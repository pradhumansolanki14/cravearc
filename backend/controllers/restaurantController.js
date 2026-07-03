import restaurantModel from "../models/restaurantModel.js";
import fs from "fs";

// ─── Vendor: get own restaurant profile ──────────────────────
const getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.restaurantId);
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant not found" });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Vendor: update own restaurant profile ───────────────────
const updateRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.restaurantId);
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant not found" });
    }

    // Allowed fields (silently ignores ownerId, isApproved, rating, totalReviews, featured)
    const allowedFields = [
      "name", "description", "cuisine", "cuisineIds",
      "address", "phone", "email", "deliveryFee", "minOrder",
      "openingHours", "isOpen", "preparationTime", "tags"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    });

    // Handle logo upload
    if (req.files?.logo?.[0]) {
      const newFilename = req.files.logo[0].filename;
      if (restaurant.logo) {
        fs.unlink(`uploads/${restaurant.logo}`, () => {});
      }
      restaurant.logo = newFilename;
    }

    // Handle coverImage upload
    if (req.files?.coverImage?.[0]) {
      const newFilename = req.files.coverImage[0].filename;
      if (restaurant.coverImage) {
        fs.unlink(`uploads/${restaurant.coverImage}`, () => {});
      }
      restaurant.coverImage = newFilename;
    }

    const updated = await restaurant.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: list all restaurants ────────────────────────
const listAllRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantModel
      .find({})
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: toggle featured flag ────────────────────────
const toggleFeatured = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.params.id);
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant not found" });
    }
    restaurant.featured = !restaurant.featured;
    const updated = await restaurant.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: soft-delete restaurant ──────────────────────
const softDeleteRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.params.id);
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant not found" });
    }
    restaurant.isApproved = false;
    restaurant.isOpen = false;
    await restaurant.save();
    res.json({ success: true, message: "Restaurant has been deactivated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export {
  getRestaurantProfile,
  updateRestaurantProfile,
  listAllRestaurants,
  toggleFeatured,
  softDeleteRestaurant
};
