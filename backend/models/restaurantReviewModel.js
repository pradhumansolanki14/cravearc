import mongoose from "mongoose";

const restaurantReviewSchema = new mongoose.Schema({
  restaurantId:  { type: String, required: true },
  userId:  { type: String, required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },
  vendorReply:     { type: String, default: "" },
  vendorRepliedAt: { type: Date, default: null },
}, { timestamps: true });

// One review per user per restaurant
restaurantReviewSchema.index({ restaurantId: 1, userId: 1 }, { unique: true });

const restaurantReviewModel = mongoose.models.restaurantReview || mongoose.model("restaurantReview", restaurantReviewSchema);
export default restaurantReviewModel;
