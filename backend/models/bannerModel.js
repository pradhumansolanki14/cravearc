import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  subtitle:     { type: String, default: "" },
  image:        { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "restaurant", default: null },
  isActive:     { type: Boolean, default: true },
  order:        { type: Number, default: 0 },
}, { timestamps: true });

const bannerModel = mongoose.models.banner || mongoose.model("banner", bannerSchema);
export default bannerModel;
