import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  image:       { type: String, default: "" },
  description: { type: String, default: "" },
  isActive:    { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
}, { timestamps: true });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);
export default categoryModel;
