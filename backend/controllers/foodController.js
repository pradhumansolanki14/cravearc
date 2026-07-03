import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import reviewModel from "../models/reviewModel.js";
import fs from "fs";

// ─── Add food (vendor adds to their restaurant) ──────────────
const addFood = async (req, res) => {
  try {
    // restaurantId comes from the authenticated vendor's token via adminAuth middleware
    const restaurantId = req.restaurantId;
    if (!restaurantId) return res.json({ success: false, message: "No restaurant linked to this account" });

    const image_filename = req.file ? req.file.filename : null;
    if (!image_filename) return res.json({ success: false, message: "Image required" });

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      image: image_filename,
      restaurantId,
    });
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── List food (public — with optional restaurant filter) ────
const listFood = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.isVeg === "true") filter.isVeg = true;
    const foods = await foodModel.find(filter).populate("restaurantId", "name logo isOpen isApproved");
    // Only show foods from approved, open restaurants to customers
    // If restaurant filter is explicit, show regardless (for vendor dashboard)
    const filtered = req.query.restaurantId
      ? foods
      : foods.filter(f => f.restaurantId?.isApproved);
    res.json({ success: true, data: filtered });
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
    const reviews = await reviewModel.find({ foodId: req.params.id }).sort({ createdAt: -1 });

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

    const updates = {
      name: req.body.name || food.name,
      description: req.body.description || food.description,
      price: req.body.price ? Number(req.body.price) : food.price,
      category: req.body.category || food.category,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : food.isAvailable,
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

    const foods = await foodModel.find(filter).populate("restaurantId", "name isApproved").limit(30);
    const result = restaurantId ? foods : foods.filter(f => f.restaurantId?.isApproved);
    res.json({ success: true, data: result });
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

// ─── Get restaurant detail with menu ─────────────────────────
const getRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.params.id);
    if (!restaurant) return res.json({ success: false, message: "Restaurant not found" });
    const menu = await foodModel.find({ restaurantId: req.params.id, isAvailable: true });
    res.json({ success: true, data: { restaurant, menu } });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, listFood, listMyFood, removeFood, getFood, searchFood, updateFood, listRestaurants, getRestaurant };
