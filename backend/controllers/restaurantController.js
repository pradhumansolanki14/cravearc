import restaurantModel, { generateUniqueSlug } from "../models/restaurantModel.js";
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
      "address", "phone", "email", "website", "deliveryFee", "minOrder",
      "openingHours", "isOpen", "preparationTime"
    ];

    if (req.body.name && req.body.name !== restaurant.name) {
      restaurant.slug = await generateUniqueSlug(req.body.name, restaurant._id);
    }

    // Parse tags (amenities) array safely
    if (req.body.tags !== undefined) {
      let tagsArray = [];
      try {
        tagsArray = JSON.parse(req.body.tags);
      } catch (e) {
        if (typeof req.body.tags === 'string') {
          tagsArray = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
        } else if (Array.isArray(req.body.tags)) {
          tagsArray = req.body.tags;
        }
      }
      restaurant.tags = tagsArray;
    }

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

    // Handle gallery deletions (remaining filenames passed in body)
    if (req.body.gallery !== undefined) {
      let remaining = [];
      try {
        remaining = JSON.parse(req.body.gallery);
      } catch (e) {
        if (typeof req.body.gallery === 'string') {
          remaining = req.body.gallery.split(',').map(t => t.trim()).filter(Boolean);
        } else if (Array.isArray(req.body.gallery)) {
          remaining = req.body.gallery;
        }
      }
      // Delete unselected gallery files from disk
      if (restaurant.gallery && restaurant.gallery.length > 0) {
        const toDelete = restaurant.gallery.filter(img => !remaining.includes(img));
        toDelete.forEach(img => {
          fs.unlink(`uploads/${img}`, () => {});
        });
      }
      restaurant.gallery = remaining;
    }

    // Handle new gallery uploads (append to list)
    if (req.files?.gallery && req.files.gallery.length > 0) {
      const newImages = req.files.gallery.map(f => f.filename);
      restaurant.gallery = [...(restaurant.gallery || []), ...newImages];
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
