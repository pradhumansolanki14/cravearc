import notificationModel from "../models/notificationModel.js";

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.role; // customer, vendor, superadmin
    
    // Fetch user-specific notifications or broadcasts for this role
    // that are NOT in the deletedBy array for this user
    const filter = {
      $or: [
        { userId },
        { userId: null, role }
      ],
      deletedBy: { $ne: userId }
    };

    const notifications = await notificationModel.find(filter).sort({ createdAt: -1 }).limit(50);
    
    // Resolve isRead dynamically for broadcast notifications
    const mapped = notifications.map(n => {
      const obj = n.toObject();
      if (!obj.userId) {
        obj.isRead = obj.readBy.some(id => id.toString() === userId.toString());
      }
      return obj;
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.json({ success: false, message: "Error fetching notifications" });
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;

    const notification = await notificationModel.findById(notificationId);
    if (!notification) return res.json({ success: false, message: "Notification not found" });

    if (notification.userId) {
      notification.isRead = true;
    } else {
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    }
    await notification.save();
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification status:", error);
    res.json({ success: false, message: "Error updating notification" });
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.role;

    // 1. Mark all personal notifications as read
    await notificationModel.updateMany({ userId, isRead: false }, { isRead: true });

    // 2. Mark all broadcast notifications for this role as read by adding userId to readBy
    const broadcasts = await notificationModel.find({ userId: null, role, readBy: { $ne: userId } });
    for (const notif of broadcasts) {
      notif.readBy.push(userId);
      await notif.save();
    }

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all read:", error);
    res.json({ success: false, message: "Error marking all read" });
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const notificationId = req.params.id;

    const notification = await notificationModel.findById(notificationId);
    if (!notification) return res.json({ success: false, message: "Notification not found" });

    if (notification.userId) {
      // If it is a personal notification, we can delete it from the DB
      await notification.deleteOne();
    } else {
      // If it is a broadcast notification, we append the userId to deletedBy
      if (!notification.deletedBy.includes(userId)) {
        notification.deletedBy.push(userId);
        await notification.save();
      }
    }
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.json({ success: false, message: "Error deleting notification" });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.role;

    // 1. Count unread personal notifications
    const personalUnread = await notificationModel.countDocuments({ userId, isRead: false });

    // 2. Count unread broadcast notifications (where userId is null, role matches, deletedBy does not contain userId, and readBy does not contain userId)
    const broadcastUnread = await notificationModel.countDocuments({
      userId: null,
      role,
      deletedBy: { $ne: userId },
      readBy: { $ne: userId }
    });

    res.json({ success: true, count: personalUnread + broadcastUnread });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.json({ success: false, message: "Error fetching unread count" });
  }
};
