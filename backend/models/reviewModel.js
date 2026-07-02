import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  foodId:  { type: String, required: true },
  userId:  { type: String, required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },
  restaurantId:    { type: String, default: "" },   // populated from food item on create
  vendorReply:     { type: String, default: "" },
  vendorRepliedAt: { type: Date, default: null },
}, { timestamps: true });

// One review per user per food item
reviewSchema.index({ foodId: 1, userId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
