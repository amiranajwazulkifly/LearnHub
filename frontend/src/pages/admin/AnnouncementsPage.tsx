// Dzul
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllAnnouncements, publishAnnouncement, archiveAnnouncement, deleteAnnouncement,
} from '../../services/announcementService';
import type { Announcement } from '../../types/announcement';
import StatusBadge from '../../components/common/StatusBadge';
import type { StatusTone } from '../../components/common/StatusBadge';

const STATUS_TONE: Record<string, StatusTone> = {
  published: 'green',
  archived: 'gray',
  draft: 'amber',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getAllAnnouncements()
      .then(setAnnouncements)
      .finally(() => setLoading(false));
  }

  async function handlePublishToggle(a: Announcement) {
    const updated = a.status === 'published' ? await archiveAnnouncement(a.id) : await publishAnnouncement(a.id);
    setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((x) => x.id !== id));
  }

  if (loading) return <p className="p-6 text-gray-500 dark:text-gray-400">Loading announcements…</p>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Announcements</h1>
        <Link
          to="/admin/announcements/new"
          className="rounded-md bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600"
        >
          + New Announcement
        </Link>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">{a.title}</h3>
                  <StatusBadge label={a.status} tone={STATUS_TONE[a.status] ?? 'amber'} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{a.content}</p>
                <p className="mt-1 font-mono text-xs text-gray-400 dark:text-gray-500">
                  {a.status === 'published' && a.publishedAt
                    ? `Published ${new Date(a.publishedAt).toLocaleDateString()}`
                    : `Created ${new Date(a.createdAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`/admin/announcements/${a.id}/edit`}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handlePublishToggle(a)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {a.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
