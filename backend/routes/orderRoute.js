import express from "express";
import authMiddleware from "../middlewares/auth.js";
import adminAuthMiddleware from "../middlewares/adminAuth.js";
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, adminStats, getOrder } from "../controllers/orderController.js";

const orderRouter = express.Router();

// ─── Admin / Vendor ───────────────────────────────────────────
orderRouter.get("/list",         adminAuthMiddleware, listOrders);   // vendor sees own, superadmin sees all
orderRouter.post("/status",      adminAuthMiddleware, updateStatus);
orderRouter.get("/stats",        adminAuthMiddleware, adminStats);

// ─── Customer ─────────────────────────────────────────────────
orderRouter.post("/place",       authMiddleware, placeOrder);
orderRouter.post("/verify",      verifyOrder);
orderRouter.post("/userorders",  authMiddleware, userOrders);
orderRouter.get("/:id",          authMiddleware, getOrder);

export default orderRouter;
