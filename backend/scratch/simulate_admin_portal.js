import mongoose from "mongoose";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import refundModel from "../models/refundModel.js";
import vendorWalletModel from "../models/vendorWalletModel.js";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import * as refundService from "../services/refundService.js";

dotenv.config();

const simulate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Simulating Admin Portal Fetch...");
  console.log("Connection Database Name:", mongoose.connection.name);

  const vendorId = "6a491167c2b82a9b3b0d8c53";
  const customerId = "6a57e50d49f499b8e58e561c";

  // Create a mock wallet if not exists
  let wallet = await vendorWalletModel.findOne({ vendorId });
  if (!wallet) {
    wallet = new vendorWalletModel({
      vendorId,
      currency: "INR",
      pendingBalance: 0,
      availableBalance: 1000,
      totalEarnings: 1000,
      totalSettled: 0,
      totalRefunded: 0
    });
    await wallet.save();
  }

  // 1. Create a mock order
  const order = new orderModel({
    userId: customerId,
    restaurantId: "6a491167c2b82a9b3b0d8c55",
    items: [{ name: "Investigation Burger", quantity: 1, price: 100 }],
    amount: 100,
    address: { firstName: "Inv", lastName: "Test" },
    payment: true,
    paymentGatewayPaymentId: "pay_inv_123",
    status: "Delivered"
  });
  await order.save();
  console.log("✓ Mock order created with ID:", order._id);

  // 2. Submit refund request (Customer)
  console.log("Submitting customer refund request...");
  const refund = await refundService.requestRefund(
    order._id,
    customerId,
    "FULL",
    100,
    "Poor Quality",
    "Burger was burnt"
  );
  console.log("✓ Refund request saved. Details:");
  console.log("  - refund _id:", refund._id);
  console.log("  - refundNumber:", refund.refundNumber);
  console.log("  - status:", refund.status);
  console.log("  - orderId:", refund.orderId);

  // 3. Confirm document exists in MongoDB directly
  const dbRefund = await refundModel.findById(refund._id);
  console.log("✓ Direct DB Lookup Result:");
  console.log("  - Exists:", dbRefund !== null);
  console.log("  - refundNumber:", dbRefund?.refundNumber);
  console.log("  - status:", dbRefund?.status);
  console.log("  - customerId:", dbRefund?.customerId);
  console.log("  - createdAt:", dbRefund?.createdAt);

  // 4. Simulate adminListRefunds query logic
  console.log("Simulating adminListRefunds query...");
  const filter = {};
  const refunds = await refundModel.find(filter)
    .populate({
      path: "customerId",
      select: "name email"
    })
    .populate({
      path: "vendorId",
      select: "name email restaurantId",
      populate: { path: "restaurantId", select: "name" }
    })
    .sort({ createdAt: -1 });

  console.log("✓ adminListRefunds query result count:", refunds.length);
  console.log("  - Found ID matches created refund:", refunds.some(r => r._id.toString() === refund._id.toString()));
  if (refunds.length > 0) {
    console.log("  - First refund in list:", JSON.stringify(refunds[0], null, 2));
  }

  // Cleanup
  await orderModel.deleteOne({ _id: order._id });
  await refundModel.deleteOne({ _id: refund._id });
  console.log("✓ Cleaned up simulated mock entities.");
  process.exit(0);
};

simulate().catch(err => {
  console.error("Simulation failed:", err);
  process.exit(1);
});
