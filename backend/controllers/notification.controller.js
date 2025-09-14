import Notification from "../models/notification.model.js";
import createError from "../utils/createError.js";

// Get user notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    if (notification.userId !== req.userId) {
      return next(createError(403, "You can only mark your own notifications"));
    }

    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Get unread count
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      isRead: false
    });

    res.status(200).json({ count });
  } catch (err) {
    next(err);
  }
};