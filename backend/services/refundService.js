import mongoose from "mongoose";
import refundModel from "../models/refundModel.js";
import orderModel from "../models/orderModel.js";
import vendorWalletModel from "../models/vendorWalletModel.js";
import settlementModel from "../models/settlementModel.js";
import { createLedgerEntry } from "./financeService.js";

// Helper to generate sequential refund number (e.g. REF-2026-000001)
const generateRefundNumber = async (session) => {
  const year = new Date().getFullYear();
  const count = await refundModel.countDocuments({
    refundNumber: new RegExp(`^REF-${year}-`)
  }).session(session);

  const seqStr = String(count + 1).padStart(6, "0");
  return `REF-${year}-${seqStr}`;
};

// 1. Validate eligibility
export const validateRefundEligibility = async (orderId, requestedAmount) => {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (!order.payment) {
    throw new Error("Cannot refund an unpaid order");
  }

  if (order.refundStatus === "REFUNDED") {
    throw new Error("Order is already fully refunded");
  }

  const remainingRefundable = order.amount - (order.refundAmount || 0);
  if (requestedAmount > remainingRefundable) {
    throw new Error(`Requested amount ₹${requestedAmount} exceeds the remaining refundable amount of ₹${remainingRefundable}`);
  }

  // Check for any duplicate active refund request
  const activeRequest = await refundModel.findOne({
    orderId,
    status: { $in: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "PROCESSING"] }
  });

  if (activeRequest) {
    throw new Error(`An active refund request (${activeRequest.refundNumber}) already exists for this order`);
  }

  return order;
};

// 2. Submit refund request (Customer)
export const requestRefund = async (orderId, customerId, refundType, requestedAmount, reason, customerMessage) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Validate inside transaction
    const order = await orderModel.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");
    if (!order.payment) throw new Error("Cannot refund an unpaid order");
    if (order.refundStatus === "REFUNDED") throw new Error("Order is already fully refunded");

    const remainingRefundable = order.amount - (order.refundAmount || 0);
    if (requestedAmount > remainingRefundable) {
      throw new Error(`Requested amount ₹${requestedAmount} exceeds refundable limit`);
    }

    const activeRequest = await refundModel.findOne({
      orderId,
      status: { $in: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "PROCESSING"] }
    }).session(session);
    if (activeRequest) {
      throw new Error("An active refund request already exists");
    }

    // Fetch vendor wallet
    const wallet = await vendorWalletModel.findOne({ vendorId: order.restaurantId }).session(session)
      || await vendorWalletModel.findOne({ vendorId: "6a491167c2b82a9b3b0d8c53" }).session(session); // Fallback / check

    let targetWallet = wallet;
    if (!targetWallet) {
      // Find restaurant owner to locate correct vendor
      const resData = await mongoose.model("restaurant").findById(order.restaurantId).session(session);
      const vId = resData?.ownerId || "6a491167c2b82a9b3b0d8c53";
      targetWallet = await vendorWalletModel.findOne({ vendorId: vId }).session(session);
      if (!targetWallet) {
        targetWallet = new vendorWalletModel({ vendorId: vId, currency: "INR" });
        await targetWallet.save({ session });
      }
    }

    const refundNumber = await generateRefundNumber(session);

    const refund = new refundModel({
      refundNumber,
      orderId,
      customerId,
      vendorId: targetWallet.vendorId,
      paymentId: order.paymentGatewayPaymentId || "manual_gateway_id",
      settlementId: order.settlementId,
      walletId: targetWallet._id,
      requestedAmount,
      currency: "INR",
      refundType,
      reason,
      customerMessage,
      status: "REQUESTED",
      requestedAt: new Date()
    });
    await refund.save({ session });

    // Update order status to requested
    order.refundStatus = "REQUESTED";
    order.refundId = refund._id;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return refund;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Refund request failed:", error);
    throw error;
  }
};

// 3. Approve Refund (Admin)
export const approveRefund = async (refundId, adminRemark, approvedAmount) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const refund = await refundModel.findById(refundId).session(session);
    if (!refund) throw new Error("Refund not found");
    if (refund.status !== "REQUESTED" && refund.status !== "UNDER_REVIEW") {
      throw new Error(`Refund cannot be approved. Current status: ${refund.status}`);
    }

    const finalApprovedAmount = approvedAmount !== undefined && approvedAmount !== null ? Number(approvedAmount) : refund.requestedAmount;

    if (typeof finalApprovedAmount !== "number" || isNaN(finalApprovedAmount)) {
      throw new Error("Approved amount must be a valid number");
    }

    if (finalApprovedAmount <= 0) {
      throw new Error("Approved amount must be greater than zero");
    }

    if (finalApprovedAmount > refund.requestedAmount) {
      throw new Error(`Approved amount cannot exceed the requested amount of ₹${refund.requestedAmount}`);
    }

    refund.status = "APPROVED";
    refund.approvedAmount = finalApprovedAmount;
    refund.reviewedAt = new Date();
    refund.approvedAt = new Date();
    refund.adminRemark = adminRemark || "Approved by platform administrator";
    await refund.save({ session });

    await session.commitTransaction();
    session.endSession();
    return refund;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// 4. Reject Refund (Admin)
