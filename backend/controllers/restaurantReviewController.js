import restaurantReviewModel from "../models/restaurantReviewModel.js";
import userModel from "../models/userModel.js";
import restaurantModel from "../models/restaurantModel.js";

// ─── Get reviews for a restaurant ─────────────────────────────
const getReviews = async (req, res) => {
  try {
    const reviews = await restaurantReviewModel.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 });
    const avg = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    res.json({ success: true, data: reviews, average: parseFloat(avg), count: reviews.length });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Helper to recalculate and update restaurant average rating & review count
const updateRestaurantStats = async (restaurantId) => {
  try {
    const reviews = await restaurantReviewModel.find({ restaurantId });
    const count = reviews.length;
    const avg = count
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count)
      : 0;

    await restaurantModel.findByIdAndUpdate(restaurantId, {
      rating: avg,
      totalReviews: count
    });
  } catch (error) {
    console.error("Error updating restaurant stats:", error);
  }
};

// ─── Add or update review ────────────────────────────────────
const addReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;
    if (!restaurantId || !rating || !comment) return res.json({ success: false, message: "All fields required" });
    if (rating < 1 || rating > 5) return res.json({ success: false, message: "Rating must be 1–5" });

    const user = await userModel.findById(req.userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) return res.json({ success: false, message: "Restaurant not found" });

    const existing = await restaurantReviewModel.findOne({ restaurantId, userId: req.userId });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.name = user.name;
      await existing.save();
      await updateRestaurantStats(restaurantId);
      return res.json({ success: true, message: "Review updated", data: existing });
    }

    const review = await restaurantReviewModel.create({
      restaurantId,
      userId: req.userId,
      name: user.name,
      rating,
      comment
    });
    await updateRestaurantStats(restaurantId);
    res.json({ success: true, message: "Review added", data: review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding review" });
  }
};

// ─── Delete review (own) ─────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const review = await restaurantReviewModel.findById(req.params.id);
    if (!review) return res.json({ success: false, message: "Review not found" });
    if (review.userId !== req.userId) return res.json({ success: false, message: "Unauthorized" });
    const restaurantId = review.restaurantId;
    await review.deleteOne();
    await updateRestaurantStats(restaurantId);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Admin: delete any review ────────────────────────────────
const adminDeleteReview = async (req, res) => {
  try {
    const review = await restaurantReviewModel.findById(req.params.id);
    if (!review) return res.json({ success: false, message: "Review not found" });
    const restaurantId = review.restaurantId;
    await review.deleteOne();
    await updateRestaurantStats(restaurantId);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Vendor: reply to a review ───────────────────────────────
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: "Reply text required" });
    }

    const review = await restaurantReviewModel.findById(req.params.reviewId);
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    if (review.restaurantId !== req.restaurantId) {
      return res.status(403).json({
        success: false,
        message: "Review does not belong to your restaurant"
      });
    }

    review.vendorReply = reply.trim();
    review.vendorRepliedAt = new Date();
    await review.save();

    res.json({ success: true, message: "Reply added", data: review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { getReviews, addReview, deleteReview, adminDeleteReview, replyToReview };
