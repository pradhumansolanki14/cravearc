import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import restaurantModel from "../models/restaurantModel.js";
import * as paymentService from "../services/paymentService.js";
import { createNotification } from "../helpers/notificationHelper.js";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

// POST /api/payments/create-order
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.payment) {
      return res.json({ success: false, message: "Order is already paid" });
    }

    // Call paymentService to create Razorpay Order
    const rzpOrder = await paymentService.createOrder(order.amount, "INR", order._id.toString());

    // Update order fields
    order.paymentGatewayOrderId = rzpOrder.id;
    order.paymentGateway = "razorpay";
    order.paymentAmount = order.amount;
    order.paymentCurrency = rzpOrder.currency;
    await order.save();

    res.json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      orderId: order._id
    });
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    res.json({ success: false, message: "Failed to create payment order" });
  }
};

// POST /api/payments/verify
export const verifyPaymentSignature = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.json({ success: false, message: "Verification parameters are missing" });
    }

    // Cryptographic verification
    const isValid = paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.json({ success: false, message: "Invalid payment signature" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // If already marked paid, return success directly (idempotency)
    if (order.payment) {
      return res.json({ success: true, message: "Payment already captured" });
    }

    // Capture payment in DB
    order.payment = true;
    order.paymentStatus = "captured";
    order.paymentPaidAt = new Date();
    order.paymentGatewayPaymentId = razorpay_payment_id;
    order.paymentGatewaySignature = razorpay_signature;
    await order.save();

    // Trigger Notifications & Emails
    const user = await userModel.findById(order.userId);
    if (user) {
      // 1. Notify Customer
      await createNotification({
        userId: user._id,
        title: "Order Confirmed",
        message: `Your order #${order._id.toString().slice(-6)} has been confirmed!`,
        type: "order",
        link: "/myorders",
        role: "customer"
      });

      // 2. Notify Vendor
      const restaurant = await restaurantModel.findById(order.restaurantId);
      if (restaurant) {
        await createNotification({
          userId: restaurant.ownerId,
          title: "New Order Received",
          message: `New order #${order._id.toString().slice(-6)} from ${user.name}!`,
          type: "order",
          link: "/orders",
          role: "vendor"
        });
      }

      // 3. Send confirmation email
      try {
        await sendOrderConfirmationEmail(user.email, user.name, order._id.toString(), order.amount, order.items || []);
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }

      // Clear customer's cart
      const cartData = user.cartData || {};
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          delete cartData[item._id || item.id];
        });
      }
      await userModel.findByIdAndUpdate(order.userId, { cartData });
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying signature:", error);
    res.json({ success: false, message: "Internal server error during verification" });
  }
};

// POST /api/payments/failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, errorReason } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Protect successfully verified captured orders from being overwritten by failure dismiss callbacks
    if (order.payment || order.paymentStatus === "captured") {
      return res.json({ success: true, message: "Order already paid, ignoring failure log" });
    }

    order.paymentStatus = "failed";
    order.paymentFailureReason = errorReason || "User cancelled or gateway failed";
    await order.save();

    res.json({ success: true, message: "Payment failure recorded" });
  } catch (error) {
    console.error("Failed to record payment failure:", error);
    res.json({ success: false, message: "Error recording failure" });
  }
};

// GET /api/payments/:id
export const getPaymentDetails = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        paymentGateway: order.paymentGateway,
        paymentGatewayOrderId: order.paymentGatewayOrderId,
        paymentGatewayPaymentId: order.paymentGatewayPaymentId,
        paymentAmount: order.paymentAmount,
        paymentCurrency: order.paymentCurrency,
        paymentPaidAt: order.paymentPaidAt,
        paymentRefundedAt: order.paymentRefundedAt,
        paymentFailureReason: order.paymentFailureReason
      }
    });
  } catch (error) {
    console.error("Failed to fetch payment details:", error);
    res.status(500).json({ success: false, message: "Error fetching details" });
  }
};

// POST /api/payments/webhook
export const handleWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return res.status(400).json({ success: false, message: "Webhook secret or signature header missing" });
  }

  try {
    // Verify Webhook signature using raw payload buffer
    const isValid = paymentService.validateWebhookSignature(req.rawBody, signature, secret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;

    if (event === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const order = await orderModel.findOne({ paymentGatewayOrderId: paymentEntity.order_id });
      
      if (order && !order.payment) {
        order.payment = true;
        order.paymentStatus = "captured";
        order.paymentPaidAt = new Date();
        order.paymentGatewayPaymentId = paymentEntity.id;
        await order.save();

        const user = await userModel.findById(order.userId);
        if (user) {
          await createNotification({
            userId: user._id,
            title: "Order Confirmed",
            message: `Your order #${order._id.toString().slice(-6)} has been confirmed!`,
            type: "order",
            link: "/myorders",
            role: "customer"
          });

          const restaurant = await restaurantModel.findById(order.restaurantId);
          if (restaurant) {
            await createNotification({
              userId: restaurant.ownerId,
              title: "New Order Received",
              message: `New order #${order._id.toString().slice(-6)} from ${user.name}!`,
              type: "order",
              link: "/orders",
              role: "vendor"
            });
          }

          try {
            await sendOrderConfirmationEmail(user.email, user.name, order._id.toString(), order.amount, order.items || []);
          } catch (err) {
            console.error("Failed to send order confirmation email via webhook:", err);
          }

          const cartData = user.cartData || {};
          if (Array.isArray(order.items)) {
            order.items.forEach(item => {
              delete cartData[item._id || item.id];
            });
          }
          await userModel.findByIdAndUpdate(order.userId, { cartData });
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payment.entity;
      const order = await orderModel.findOne({ paymentGatewayOrderId: paymentEntity.order_id });
      if (order && !order.payment) {
        order.paymentStatus = "failed";
        order.paymentFailureReason = paymentEntity.error_description || "Payment failed at gateway";
        await order.save();
      }
    } else if (event === "refund.processed") {
      const refundEntity = payload.refund.entity;
      const order = await orderModel.findOne({ paymentGatewayPaymentId: refundEntity.payment_id });
      if (order) {
        order.paymentStatus = "refunded";
        order.paymentRefundedAt = new Date();
        await order.save();
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(500).json({ success: false, message: "Webhook handler failed" });
  }
};
