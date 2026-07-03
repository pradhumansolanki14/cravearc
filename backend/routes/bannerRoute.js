import express from "express";
import { createBanner, updateBanner, deleteBanner, listBanners } from "../controllers/bannerController.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import multer from "multer";

const bannerRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// ─── Public ───────────────────────────────────────────────────
bannerRouter.get("/",                          listBanners);

// ─── Super Admin only ────────────────────────────────────────
bannerRouter.post("/",      adminAuthMiddleware, superAdminOnly, upload.single("image"), createBanner);
bannerRouter.put("/:id",    adminAuthMiddleware, superAdminOnly, upload.single("image"), updateBanner);
bannerRouter.delete("/:id", adminAuthMiddleware, superAdminOnly, deleteBanner);

export default bannerRouter;
