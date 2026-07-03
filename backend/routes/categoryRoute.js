import express from "express";
import { createCategory, updateCategory, deleteCategory, listCategories } from "../controllers/categoryController.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";

const categoryRouter = express.Router();

// ─── Public ───────────────────────────────────────────────────
categoryRouter.get("/",                          listCategories);

// ─── Super Admin only ────────────────────────────────────────
categoryRouter.post("/",      adminAuthMiddleware, superAdminOnly, createCategory);
categoryRouter.put("/:id",    adminAuthMiddleware, superAdminOnly, updateCategory);
categoryRouter.delete("/:id", adminAuthMiddleware, superAdminOnly, deleteCategory);

export default categoryRouter;
