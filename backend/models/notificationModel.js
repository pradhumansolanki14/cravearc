import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Null for system broadcasts
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["order", "review", "coupon", "announcement", "system", "vendor", "platform"], 
    required: true 
  },
  link: { type: String, default: "" },
  role: { type: String, enum: ["customer", "vendor", "superadmin"], default: "customer" },
  isRead: { type: Boolean, default: false }, // For direct user notifications
  readBy: [{ type: mongoose.Schema.Types.ObjectId }], // For broadcast notifications
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId }] // For broadcast notifications
}, { timestamps: true });

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export default notificationModel;
