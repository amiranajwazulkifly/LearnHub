import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  createAssignment,
  deleteAssignment,
  getCourseAssignments,
  updateAssignment,
} from "../../services/assignmentService";

import type { Assignment } from "../../types/assignment";
import { fieldBorderClasses } from "../../utils/formStyles";
import { ROUTES } from "../../constants/routes";
import ConfirmModal from "../../components/common/ConfirmModal";

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

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
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

      closeForm();
      loadAssignments();
    } catch {
      setFormError(
        "Failed to save assignment. Check the fields and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    const id = deleteTarget;

    setDeleteTarget(null);

    await deleteAssignment(id);

    loadAssignments();
  }

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">Loading assignments...</p>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        to={ROUTES.INSTRUCTOR.COURSES}
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to My Courses
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
            instructor / assignments
          </p>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create assignments and review student submissions.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-brand-700 hover:to-brand-600"
        >
          <Plus size={17} />
          New Assignment
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-7 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {editingId ? "Edit Assignment" : "Create New Assignment"}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {editingId
                  ? "Update the assignment details below."
                  : "Add a new assignment for students in this course."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Close assignment form"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  required
                  minLength={2}
                  maxLength={180}
                  className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
                    false,
                  )}`}
                  placeholder="e.g. Week 3 Problem Set"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={5}
                  className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
                    false,
                  )}`}
                  placeholder="Instructions for students..."
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Points
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={form.points}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        points: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 ${fieldBorderClasses(
                      false,
                    )}`}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due date
                  </label>

                  <input
                    type="datetime-local"
                    value={form.due_at}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        due_at: e.target.value,
                      })
                    }
                    className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 ${fieldBorderClasses(
                      false,
                    )}`}
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
                    onRemove={() =>
                      setForm({
                        ...form,
                        remove_attachment: true,
                      })
                    }
                  />
                )}

                <input
                  type="file"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      attachment: e.target.files?.[0] ?? null,
                    })
                  }
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:file:bg-gray-700 dark:file:text-gray-200 dark:hover:file:bg-gray-600"
                />
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex items-start gap-3">
                  <FileText
                    size={18}
                    className="mt-0.5 shrink-0 text-brand-500"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Assignment details
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      Students will be able to view the title, description, due
                      date, points and attachment after the assignment is
                      created.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {formError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-600 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Create Assignment"}
            </button>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <ClipboardList size={22} />
          </div>

          <h2 className="font-semibold text-gray-900 dark:text-gray-50">
            No assignments yet
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create the first assignment for this course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const hasDueDate = Boolean(assignment.dueAt);
            const dueDate = assignment.dueAt
              ? new Date(assignment.dueAt)
              : null;

            const overdue = dueDate !== null && dueDate.getTime() < Date.now();

            return (
              <div
                key={assignment.id}
                className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-600"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Assignment info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
                        <ClipboardList size={14} />
                        Assignment
                      </span>

                      {overdue ? (
                        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                          Past due
                        </span>
                      ) : hasDueDate ? (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-500/10 px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          No due date
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      {assignment.title}
                    </h3>

                    {assignment.description && (
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {assignment.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-brand-500" />
                        <span>
                          {assignment.points
                            ? `${assignment.points} points`
                            : "No points set"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarClock size={16} className="text-amber-500" />

                        <span>
                          {assignment.dueAt
                            ? `Due ${new Date(
                                assignment.dueAt,
                              ).toLocaleString()}`
                            : "No due date"}
                        </span>
                      </div>

                      {assignment.attachmentUrl && (
                        <a
                          href={assignment.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-brand-600 hover:underline dark:text-brand-400"
                        >
                          <FileText size={16} />
                          {assignment.attachmentName ?? "View attachment"}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`${ROUTES.INSTRUCTOR.ASSIGNMENTS}/${assignment.id}/submissions`}
                      className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-3.5 py-2 text-sm font-medium text-white transition hover:from-brand-700 hover:to-brand-600"
                    >
                      <Users size={16} />
                      View Submissions
                    </Link>

                    <button
                      onClick={() => openEditForm(assignment)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteTarget(assignment.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete assignment?"
        message="Student submissions for this assignment will be removed too. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
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
    <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
      <span>Current file:</span>

      <a
        href={assignment.attachmentUrl}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        {assignment.attachmentName}
      </a>

      <button
        type="button"
        onClick={onRemove}
        className="ml-auto text-red-600 hover:underline dark:text-red-400"
      >
        remove
      </button>
    </div>
  );
}
