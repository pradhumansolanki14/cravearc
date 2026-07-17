import mongoose from "mongoose";
import dotenv from "dotenv";
import refundModel from "../models/refundModel.js";

dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Mongoose connected. Db Name:", mongoose.connection.name);
  
  const refundModel = (await import("../models/refundModel.js")).default;
  const orderModel = (await import("../models/orderModel.js")).default;
  
  const refunds = await refundModel.find({});
  console.log("REFUNDS IN DB:", JSON.stringify(refunds, null, 2));

  const orders = await orderModel.find({});
  console.log("ORDERS IN DB:", JSON.stringify(orders, null, 2));
  
  process.exit(0);
};

check().catch(err => {
  console.error(err);
  process.exit(1);
});
