import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vendorWallet",
    required: true
  },
  settlementNumber: {
    type: String,
    required: true,
    unique: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  settlementDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
    default: "PENDING"
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "order"
  }],
  ledgerEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "financialLedger"
  }],
  notes: {
    type: String,
    default: ""
  },
  failureReason: {
    type: String,
    default: ""
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: String,
    default: null
  },
  reference: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const settlementModel = mongoose.models.settlement || mongoose.model("settlement", settlementSchema);

export default settlementModel;
