import mongoose from "mongoose";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import vendorWalletModel from "../models/vendorWalletModel.js";
import financialLedgerModel from "../models/financialLedgerModel.js";
import settlementModel from "../models/settlementModel.js";
import settingsModel from "../models/settingsModel.js";
import * as settlementService from "../services/settlementService.js";

dotenv.config();

const runTest = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB Connected successfully.");

  const vendorId = "6a491167c2b82a9b3b0d8c53"; // Navin's vendor ID
  
  // 1. Clear database state for clean test run
  await settlementModel.deleteMany({ vendorId });
  await vendorWalletModel.deleteMany({ vendorId });
  await financialLedgerModel.deleteMany({ vendorId });
  console.log("Database cleared for vendor:", vendorId);

  // 2. Setup Wallet with initial available balance
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
  console.log("Mock wallet initialized with available balance of ₹1000");

  // 3. Create mock orders
  const o1 = new orderModel({
    userId: "6a57e50d49f499b8e58e561c",
    restaurantId: "6a491167c2b82a9b3b0d8c55",
    items: [{ name: "Samosa", quantity: 2, price: 50 }],
    amount: 100,
    address: { firstName: "Test", lastName: "1" },
    payment: true,
    status: "Delivered",
    walletProcessed: true,
    vendorNetAmount: 100,
    settled: false
  });
  await o1.save();

  const o2 = new orderModel({
    userId: "6a57e50d49f499b8e58e561c",
    restaurantId: "6a491167c2b82a9b3b0d8c55",
    items: [{ name: "Kachori", quantity: 4, price: 50 }],
    amount: 200,
    address: { firstName: "Test", lastName: "2" },
    payment: true,
    status: "Delivered",
    walletProcessed: true,
    vendorNetAmount: 200,
    settled: false
  });
  await o2.save();
  console.log("Mock orders created: Order 1 (₹100), Order 2 (₹200)");

  // 4. Generate settlements
  const generated = await settlementService.generateWeeklySettlements();
  console.log("Generated settlements count:", generated.length);
  if (generated.length > 0) {
    console.log("Generated settlement number:", generated[0].settlementNumber);
    console.log("Generated settlement status:", generated[0].status); // PENDING
    console.log("Generated settlement amount:", generated[0].amount); // 300
  }

  // Verify orders linked to settlementId
  const checkO1 = await orderModel.findById(o1._id);
  console.log("Order 1 settlementId linked:", checkO1.settlementId !== null);
  console.log("Order 1 settled status:", checkO1.settled); // false

  // 5. Test Generate Idempotency (should do nothing, as a pending settlement already exists)
  const generated2 = await settlementService.generateWeeklySettlements();
  console.log("Duplicate generation run created count (expected 0):", generated2.length);

  // 6. Complete Payout
  const settlementId = generated[0]._id;
  const completed = await settlementService.completeSettlement(settlementId, "admin-test");
  console.log("Completed settlement status:", completed.status); // COMPLETED
  
  const updatedWallet = await vendorWalletModel.findOne({ vendorId });
  console.log("Wallet availableBalance after completion (expected 700):", updatedWallet.availableBalance);
  console.log("Wallet totalSettled after completion (expected 300):", updatedWallet.totalSettled);

  const checkO1Settled = await orderModel.findById(o1._id);
  console.log("Order 1 settled status after completion (expected true):", checkO1Settled.settled);

  const ledgerCount = await financialLedgerModel.countDocuments({ vendorId, transactionType: "SETTLEMENT" });
  console.log("Settlement ledger count (expected 1):", ledgerCount);
  
  const ledgerEntry = await financialLedgerModel.findOne({ vendorId, transactionType: "SETTLEMENT" });
  console.log("Ledger entry amount (expected -300):", ledgerEntry.amount);
  console.log("Ledger balanceAfter (expected 700):", ledgerEntry.balanceAfter);

  // 7. Test completeSettlement duplication block
  try {
    await settlementService.completeSettlement(settlementId, "admin-test");
    console.log("[ERROR] Settlement completion did not block duplicate execution");
  } catch (err) {
    console.log("Duplicate completion blocked correctly. Error message:", err.message);
  }

  // 8. Test Failure flow
  // Create another order and generate a settlement
  const o3 = new orderModel({
    userId: "6a57e50d49f499b8e58e561c",
    restaurantId: "6a491167c2b82a9b3b0d8c55",
    items: [{ name: "Paneer", quantity: 3, price: 50 }],
    amount: 150,
    address: { firstName: "Test", lastName: "3" },
    payment: true,
    status: "Delivered",
    walletProcessed: true,
    vendorNetAmount: 150,
    settled: false
  });
  await o3.save();

  const generatedFailRun = await settlementService.generateWeeklySettlements();
  const failSettlementId = generatedFailRun[0]._id;
  console.log("Generated second settlement for fail run:", generatedFailRun[0].settlementNumber);

  // Mark Failed
  const failed = await settlementService.failSettlement(failSettlementId, "Bank details rejected");
  console.log("Failed settlement status:", failed.status); // FAILED
  console.log("Failed settlement failureReason:", failed.failureReason);

  const walletAfterFail = await vendorWalletModel.findOne({ vendorId });
  console.log("Wallet availableBalance after fail (expected 700):", walletAfterFail.availableBalance);

  const checkO3AfterFail = await orderModel.findById(o3._id);
  console.log("Order 3 settlementId after fail (expected null):", checkO3AfterFail.settlementId);

  // 9. Test Retry flow
  const retried = await settlementService.retrySettlement(failSettlementId);
  console.log("Retried settlement status (expected PENDING):", retried.status);
  
  const checkO3AfterRetry = await orderModel.findById(o3._id);
  console.log("Order 3 settlementId after retry (expected linked):", checkO3AfterRetry.settlementId !== null);

  // 10. Clean up test records
  await orderModel.deleteMany({ _id: { $in: [o1._id, o2._id, o3._id] } });
  await vendorWalletModel.deleteOne({ vendorId });
  await financialLedgerModel.deleteMany({ vendorId });
  await settlementModel.deleteMany({ vendorId });
  console.log("Cleaned up database. All tests completed successfully.");
  process.exit(0);
};

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
