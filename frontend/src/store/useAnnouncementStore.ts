import { create } from "zustand";

import { getPublishedAnnouncementFeed } from "../services/announcementService";

interface AnnouncementState {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

/**
 * The current user's unread announcement count.
 *
 * Shared state rather than local to the announcements page, because the
 * sidebar badge lives in the layout: when the page marks items read, the
 * badge needs to drop immediately, not on the next navigation.
 */
export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  unreadCount: 0,

  refreshUnread: async () => {
    try {
      const feed = await getPublishedAnnouncementFeed();
      set({ unreadCount: feed.unreadCount });
    } catch {
      // The badge is a hint, not critical state; keep the last known value.
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),
}));
