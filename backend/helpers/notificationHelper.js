import notificationModel from "../models/notificationModel.js";

/**
 * Reusable helper to create a database notification.
 * Designed to easily support Socket.IO triggers in the future.
 * 
 * @param {Object} params
 * @param {string|null} params.userId - Recipient user/admin ID (null for system broadcasts)
 * @param {string} params.title - Title of notification
 * @param {string} params.message - Body content of notification
 * @param {string} params.type - Enum type ("order", "review", "coupon", "announcement", "system", "vendor", "platform")
 * @param {string} params.link - Navigation target redirect
 * @param {string} params.role - Target role enum ("customer", "vendor", "superadmin")
 * @returns {Promise<Object|null>}
 */
export const createNotification = async ({ userId = null, title, message, type, link = "", role = "customer" }) => {
  try {
    const notification = await notificationModel.create({
      userId,
      title,
      message,
      type,
      link,
      role,
      isRead: false
    });
    
    // TODO: Centralized socket.io emit event can be placed here in the future:
    // getIoInstance().to(userId ? userId.toString() : role).emit("notification", notification);
    
    return notification;
  } catch (error) {
    console.error("Failed to create database notification:", error);
    return null;
  }
};
