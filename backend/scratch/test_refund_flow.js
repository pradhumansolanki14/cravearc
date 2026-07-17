import mongoose from "mongoose";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import vendorWalletModel from "../models/vendorWalletModel.js";
import financialLedgerModel from "../models/financialLedgerModel.js";
import settlementModel from "../models/settlementModel.js";
import refundModel from "../models/refundModel.js";
import * as refundService from "../services/refundService.js";
import * as settlementService from "../services/settlementService.js";

dotenv.config();

const runTest = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB Connected successfully.");

  const vendorId = "6a491167c2b82a9b3b0d8c53"; // Navin's vendor ID
  const customerId = "6a57e50d49f499b8e58e561c";

  // 1. Clear database state
  await refundModel.deleteMany({ vendorId });
  await settlementModel.deleteMany({ vendorId });
  await vendorWalletModel.deleteMany({ vendorId });
  await financialLedgerModel.deleteMany({ vendorId });
  console.log("Database state initialized.");

  // Setup Wallet
  const wallet = new vendorWalletModel({
    vendorId,
    currency: "INR",
    pendingBalance: 0,
    availableBalance: 1000,
    totalEarnings: 1000,
    totalSettled: 0,
    totalRefunded: 0
  });
  await wallet.save();
  console.log("Wallet initialized with available balance of ₹1000");

  // Create order
  const order = new orderModel({
    userId: customerId,
    restaurantId: "6a491167c2b82a9b3b0d8c55",
    items: [{ name: "Samosa Platter", quantity: 5, price: 100 }],
    amount: 500,
    address: { firstName: "Test", lastName: "Refund" },
    payment: true,
    paymentGatewayPaymentId: "pay_test_refund_123",
    status: "Delivered",
    walletProcessed: true,
    vendorNetAmount: 440,
    settled: false
  });
  await order.save();
  console.log("Mock order created. Net netAmount: ₹440");

  // ─── Scenario A: Refund Before Settlement Completion ───
  console.log("\n--- Scenario A: Refund Before Settlement Completion ---");
  
  // Generate settlement (status: PENDING)
  const generatedSettlements = await settlementService.generateWeeklySettlements();
  const settlement = generatedSettlements[0];
  console.log("Generated pending settlement amount:", settlement.amount); // Expected: 440

  // Customer requests a partial refund of ₹200
  const refundReq = await refundService.requestRefund(order._id, customerId, "PARTIAL", 200, "Poor Quality", "Food was cold");
  console.log("Refund request submitted. Number:", refundReq.refundNumber);
  console.log("Refund request status:", refundReq.status); // REQUESTED

  // Verify duplicate request block
  try {
    await refundService.requestRefund(order._id, customerId, "PARTIAL", 50, "Duplicate Test", "Duplicate message");
    console.log("[ERROR] Duplicate refund request was not blocked!");
  } catch (err) {
    console.log("Duplicate request blocked correctly. Message:", err.message);
  }

  // Admin approves refund for ₹200
  const approved = await refundService.approveRefund(refundReq._id, "Food quality approved refund", 200);
  console.log("Refund approved status:", approved.status); // APPROVED
  console.log("Refund approved amount:", approved.approvedAmount); // 200
  console.log("Audit approvedAt:", approved.approvedAt !== null);

  // Admin processes refund
  const processing = await refundService.processRefund(approved._id, "admin-test");
  console.log("Refund processing status:", processing.status); // PROCESSING
  console.log("Audit processingAt:", processing.processingAt !== null);

  // Admin completes refund
  const completed = await refundService.completeRefund(processing._id, "ref_gate_001");
  console.log("Refund completed status:", completed.status); // COMPLETED
  console.log("Audit completedAt:", completed.completedAt !== null);

  // Assertions
  const updatedSettlement = await settlementModel.findById(settlement._id);
  console.log("Settlement amount after partial refund (expected 240):", updatedSettlement.amount);

  const updatedWallet = await vendorWalletModel.findOne({ vendorId });
  console.log("Wallet availableBalance after partial refund (expected 1000):", updatedWallet.availableBalance);
  console.log("Wallet totalRefunded after partial refund (expected 200):", updatedWallet.totalRefunded);

  const checkOrder = await orderModel.findById(order._id);
  console.log("Order refundAmount (expected 200):", checkOrder.refundAmount);
  console.log("Order refundStatus (expected PARTIAL):", checkOrder.refundStatus);

  const ledgerEntry = await financialLedgerModel.findOne({ vendorId, transactionType: "PARTIAL_REFUND" });
  console.log("Ledger entry found (expected null/false):", ledgerEntry !== null);

  // ─── Scenario B: Settlement Protection Threshold Limit ───
  console.log("\n--- Scenario B: Settlement Protection Threshold Limit ---");

  // Customer requests another partial refund of remaining ₹300 (exceeds settlement balance of 240)
  const refundReq2 = await refundService.requestRefund(order._id, customerId, "FULL", 300, "Poor Quality", "Other items stale");
  const approved2 = await refundService.approveRefund(refundReq2._id, "Remaining refund approved", 300);
  const completed2 = await refundService.completeRefund(approved2._id, "ref_gate_002");

  // Assertions
  const updatedSettlement2 = await settlementModel.findById(settlement._id);
  console.log("Settlement amount after second refund (expected 0, capped):", updatedSettlement2.amount);

  const updatedWallet2 = await vendorWalletModel.findOne({ vendorId });
  console.log("Wallet availableBalance (expected 1000):", updatedWallet2.availableBalance);
  console.log("Wallet totalRefunded (expected 500):", updatedWallet2.totalRefunded);

  const checkOrder2 = await orderModel.findById(order._id);
  console.log("Order refundAmount (expected 500):", checkOrder2.refundAmount);
  console.log("Order refundStatus (expected REFUNDED):", checkOrder2.refundStatus);

  // ─── Scenario C: Refund Completed After Settlement is COMPLETED ───
  console.log("\n--- Scenario C: Refund Completed After Settlement is COMPLETED (Negative Wallet) ---");

  // Setup fresh mock order and wallet balance
  const orderNew = new orderModel({
    userId: customerId,
    restaurantId: "6a491167c2b82a9b3b0d8c55",
    items: [{ name: "Kachori Platter", quantity: 2, price: 100 }],
    amount: 200,
    address: { firstName: "Test", lastName: "New" },
    payment: true,
    paymentGatewayPaymentId: "pay_test_new_123",
    status: "Delivered",
    walletProcessed: true,
    vendorNetAmount: 176,
    settled: false
  });
  await orderNew.save();

  // Reset wallet availableBalance to ₹324
  updatedWallet2.availableBalance = 324;
  await updatedWallet2.save();

  // Generate settlement for orderNew
  const generatedNew = await settlementService.generateWeeklySettlements();
  const settlementNew = generatedNew[0];
  console.log("Generated new settlement amount:", settlementNew.amount); // 176

  // Complete settlementNew
  await settlementService.completeSettlement(settlementNew._id, "admin-test");
  const walletAfterSettled = await vendorWalletModel.findOne({ vendorId });
  console.log("Wallet availableBalance after weekly settlement (expected 148):", walletAfterSettled.availableBalance); // 324 - 176

  // Now refund orderNew for full ₹200 (should force wallet to go negative, settlement record remains COMPLETED and unchanged!)
  const refundReqNew = await refundService.requestRefund(orderNew._id, customerId, "FULL", 200, "Late Delivery", "arrived cold");
  const approvedNew = await refundService.approveRefund(refundReqNew._id, "Approved late delivery", 200);
  const completedNew = await refundService.completeRefund(approvedNew._id, "ref_gate_003");

  const walletAfterRefund = await vendorWalletModel.findOne({ vendorId });
  console.log("Wallet availableBalance after refund (expected -52):", walletAfterRefund.availableBalance); // 148 - 200

  const finalSettlementRecord = await settlementModel.findById(settlementNew._id);
  console.log("Settlement status (expected COMPLETED):", finalSettlementRecord.status);
  console.log("Settlement amount remains unchanged (expected 176):", finalSettlementRecord.amount);

  // 10. Clean up
  await orderModel.deleteMany({ _id: { $in: [order._id, orderNew._id] } });
  await vendorWalletModel.deleteOne({ vendorId });
  await financialLedgerModel.deleteMany({ vendorId });
  await settlementModel.deleteMany({ _id: { $in: [settlement._id, settlementNew._id] } });
  await refundModel.deleteMany({ vendorId });
  console.log("Cleaned up database mock entries. Test completed successfully.");
  process.exit(0);
};

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
