// Dzul
import { useEffect, useState } from 'react';
import { getPublishedAnnouncements } from '../../services/announcementService';
import type { Announcement } from '../../types/announcement';
import PageHeader from '../../components/layout/PageHeader';

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'Everyone',
  students: 'Students',
  instructors: 'Instructors',
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedAnnouncements()
      .then(setAnnouncements)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading announcements...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="student / announcements"
        title="Announcements"
        description="Updates and alerts posted for your courses and the wider campus."
      />

      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {AUDIENCE_LABEL[a.audience] ?? a.audience}
              </span>

              {a.publishedAt && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(a.publishedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-50">{a.title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
              {a.content}
            </p>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white py-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-400 dark:text-gray-500">No announcements right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
