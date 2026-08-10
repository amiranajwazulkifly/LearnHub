import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyAssignments } from "../../services/assignmentService";
import type { Assignment } from "../../types/assignment";
import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";
import { ROUTES } from "../../constants/routes";

function taskStatus(assignment: Assignment): { label: string; tone: StatusTone } {
  const submission = assignment.mySubmission;
  if (!submission) {
    if (assignment.dueAt && new Date(assignment.dueAt) < new Date()) {
      return { label: "overdue", tone: "red" };
    }
    return { label: "not submitted", tone: "gray" };
  }
  if (submission.grade !== null && submission.grade !== undefined) {
    return { label: "graded", tone: "green" };
  }
  return { label: "submitted", tone: "amber" };
}

export default function StudentTasksPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyAssignments()
      .then(setAssignments)
      .catch(() => setError("Failed to load your tasks"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>;
  }

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
        student / tasks
      </p>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">Tasks</h1>

      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {assignments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No assignments yet. Check back once your instructors post some.
        </p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const status = taskStatus(a);
            return (
              <Link
                key={a.id}
                to={`${ROUTES.STUDENT.TASKS}/${a.id}`}
                className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {a.courseCode} · {a.courseTitle}
                  </p>
                  <h3 className="mt-1 font-semibold text-gray-900 dark:text-gray-50">{a.title}</h3>
                  <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {a.points ? `${a.points} pts` : "No points set"}
                    {a.dueAt ? ` · Due ${new Date(a.dueAt).toLocaleString()}` : " · No due date"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {a.mySubmission?.grade !== null && a.mySubmission?.grade !== undefined && (
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {a.mySubmission.grade}
                      {a.points ? ` / ${a.points}` : ""}
                    </span>
                  )}
                  <StatusBadge label={status.label} tone={status.tone} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
