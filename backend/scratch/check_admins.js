import mongoose from "mongoose";
import dotenv from "dotenv";
import adminModel from "../models/adminModel.js";

dotenv.config();

const checkAdmins = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB Connected");
  const admins = await adminModel.find({});
  console.log("Admins count:", admins.length);
  admins.forEach(admin => {
    console.log({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isApproved: admin.isApproved,
      restaurantId: admin.restaurantId
    });
  });
  process.exit(0);
};

checkAdmins().catch(err => {
  console.error(err);
  process.exit(1);
});