export const rejectRefund = async (refundId, adminRemark) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const refund = await refundModel.findById(refundId).session(session);
    if (!refund) throw new Error("Refund not found");
    if (refund.status !== "REQUESTED" && refund.status !== "UNDER_REVIEW") {
      throw new Error(`Refund cannot be rejected. Current status: ${refund.status}`);
    }

    refund.status = "REJECTED";
    refund.reviewedAt = new Date();
    refund.adminRemark = adminRemark || "Rejected by platform administrator";
    await refund.save({ session });

    const order = await orderModel.findById(refund.orderId).session(session);
    if (order) {
      // Revert order status
      order.refundStatus = order.refundAmount > 0 ? "PARTIAL" : "NONE";
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    return refund;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// 5. Process Refund (Admin)
export const processRefund = async (refundId, processedBy) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const refund = await refundModel.findById(refundId).session(session);
    if (!refund) throw new Error("Refund not found");
    if (refund.status !== "APPROVED") {
      throw new Error(`Refund must be approved first. Current status: ${refund.status}`);
    }

    refund.status = "PROCESSING";
    refund.processingAt = new Date();
    refund.processedBy = processedBy || "admin";
    await refund.save({ session });

    await session.commitTransaction();
    session.endSession();
    return refund;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// 6. Complete Refund (Admin, executes calculations, handles settlement protection, updates wallet & ledgers)
export const completeRefund = async (refundId, gatewayReference) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const refund = await refundModel.findById(refundId).session(session);
    if (!refund) throw new Error("Refund not found");
    if (refund.status !== "APPROVED" && refund.status !== "PROCESSING") {
      throw new Error(`Refund cannot be completed. Current status: ${refund.status}`);
    }

    const order = await orderModel.findById(refund.orderId).session(session);
    if (!order) throw new Error("Order associated with refund not found");

    const wallet = await vendorWalletModel.findById(refund.walletId).session(session);
    if (!wallet) throw new Error("Vendor wallet associated with refund not found");

    const refundAmount = refund.approvedAmount || refund.requestedAmount;

    // Handle Settlement Protection Threshold
    if (order.settlementId) {
      const settlement = await settlementModel.findById(order.settlementId).session(session);
      if (settlement && (settlement.status === "PENDING" || settlement.status === "PROCESSING")) {
        // Settlement not yet completed: protect it from becoming negative
        const deductFromSettlement = Math.min(refundAmount, settlement.amount);
        settlement.amount -= deductFromSettlement;
        await settlement.save({ session });
        console.log(`Adjusted pending settlement ${settlement.settlementNumber} amount: decreased by ₹${deductFromSettlement}`);
      }
    }

    // Determine refund wallet accounting based on order.settled status
    if (order.settled === true) {
      // Refund after settlement: Deduct wallet availableBalance directly (may become negative if required) and record in financial ledger
      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore - refundAmount;

      wallet.availableBalance = balanceAfter;
      wallet.totalRefunded += refundAmount;
      await wallet.save({ session });

      // Write immutable ledger entry
      const ledgerTxType = refund.refundType === "FULL" ? "FULL_REFUND" : "PARTIAL_REFUND";
      const ledgerEntry = await createLedgerEntry({
        walletId: wallet._id,
        vendorId: refund.vendorId,
        orderId: order._id,
        transactionType: ledgerTxType,
        amount: -refundAmount,
        balanceBefore,
        balanceAfter,
        currency: refund.currency,
        reference: refund._id.toString(),
        description: `Customer refund completed after weekly settlement: ${refund.refundNumber}. Reason: ${refund.reason}`,
        createdBy: refund.processedBy || "admin"
      }, session);

      refund.ledgerEntries = [ledgerEntry._id];
    } else {
      // Refund before settlement: Cancel pending earnings only. Do not deduct from availableBalance.
      wallet.totalRefunded += refundAmount;
      await wallet.save({ session });
      
      refund.ledgerEntries = [];
      console.log(`Refund completed before settlement for order ${order._id}. availableBalance remains unchanged.`);
    }

    // Update refund fields
    refund.status = "COMPLETED";
    refund.completedAt = new Date();
    refund.gatewayReference = gatewayReference || `GWR-${Date.now()}`;
    await refund.save({ session });

    // Update order flags
    order.refundAmount = (order.refundAmount || 0) + refundAmount;
    order.refundStatus = order.refundAmount >= order.amount ? "REFUNDED" : "PARTIAL";
    order.paymentRefundedAt = new Date();
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return refund;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to complete refund:", error);
    throw error;
  }
};

// 7. Fail Refund (Admin)
export const failRefund = async (refundId, failureReason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const refund = await refundModel.findById(refundId).session(session);
    if (!refund) throw new Error("Refund not found");
    if (refund.status !== "APPROVED" && refund.status !== "PROCESSING") {
      throw new Error(`Refund cannot be failed. Current status: ${refund.status}`);
    }

    refund.status = "FAILED";
    refund.failureReason = failureReason || "Gateway processing failed";
    await refund.save({ session });

    // Set order status back to REQUESTED or let them submit again
    const order = await orderModel.findById(refund.orderId).session(session);
    if (order) {
      order.refundStatus = order.refundAmount > 0 ? "PARTIAL" : "NONE";
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    return refund;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
