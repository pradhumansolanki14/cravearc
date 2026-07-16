import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId:        { type: String, required: true },
  restaurantId:  { type: mongoose.Schema.Types.ObjectId, ref: "restaurant" },
  items:         { type: Array, required: true },
  amount:        { type: Number, required: true },
  address:       { type: Object, required: true },
  status:        { type: String, default: "Food Processing" },
  date:          { type: Date, default: Date.now },
  payment:        { type: Boolean, default: false },
  couponId:       { type: mongoose.Schema.Types.ObjectId, ref: "coupon", default: null },
  discountAmount: { type: Number, default: 0 },
  paymentMethod:  { type: String, enum: ["stripe", "cod", "razorpay"], default: "razorpay" },
  note:           { type: String, default: "" },
  
  // Payment Gateway Foundation fields (P3-R4.1)
  paymentStatus:           { type: String, enum: ["pending", "captured", "failed", "refunded"], default: "pending" },
  paymentGateway:          { type: String, default: "razorpay" },
  paymentGatewayOrderId:   { type: String, default: "" },
  paymentGatewayPaymentId: { type: String, default: "" },
  paymentGatewaySignature: { type: String, default: "" },
  paymentAmount:           { type: Number, default: 0 },
  paymentCurrency:         { type: String, default: "INR" },
  paymentPaidAt:           { type: Date, default: null },
  paymentRefundedAt:       { type: Date, default: null },
  paymentFailureReason:    { type: String, default: "" },
}, { timestamps: true });

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
