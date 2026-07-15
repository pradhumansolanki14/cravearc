import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";
import userModel from "../models/userModel.js";

/**
 * Middleware that allows requests from either Customers (via customer token) 
 * or Admins/Vendors (via admin token) to access endpoints like Notification Center.
 */
const authAnyMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return res.status(401).json({ success: false, message: "Not authorized. Please log in again." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.isAdmin) {
      const admin = await adminModel.findById(decoded.id).select("role restaurantId isApproved");
      if (!admin) return res.status(401).json({ success: false, message: "Admin account not found" });
      if (!admin.isApproved) return res.status(403).json({ success: false, message: "Account pending approval" });
      
      req.adminId = decoded.id;
      req.adminRole = admin.role;                          // "superadmin" | "vendor"
      req.restaurantId = admin.restaurantId?.toString();   // null for superadmin
      req.userId = decoded.id;
      req.role = admin.role;                               // "superadmin" | "vendor"
    } else {
      const user = await userModel.findById(decoded.id).select("isActive");
      if (!user) return res.status(401).json({ success: false, message: "User account not found" });
      if (user.isActive === false) return res.status(403).json({ success: false, message: "Account suspended" });
      
      req.userId = decoded.id;
      req.role = "customer";
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authAnyMiddleware;
