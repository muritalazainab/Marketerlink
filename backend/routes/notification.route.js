import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.put("/:id/read", verifyToken, markAsRead);
router.put("/mark-all-read", verifyToken, markAllAsRead);

export default router;