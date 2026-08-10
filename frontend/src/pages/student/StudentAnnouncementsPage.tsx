// Dzul
import { useEffect, useState } from 'react';
import { getPublishedAnnouncements } from '../../services/announcementService';
import type { Announcement } from '../../types/announcement';

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedAnnouncements()
      .then(setAnnouncements)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-500 dark:text-gray-400">Loading announcements…</p>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">Announcements</h1>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-gray-50">{a.title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{a.content}</p>
            {a.publishedAt && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {new Date(a.publishedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No announcements right now.</p>
        )}
      </div>
    </div>
  );
}
