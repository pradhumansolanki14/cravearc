import express from "express";
import { createCuisine, updateCuisine, deleteCuisine, listCuisines } from "../controllers/cuisineController.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";

const cuisineRouter = express.Router();

// ─── Public ───────────────────────────────────────────────────
cuisineRouter.get("/",                          listCuisines);

// ─── Super Admin only ────────────────────────────────────────
cuisineRouter.post("/",      adminAuthMiddleware, superAdminOnly, createCuisine);
cuisineRouter.put("/:id",    adminAuthMiddleware, superAdminOnly, updateCuisine);
cuisineRouter.delete("/:id", adminAuthMiddleware, superAdminOnly, deleteCuisine);

export default cuisineRouter;
