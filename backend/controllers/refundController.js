import refundModel from "../models/refundModel.js";
import orderModel from "../models/orderModel.js";
import vendorWalletModel from "../models/vendorWalletModel.js";
import restaurantModel from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";
import { createNotification } from "../helpers/notificationHelper.js";
import * as refundService from "../services/refundService.js";

// ─── Customer Endpoints ──────────────────────────────────────────

// POST /api/refunds/request
export const customerRequestRefund = async (req, res) => {
  try {
    const { orderId, refundType, requestedAmount, reason, customerMessage } = req.body;
    const customerId = req.userId;

    if (!orderId || !refundType || !requestedAmount || !reason) {
      return res.status(400).json({ success: false, message: "Missing required request attributes" });
    }

    const refund = await refundService.requestRefund(
      orderId,
      customerId,
      refundType,
      requestedAmount,
      reason,
      customerMessage
    );

    // Notify Customer
    await createNotification({
      userId: customerId,
      title: "Refund Requested",
      message: `Your refund request for order #${orderId.slice(-6)} has been submitted.`,
      type: "refund",
      link: "/myorders",
      role: "customer"
    });

    res.json({ success: true, message: "Refund request submitted successfully", data: refund });
  } catch (error) {
    console.error("Error creating refund request:", error);
    res.status(400).json({ success: false, message: error.message || "Error submitting refund request" });
  }
};

// GET /api/refunds/my
export const customerListRefunds = async (req, res) => {
  try {
    const refunds = await refundModel.find({ customerId: req.userId })
      .populate("orderId", "amount status date")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: refunds });
  } catch (error) {
    console.error("Error fetching customer refunds:", error);
    res.status(500).json({ success: false, message: "Error fetching refunds" });
  }
};

// GET /api/refunds/:id
export const customerGetRefund = async (req, res) => {
  try {
    const refund = await refundModel.findOne({ _id: req.params.id, customerId: req.userId })
      .populate("orderId")
      .populate("walletId");

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund record not found" });
    }

    res.json({ success: true, data: refund });
  } catch (error) {
    console.error("Error fetching customer refund detail:", error);
    res.status(500).json({ success: false, message: "Error fetching refund details" });
  }
};

// ─── Administrative Endpoints (Platform Admin) ────────────────────

// GET /api/refunds
export const adminListRefunds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.refundType) filter.refundType = req.query.refundType;
    if (req.query.vendorId) filter.vendorId = req.query.vendorId;

    const [refunds, total] = await Promise.all([
      refundModel.find(filter)
        .populate({
          path: "customerId",
          select: "name email"
        })
        .populate({
          path: "vendorId",
          select: "name email restaurantId",
          populate: { path: "restaurantId", select: "name" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      refundModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error listing admin refunds:", error);
    res.status(500).json({ success: false, message: "Error fetching refunds list" });
  }
};

// GET /api/refunds/:id (Admin Detail)
export const adminGetRefund = async (req, res) => {
  try {
    const refund = await refundModel.findById(req.params.id)
      .populate({
        path: "customerId",
        select: "name email"
      })
      .populate({
        path: "vendorId",
        select: "name email restaurantId",
        populate: { path: "restaurantId", select: "name address logo" }
      })
      .populate("orderId")
      .populate("walletId")
      .populate("ledgerEntries");

    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund record not found" });
    }

    res.json({ success: true, data: refund });
  } catch (error) {
    console.error("Error fetching admin refund detail:", error);
    res.status(500).json({ success: false, message: "Error fetching refund details" });
  }
};

// POST /api/refunds/:id/approve
export const adminApproveRefund = async (req, res) => {
  try {
    const { adminRemark, approvedAmount } = req.body;
    const refund = await refundService.approveRefund(req.params.id, adminRemark, approvedAmount);

    // Notify Customer
    await createNotification({
      userId: refund.customerId,
      title: "Refund Approved",
      message: `Your refund of ₹${refund.approvedAmount} for order #${refund.orderId.toString().slice(-6)} has been approved.`,
      type: "refund",
      link: "/myorders",
      role: "customer"
    });

    res.json({ success: true, message: "Refund request approved", data: refund });
  } catch (error) {
    console.error("Error approving refund:", error);
    res.status(400).json({ success: false, message: error.message || "Error approving refund" });
  }
};

// POST /api/refunds/:id/reject
export const adminRejectRefund = async (req, res) => {
  try {
    const { adminRemark } = req.body;
    const refund = await refundService.rejectRefund(req.params.id, adminRemark);

    // Notify Customer
    await createNotification({
      userId: refund.customerId,
      title: "Refund Request Rejected",
      message: `Your refund request for order #${refund.orderId.toString().slice(-6)} has been rejected.`,
      type: "refund",
      link: "/myorders",
      role: "customer"
    });

    res.json({ success: true, message: "Refund request rejected", data: refund });
  } catch (error) {
    console.error("Error rejecting refund:", error);
    res.status(400).json({ success: false, message: error.message || "Error rejecting refund" });
  }
};

// POST /api/refunds/:id/process
export const adminProcessRefund = async (req, res) => {
  try {
    const processedBy = req.adminId;
    const refund = await refundService.processRefund(req.params.id, processedBy);

    // Notify Admin
    await createNotification({
      userId: req.adminId, // Notify current admin
      title: "Refund Processing",
      message: `Refund #${refund.refundNumber} has been sent to gateway for processing.`,
      type: "refund",
      link: `/refund-management`,
      role: "superadmin"
    });

    res.json({ success: true, message: "Refund marked as PROCESSING", data: refund });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(400).json({ success: false, message: error.message || "Error processing refund" });
  }
};

// POST /api/refunds/:id/complete
export const adminCompleteRefund = async (req, res) => {
  try {
    const { gatewayReference } = req.body;
    const refund = await refundService.completeRefund(req.params.id, gatewayReference);

    // Fetch vendor wallet to check negative balance
    const wallet = await vendorWalletModel.findById(refund.walletId);
    const order = await orderModel.findById(refund.orderId);

    // 1. Notify Customer
    await createNotification({
      userId: refund.customerId,
      title: "Refund Completed",
      message: `Your refund of ₹${refund.approvedAmount} has been processed back to your payment account.`,
      type: "refund",
      link: "/myorders",
      role: "customer"
    });

    // 2. Notify Vendor
    if (wallet) {
      await createNotification({
        userId: refund.vendorId,
        title: "Refund Deducted",
        message: `₹${refund.approvedAmount} has been deducted from your wallet for order #${order?._id.toString().slice(-6) || ""}.`,
        type: "refund",
        link: "/wallet",
        role: "vendor"
      });

      if (wallet.availableBalance < 0) {
        await createNotification({
          userId: refund.vendorId,
          title: "Negative Wallet Balance Created",
          message: `Your available balance has dropped to ${wallet.availableBalance} due to refund adjustments. Recovery will occur automatically from future sales.`,
          type: "refund",
          link: "/wallet",
          role: "vendor"
        });
      }
    }

    res.json({ success: true, message: "Refund COMPLETED successfully", data: refund });
  } catch (error) {
    console.error("Error completing refund:", error);
    res.status(400).json({ success: false, message: error.message || "Error completing refund" });
  }
};

// POST /api/refunds/:id/fail
export const adminFailRefund = async (req, res) => {
  try {
    const { failureReason } = req.body;
    const refund = await refundService.failRefund(req.params.id, failureReason);

    res.json({ success: true, message: "Refund marked as FAILED", data: refund });
  } catch (error) {
    console.error("Error failing refund:", error);
    res.status(400).json({ success: false, message: error.message || "Error failing refund" });
  }
};
