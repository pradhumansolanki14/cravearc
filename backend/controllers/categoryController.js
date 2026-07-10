import categoryModel from "../models/categoryModel.js";
import foodModel from "../models/foodModel.js";
import fs from "fs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─── Create category (super admin only) ──────────────────────
const createCategory = async (req, res) => {
  try {
    const { name, description, featured } = req.body;
    if (!name) return res.json({ success: false, message: "Name required" });

    // MIME type check
    if (req.file && !ALLOWED_TYPES.includes(req.file.mimetype)) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are allowed" });
    }

    // Check for duplicate name
    const exists = await categoryModel.findOne({ name });
    if (exists) {
      if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
      return res.json({ success: false, message: "Category name already exists" });
    }

    const image_filename = req.file ? req.file.filename : "";

    const category = await categoryModel.create({
      name,
      image: image_filename,
      description: description || "",
      isActive: true,
      featured: featured === 'true' || featured === true ? true : false,
    });

    res.json({ success: true, message: "Category created", data: category });
  } catch (error) {
    console.log(error);
    if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
    res.json({ success: false, message: "Error creating category" });
  }
};

// ─── Update category (super admin only) ──────────────────────
const updateCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) return res.json({ success: false, message: "Category not found" });

    // MIME type check for new image
    if (req.file) {
      if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
        fs.unlink(`uploads/${req.file.filename}`, () => {});
        return res.status(400).json({ success: false, message: "Only JPEG, PNG, and WebP images are allowed" });
      }
      // Delete old image file
      if (category.image) {
        fs.unlink(`uploads/${category.image}`, () => {});
      }
    }

    const { name, description, isActive, featured } = req.body;
    const oldName = category.name;
    const isRenaming = name !== undefined && name !== oldName;

    if (isRenaming) {
      const exists = await categoryModel.findOne({ name });
      if (exists) {
        if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
        return res.json({ success: false, message: "Category name already exists" });
      }
    }

    const updates = {};
    if (name !== undefined)        updates.name        = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined)    updates.isActive    = isActive;
    if (featured !== undefined)    updates.featured    = featured === 'true' || featured === true ? true : false;
    if (req.file)                  updates.image       = req.file.filename;

    const updated = await categoryModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    
    if (isRenaming) {
      // Cascade rename to all referencing food items
      await foodModel.updateMany({ category: oldName }, { category: name });
    }

    res.json({ success: true, message: "Category updated", data: updated });
  } catch (error) {
    console.log(error);
    if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
    res.json({ success: false, message: "Error updating category" });
  }
};

// ─── Delete category (super admin only) ──────────────────────
const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) return res.json({ success: false, message: "Category not found" });

    // 409 guard: cannot delete if food items reference this category
    const referencingFood = await foodModel.findOne({ category: category.name });
    if (referencingFood) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete — food items are using this category",
      });
    }

    // Delete image file from disk
    if (category.image) {
      fs.unlink(`uploads/${category.image}`, () => {});
    }

    await categoryModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting category" });
  }
};

// ─── List categories (public) ─────────────────────────────────
const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error listing categories" });
  }
};

export { createCategory, updateCategory, deleteCategory, listCategories };
