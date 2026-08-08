// Dzul
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllAnnouncements, publishAnnouncement, archiveAnnouncement, moveAnnouncementToDraft, deleteAnnouncement,
} from '../../services/announcementService';
import type { Announcement } from '../../types/announcement';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
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

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((x) => x.id !== id));
  }

  async function applyAction(a: Announcement, action: 'publish' | 'archive' | 'draft') {
    const updated =
      action === 'publish' ? await publishAnnouncement(a.id)
      : action === 'archive' ? await archiveAnnouncement(a.id)
      : await moveAnnouncementToDraft(a.id);
    setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
  }

  if (loading) return <p className="p-6 text-gray-500">Loading announcements…</p>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <Link
          to="/admin/announcements/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Announcement
        </Link>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {a.audience}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{a.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {a.status === 'published' && a.publishedAt
                    ? `Published ${new Date(a.publishedAt).toLocaleDateString()}`
                    : a.createdAt
                      ? `Created ${new Date(a.createdAt).toLocaleDateString()}`
                      : ''}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`/admin/announcements/${a.id}/edit`}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Edit
                </Link>
                {a.status !== 'published' && (
                  <button
                    onClick={() => applyAction(a, 'publish')}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                  >
                    Publish
                  </button>
                )}
                {a.status === 'published' && (
                  <button
                    onClick={() => applyAction(a, 'archive')}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                  >
                    Archive
                  </button>
                )}
                {a.status === 'archived' && (
                  <button
                    onClick={() => applyAction(a, 'draft')}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                  >
                    Back to Draft
                  </button>
                )}
                <button
                  onClick={() => handleDelete(a.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}