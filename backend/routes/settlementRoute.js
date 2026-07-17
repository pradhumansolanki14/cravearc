import express from "express";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import {
  getSettlements,
  getSettlementDetail,
  triggerSettlementGeneration,
  adminCompleteSettlement,
  adminFailSettlement,
  adminCancelSettlement,
  adminRetrySettlement
} from "../controllers/settlementController.js";

const settlementRouter = express.Router();

// ─── Shared Routes (Protected) ───────────────────────────────────
settlementRouter.get("/",             adminAuthMiddleware, getSettlements);
settlementRouter.get("/:id",          adminAuthMiddleware, getSettlementDetail);

// ─── Superadmin only Routes ───────────────────────────────────────
settlementRouter.post("/generate",    adminAuthMiddleware, superAdminOnly, triggerSettlementGeneration);
settlementRouter.post("/:id/complete", adminAuthMiddleware, superAdminOnly, adminCompleteSettlement);
settlementRouter.post("/:id/fail",     adminAuthMiddleware, superAdminOnly, adminFailSettlement);
settlementRouter.post("/:id/cancel",   adminAuthMiddleware, superAdminOnly, adminCancelSettlement);
settlementRouter.post("/:id/retry",    adminAuthMiddleware, superAdminOnly, adminRetrySettlement);

export default settlementRouter;
