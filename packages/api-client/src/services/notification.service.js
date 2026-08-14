// @doctor/api-client — notificationService (Phase 09).
// Maps to src/modules/notification/* (all routes require auth; any role).
//   list        GET   /notifications/me?page=&limit=
//   unreadCount GET   /notifications/unread-count
//   markRead    PATCH /notifications/:id/read
//   markAllRead PATCH /notifications/read-all
import { request } from "../http-client.js";

export const notificationService = {
  async list({ page, limit } = {}) {
    const usp = new URLSearchParams();
    if (page != null) usp.append("page", String(page));
    if (limit != null) usp.append("limit", String(limit));
    const qs = usp.toString();
    const res = await request(`/notifications/me${qs ? `?${qs}` : ""}`, { method: "GET" });
    return (res && res.data) || null;
  },

  async unreadCount() {
    const res = await request("/notifications/unread-count", { method: "GET" });
    return (res && res.data) || null;
  },

  async markRead(id) {
    const res = await request(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
    return (res && res.data) || null;
  },

  async markAllRead() {
    const res = await request("/notifications/read-all", { method: "PATCH" });
    return (res && res.data) || null;
  },
};
