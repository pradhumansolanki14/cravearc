import cuisineModel from "../models/cuisineModel.js";
import restaurantModel from "../models/restaurantModel.js";
import fs from "fs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─── Create cuisine (super admin only) ───────────────────────
const createCuisine = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.json({ success: false, message: "Name required" });

    // MIME type check
    if (req.file && !ALLOWED_TYPES.includes(req.file.mimetype)) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are allowed" });
    }

    // Check if name already exists
    const exists = await cuisineModel.findOne({ name });
    if (exists) {
      if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.json({ success: false, message: "Cuisine name already exists" });
    }

    const image_filename = req.file ? req.file.filename : "";

    const cuisine = await cuisineModel.create({
      name,
      image: image_filename,
      isActive: true,
    });

    res.json({ success: true, message: "Cuisine created", data: cuisine });
  } catch (error) {
    console.log(error);
    if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
    res.json({ success: false, message: "Error creating cuisine" });
  }
};

// ─── Update cuisine (super admin only) ───────────────────────
const updateCuisine = async (req, res) => {
  try {
    const cuisine = await cuisineModel.findById(req.params.id);
    if (!cuisine) return res.json({ success: false, message: "Cuisine not found" });

    // MIME type check for new image
    if (req.file) {
      if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
        fs.unlink(`uploads/${req.file.filename}`, () => {});
        return res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are allowed" });
      }
      // Delete old image file
      if (cuisine.image) {
        fs.unlink(`uploads/${cuisine.image}`, () => {});
      }
    }

    const { name, isActive } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (isActive !== undefined) updates.isActive = isActive;
    if (req.file) updates.image = req.file.filename;

    const updated = await cuisineModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Cuisine updated", data: updated });
  } catch (error) {
    console.log(error);
    if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
    res.json({ success: false, message: "Error updating cuisine" });
  }
};

// ─── Delete cuisine (super admin only) ───────────────────────
const deleteCuisine = async (req, res) => {
  try {
    const cuisine = await cuisineModel.findById(req.params.id);
    if (!cuisine) return res.json({ success: false, message: "Cuisine not found" });

    // 409 guard: Check if any restaurant references this cuisine
    const referencingRestaurant = await restaurantModel.findOne({ cuisineIds: req.params.id });
    if (referencingRestaurant) {
      return res.status(409).json({ 
        success: false, 
        message: "Cuisine is referenced by existing restaurants" 
      });
    }

    if (cuisine.image) {
      fs.unlink(`uploads/${cuisine.image}`, () => {});
    }

    await cuisineModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Cuisine deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting cuisine" });
  }
};

// ─── List cuisines (public) ───────────────────────────────────
const listCuisines = async (req, res) => {
  try {
    const cuisines = await cuisineModel.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: cuisines });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error listing cuisines" });
  }
};

export { createCuisine, updateCuisine, deleteCuisine, listCuisines };
