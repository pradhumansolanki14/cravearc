import restaurantModel, { generateUniqueSlug } from "../models/restaurantModel.js";
import cuisineModel from "../models/cuisineModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinaryService.js";

// ─── Vendor: get own restaurant profile ──────────────────────
const getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.restaurantId);
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant not found" });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error(error);
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

    // Keep cuisineIds synced with cuisine text updates
    if (req.body.cuisine !== undefined) {
      try {
        const allCuisines = await cuisineModel.find({ isActive: true });
        const parts = req.body.cuisine.split(/[,\s·/&]+/i).map(x => x.trim().toLowerCase()).filter(Boolean);
        const matchedCuisineIds = [];
        for (const c of allCuisines) {
          const cNameLower = c.name.toLowerCase();
          if (parts.includes(cNameLower) || req.body.cuisine.toLowerCase().includes(cNameLower)) {
            matchedCuisineIds.push(c._id);
          }
        }
        restaurant.cuisineIds = matchedCuisineIds;
      } catch (err) {
        console.error("Failed to sync cuisineIds on update:", err);
      }
    }

    // Handle logo upload
    if (req.files?.logo?.[0]) {
      if (restaurant.logo) {
        await deleteFromCloudinary(restaurant.logo);
      }
      const logoUrl = await uploadToCloudinary(req.files.logo[0].buffer, "cravearc/restaurants/logos");
      restaurant.logo = logoUrl;
    }

    // Handle coverImage upload
    if (req.files?.coverImage?.[0]) {
      if (restaurant.coverImage) {
        await deleteFromCloudinary(restaurant.coverImage);
      }
      const coverUrl = await uploadToCloudinary(req.files.coverImage[0].buffer, "cravearc/restaurants/covers");
      restaurant.coverImage = coverUrl;
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
      // Delete unselected gallery files from Cloudinary
      if (restaurant.gallery && restaurant.gallery.length > 0) {
        const toDelete = restaurant.gallery.filter(img => !remaining.includes(img));
        for (const img of toDelete) {
          await deleteFromCloudinary(img);
        }
      }
      restaurant.gallery = remaining;
    }

    // Handle new gallery uploads (append to list)
    if (req.files?.gallery && req.files.gallery.length > 0) {
      const uploadPromises = req.files.gallery.map(f => uploadToCloudinary(f.buffer, "cravearc/restaurants/gallery"));
      const newImages = await Promise.all(uploadPromises);
      restaurant.gallery = [...(restaurant.gallery || []), ...newImages];
    }

    const updated = await restaurant.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
