import axiosInstance from "../api/axiosInstance";
import type { AppNotification, NotificationFeed } from "../types/notification";

export async function getNotifications(): Promise<NotificationFeed> {
  const { data } = await axiosInstance.get("/notifications");
  return data.data;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await axiosInstance.patch(`/notifications/${id}/read`);
  return data.data.notification;
}

export async function markAllNotificationsRead(): Promise<void> {
  await axiosInstance.patch("/notifications/read-all");
}
