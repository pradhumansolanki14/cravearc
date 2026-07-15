import mongoose from "mongoose";

// role: "superadmin" → full platform access
// role: "vendor"     → manages their own restaurant only
const adminSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  role:           { type: String, enum: ["superadmin", "vendor"], default: "vendor" },
  restaurantId:   { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", default: null },
  isApproved:     { type: Boolean, default: false }, // superadmin can approve vendors
  phone:          { type: String, default: "" },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiry: { type: Date, default: null },
}, { timestamps: true });

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
