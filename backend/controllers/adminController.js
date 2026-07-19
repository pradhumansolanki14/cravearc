import mongoose from "mongoose";
import adminModel from "../models/adminModel.js";
import restaurantModel, { generateUniqueSlug } from "../models/restaurantModel.js";
import cuisineModel from "../models/cuisineModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import settingsModel from "../models/settingsModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
import { 
  sendForgotPasswordEmail, 
  sendPasswordChangedEmail,
  sendVendorReceivedEmail,
  sendVendorApprovedEmail,
  sendVendorRejectedEmail
} from "../services/emailService.js";
import { createNotification } from "../helpers/notificationHelper.js";

const createAdminToken = (id) => jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET);

// ─── Login ───────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await adminModel.findOne({ email });
    if (!admin) return res.json({ success: false, message: "Account not found" });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });
    if (!admin.isApproved) return res.json({ success: false, message: "Your account is pending approval by the platform admin" });

    const token = createAdminToken(admin._id);
    res.json({
      success: true, token,
      name: admin.name,
      role: admin.role,
      restaurantId: admin.restaurantId,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Register superadmin (secret key) ────────────────────────
const registerSuperAdmin = async (req, res) => {
  const { name, email, password, secretKey } = req.body;
  try {
    if (secretKey !== process.env.ADMIN_SECRET_KEY)
      return res.json({ success: false, message: "Invalid secret key" });
    const exists = await adminModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already registered" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password too short" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const admin = await adminModel.create({ name, email, password: hashed, role: "superadmin", isApproved: true });
    const token = createAdminToken(admin._id);
    res.json({ success: true, token, message: "Super admin created" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Vendor self-registration (atomic transaction) ───────────
const registerVendor = async (req, res) => {
  const { name, email, password, restaurantName, restaurantDescription, cuisine, address, phone } = req.body;

  // ── Pre-transaction validation (fast checks before opening session) ──
  try {
    // Check vendorSignupOpen from settings
    const settings = await settingsModel.findOne({});
    if (settings && settings.vendorSignupOpen === false) {
      return res.status(403).json({ success: false, message: "Vendor registrations are currently closed" });
    }

    const exists = await adminModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "Email already registered" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password must be at least 8 characters" });
    if (!restaurantName) return res.json({ success: false, message: "Restaurant name required" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Error registering vendor" });
  }

  // ── Atomic transaction: create vendor + restaurant together ──
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Step 1: Create vendor admin account (pending approval)
    const vendorDocs = await adminModel.create([{
      name, email, password: hashed,
      role: "vendor",
      isApproved: false,
      phone: phone || "",
    }], { session });
    const vendor = vendorDocs[0];

    // Resolve cuisineIds from the cuisine string if any
    let matchedCuisineIds = [];
    if (cuisine) {
      try {
        const allCuisines = await cuisineModel.find({ isActive: true }).session(session);
        const parts = cuisine.split(/[,\s·/&]+/i).map(x => x.trim().toLowerCase()).filter(Boolean);
        for (const c of allCuisines) {
          const cNameLower = c.name.toLowerCase();
          if (parts.includes(cNameLower) || cuisine.toLowerCase().includes(cNameLower)) {
            matchedCuisineIds.push(c._id);
          }
        }
      } catch (err) {
        console.error("Failed to sync cuisineIds on registration:", err);
      }
    }

    // Step 2: Create restaurant profile linked to vendor
    const slug = await generateUniqueSlug(restaurantName);
    const restaurantDocs = await restaurantModel.create([{
      ownerId: vendor._id,
      name: restaurantName,
      slug,
      description: restaurantDescription || "",
      cuisine: cuisine || "",
      cuisineIds: matchedCuisineIds,
      address: address || "",
      phone: phone || "",
      email,
      isApproved: false,
    }], { session });
    const restaurant = restaurantDocs[0];

    // Step 3: Link restaurant back to vendor (cross-reference)
    vendor.restaurantId = restaurant._id;
    await vendor.save({ session });

    // Step 4: Commit — both documents are now persisted
    await session.commitTransaction();

    // Notify SuperAdmins of new vendor application
    await createNotification({
      userId: null,
      title: "New Vendor Application",
      message: `New vendor "${restaurantName}" is pending approval.`,
      type: "vendor",
      link: "/restaurants",
      role: "superadmin"
    });

    // Send transactional emails
    try {
      await sendVendorReceivedEmail(email, name, restaurantName);
    } catch (err) {
      console.error("Failed to send vendor received emails:", err);
    }

    res.json({
      success: true,
      message: "Registration successful! Your account is pending approval by the platform admin. You will be notified once approved.",
    });
  } catch (error) {
    // Roll back all changes if any step fails
    await session.abortTransaction();
    console.log("Vendor registration transaction rolled back:", error);
    res.json({ success: false, message: "Error registering vendor" });
  } finally {
    session.endSession();
  }
};

// ─── Get profile ──────────────────────────────────────────────
const getAdminProfile = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.adminId).select("-password").populate("restaurantId");
    if (!admin) return res.json({ success: false, message: "Not found" });
    res.json({ success: true, data: admin });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: list all vendors ────────────────────────────
const listVendors = async (req, res) => {
  try {
    const vendors = await adminModel.find({ role: "vendor" })
      .select("-password")
      .populate("restaurantId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: approve / reject vendor ─────────────────────
const approveVendor = async (req, res) => {
  try {
    const { vendorId, approved } = req.body;
    const vendor = await adminModel.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") return res.json({ success: false, message: "Vendor not found" });

    vendor.isApproved = approved;
    await vendor.save();

    let restaurantName = "your restaurant";
    if (vendor.restaurantId) {
      const rest = await restaurantModel.findByIdAndUpdate(vendor.restaurantId, { isApproved: approved }, { new: true });
      if (rest) restaurantName = rest.name;
    }

    // 1. Create In-App Notification for the Vendor
    await createNotification({
      userId: vendor._id,
      title: approved ? "Application Approved" : "Application Status Update",
      message: approved 
        ? `Congratulations! Your partner account for "${restaurantName}" has been approved.`
        : `Your application for "${restaurantName}" was not approved.`,
      type: "vendor",
      link: "/dashboard",
      role: "vendor"
    });

    // 2. Send transactional email
    try {
      if (approved) {
        await sendVendorApprovedEmail(vendor.email, vendor.name, restaurantName);
      } else {
        await sendVendorRejectedEmail(vendor.email, vendor.name, restaurantName);
      }
    } catch (err) {
      console.error("Failed to send vendor approval/rejection email:", err);
    }

    res.json({ success: true, message: `Vendor ${approved ? "approved" : "rejected"}` });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: list all users ──────────────────────────────
const listUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password -cartData").sort({ _id: -1 });
    const orders = await orderModel.find({ userId: { $in: users.map(u => u._id.toString()) } });
    const counts = {}, amounts = {};
    orders.forEach(o => {
      counts[o.userId] = (counts[o.userId] || 0) + 1;
      amounts[o.userId] = (amounts[o.userId] || 0) + o.amount;
    });
    const enriched = users.map(u => ({
      ...u.toObject(),
      orderCount: counts[u._id.toString()] || 0,
      totalSpent: amounts[u._id.toString()] || 0,
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: user detail ──────────────────────────────────
const getUserDetail = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password -cartData");
    if (!user) return res.json({ success: false, message: "User not found" });
    const orders = await orderModel.find({ userId: req.params.id }).sort({ date: -1 });
    res.json({ success: true, data: { ...user.toObject(), orders } });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── SuperAdmin: platform-wide stats ─────────────────────────
const platformStats = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const priorWeekAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalVendors,
      totalUsers,
      totalOrders,
      restaurants,
      orders,
      pendingApprovals,
      priorVendors,
      priorUsers
    ] = await Promise.all([
      adminModel.countDocuments({ role: "vendor" }),
      userModel.countDocuments(),
      orderModel.countDocuments({ payment: true }),
      restaurantModel.find({ isApproved: true }).lean(),
      orderModel.find({ payment: true }).populate('restaurantId', 'name'),
      adminModel.countDocuments({ role: "vendor", isApproved: false }),
      adminModel.countDocuments({ role: "vendor", createdAt: { $lt: weekAgo } }),
      userModel.countDocuments({ createdAt: { $lt: weekAgo } })
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);

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

    const formatGrowth = (current, prior) => {
      if (prior === 0) return current > 0 ? "+100%" : "0%";
      const diff = ((current - prior) / prior) * 105 - 5; // slight variance for aesthetics if needed or pure math
      const mathDiff = ((current - prior) / prior) * 100;
      return (mathDiff >= 0 ? "+" : "") + mathDiff.toFixed(0) + "%";
    };

    const trends = {
      restaurants: formatGrowth(totalVendors, priorVendors),
      users: formatGrowth(totalUsers, priorUsers),
      orders: formatGrowth(currentWeekOrders.length, priorWeekOrders.length),
      revenue: formatGrowth(currentWeekRevenue, priorWeekRevenue)
    };

    // Per-restaurant revenue breakdown
    const restaurantBreakdown = {};
    orders.forEach(order => {
      if (order.restaurantId) {
        const id = order.restaurantId._id.toString();
        const name = order.restaurantId.name || 'Unknown Restaurant';
        if (!restaurantBreakdown[id]) {
          restaurantBreakdown[id] = {
            name,
            orderCount: 0,
            totalRevenue: 0,
          };
        }
        restaurantBreakdown[id].orderCount += 1;
        restaurantBreakdown[id].totalRevenue += order.amount;
      }
    });

    const restaurantStats = Object.values(restaurantBreakdown)
      .sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue descending

    res.json({
      success: true,
      data: {
        totalVendors,
        totalUsers,
        totalOrders,
        totalRevenue,
        restaurants: restaurants.length,
        pendingApprovals,
        restaurantBreakdown: restaurantStats,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })),
        dailyOrders: Object.entries(dailyOrders).map(([date, count]) => ({ date, count })),
        trends
      },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching platform stats" });
  }
};

// ─── SuperAdmin: toggle user active status ───────────────────
const toggleUserActive = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.json({ success: false, message: "User not found" });

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "suspended"}`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Forgot Password ───────────────────────────────────────────
const forgotAdminPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.json({ success: false, message: "Email is required" });

    const admin = await adminModel.findOne({ email: email.toLowerCase() });
    if (!admin) {
      // Return success for security, not disclosing account existence
      return res.json({ success: true, message: "If that email is registered, we have sent a reset password link" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await admin.save();

    await sendForgotPasswordEmail(admin.email, admin.name, resetToken, admin.role);

    res.json({ success: true, message: "If that email is registered, we have sent a reset password link" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error sending reset email" });
  }
};

// ─── Reset Password ────────────────────────────────────────────
const resetAdminPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  try {
    if (!token || !password || !confirmPassword) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters long" });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.json({ success: false, message: "Password must contain both letters and numbers" });
    }

    const admin = await adminModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!admin) {
      return res.json({ success: false, message: "Invalid or expired password reset link" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
    admin.resetPasswordToken = null;
    admin.resetPasswordExpiry = null;
    await admin.save();

    try {
      await sendPasswordChangedEmail(admin.email, admin.name);
    } catch (err) {
      console.error("Password reset confirmation email failed to send:", err);
    }

    res.json({ success: true, message: "Your password has been reset successfully!" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error resetting password" });
  }
};

export {
  loginAdmin, registerSuperAdmin, registerVendor,
  getAdminProfile, listVendors, approveVendor,
  listUsers, getUserDetail, platformStats,
  toggleUserActive, forgotAdminPassword, resetAdminPassword,
};
