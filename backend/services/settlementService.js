import mongoose from "mongoose";
import settlementModel from "../models/settlementModel.js";
import orderModel from "../models/orderModel.js";
import vendorWalletModel from "../models/vendorWalletModel.js";
import financialLedgerModel from "../models/financialLedgerModel.js";
import adminModel from "../models/adminModel.js";
import settingsModel from "../models/settingsModel.js";
import { createLedgerEntry } from "./financeService.js";

// Helper to get ISO week number and year
const getWeekString = (date) => {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
  return `${tempDate.getUTCFullYear()}W${String(weekNo).padStart(2, "0")}`;
};

// 1. Generate weekly settlements for all eligible vendors (idempotent)
export const generateWeeklySettlements = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const now = new Date();
    const weekStr = getWeekString(now);
    const weekEndDate = new Date(now);
    const weekStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all approved vendors
    const vendors = await adminModel.find({ role: "vendor", isApproved: true }).session(session);
    const generatedSettlements = [];

    for (const vendor of vendors) {
      // Idempotency check: check if a PENDING or PROCESSING settlement already exists for this week
      const existing = await settlementModel.findOne({
        vendorId: vendor._id,
        weekStartDate: { $gte: weekStartDate },
        status: { $in: ["PENDING", "PROCESSING"] }
      }).session(session);

      if (existing) {
        console.log(`Settlement already exists/pending for vendor ${vendor.name} (${vendor._id}). Skipping.`);
        continue;
      }

      // Collect eligible orders: Delivered, walletProcessed = true, settled = false, settlementId = null
      const eligibleOrders = await orderModel.find({
        restaurantId: vendor.restaurantId,
        status: "Delivered",
        walletProcessed: true,
        settled: false,
        settlementId: null
      }).session(session);

      if (eligibleOrders.length === 0) {
        continue;
      }

      // Calculate total settlement amount based on vendorNetAmount
      const settlementAmount = eligibleOrders.reduce((sum, o) => sum + (o.vendorNetAmount || 0), 0);
      if (settlementAmount <= 0) {
        continue;
      }

      // Fetch or automatically create vendor wallet
      let wallet = await vendorWalletModel.findOne({ vendorId: vendor._id }).session(session);
      if (!wallet) {
        wallet = new vendorWalletModel({
          vendorId: vendor._id,
          currency: "INR",
          pendingBalance: 0,
          availableBalance: 0,
          totalEarnings: 0,
          totalSettled: 0,
          totalRefunded: 0
        });
        await wallet.save({ session });
      }

      // Generate unique settlement number
      const suffix = vendor._id.toString().slice(-6).toUpperCase();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const settlementNumber = `SET-${weekStr}-${suffix}-${rand}`;

      // Create settlement model
      const settlement = new settlementModel({
        vendorId: vendor._id,
        walletId: wallet._id,
        settlementNumber,
        weekStartDate,
        weekEndDate,
        settlementDate: now,
        status: "PENDING",
        amount: settlementAmount,
        currency: wallet.currency,
        orders: eligibleOrders.map(o => o._id),
        notes: `Weekly settlement generation for ${weekStr}`
      });
      await settlement.save({ session });

      // Link orders to this settlement
      await orderModel.updateMany(
        { _id: { $in: eligibleOrders.map(o => o._id) } },
        { $set: { settlementId: settlement._id } },
        { session }
      );

      generatedSettlements.push(settlement);
      console.log(`Generated settlement ${settlementNumber} for vendor ${vendor.name} amounting to ₹${settlementAmount}`);
    }

    await session.commitTransaction();
    session.endSession();
    return generatedSettlements;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to generate settlements:", error);
    throw error;
  }
};

