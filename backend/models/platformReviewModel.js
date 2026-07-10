import mongoose from "mongoose";

const platformReviewSchema = new mongoose.Schema({
  userId:  { type: String, required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 500 },
  adminReply:     { type: String, default: "" },
  adminRepliedAt: { type: Date, default: null },
}, { timestamps: true });

// One review per user for the platform
platformReviewSchema.index({ userId: 1 }, { unique: true });

const platformReviewModel = mongoose.models.platformReview || mongoose.model("platformReview", platformReviewSchema);
export default platformReviewModel;
