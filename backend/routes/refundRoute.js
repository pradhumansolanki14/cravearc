import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import {
  customerRequestRefund,
  customerListRefunds,
  customerGetRefund,
  adminListRefunds,
  adminGetRefund,
  adminApproveRefund,
  adminRejectRefund,
  adminProcessRefund,
  adminCompleteRefund,
  adminFailRefund
} from "../controllers/refundController.js";

const refundRouter = express.Router();

// Unified details endpoint: GET /api/refunds/:id
const getRefundDetailUnified = async (req, res) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isAdmin) {
      // Inject admin parameters as adminAuthMiddleware would do
      return adminAuthMiddleware(req, res, () => adminGetRefund(req, res));
    } else {
      // Inject customer parameters as authMiddleware would do
      return authMiddleware(req, res, () => customerGetRefund(req, res));
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// ─── Customer Endpoints ──────────────────────────────────────────
refundRouter.post("/request", authMiddleware, customerRequestRefund);
refundRouter.get("/my",       authMiddleware, customerListRefunds);

// ─── Unified Detail Route ────────────────────────────────────────
refundRouter.get("/:id",      getRefundDetailUnified);

// ─── Platform Admin Endpoints ────────────────────────────────────
refundRouter.get("/",             adminAuthMiddleware, superAdminOnly, adminListRefunds);
refundRouter.post("/:id/approve",  adminAuthMiddleware, superAdminOnly, adminApproveRefund);
refundRouter.post("/:id/reject",   adminAuthMiddleware, superAdminOnly, adminRejectRefund);
refundRouter.post("/:id/process",  adminAuthMiddleware, superAdminOnly, adminProcessRefund);
refundRouter.post("/:id/complete", adminAuthMiddleware, superAdminOnly, adminCompleteRefund);
refundRouter.post("/:id/fail",     adminAuthMiddleware, superAdminOnly, adminFailRefund);

export default refundRouter;