// 2. Complete Settlement (Admin action, decreases Available balance, updates ledger)
export const completeSettlement = async (settlementId, completedBy) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const settlement = await settlementModel.findById(settlementId).session(session);
    if (!settlement) {
      throw new Error("Settlement not found");
    }

    if (settlement.status !== "PENDING" && settlement.status !== "PROCESSING") {
      throw new Error(`Settlement cannot be completed. Current status: ${settlement.status}`);
    }

    const wallet = await vendorWalletModel.findById(settlement.walletId).session(session);
    if (!wallet) {
      throw new Error("Vendor wallet not found");
    }

    // Safety validation: prevent negative Available balance
    if (wallet.availableBalance < settlement.amount) {
      throw new Error(`Insufficient available balance (₹${wallet.availableBalance}) to process settlement of ₹${settlement.amount}`);
    }

    const balanceBefore = wallet.availableBalance;
    const balanceAfter = balanceBefore - settlement.amount;

    // 1. Decrease wallet available balance and increase total settled
    wallet.availableBalance = balanceAfter;
    wallet.totalSettled += settlement.amount;
    wallet.lastSettlementAt = new Date();
    await wallet.save({ session });

    // 2. Write immutable ledger entry
    const ledgerEntry = await createLedgerEntry({
      walletId: wallet._id,
      vendorId: settlement.vendorId,
      orderId: null,
      transactionType: "SETTLEMENT",
      amount: -settlement.amount,
      balanceBefore,
      balanceAfter,
      currency: settlement.currency,
      reference: settlement._id.toString(),
      description: `Weekly payout settlement completed: ${settlement.settlementNumber}`,
      createdBy: completedBy || "admin"
    }, session);

    // 3. Mark orders as settled
    await orderModel.updateMany(
      { _id: { $in: settlement.orders } },
      { 
        $set: { 
          settled: true,
          settledAt: new Date()
        } 
      },
      { session }
    );

    // 4. Update settlement status
    settlement.status = "COMPLETED";
    settlement.completedAt = new Date();
    settlement.completedBy = completedBy || "admin";
    settlement.ledgerEntries.push(ledgerEntry._id);
    await settlement.save({ session });

    await session.commitTransaction();
    session.endSession();
    return settlement;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to complete settlement:", error);
    throw error;
  }
};

// 3. Fail Settlement (Admin action, leaves wallet unchanged, marks orders eligible again)
export const failSettlement = async (settlementId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const settlement = await settlementModel.findById(settlementId).session(session);
    if (!settlement) {
      throw new Error("Settlement not found");
    }

    if (settlement.status !== "PENDING" && settlement.status !== "PROCESSING") {
      throw new Error(`Settlement cannot be failed. Current status: ${settlement.status}`);
    }

    // Free up the orders so they are eligible for other runs
    await orderModel.updateMany(
      { _id: { $in: settlement.orders } },
      { $set: { settlementId: null } },
      { session }
    );

    settlement.status = "FAILED";
    settlement.failureReason = reason || "Administrative payout failed";
    await settlement.save({ session });

    await session.commitTransaction();
    session.endSession();
    return settlement;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to mark settlement as failed:", error);
    throw error;
  }
};

// 4. Cancel Settlement (Admin action)
export const cancelSettlement = async (settlementId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const settlement = await settlementModel.findById(settlementId).session(session);
    if (!settlement) {
      throw new Error("Settlement not found");
    }

    if (settlement.status !== "PENDING" && settlement.status !== "PROCESSING") {
      throw new Error(`Settlement cannot be cancelled. Current status: ${settlement.status}`);
    }

    // Free up orders
    await orderModel.updateMany(
      { _id: { $in: settlement.orders } },
      { $set: { settlementId: null } },
      { session }
    );

    settlement.status = "CANCELLED";
    await settlement.save({ session });

    await session.commitTransaction();
    session.endSession();
    return settlement;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to cancel settlement:", error);
    throw error;
  }
};

// 5. Retry Settlement (Admin action, resets status to PENDING and rebinds orders)
export const retrySettlement = async (settlementId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const settlement = await settlementModel.findById(settlementId).session(session);
    if (!settlement) {
      throw new Error("Settlement not found");
    }

    if (settlement.status !== "FAILED" && settlement.status !== "CANCELLED") {
      throw new Error(`Settlement cannot be retried. Current status: ${settlement.status}`);
    }

    // Ensure none of the orders have been settled in other runs in the meantime
    const alreadySettledCount = await orderModel.countDocuments({
      _id: { $in: settlement.orders },
      settled: true
    }).session(session);

    if (alreadySettledCount > 0) {
      throw new Error("Cannot retry settlement: Some orders in this payout have already been settled in another invoice.");
    }

    // Re-bind the orders
    await orderModel.updateMany(
      { _id: { $in: settlement.orders } },
      { $set: { settlementId: settlement._id } },
      { session }
    );

    settlement.status = "PENDING";
    settlement.failureReason = "";
    await settlement.save({ session });

    await session.commitTransaction();
    session.endSession();
    return settlement;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to retry settlement:", error);
    throw error;
  }
};
