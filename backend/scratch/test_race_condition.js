import mongoose from "mongoose";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";
import { handlePaymentFailure } from "../controllers/paymentController.js";

dotenv.config();

const testRace = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB Connected");

  // Create a mock paid order
  const order = new orderModel({
    userId: "6a57e50d49f499b8e58e561c",
    restaurantId: "6a491167c2b82a9b3b0d8c55",
    items: [],
    amount: 10,
    address: {},
    payment: true,
    paymentStatus: "captured"
  });
  await order.save();
  console.log("Mock paid order created:", order._id);

  // Call handlePaymentFailure mock request
  const req = {
    body: {
      orderId: order._id.toString(),
      errorReason: "User cancelled after success"
    }
  };

  const res = {
    json: (data) => {
      console.log("Response from failure logger:", data);
    }
  };

  await handlePaymentFailure(req, res);

  // Read order back to check if paymentStatus remains "captured"
  const updatedOrder = await orderModel.findById(order._id);
  console.log("Order Payment Status after failure log call:", updatedOrder.paymentStatus);
  console.log("Order Payment Failure Reason:", updatedOrder.paymentFailureReason);

  // Clean up
  await orderModel.findByIdAndDelete(order._id);
  console.log("Cleaned up mock order");
  process.exit(0);
};

testRace().catch(err => {
  console.error(err);
  process.exit(1);
});
