import mongoose from "mongoose";

// A Restaurant is owned by a vendor (admin with role "vendor")
// The adminId links back to the admin/vendor account
const restaurantSchema = new mongoose.Schema({
  ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: "admin", required: true },
  name:         { type: String, required: true },
  description:  { type: String, default: "" },
  cuisine:      { type: String, default: "" },       // e.g. "Italian, Pizza"
  cuisineIds:   { type: [mongoose.Schema.Types.ObjectId], ref: "cuisine", default: [] },
  featured:     { type: Boolean, default: false },
  preparationTime: { type: Number, default: 30 },   // minutes
  tags:         { type: [String], default: [] },
  address:      { type: String, default: "" },
  phone:        { type: String, default: "" },
  email:        { type: String, default: "" },
  logo:         { type: String, default: "" },        // image filename
  coverImage:   { type: String, default: "" },
  deliveryFee:  { type: Number, default: 2 },
  minOrder:     { type: Number, default: 0 },
  openingHours: { type: String, default: "9:00 AM - 11:00 PM" },
  isOpen:       { type: Boolean, default: true },
  isApproved:   { type: Boolean, default: false },    // super admin approves vendors
  rating:       { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
export default restaurantModel;
