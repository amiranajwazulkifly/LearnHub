// Dzul
import { useCallback, useEffect, useState } from "react";

import {
  getPublishedAnnouncementFeed,
  markAnnouncementRead,
} from "../../services/announcementService";
import type { Announcement } from "../../types/announcement";
import PageHeader from "../../components/layout/PageHeader";
import { SkeletonList } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { describeLoadError, type LoadErrorCopy } from "../../utils/errorHandler";
import { formatDate } from "../../utils/formatters";
import { useAnnouncementStore } from "../../store/useAnnouncementStore";

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Everyone",
  students: "Students",
  instructors: "Instructors",
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  // Which items were unread when the page opened. Kept for the whole visit
  // so the NEW marker stays readable even though they are marked read as
  // soon as they're shown.
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadErrorCopy | null>(null);

  const setUnreadCount = useAnnouncementStore((state) => state.setUnreadCount);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);

    getPublishedAnnouncementFeed()
      .then((feed) => {
        setAnnouncements(feed.announcements);

        const unread = feed.announcements.filter((a) => !a.isRead);

        // Merge rather than replace. This page marks items read as soon as it
        // loads, so any later fetch — a retry, or React StrictMode running
        // the effect twice in development — sees them as read already.
        // Replacing would wipe the NEW markers the reader hasn't seen yet.
        setNewIds((previous) => new Set([...previous, ...unread.map((a) => a.id)]));

        // Viewing the page is opening them. Mark each read, and clear the
        // sidebar badge straight away rather than waiting on the requests.
        if (unread.length > 0) {
          setUnreadCount(0);
          void Promise.allSettled(unread.map((a) => markAnnouncementRead(a.id)));
        }
      })
      .catch((err) => setLoadError(describeLoadError(err, "announcements")))
      .finally(() => setLoading(false));
  }, [setUnreadCount]);

  useEffect(load, [load]);

  if (loading) {
    return <SkeletonList />;
  }

  const newCount = newIds.size;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="student / announcements"
        title="Announcements"
        description={
          newCount > 0
            ? `${newCount} new since your last visit.`
            : "Updates and alerts posted for your courses and the wider campus."
        }
      />

      {loadError ? (
        <ErrorState
          title={loadError.title}
          description={loadError.description}
          onRetry={loadError.canRetry ? load : undefined}
        />
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No announcements right now"
          description="Updates from your instructors and the campus will appear here."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const isNew = newIds.has(a.id);

            return (
              <article
                key={a.id}
                className={`rounded-xl border bg-white p-4 dark:bg-gray-900 ${
                  isNew
                    ? "border-brand-300 dark:border-brand-800"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isNew && (
                      <span className="rounded-full bg-brand-600 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
                        New
                      </span>
                    )}

                    <span className="rounded-full bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {AUDIENCE_LABEL[a.audience] ?? a.audience}
                    </span>
                  </div>

                  {a.publishedAt && (
                    <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(a.publishedAt)}
                    </p>
                  )}
                </div>

                <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-50">{a.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                  {a.content}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
