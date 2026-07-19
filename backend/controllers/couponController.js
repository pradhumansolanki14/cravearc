import couponModel from "../models/couponModel.js";

// ─── Validate coupon (frontend use) ──────────────────────────
const validateCoupon = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;
    if (!code) return res.json({ success: false, message: "Code required" });

    const coupon = await couponModel.findOne({ code: code.toUpperCase() });
    if (!coupon)           return res.json({ success: false, message: "Invalid promo code" });
    if (!coupon.isActive)  return res.json({ success: false, message: "This code is inactive" });
    if (new Date() > coupon.expiresAt) return res.json({ success: false, message: "This code has expired" });
    if (coupon.usedCount >= coupon.maxUses) return res.json({ success: false, message: "This code has reached its usage limit" });
    if (cartAmount < coupon.minOrder)  return res.json({ success: false, message: `Minimum order of $${coupon.minOrder} required` });

    const discountAmount = coupon.discountType === "percent"
      ? parseFloat(((cartAmount * coupon.discount) / 100).toFixed(2))
      : parseFloat(Math.min(coupon.discount, cartAmount).toFixed(2));

    res.json({
      success: true,
      message: `${coupon.discount}${coupon.discountType === "percent" ? "%" : "$"} off applied!`,
      discount: discountAmount,
      couponId: coupon._id,
      code: coupon.code,
      type: coupon.discountType,
      value: coupon.discount,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error validating coupon" });
  }
};

// ─── Admin / Vendor: list coupons ──────────────────────────────
const listCoupons = async (req, res) => {
  try {
    const filter = {};
    if (req.adminRole === "vendor") {
      filter.restaurantId = req.restaurantId;
    }
    const coupons = await couponModel.find(filter).populate("restaurantId", "name logo").sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── Admin / Vendor: create coupon ─────────────────────────────
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discount, minOrder, maxUses, expiresAt, description } = req.body;
    if (!code || !discount || !expiresAt) return res.json({ success: false, message: "Code, discount, and expiry required" });

    const exists = await couponModel.findOne({ code: code.toUpperCase() });
    if (exists) return res.json({ success: false, message: "Code already exists" });

    const restaurantId = req.adminRole === "vendor" ? req.restaurantId : (req.body.restaurantId || null);

    const coupon = await couponModel.create({
      code: code.toUpperCase(), discountType, discount: Number(discount),
      minOrder: Number(minOrder) || 0, maxUses: Number(maxUses) || 100,
      expiresAt: new Date(expiresAt), description, restaurantId
    });
    res.json({ success: true, message: "Coupon created", data: coupon });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error creating coupon" });
  }
};

// ─── Admin / Vendor: toggle active ─────────────────────────────
const toggleCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Not found" });

    // Scope check: vendor can only toggle their own restaurant's coupons
    if (req.adminRole === "vendor") {
      if (!req.restaurantId || !coupon.restaurantId || coupon.restaurantId.toString() !== req.restaurantId) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`, data: coupon });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── Admin / Vendor: delete coupon ─────────────────────────────
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Not found" });

    // Scope check: vendor can only delete their own restaurant's coupons
    if (req.adminRole === "vendor") {
      if (!req.restaurantId || !coupon.restaurantId || coupon.restaurantId.toString() !== req.restaurantId) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    await couponModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

// ─── Admin / Vendor: update coupon ─────────────────────────────
const updateCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    // Scope check: vendor can only edit their own restaurant's coupons
    if (req.adminRole === "vendor") {
      if (!req.restaurantId || !coupon.restaurantId || coupon.restaurantId.toString() !== req.restaurantId) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
    }

    const { code, discountType, discount, minOrder, maxUses, expiresAt, description } = req.body;

    const updates = {};
    if (code !== undefined) {
      const exists = await couponModel.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id } });
      if (exists) return res.json({ success: false, message: "Code already exists" });
      updates.code = code.toUpperCase();
    }
    if (discountType !== undefined) updates.discountType = discountType;
    if (discount !== undefined) updates.discount = Number(discount);
    if (minOrder !== undefined) updates.minOrder = Number(minOrder);
    if (maxUses !== undefined) updates.maxUses = Number(maxUses);
    if (expiresAt !== undefined) updates.expiresAt = new Date(expiresAt);
    if (description !== undefined) updates.description = description;

    // Platform admin can specify a different restaurantId
    if (req.adminRole === "superadmin") {
      if (req.body.restaurantId !== undefined) {
        updates.restaurantId = req.body.restaurantId || null;
      }
    }

    const updated = await couponModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Coupon updated", data: updated });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error updating coupon" });
  }
};

// ─── Customer: list active coupons ──────────────────────────────
const getActiveCoupons = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    // Find active coupons that haven't expired
    const filter = {
      isActive: true,
      expiresAt: { $gt: new Date() }
    };
    
    // Platform-wide OR matches the restaurantId
    if (restaurantId) {
      filter.$or = [
        { restaurantId: null },
        { restaurantId: restaurantId }
      ];
    } else {
      filter.restaurantId = null;
    }
    
    const coupons = await couponModel.find(filter).sort({ discount: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching active coupons" });
  }
};

// ─── Public: list active platform coupons ──────────────────────
const getPublicCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({
      isActive: true,
      restaurantId: null,
      expiresAt: { $gt: new Date() }
    }).sort({ discount: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error fetching public coupons" });
  }
};

export { validateCoupon, listCoupons, createCoupon, toggleCoupon, deleteCoupon, updateCoupon, getActiveCoupons, getPublicCoupons };
