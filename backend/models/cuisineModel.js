import mongoose from "mongoose";

const cuisineSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  image:    { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const cuisineModel = mongoose.models.cuisine || mongoose.model("cuisine", cuisineSchema);
export default cuisineModel;
