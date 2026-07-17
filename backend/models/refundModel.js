import mongoose from "mongoose";

const refundSchema = new mongoose.Schema({
  refundNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  settlementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "settlement",
    default: null
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vendorWallet",
    required: true
  },
  requestedAmount: {
    type: Number,
    required: true
  },
  approvedAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: "INR"
  },
  refundType: {
    type: String,
    enum: ["FULL", "PARTIAL"],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  customerMessage: {
    type: String,
    default: ""
  },
  adminRemark: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "PROCESSING", "COMPLETED", "REJECTED", "FAILED"],
    default: "REQUESTED"
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  processingAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: String,
    default: null
  },
  gatewayReference: {
    type: String,
    default: ""
  },
  failureReason: {
    type: String,
    default: ""
  },
  ledgerEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "financialLedger"
  }]
}, { timestamps: true });

const refundModel = mongoose.models.refund || mongoose.model("refund", refundSchema);

export default refundModel;
