import mongoose from "mongoose";
import adminModel from "../models/adminModel.js";
import restaurantModel, { generateUniqueSlug } from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import settingsModel from "../models/settingsModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

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
    console.log(error);
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
    console.log(error);
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
    console.log(error);
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

    // Step 2: Create restaurant profile linked to vendor
    const slug = await generateUniqueSlug(restaurantName);
    const restaurantDocs = await restaurantModel.create([{
      ownerId: vendor._id,
      name: restaurantName,
      slug,
      description: restaurantDescription || "",
      cuisine: cuisine || "",
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

    // Sync restaurant approval status
    if (vendor.restaurantId) {
      await restaurantModel.findByIdAndUpdate(vendor.restaurantId, { isApproved: approved });
    }

    res.json({ success: true, message: `Vendor ${approved ? "approved" : "rejected"}` });
  } catch (error) {
    console.log(error);
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
    const [totalVendors, totalUsers, totalOrders, restaurants] = await Promise.all([
      adminModel.countDocuments({ role: "vendor" }),
      userModel.countDocuments(),
      orderModel.countDocuments(),
      restaurantModel.find({ isApproved: true }).lean(),
    ]);
    const orders = await orderModel.find({}).populate('restaurantId', 'name');
    const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
    const pendingApprovals = await adminModel.countDocuments({ role: "vendor", isApproved: false });

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
        restaurantBreakdown: restaurantStats, // NEW
      },
    });
  } catch (error) {
    res.json({ success: false, message: "Error" });
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
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export {
  loginAdmin, registerSuperAdmin, registerVendor,
  getAdminProfile, listVendors, approveVendor,
  listUsers, getUserDetail, platformStats,
  toggleUserActive,
};
