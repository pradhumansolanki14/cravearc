import mongoose from "mongoose";

const categoryRequestSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  description:    { type: String, default: "" },
  reason:         { type: String, default: "" },
  vendorId:       { type: mongoose.Schema.Types.ObjectId, ref: "admin", required: true },
  restaurantId:   { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", required: true },
  restaurantName: { type: String, required: true },
  status:         { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectionReason:{ type: String, default: "" },
  approvedAt:     { type: Date, default: null },
  rejectedAt:     { type: Date, default: null },
}, { timestamps: true });

const categoryRequestModel = mongoose.models.categoryRequest || mongoose.model("categoryRequest", categoryRequestSchema);
export default categoryRequestModel;
