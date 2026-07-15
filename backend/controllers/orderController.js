import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import Stripe from "stripe";
import couponModel from "../models/couponModel.js";
import settingsModel from "../models/settingsModel.js";
import restaurantModel from "../models/restaurantModel.js";
import { createNotification } from "../helpers/notificationHelper.js";
import { sendOrderConfirmationEmail, sendOrderCancelledEmail } from "../services/emailService.js";

// Lazily initialized so dotenv is loaded first
let stripe;
const getStripe = () => {
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
};

// ─── Place Order ─────────────────────────────────────────────
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
  try {
    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ success: false, message: "Payment processing is not configured" });
    }

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

    // ── Build Stripe line items ────────────────────────────────
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));
    line_items.push({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: { name: "Delivery Charges" },
        unit_amount: Math.round(deliveryFee * 100),
      },
      quantity: 1,
    });

    const session = await getStripe().checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/verify?success=false`,
      metadata: { orderId: newOrder._id.toString(), userId },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.json({ success: false, message: "Error creating checkout session" });
  }
};

// ─── Verify Order ─────────────────────────────────────────────
const verifyOrder = async (req, res) => {
  const { success, sessionId } = req.body;
  try {
    if (success === "true" && sessionId) {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return res.json({ success: false, message: "Payment not confirmed" });
      }
      
      const order = await orderModel.findByIdAndUpdate(session.metadata.orderId, { payment: true, status: "Food Processing" }, { new: true });
      const user = await userModel.findById(session.metadata.userId);
      
      if (order && user) {
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

        // Clear user cart
        const cartData = user.cartData || {};
        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            delete cartData[item._id || item.id];
          });
        }
        await userModel.findByIdAndUpdate(session.metadata.userId, { cartData });
      }
      
      return res.json({ success: true, message: "Order confirmed" });
    }
    return res.json({ success: false, message: "Payment failed" });
  } catch (error) {
    console.error("Order Verification Error:", error);
    res.json({ success: false, message: "Error verifying order" });
  }
};

// ─── User Orders ─────────────────────────────────────────────
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── List All Orders (Vendor sees own, SuperAdmin sees all) ───
const listOrders = async (req, res) => {
  try {
    const filter = {};
    // If called from vendor context, scope to their restaurant
    if (req.restaurantId) filter.restaurantId = req.restaurantId;
    const orders = await orderModel.find(filter).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Update Status (Admin) ────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.json({ success: false, message: "Order not found" });

    // Fetch user and restaurant details
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
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Admin Dashboard Stats (vendor-scoped or platform-wide) ──
const adminStats = async (req, res) => {
  try {
    const filter = {};
    if (req.restaurantId) filter.restaurantId = req.restaurantId;

    const orders = await orderModel.find(filter);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const processing = orders.filter(o => o.status === 'Food Processing').length;
    const outForDelivery = orders.filter(o => o.status === 'Out for Delivery').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;

    // Last 7 days revenue
    const now = new Date();
    const dailyRevenue = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyRevenue[d.toISOString().slice(0, 10)] = 0;
    }
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    orders.filter(o => new Date(o.date) >= weekAgo).forEach(o => {
      const key = new Date(o.date).toISOString().slice(0, 10);
      if (dailyRevenue[key] !== undefined) dailyRevenue[key] += o.amount;
    });

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
        totalOrders, totalRevenue, processing, outForDelivery, delivered,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })),
        topItems, recentOrders
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching stats" });
  }
};

// ─── Get Single Order ─────────────────────────────────────────
const getOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, adminStats, getOrder };
