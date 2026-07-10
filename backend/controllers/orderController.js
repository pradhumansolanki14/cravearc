import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import couponModel from "../models/couponModel.js";
import settingsModel from "../models/settingsModel.js";
import restaurantModel from "../models/restaurantModel.js";

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
      await orderModel.findByIdAndUpdate(session.metadata.orderId, { payment: true, status: "Food Processing" });
      
      const user = await userModel.findById(session.metadata.userId);
      if (user) {
        const order = await orderModel.findById(session.metadata.orderId);
        if (order && Array.isArray(order.items)) {
          const cartData = user.cartData || {};
          order.items.forEach(item => {
            delete cartData[item._id || item.id];
          });
          await userModel.findByIdAndUpdate(session.metadata.userId, { cartData });
        } else {
          await userModel.findByIdAndUpdate(session.metadata.userId, { cartData: {} });
        }
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
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
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
