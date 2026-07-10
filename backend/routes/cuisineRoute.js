import express from "express";
import { createCuisine, updateCuisine, deleteCuisine, listCuisines } from "../controllers/cuisineController.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

const cuisineRouter = express.Router();

// ─── Public ───────────────────────────────────────────────────
cuisineRouter.get("/",                          listCuisines);

// ─── Super Admin only ────────────────────────────────────────
cuisineRouter.post("/",      adminAuthMiddleware, superAdminOnly, upload.single("image"), createCuisine);
cuisineRouter.put("/:id",    adminAuthMiddleware, superAdminOnly, upload.single("image"), updateCuisine);
cuisineRouter.delete("/:id", adminAuthMiddleware, superAdminOnly, deleteCuisine);

export default cuisineRouter;
