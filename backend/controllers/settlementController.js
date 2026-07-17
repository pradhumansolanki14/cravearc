import settlementModel from "../models/settlementModel.js";
import * as settlementService from "../services/settlementService.js";
import orderModel from "../models/orderModel.js";

// GET /api/settlements (Vendor: lists own, Admin: lists all)
export const getSettlements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.adminRole === "vendor") {
      filter.vendorId = req.adminId;
    } else {
      // Admin filters
      if (req.query.vendorId) {
        filter.vendorId = req.query.vendorId;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
      if (req.query.startDate || req.query.endDate) {
        filter.settlementDate = {};
        if (req.query.startDate) {
          filter.settlementDate.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          const end = new Date(req.query.endDate);
          end.setHours(23, 59, 59, 999);
          filter.settlementDate.$lte = end;
        }
      }
    }

    const [settlements, total] = await Promise.all([
      settlementModel.find(filter)
        .populate({
          path: "vendorId",
          select: "name email restaurantId",
          populate: { path: "restaurantId", select: "name" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      settlementModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: settlements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching settlements list:", error);
    res.status(500).json({ success: false, message: "Error fetching settlements" });
  }
};

// GET /api/settlements/:id (Detail query)
export const getSettlementDetail = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.adminRole === "vendor") {
      filter.vendorId = req.adminId;
    }

    const settlement = await settlementModel.findOne(filter)
      .populate({
        path: "vendorId",
        select: "name email restaurantId",
        populate: { path: "restaurantId", select: "name address logo" }
      })
      .populate("orders")
      .populate("ledgerEntries");

    if (!settlement) {
      return res.status(404).json({ success: false, message: "Settlement record not found" });
    }

    // Compute financial summaries dynamically for presentation
    const orders = settlement.orders || [];
    const commissionSummary = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
    const gatewayFeeSummary = orders.reduce((sum, o) => sum + (o.gatewayFee || 0), 0);
    const grossAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const netAmount = settlement.amount;

    res.json({
      success: true,
      data: {
        ...settlement.toObject(),
        summary: {
          grossAmount,
          commissionSummary,
          gatewayFeeSummary,
          netAmount
        }
      }
    });
  } catch (error) {
    console.error("Error fetching settlement detail:", error);
    res.status(500).json({ success: false, message: "Error fetching settlement details" });
  }
};

// POST /api/settlements/generate (Platform Admin only)
export const triggerSettlementGeneration = async (req, res) => {
  try {
    const list = await settlementService.generateWeeklySettlements();
    res.json({
      success: true,
      message: `Weekly settlements generation run completed. Generated ${list.length} pending settlements.`,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error("Error triggering weekly settlements generation:", error);
    res.status(500).json({ success: false, message: error.message || "Error generating settlements" });
  }
};

// POST /api/settlements/:id/complete (Platform Admin only)
export const adminCompleteSettlement = async (req, res) => {
  try {
    const { reference, notes } = req.body;
    const completedBy = req.adminId; // Store admin account ID or username

    const settlement = await settlementService.completeSettlement(req.params.id, completedBy);
    
    // Save reference and notes directly in settlement
    if (reference) settlement.reference = reference;
    if (notes) settlement.notes = notes;
    await settlement.save();

    res.json({ success: true, message: "Settlement payout marked COMPLETED successfully", data: settlement });
  } catch (error) {
    console.error("Error completing settlement:", error);
    res.status(400).json({ success: false, message: error.message || "Error completing settlement" });
  }
};

// POST /api/settlements/:id/fail (Platform Admin only)
export const adminFailSettlement = async (req, res) => {
  try {
    const { failureReason } = req.body;
    const settlement = await settlementService.failSettlement(req.params.id, failureReason);
    res.json({ success: true, message: "Settlement payout marked FAILED", data: settlement });
  } catch (error) {
    console.error("Error failing settlement:", error);
    res.status(400).json({ success: false, message: error.message || "Error failing settlement" });
  }
};

// POST /api/settlements/:id/cancel (Platform Admin only)
export const adminCancelSettlement = async (req, res) => {
  try {
    const settlement = await settlementService.cancelSettlement(req.params.id);
    res.json({ success: true, message: "Settlement payout CANCELLED", data: settlement });
  } catch (error) {
    console.error("Error cancelling settlement:", error);
    res.status(400).json({ success: false, message: error.message || "Error cancelling settlement" });
  }
};

// POST /api/settlements/:id/retry (Platform Admin only)
export const adminRetrySettlement = async (req, res) => {
  try {
    const settlement = await settlementService.retrySettlement(req.params.id);
    res.json({ success: true, message: "Settlement status reset to PENDING for payout retry", data: settlement });
  } catch (error) {
    console.error("Error retrying settlement:", error);
    res.status(400).json({ success: false, message: error.message || "Error retrying settlement" });
  }
};
