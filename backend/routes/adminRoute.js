import express from "express";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import {
  loginAdmin, registerSuperAdmin, registerVendor,
  getAdminProfile, listVendors, approveVendor,
  listUsers, getUserDetail, platformStats,
  toggleUserActive, forgotAdminPassword, resetAdminPassword,
} from "../controllers/adminController.js";
import { adminDeleteReview, replyToReview } from "../controllers/reviewController.js";
import vendorOnly from "../middlewares/vendorOnly.js";

const adminRouter = express.Router();

// ─── Auth ─────────────────────────────────────────────────────
adminRouter.post("/login",              loginAdmin);
adminRouter.post("/register",           registerSuperAdmin);   // secret key guarded
adminRouter.post("/vendor/register",    registerVendor);       // public vendor signup
adminRouter.post("/forgot-password",    forgotAdminPassword);
adminRouter.post("/reset-password",     resetAdminPassword);

// ─── Protected (any admin) ────────────────────────────────────
adminRouter.get("/profile",             adminAuthMiddleware, getAdminProfile);

// ─── Super admin only ─────────────────────────────────────────
adminRouter.get("/vendors",             adminAuthMiddleware, superAdminOnly, listVendors);
adminRouter.post("/vendors/approve",    adminAuthMiddleware, superAdminOnly, approveVendor);
adminRouter.get("/users",               adminAuthMiddleware, superAdminOnly, listUsers);
adminRouter.get("/users/:id",           adminAuthMiddleware, superAdminOnly, getUserDetail);
adminRouter.put("/users/:id",           adminAuthMiddleware, superAdminOnly, toggleUserActive);
adminRouter.get("/platform-stats",      adminAuthMiddleware, superAdminOnly, platformStats);
adminRouter.delete("/reviews/:id",      adminAuthMiddleware, superAdminOnly, adminDeleteReview);

// ─── Vendor only (Restaurant Manager) ────────────────────────
adminRouter.put("/reviews/:reviewId/reply", adminAuthMiddleware, vendorOnly, replyToReview);

export default adminRouter;
