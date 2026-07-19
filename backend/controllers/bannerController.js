import bannerModel from "../models/bannerModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinaryService.js";

// ─── Create banner (super admin only) ────────────────────────
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, restaurantId, order } = req.body;
    if (!title) return res.json({ success: false, message: "Title required" });

    if (!req.file) return res.json({ success: false, message: "Image required" });

    // MIME type check
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Only JPEG, PNG, and WebP images are allowed" 
      });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "cravearc/banners");

    const banner = await bannerModel.create({
      title,
      subtitle: subtitle || "",
      image: imageUrl,
      restaurantId: restaurantId || null,
      order: order ? Number(order) : 0,
      isActive: true,
    });

    res.json({ success: true, message: "Banner created", data: banner });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error creating banner" });
  }
};

// ─── Update banner (super admin only) ────────────────────────
const updateBanner = async (req, res) => {
  try {
    const banner = await bannerModel.findById(req.params.id);
    if (!banner) return res.json({ success: false, message: "Banner not found" });

    let imageUrl = undefined;
    // MIME type check for new image
    if (req.file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          success: false, 
          message: "Only JPEG, PNG, and WebP images are allowed" 
        });
      }

      // Delete old image file
      if (banner.image) {
        await deleteFromCloudinary(banner.image);
      }
      imageUrl = await uploadToCloudinary(req.file.buffer, "cravearc/banners");
    }

    const { title, subtitle, restaurantId, order, isActive } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (restaurantId !== undefined) updates.restaurantId = restaurantId || null;
    if (order !== undefined) updates.order = Number(order);
    if (isActive !== undefined) updates.isActive = isActive;
    if (req.file) updates.image = imageUrl;

    const updated = await bannerModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Banner updated", data: updated });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error updating banner" });
  }
};

// ─── Delete banner (super admin only) ────────────────────────
const deleteBanner = async (req, res) => {
  try {
    const banner = await bannerModel.findById(req.params.id);
    if (!banner) return res.json({ success: false, message: "Banner not found" });

    // Delete image file
    if (banner.image) {
      await deleteFromCloudinary(banner.image);
    }

    await bannerModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error deleting banner" });
  }
};

// ─── List banners (public) ────────────────────────────────────
const listBanners = async (req, res) => {
  try {
    const banners = await bannerModel.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error listing banners" });
  }
};

export { createBanner, updateBanner, deleteBanner, listBanners };
