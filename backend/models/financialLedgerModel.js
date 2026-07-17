import mongoose from "mongoose";

const financialLedgerSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vendorWallet",
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    default: null
  },
  transactionType: {
    type: String,
    enum: [
      "ORDER_CREDIT",
      "COMMISSION",
      "PAYMENT_GATEWAY_FEE",
      "REFUND",
      "PARTIAL_REFUND",
      "FULL_REFUND",
      "SETTLEMENT",
      "MANUAL_ADJUSTMENT",
      "ORDER_CREDIT_AVAILABLE"
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  reference: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: String,
    default: "system"
  }
}, { timestamps: true });

const financialLedgerModel = mongoose.models.financialLedger || mongoose.model("financialLedger", financialLedgerSchema);

export default financialLedgerModel;
