import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import foodReviewModel from "../models/foodReviewModel.js";
import fs from "fs";

// ─── Add food (vendor adds to their restaurant) ──────────────
const addFood = async (req, res) => {
  try {
    // restaurantId comes from the authenticated vendor's token via adminAuth middleware
    const restaurantId = req.restaurantId;
    if (!restaurantId) return res.json({ success: false, message: "No restaurant linked to this account" });

    const image_filename = req.file ? req.file.filename : null;
    if (!image_filename) return res.json({ success: false, message: "Image required" });

    let tagsArray = [];
    if (req.body.tags) {
      try {
        tagsArray = JSON.parse(req.body.tags);
      } catch (e) {
        if (typeof req.body.tags === 'string') {
          tagsArray = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
        } else if (Array.isArray(req.body.tags)) {
          tagsArray = req.body.tags;
        }
      }
    }

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      image: image_filename,
      restaurantId,
      preparationTime: req.body.preparationTime ? Number(req.body.preparationTime) : undefined,
      isVeg: req.body.isVeg === "true" || req.body.isVeg === true,
      calories: req.body.calories ? Number(req.body.calories) : undefined,
      tags: tagsArray,
    });
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Helper to attach ratings stats to food items dynamically using Aggregation
const attachRatingStats = async (foods) => {
  if (!foods || foods.length === 0) return [];
  const foodIds = foods.map(f => f._id.toString());
  try {
    const stats = await foodReviewModel.aggregate([
      { $match: { foodId: { $in: foodIds } } },
      { $group: { _id: "$foodId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    const statsMap = {};
    stats.forEach(s => {
      statsMap[s._id] = {
        avgRating: Math.round(s.avgRating * 10) / 10,
        reviewCount: s.count
      };
    });
    return foods.map(f => {
      const s = statsMap[f._id.toString()] || { avgRating: 0, reviewCount: 0 };
      return {
        ...f.toObject(),
        averageRating: s.avgRating,
        reviewCount: s.reviewCount
      };
    });
  } catch (err) {
    console.error("Error attaching rating stats:", err);
    return foods.map(f => ({ ...f.toObject(), averageRating: 0, reviewCount: 0 }));
  }
};

// ─── List food (public — with optional restaurant filter) ────
const listFood = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.isVeg === "true") filter.isVeg = true;
    const foods = await foodModel.find(filter).populate("restaurantId", "name logo isOpen isApproved deliveryFee");
    // Only show foods from approved, open restaurants to customers
    // If restaurant filter is explicit, show regardless (for vendor dashboard)
    const filtered = req.query.restaurantId
      ? foods
      : foods.filter(f => f.restaurantId?.isApproved);
    
    const foodsWithStats = await attachRatingStats(filtered);
    res.json({ success: true, data: foodsWithStats });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Vendor list (only their own items) ─────────────────────
const listMyFood = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    if (!restaurantId) return res.json({ success: false, message: "No restaurant linked" });
    const foods = await foodModel.find({ restaurantId });
    res.json({ success: true, data: foods });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── Get single food ─────────────────────────────────────────
const getFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.id).populate("restaurantId", "name logo address phone openingHours isOpen");
    if (!food) return res.json({ success: false, message: "Food not found" });

    // Fetch reviews including vendorReply and vendorRepliedAt
    const reviews = await foodReviewModel.find({ foodId: req.params.id }).sort({ createdAt: -1 });

    res.json({ success: true, data: { ...food.toObject(), reviews } });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── Update food (vendor can only update their own) ──────────
const updateFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.id);
    if (!food) return res.json({ success: false, message: "Food not found" });

    // Vendor authorization check
    if (req.restaurantId && food.restaurantId.toString() !== req.restaurantId) {
      return res.json({ success: false, message: "Not authorized to edit this item" });
    }

    let tagsArray = undefined;
    if (req.body.tags) {
      try {
        tagsArray = JSON.parse(req.body.tags);
      } catch (e) {
        if (typeof req.body.tags === 'string') {
          tagsArray = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
        } else if (Array.isArray(req.body.tags)) {
          tagsArray = req.body.tags;
        }
      }
    }

    const updates = {
      name: req.body.name || food.name,
      description: req.body.description || food.description,
      price: req.body.price ? Number(req.body.price) : food.price,
      category: req.body.category || food.category,
      isAvailable: req.body.isAvailable !== undefined ? (req.body.isAvailable === "true" || req.body.isAvailable === true) : food.isAvailable,
      preparationTime: req.body.preparationTime !== undefined ? Number(req.body.preparationTime) : food.preparationTime,
      isVeg: req.body.isVeg !== undefined ? (req.body.isVeg === "true" || req.body.isVeg === true) : food.isVeg,
      calories: req.body.calories !== undefined ? Number(req.body.calories) : food.calories,
      tags: tagsArray !== undefined ? tagsArray : food.tags,
    };

    if (req.file) {
      if (food.image) fs.unlink(`uploads/${food.image}`, () => {});
      updates.image = req.file.filename;
    }

    const updated = await foodModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Food updated", data: updated });
  } catch (error) {
    res.json({ success: false, message: "Error updating food" });
  }
};

// ─── Search food ─────────────────────────────────────────────
const searchFood = async (req, res) => {
  try {
    const { q, category, restaurantId } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
    if (category && category !== "All") filter.category = category;
    if (restaurantId) filter.restaurantId = restaurantId;

    const foods = await foodModel.find(filter).populate("restaurantId", "name logo isApproved").limit(30);
    const result = restaurantId ? foods : foods.filter(f => f.restaurantId?.isApproved);
    const foodsWithStats = await attachRatingStats(result);
    res.json({ success: true, data: foodsWithStats });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── Remove food (vendor can only remove their own) ──────────
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) return res.json({ success: false, message: "Food not found" });

    if (req.restaurantId && food.restaurantId.toString() !== req.restaurantId) {
      return res.json({ success: false, message: "Not authorized" });
    }

    if (food.image) fs.unlink(`uploads/${food.image}`, () => {});
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── List all restaurants (public) ───────────────────────────
const listRestaurants = async (req, res) => {
  try {
    const filter = { isApproved: true };
    
    // Filter by cuisineId (restaurant has this cuisine in cuisineIds array)
    if (req.query.cuisineId) {
      filter.cuisineIds = req.query.cuisineId;
    }
    
    // Filter by featured flag
    if (req.query.featured === "true") {
      filter.featured = true;
    }
    
    const restaurants = await restaurantModel.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const getRestaurant = async (req, res) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    let restaurant;
    if (isObjectId) {
      restaurant = await restaurantModel.findById(req.params.id);
    } else {
      restaurant = await restaurantModel.findOne({ slug: req.params.id.toLowerCase() });
    }
    if (!restaurant) return res.json({ success: false, message: "Restaurant not found" });
    const menu = await foodModel.find({ restaurantId: restaurant._id, isAvailable: true });
    const menuWithStats = await attachRatingStats(menu);
    res.json({ success: true, data: { restaurant, menu: menuWithStats } });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, listFood, listMyFood, removeFood, getFood, searchFood, updateFood, listRestaurants, getRestaurant };
