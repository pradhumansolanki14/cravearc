import express from "express";
import authAnyMiddleware from "../middlewares/authAny.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authAnyMiddleware, getNotifications);
notificationRouter.get("/unread-count", authAnyMiddleware, getUnreadCount);
notificationRouter.put("/read-all", authAnyMiddleware, markAllAsRead);
notificationRouter.put("/:id/read", authAnyMiddleware, markAsRead);
notificationRouter.delete("/:id", authAnyMiddleware, deleteNotification);

export default notificationRouter;
