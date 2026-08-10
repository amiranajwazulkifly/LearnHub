import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  createAssignment,
  deleteAssignment,
  getCourseAssignments,
  updateAssignment,
} from "../../services/assignmentService";
import type { Assignment } from "../../types/assignment";
import { fieldBorderClasses } from "../../utils/formStyles";
import { ROUTES } from "../../constants/routes";

interface FormState {
  title: string;
  description: string;
  points: string;
  due_at: string;
  attachment: File | null;
  remove_attachment: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  points: "",
  due_at: "",
  attachment: null,
  remove_attachment: false,
};

export default function InstructorCourseAssignmentsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function loadAssignments() {
    if (!courseId) return;
    setLoading(true);
    getCourseAssignments(courseId)
      .then(setAssignments)
      .catch(() => setError("Failed to load assignments"))
      .finally(() => setLoading(false));
  }

  useEffect(loadAssignments, [courseId]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(assignment: Assignment) {
    setEditingId(assignment.id);
    setForm({
      title: assignment.title,
      description: assignment.description ?? "",
      points: assignment.points ? String(assignment.points) : "",
      due_at: assignment.dueAt ? assignment.dueAt.slice(0, 16) : "",
      attachment: null,
      remove_attachment: false,
    });
    setFormError("");
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    setFormError("");
    setSaving(true);

    try {
      if (editingId) {
        await updateAssignment(editingId, {
          title: form.title,
          description: form.description,
          points: form.points,
          due_at: form.due_at,
          attachment: form.attachment,
          remove_attachment: form.remove_attachment,
        });
      } else {
        await createAssignment({
          course_id: courseId,
          title: form.title,
          description: form.description,
          points: form.points,
          due_at: form.due_at,
          attachment: form.attachment,
        });
      }
      setFormOpen(false);
      loadAssignments();
    } catch {
      setFormError("Failed to save assignment. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this assignment? Student submissions will be removed too.")) return;
    await deleteAssignment(id);
    loadAssignments();
  }

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading assignments...</p>;
  }

  return (
    <div>
      <Link
        to={ROUTES.INSTRUCTOR.COURSES}
        className="font-mono text-sm text-brand-600 hover:underline dark:text-brand-400"
      >
        ← Back to My Courses
      </Link>

      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Assignments</h1>
        <button
          onClick={openCreateForm}
          className="rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-700 hover:to-brand-600"
        >
          + New Assignment
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {editingId ? "Edit Assignment" : "New Assignment"}
          </h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              minLength={2}
              maxLength={180}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(false)}`}
              placeholder="e.g. Week 3 Problem Set"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(false)}`}
              placeholder="Instructions for students..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Points
              </label>
              <input
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(false)}`}
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due date
              </label>
              <input
                type="datetime-local"
                value={form.due_at}
                onChange={(e) => setForm({ ...form, due_at: e.target.value })}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 ${fieldBorderClasses(false)}`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachment
            </label>
            {editingId && !form.remove_attachment && (
              <AttachmentHint
                assignment={assignments.find((a) => a.id === editingId)}
                onRemove={() => setForm({ ...form, remove_attachment: true })}
              />
            )}
            <input
              type="file"
              onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] ?? null })}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-200"
            />
          </div>

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Assignment"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {assignments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No assignments yet for this course.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">{a.title}</h3>
                <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                  {a.points ? `${a.points} pts` : "No points set"}
                  {a.dueAt ? ` · Due ${new Date(a.dueAt).toLocaleString()}` : " · No due date"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to={`${ROUTES.INSTRUCTOR.ASSIGNMENTS}/${a.id}/submissions`}
                  className="rounded-md bg-linear-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600"
                >
                  View Submissions
                </Link>
                <button
                  onClick={() => openEditForm(a)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttachmentHint({
  assignment,
  onRemove,
}: {
  assignment?: Assignment;
  onRemove: () => void;
}) {
  if (!assignment?.attachmentUrl) return null;
  return (
    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
      Current file:{" "}
      <a
        href={assignment.attachmentUrl}
        target="_blank"
        rel="noreferrer"
        className="text-brand-600 hover:underline dark:text-brand-400"
      >
        {assignment.attachmentName}
      </a>{" "}
      —{" "}
      <button type="button" onClick={onRemove} className="text-red-600 hover:underline dark:text-red-400">
        remove
      </button>
    </p>
  );
}
