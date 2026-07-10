import favoriteModel from "../models/favoriteModel.js";
import foodModel from "../models/foodModel.js";

// ─── Get user's favorites (sectional foods & restaurants details) ─
const getFavorites = async (req, res) => {
  try {
    const favs = await favoriteModel.find({ userId: req.userId });

    const foodIds = favs.filter(f => f.foodId).map(f => f.foodId);
    const foods = await foodModel.find({ _id: { $in: foodIds } });

    const restaurantIds = favs.filter(f => f.restaurantId).map(f => f.restaurantId);
    const restaurantModel = (await import("../models/restaurantModel.js")).default;
    const restaurants = await restaurantModel.find({ _id: { $in: restaurantIds } });

    res.json({ success: true, data: { foods, restaurants } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Get favorite IDs only (sectional lookup) ────────────────
const getFavoriteIds = async (req, res) => {
  try {
    const favs = await favoriteModel.find({ userId: req.userId });
    res.json({
      success: true,
      data: {
        foods: favs.filter(f => f.foodId).map(f => f.foodId),
        restaurants: favs.filter(f => f.restaurantId).map(f => f.restaurantId)
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Toggle favorite ─────────────────────────────────────────
const toggleFavorite = async (req, res) => {
  const { foodId, restaurantId } = req.body;
  try {
    if (foodId) {
      const existing = await favoriteModel.findOne({ userId: req.userId, foodId });
      if (existing) {
        await favoriteModel.deleteOne({ userId: req.userId, foodId });
        return res.json({ success: true, isFavorite: false, type: "food", message: "Removed from favorites" });
      }
      await favoriteModel.create({ userId: req.userId, foodId });
      return res.json({ success: true, isFavorite: true, type: "food", message: "Added to favorites" });
    } else if (restaurantId) {
      const existing = await favoriteModel.findOne({ userId: req.userId, restaurantId });
      if (existing) {
        await favoriteModel.deleteOne({ userId: req.userId, restaurantId });
        return res.json({ success: true, isFavorite: false, type: "restaurant", message: "Removed from favorites" });
      }
      await favoriteModel.create({ userId: req.userId, restaurantId });
      return res.json({ success: true, isFavorite: true, type: "restaurant", message: "Added to favorites" });
    } else {
      return res.json({ success: false, message: "Either foodId or restaurantId is required" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { getFavorites, getFavoriteIds, toggleFavorite };
