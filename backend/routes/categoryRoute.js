import express from "express";
import { createCategory, updateCategory, deleteCategory, listCategories } from "../controllers/categoryController.js";
import { submitRequest, getMyRequests, getAllRequests, approveRequest, rejectRequest } from "../controllers/categoryRequestController.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import multer from "multer";

const categoryRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// ─── Public ───────────────────────────────────────────────────
categoryRouter.get("/", listCategories);

// ─── Category Requests Workflow (ENH-005) ──────────────────────
categoryRouter.post("/requests",             adminAuthMiddleware, submitRequest);
categoryRouter.get("/requests/my",           adminAuthMiddleware, getMyRequests);
categoryRouter.get("/requests/all",          adminAuthMiddleware, superAdminOnly, getAllRequests);
categoryRouter.post("/requests/:id/approve",  adminAuthMiddleware, superAdminOnly, approveRequest);
categoryRouter.post("/requests/:id/reject",   adminAuthMiddleware, superAdminOnly, rejectRequest);

// ─── Super Admin only (Direct Master Catalog) ──────────────────
categoryRouter.post("/",      adminAuthMiddleware, superAdminOnly, upload.single("image"), createCategory);
categoryRouter.put("/:id",    adminAuthMiddleware, superAdminOnly, upload.single("image"), updateCategory);
categoryRouter.delete("/:id", adminAuthMiddleware, superAdminOnly, deleteCategory);

export default categoryRouter;
