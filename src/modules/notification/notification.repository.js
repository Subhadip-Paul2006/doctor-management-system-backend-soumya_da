import prisma from "../../config/db.config.js";

export const createNotification = ({ userId, type, title, message, meta }) => {
  return prisma.notification.create({
    data: { userId, type, title, message, meta },
  });
};

export const findMyNotifications = ({ userId, page = 1, limit = 20 }) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const countMyNotifications = (userId) => {
  return prisma.notification.count({ where: { userId } });
};

export const countUnread = (userId) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const findNotificationById = (id) => {
  return prisma.notification.findUnique({ where: { id } });
};

export const markAsRead = (id) => {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

export const markAllAsRead = (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
