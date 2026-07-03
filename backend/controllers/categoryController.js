import categoryModel from "../models/categoryModel.js";
import foodModel from "../models/foodModel.js";

// ─── Create category (super admin only) ──────────────────────
const createCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    if (!name) return res.json({ success: false, message: "Name required" });

    // Check if name already exists
    const exists = await categoryModel.findOne({ name });
    if (exists) return res.json({ success: false, message: "Category name already exists" });

    const category = await categoryModel.create({
      name,
      image: image || "",
      description: description || "",
      isActive: true,
    });

    res.json({ success: true, message: "Category created", data: category });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error creating category" });
  }
};

// ─── Update category (super admin only) ──────────────────────
const updateCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) return res.json({ success: false, message: "Category not found" });

    const { name, image, description, isActive } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (image !== undefined) updates.image = image;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await categoryModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Category updated", data: updated });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating category" });
  }
};

// ─── Delete category (super admin only) ──────────────────────
const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) return res.json({ success: false, message: "Category not found" });

    // 409 guard: Check if any food item references this category
    const referencingFood = await foodModel.findOne({ category: category.name });
    if (referencingFood) {
      return res.status(409).json({ 
        success: false, 
        message: "Category is in use by existing food items" 
      });
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
