import announcementModel from "../models/announcementModel.js";
import { createNotification } from "../helpers/notificationHelper.js";

// GET /api/announcements (public/user/vendor dashboards)
export const getAnnouncements = async (req, res) => {
  try {
    const role = req.query.role || "all";
    const filter = {
      isPublished: true,
      $or: [
        { targetRole: "all" },
        { targetRole: role }
      ]
    };
    const announcements = await announcementModel.find(filter).sort({ publishedAt: -1 }).limit(10);
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.json({ success: false, message: "Error fetching announcements" });
  }
};

// GET /api/announcements/all (superadmin dashboard)
export const listAllAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error listing all announcements:", error);
    res.json({ success: false, message: "Error" });
  }
};

// POST /api/announcements (superadmin create)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    if (!title || !message) return res.json({ success: false, message: "Title and message are required" });

    const announcement = await announcementModel.create({
      title,
      message,
      targetRole: targetRole || "all",
      isPublished: false
    });

    res.json({ success: true, message: "Announcement created", data: announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.json({ success: false, message: "Error creating announcement" });
  }
};

// PUT /api/announcements/:id (superadmin edit)
export const editAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    const announcement = await announcementModel.findById(req.params.id);
    if (!announcement) return res.json({ success: false, message: "Announcement not found" });

    if (title) announcement.title = title;
    if (message) announcement.message = message;
    if (targetRole) announcement.targetRole = targetRole;

    await announcement.save();
    res.json({ success: true, message: "Announcement updated", data: announcement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.json({ success: false, message: "Error updating announcement" });
  }
};

// DELETE /api/announcements/:id (superadmin delete)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementModel.findById(req.params.id);
    if (!announcement) return res.json({ success: false, message: "Announcement not found" });

    await announcement.deleteOne();
    res.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.json({ success: false, message: "Error deleting announcement" });
  }
};

// POST /api/announcements/:id/publish (superadmin publish)
export const publishAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementModel.findById(req.params.id);
    if (!announcement) return res.json({ success: false, message: "Announcement not found" });

    announcement.isPublished = true;
    announcement.publishedAt = new Date();
    await announcement.save();

    // Broadcast to notifications based on target role
    const roles = announcement.targetRole === "all" ? ["customer", "vendor"] : [announcement.targetRole];
    
    for (const role of roles) {
      await createNotification({
        userId: null, // broadcast
        title: `Announcement: ${announcement.title}`,
        message: announcement.message,
        type: "announcement",
        link: "/", // or dashboard
        role: role
      });
    }

    res.json({ success: true, message: "Announcement published successfully", data: announcement });
  } catch (error) {
    console.error("Error publishing announcement:", error);
    res.json({ success: false, message: "Error publishing announcement" });
  }
};
