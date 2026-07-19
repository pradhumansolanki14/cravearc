import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import mongoose from "mongoose";
import * as financeService from "../services/financeService.js";
import couponModel from "../models/couponModel.js";
import settingsModel from "../models/settingsModel.js";
import restaurantModel from "../models/restaurantModel.js";
import { createNotification } from "../helpers/notificationHelper.js";
import { sendOrderConfirmationEmail, sendOrderCancelledEmail } from "../services/emailService.js";

// ─── Place Order ─────────────────────────────────────────────
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  try {

    const userId = req.userId;

    // ── Coupon validation (must happen BEFORE order is created) ──
    if (req.body.couponCode) {
      const coupon = await couponModel.findOne({ code: req.body.couponCode.toUpperCase() });

      // Check 1: Coupon exists
      if (!coupon) {
        return res.status(400).json({ success: false, message: "Invalid coupon code" });
      }

      // Check 2: isActive
      if (!coupon.isActive) {
        return res.status(400).json({ success: false, message: "This coupon is inactive" });
      }

      // Check 3: expiresAt
      if (new Date() > coupon.expiresAt) {
        return res.status(400).json({ success: false, message: "Coupon has expired" });
      }

      // Check 4: usedCount < maxUses
      if (coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      }

      // Check 5: minOrder
      if (req.body.amount < coupon.minOrder) {
        return res.status(400).json({ success: false, message: "Order total below coupon minimum" });
      }

      // Check 6: restaurant scope match
      if (coupon.restaurantId && req.body.restaurantId) {
        if (coupon.restaurantId.toString() !== req.body.restaurantId.toString()) {
          return res.status(400).json({ success: false, message: "Coupon not valid for this restaurant" });
        }
      }

      // Calculate discount
      const discountAmount = coupon.discountType === "percent"
        ? (req.body.amount * coupon.discount) / 100
        : Math.min(coupon.discount, req.body.amount);

      // Store for order creation
      req.body.couponId = coupon._id;
      req.body.discountAmount = discountAmount;

      // Atomically increment usedCount
      await couponModel.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    // ── Create order document ──────────────────────────────────
    const newOrder = new orderModel({
      userId,
      restaurantId: req.body.restaurantId || null,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: false,
      status: "Food Processing",
      couponId: req.body.couponId || null,
      discountAmount: req.body.discountAmount || 0,
    });
    await newOrder.save();

    // ── Fetch settings (currency, deliveryFee) ─────────────────
    const settings = await settingsModel.findOne({});
    const currency = settings?.currency || "USD";

    let deliveryFee = settings?.deliveryFee ?? 2;
    if (req.body.restaurantId) {
      const restaurant = await restaurantModel.findById(req.body.restaurantId);
      if (restaurant?.deliveryFee !== undefined) {
        deliveryFee = restaurant.deliveryFee;
      }
    }

    res.json({ success: true, orderId: newOrder._id.toString() });
  } catch (error) {
    console.error("Order Placement Error:", error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// ─── Verify Order ─────────────────────────────────────────────
const verifyOrder = async (req, res) => {
  // Stripe verify is deprecated because Razorpay is the primary gateway
  return res.json({ success: false, message: "Stripe checkout session verification is disabled. Please verify via Razorpay routes." });
};

// ─── User Orders ─────────────────────────────────────────────
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── List All Orders (Vendor sees own, SuperAdmin sees all) ───
const listOrders = async (req, res) => {
  try {
    const filter = { payment: true };
    // If called from vendor context, scope to their restaurant
    if (req.restaurantId) filter.restaurantId = req.restaurantId;
    const orders = await orderModel.find(filter).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Update Status (Admin) ────────────────────────────────────
const updateStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ success: false, message: "Order not found" });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save({ session });

    if (status === "Delivered" && oldStatus !== "Delivered") {
      await financeService.movePendingToAvailable(orderId, session);
    }

    await session.commitTransaction();
    session.endSession();

    // Fetch user and restaurant details for notification side-effects (non-blocking)
    const user = await userModel.findById(order.userId);
    const restaurant = await restaurantModel.findById(order.restaurantId);

    if (user) {
      // 1. Create In-App Notification for Customer
      let notifTitle = "";
      let notifMessage = "";
      if (status === "Food Processing") {
        notifTitle = "Preparing Your Meal";
        notifMessage = `Your order #${orderId.toString().slice(-6)} is now being prepared.`;
      } else if (status === "Out for Delivery") {
        notifTitle = "Out for Delivery";
        notifMessage = `Your order #${orderId.toString().slice(-6)} is out for delivery!`;
      } else if (status === "Delivered") {
        notifTitle = "Order Delivered";
        notifMessage = `Your order #${orderId.toString().slice(-6)} has been delivered. Enjoy!`;
      } else if (status === "Cancelled") {
        notifTitle = "Order Cancelled";
        notifMessage = `Your order #${orderId.toString().slice(-6)} has been cancelled.`;
      }

      if (notifTitle) {
        await createNotification({
          userId: user._id,
          title: notifTitle,
          message: notifMessage,
          type: "order",
          link: "/myorders",
          role: "customer"
        });
      }

      // 2. Extra triggers on delivery or cancel
      if (status === "Delivered") {
        // Review reminder notification only (no email mandatory)
        await createNotification({
          userId: user._id,
          title: "Review Your Order",
          message: `Please share your feedback for order #${orderId.toString().slice(-6)}.`,
          type: "review",
          link: "/myorders",
          role: "customer"
        });
      }

      if (status === "Cancelled") {
        // Notify Vendor
        if (restaurant) {
          await createNotification({
            userId: restaurant.ownerId,
            title: "Order Cancelled",
            message: `Order #${orderId.toString().slice(-6)} has been cancelled.`,
            type: "order",
            link: "/orders",
            role: "vendor"
          });

          // Send cancel email to Vendor
          const vendor = await adminModel.findById(restaurant.ownerId);
          if (vendor && vendor.email) {
            try {
              await sendOrderCancelledEmail(vendor.email, vendor.name, orderId.toString());
            } catch (err) {
              console.error("Failed to send vendor order cancelled email:", err);
            }
          }
        }

        // Send cancel email to Customer
        try {
          await sendOrderCancelledEmail(user.email, user.name, orderId.toString());
        } catch (err) {
          console.error("Failed to send customer order cancelled email:", err);
        }
      }
    }

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Admin Dashboard Stats (vendor-scoped or platform-wide) ──
const adminStats = async (req, res) => {
  try {
    const filter = { payment: true };
    if (req.restaurantId) filter.restaurantId = req.restaurantId;

    const orders = await orderModel.find(filter);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const processing = orders.filter(o => o.status === 'Food Processing').length;
    const outForDelivery = orders.filter(o => o.status === 'Out for Delivery').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const priorWeekAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Last 7 days daily revenue & orders
    const dailyRevenue = {};
    const dailyOrders = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyRevenue[key] = 0;
      dailyOrders[key] = 0;
    }

    orders.filter(o => new Date(o.date) >= weekAgo).forEach(o => {
      const key = new Date(o.date).toISOString().slice(0, 10);
      if (dailyRevenue[key] !== undefined) dailyRevenue[key] += o.amount;
      if (dailyOrders[key] !== undefined) dailyOrders[key] += 1;
    });

    // Compute dynamic trends (current week vs prior week)
    const currentWeekOrders = orders.filter(o => new Date(o.date) >= weekAgo);
    const priorWeekOrders = orders.filter(o => new Date(o.date) >= priorWeekAgo && new Date(o.date) < weekAgo);

    const currentWeekRevenue = currentWeekOrders.reduce((sum, o) => sum + o.amount, 0);
    const priorWeekRevenue = priorWeekOrders.reduce((sum, o) => sum + o.amount, 0);

    const currentWeekDelivered = currentWeekOrders.filter(o => o.status === 'Delivered').length;
    const priorWeekDelivered = priorWeekOrders.filter(o => o.status === 'Delivered').length;

    const formatGrowth = (current, prior) => {
      if (prior === 0) return current > 0 ? "+100%" : "0%";
      const diff = ((current - prior) / prior) * 100;
      return (diff >= 0 ? "+" : "") + diff.toFixed(0) + "%";
    };

    const trends = {
      revenue: formatGrowth(currentWeekRevenue, priorWeekRevenue),
      orders: formatGrowth(currentWeekOrders.length, priorWeekOrders.length),
      processing: "Active",
      delivered: formatGrowth(currentWeekDelivered, priorWeekDelivered)
    };

    // Top selling items
    const itemCounts = {};
    orders.forEach(o => o.items.forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
      itemCounts[item.name].count += item.quantity || 1;
      itemCounts[item.name].revenue += item.price * (item.quantity || 1);
    }));
    const topItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        processing,
        outForDelivery,
        delivered,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })),
        dailyOrders: Object.entries(dailyOrders).map(([date, count]) => ({ date, count })),
        trends,
        topItems,
        recentOrders
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching stats" });
  }
};

// ─── Get Single Order ─────────────────────────────────────────
const getOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, adminStats, getOrder };
