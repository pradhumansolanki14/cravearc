import express from "express";
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  listAllRestaurants,
  toggleFeatured,
  softDeleteRestaurant
} from "../controllers/restaurantController.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import vendorOnly from "../middlewares/vendorOnly.js";
import multer from "multer";

const restaurantRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// ─── Vendor only (Restaurant Manager) ────────────────────────
restaurantRouter.get("/profile",          adminAuthMiddleware, vendorOnly, getRestaurantProfile);
restaurantRouter.put("/profile",          adminAuthMiddleware, vendorOnly, upload.fields([{ name: "logo" }, { name: "coverImage" }, { name: "gallery", maxCount: 10 }]), updateRestaurantProfile);

// ─── Super Admin only (Platform Admin) ───────────────────────
restaurantRouter.get("/",                 adminAuthMiddleware, superAdminOnly, listAllRestaurants);
restaurantRouter.patch("/:id/featured",   adminAuthMiddleware, superAdminOnly, toggleFeatured);
restaurantRouter.delete("/:id",           adminAuthMiddleware, superAdminOnly, softDeleteRestaurant);

export default restaurantRouter;
