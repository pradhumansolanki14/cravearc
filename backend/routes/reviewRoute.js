import express from "express";
import * as foodController from "../controllers/foodReviewController.js";
import * as restaurantController from "../controllers/restaurantReviewController.js";
import * as platformController from "../controllers/platformReviewController.js";

import authMiddleware from "../middlewares/auth.js";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";

const reviewRouter = express.Router();

// ─── Food Reviews ─────────────────────────────────────────────
reviewRouter.get("/food/:foodId",              foodController.getReviews);
reviewRouter.post("/food",                     authMiddleware, foodController.addReview);
reviewRouter.delete("/food/:id",               authMiddleware, foodController.deleteReview);
reviewRouter.delete("/food/admin/:id",         adminAuthMiddleware, foodController.adminDeleteReview);
reviewRouter.post("/food/vendor/:reviewId",    adminAuthMiddleware, foodController.replyToReview);

// ─── Restaurant Reviews ───────────────────────────────────────
reviewRouter.get("/restaurant/:restaurantId",  restaurantController.getReviews);
reviewRouter.post("/restaurant",               authMiddleware, restaurantController.addReview);
reviewRouter.delete("/restaurant/:id",         authMiddleware, restaurantController.deleteReview);
reviewRouter.delete("/restaurant/admin/:id",   adminAuthMiddleware, restaurantController.adminDeleteReview);
reviewRouter.post("/restaurant/vendor/:reviewId", adminAuthMiddleware, restaurantController.replyToReview);

// ─── Platform Reviews ─────────────────────────────────────────
reviewRouter.get("/platform",                  platformController.getReviews);
reviewRouter.post("/platform",                 authMiddleware, platformController.addReview);
reviewRouter.delete("/platform/:id",           authMiddleware, platformController.deleteReview);
reviewRouter.delete("/platform/admin/:id",     adminAuthMiddleware, platformController.adminDeleteReview);
reviewRouter.post("/platform/admin/:reviewId", adminAuthMiddleware, superAdminOnly, platformController.replyToReview);

export default reviewRouter;
