// Dzul
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllAnnouncements, publishAnnouncement, unpublishAnnouncement, deleteAnnouncement,
} from '../../services/announcementService';
import type { Announcement } from '../../types/announcement';

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
    const updated = a.status === 'published' ? await unpublishAnnouncement(a.id) : await publishAnnouncement(a.id);
    setAnnouncements((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((x) => x.id !== id));
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
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{a.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {a.status === 'published' && a.published_at
                    ? `Published ${new Date(a.published_at).toLocaleDateString()}`
                    : `Created ${new Date(a.created_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`/admin/announcements/${a.id}/edit`}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handlePublishToggle(a)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
                >
                  {a.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
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
