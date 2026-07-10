import mongoose from "mongoose";

// A Restaurant is owned by a vendor (admin with role "vendor")
// The adminId links back to the admin/vendor account
const restaurantSchema = new mongoose.Schema({
  ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: "admin", required: true },
  name:         { type: String, required: true },
  slug:         { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  description:  { type: String, default: "" },
  cuisine:      { type: String, default: "" },       // e.g. "Italian, Pizza"
  cuisineIds:   { type: [mongoose.Schema.Types.ObjectId], ref: "cuisine", default: [] },
  featured:     { type: Boolean, default: false },
  preparationTime: { type: Number, default: 30 },   // minutes
  tags:         { type: [String], default: [] },
  website:      { type: String, default: "" },
  address:      { type: String, default: "" },
  phone:        { type: String, default: "" },
  email:        { type: String, default: "" },
  logo:         { type: String, default: "" },        // image filename
  coverImage:   { type: String, default: "" },
  gallery:      { type: [String], default: [] },
  deliveryFee:  { type: Number, default: 2 },
  minOrder:     { type: Number, default: 0 },
  openingHours: { type: String, default: "9:00 AM - 11:00 PM" },
  isOpen:       { type: Boolean, default: true },
  isApproved:   { type: Boolean, default: false },    // super admin approves vendors
  rating:       { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

export const generateUniqueSlug = async (name, excludeId = null) => {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!baseSlug) {
    baseSlug = "restaurant";
  }

  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await mongoose.models.restaurant.findOne(query);
    if (!existing) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
export default restaurantModel;
