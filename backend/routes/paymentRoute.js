import express from "express";
import authMiddleware from "../middlewares/auth.js";
import {
  createPaymentOrder,
  verifyPaymentSignature,
  handlePaymentFailure,
  getPaymentDetails,
  handleWebhook
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

// Customer protected payment routes
paymentRouter.post("/create-order", authMiddleware, createPaymentOrder);
paymentRouter.post("/verify", authMiddleware, verifyPaymentSignature);
paymentRouter.post("/failure", authMiddleware, handlePaymentFailure);
paymentRouter.get("/:id", authMiddleware, getPaymentDetails);

// Webhook endpoint (Public - verified cryptographically within controller)
paymentRouter.post("/webhook", handleWebhook);

export default paymentRouter;
