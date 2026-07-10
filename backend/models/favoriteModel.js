import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  foodId: { type: String },
  restaurantId: { type: String },
}, { timestamps: true });

// Sparse compound indexes for optional favorited items
favoriteSchema.index({ userId: 1, foodId: 1 }, { unique: true, partialFilterExpression: { foodId: { $exists: true } } });
favoriteSchema.index({ userId: 1, restaurantId: 1 }, { unique: true, partialFilterExpression: { restaurantId: { $exists: true } } });

const favoriteModel = mongoose.models.favorite || mongoose.model("favorite", favoriteSchema);
export default favoriteModel;
