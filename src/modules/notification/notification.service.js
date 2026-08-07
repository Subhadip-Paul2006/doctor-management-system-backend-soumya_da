import ApiError from "../../utils/apiError.js";
import {
  createNotification,
  findMyNotifications,
  countMyNotifications,
  countUnread,
  findNotificationById,
  markAsRead as markAsReadRepo,
  markAllAsRead as markAllAsReadRepo,
} from "./notification.repository.js";

// Called internally by other modules (appointment, admin, doctor, etc.)
// This NEVER throws — a failed notification must never break the action
// that triggered it (e.g. booking an appointment should still succeed
// even if writing the notification row fails for some reason).
export const notifyUser = async ({ userId, type, title, message, meta }) => {
  if (!userId) return null;
  try {
    return await createNotification({ userId, type, title, message, meta });
  } catch (err) {
    console.error("notifyUser failed:", err.message);
    return null;
  }
};

export const getMyNotifications = async (userId, { page = 1, limit = 20 }) => {
  const [items, total, unread] = await Promise.all([
    findMyNotifications({ userId, page, limit }),
    countMyNotifications(userId),
    countUnread(userId),
  ]);
  return { items, total, unread, page, limit };
};

export const getUnreadCount = async (userId) => {
  const count = await countUnread(userId);
  return { count };
};

export const markNotificationRead = async (userId, notificationId) => {
  const notification = await findNotificationById(notificationId);
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId !== userId) {
    throw new ApiError(403, "This notification does not belong to you");
  }
  return markAsReadRepo(notificationId);
};

export const markAllNotificationsRead = async (userId) => {
  return markAllAsReadRepo(userId);
};
