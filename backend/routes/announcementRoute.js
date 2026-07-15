import express from "express";
import adminAuthMiddleware, { superAdminOnly } from "../middlewares/adminAuth.js";
import {
  getAnnouncements,
  listAllAnnouncements,
  createAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  publishAnnouncement
} from "../controllers/announcementController.js";

const announcementRouter = express.Router();

// Public / Dashboard announcement feeds
announcementRouter.get("/", getAnnouncements);

// Platform Admin Console Announcement CRUD & Publish
announcementRouter.get("/all", adminAuthMiddleware, superAdminOnly, listAllAnnouncements);
announcementRouter.post("/", adminAuthMiddleware, superAdminOnly, createAnnouncement);
announcementRouter.put("/:id", adminAuthMiddleware, superAdminOnly, editAnnouncement);
announcementRouter.delete("/:id", adminAuthMiddleware, superAdminOnly, deleteAnnouncement);
announcementRouter.post("/:id/publish", adminAuthMiddleware, superAdminOnly, publishAnnouncement);

export default announcementRouter;
