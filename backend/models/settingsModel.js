import mongoose from "mongoose";

// Platform-wide settings (superadmin only)
const settingsSchema = new mongoose.Schema({
  platformName:   { type: String, default: "Tomato" },
  phone:          { type: String, default: "+1-212-456-7898" },
  email:          { type: String, default: "contact@tomato.com" },
  address:        { type: String, default: "123 Food Street, New York, NY 10001" },
  deliveryFee:    { type: Number, default: 2 },
  minOrder:       { type: Number, default: 0 },
  currency:       { type: String, default: "INR" },
  aboutUs:        { type: String, default: "Premium food delivery from your city's best restaurants." },
  vendorSignupOpen: { type: Boolean, default: true }, // allow new vendor registrations
  maintenanceMode:    { type: Boolean, default: false },
  platformFeePercent: { type: Number, default: 0 },
  supportEmail:       { type: String, default: "" },
}, { timestamps: true });

const settingsModel = mongoose.models.settings || mongoose.model("settings", settingsSchema);
export default settingsModel;
