export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  /** In-app path to open when clicked. */
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationFeed {
  notifications: AppNotification[];
  unreadCount: number;
}
