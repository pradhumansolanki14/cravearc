import categoryRequestModel from "../models/categoryRequestModel.js";
import categoryModel from "../models/categoryModel.js";
import restaurantModel from "../models/restaurantModel.js";

// ─── Vendor: Submit a Category Request ───────────────────────
const submitRequest = async (req, res) => {
  try {
    const { name, description, reason } = req.body;
    if (!name || !name.trim()) {
      return res.json({ success: false, message: "Category name required" });
    }

    const trimmedName = name.trim();

    // 1. Enforce that only vendor accounts make requests
    if (req.adminRole !== "vendor") {
      return res.status(403).json({ success: false, message: "Only vendors can request categories" });
    }

    // 2. Resolve restaurant details
    const restaurant = await restaurantModel.findById(req.restaurantId);
    if (!restaurant) {
      return res.json({ success: false, message: "No restaurant profile associated with this account" });
    }

    // 3. Check duplicate in master catalog (case-insensitive)
    const existsInCatalog = await categoryModel.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") } 
    });
    if (existsInCatalog) {
      return res.json({ success: false, message: "This category is already available in the master catalog" });
    }

    // 4. Check duplicate pending request (case-insensitive)
    const existsPending = await categoryRequestModel.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      status: "pending"
    });
    if (existsPending) {
      return res.json({ success: false, message: "A request for this category is already pending review" });
    }

    // 5. Create request
    const request = new categoryRequestModel({
      name: trimmedName,
      description: description || "",
      reason: reason || "",
      vendorId: req.adminId,
      restaurantId: req.restaurantId,
      restaurantName: restaurant.name,
      status: "pending"
    });

    await request.save();
    res.json({ success: true, message: "Category request submitted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error submitting category request" });
  }
};

// ─── Vendor: List own Category Requests ──────────────────────
const getMyRequests = async (req, res) => {
  try {
    if (req.adminRole !== "vendor") {
      return res.status(403).json({ success: false, message: "Only vendors can access own requests" });
    }

    const requests = await categoryRequestModel.find({ vendorId: req.adminId }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error retrieving requests" });
  }
};

// ─── Super Admin: List all Category Requests ────────────────
const getAllRequests = async (req, res) => {
  try {
    const requests = await categoryRequestModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error retrieving all requests" });
  }
};

// ─── Super Admin: Approve a Request ──────────────────────────
const approveRequest = async (req, res) => {
  try {
    const request = await categoryRequestModel.findById(req.params.id);
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.json({ success: false, message: `Request is already ${request.status}` });
    }

    // 1. Double check case-insensitive match in master catalog
    const catalogDuplicate = await categoryModel.findOne({ 
      name: { $regex: new RegExp(`^${request.name}$`, "i") } 
    });

    if (!catalogDuplicate) {
      // Create actual category in master catalog
      const newCategory = new categoryModel({
        name: request.name,
        description: request.description || "Vendor requested category",
        image: "", // Platform Admin can upload an image later in categories edit
        isActive: true
      });
      await newCategory.save();
    }

    // 2. Set status to Approved
    request.status = "approved";
    request.approvedAt = new Date();
    await request.save();

    res.json({ success: true, message: "Category approved and catalog updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error approving category request" });
  }
};

// ─── Super Admin: Reject a Request ──────────────────────────
const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await categoryRequestModel.findById(req.params.id);
    if (!request) {
      return res.json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.json({ success: false, message: `Request is already ${request.status}` });
    }

    request.status = "rejected";
    request.rejectionReason = rejectionReason || "Does not comply with catalog standards";
    request.rejectedAt = new Date();
    await request.save();

    res.json({ success: true, message: "Category request rejected successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error rejecting category request" });
  }
};

export { submitRequest, getMyRequests, getAllRequests, approveRequest, rejectRequest };
