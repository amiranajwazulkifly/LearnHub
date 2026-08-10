// Dzul
//
// Requires: npm install react-hook-form @hookform/resolvers zod

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { announcementSchema, type AnnouncementFormValues } from '../../schemas/announcementSchema';
import {
  createAnnouncement, updateAnnouncement, getAnnouncement,
} from '../../services/announcementService';

export default function AnnouncementFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    getAnnouncement(id)
      .then((a) => reset({ title: a.title, content: a.content }))
      .finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  async function onSubmit(values: AnnouncementFormValues) {
    setSubmitError('');
    try {
      if (isEdit && id) {
        await updateAnnouncement(id, values);
      } else {
        await createAnnouncement(values);
      }
      navigate('/admin/announcements');
    } catch {
      setSubmitError('Failed to save announcement. Please try again.');
    }
  }

  if (loading) return <p className="p-6 text-gray-500 dark:text-gray-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">
        {isEdit ? 'Edit Announcement' : 'New Announcement'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input
            {...register('title')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="e.g. Midterm schedule released"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
          <textarea
            {...register('content')}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="Write the announcement…"
          />
          {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Draft'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/announcements')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
