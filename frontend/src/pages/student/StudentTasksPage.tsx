import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyAssignments } from "../../services/assignmentService";
import type { Assignment } from "../../types/assignment";
import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { ROUTES } from "../../constants/routes";
import {
  describeLoadError,
  type LoadErrorCopy,
} from "../../utils/errorHandler";
import {
  formatDateTime,
  formatGrade,
  formatTimeRemaining,
} from "../../utils/formatters";

// The four states a task can be in, from the student's point of view. Order
// matches the section order rendered below.
type TaskGroup = "upcoming" | "submitted" | "graded" | "past-due";

const GROUP_LABELS: Record<TaskGroup, string> = {
  upcoming: "Upcoming",
  submitted: "Submitted",
  graded: "Graded",
  "past-due": "Past Due",
};

const GROUP_ORDER: TaskGroup[] = [
  "upcoming",
  "submitted",
  "graded",
  "past-due",
];

const GROUP_DESCRIPTIONS: Record<TaskGroup, string> = {
  upcoming: "Not submitted yet, still open.",
  submitted: "Handed in and waiting to be graded.",
  graded: "Marked and returned by your instructor.",
  "past-due": "The deadline has passed and nothing was submitted.",
};

function groupFor(assignment: Assignment, now: Date): TaskGroup {
  const submission = assignment.mySubmission;

  if (submission) {
    const isGraded =
      submission.grade !== null && submission.grade !== undefined;
    return isGraded ? "graded" : "submitted";
  }

  const isOverdue =
    Boolean(assignment.dueAt) && new Date(assignment.dueAt!) < now;
  return isOverdue ? "past-due" : "upcoming";
}

const GROUP_TONES: Record<TaskGroup, StatusTone> = {
  upcoming: "brand",
  submitted: "amber",
  graded: "green",
  "past-due": "red",
};

function TaskCard({
  assignment,
  group,
}: {
  assignment: Assignment;
  group: TaskGroup;
}) {
  const grade = formatGrade(assignment.mySubmission?.grade, assignment.points);

  // Only meaningful while the clock still matters — once something is handed
  // in or marked, counting down to its deadline is just noise.
  const remaining =
    group === "upcoming" || group === "past-due"
      ? formatTimeRemaining(assignment.dueAt)
      : null;

  return (
    <Link
      to={`${ROUTES.STUDENT.TASKS}/${assignment.id}`}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-line sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="min-w-0">
        <p className="font-mono text-xs font-semibold text-brand-ink">
          {assignment.courseCode} · {assignment.courseTitle}
        </p>

        <h3 className="mt-1 font-semibold text-gray-900 dark:text-gray-50">
          {assignment.title}
        </h3>

        <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
          {assignment.dueAt
            ? `Due ${formatDateTime(assignment.dueAt)}`
            : "No due date"}
          {assignment.points ? ` · ${assignment.points} points` : ""}
        </p>

        {remaining && (
          <p
            className={`mt-1 font-mono text-xs font-medium ${
              group === "past-due"
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {remaining}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {grade && (
          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
            {grade}
          </span>
        )}

        <StatusBadge
          label={GROUP_LABELS[group].toLowerCase()}
          tone={GROUP_TONES[group]}
        />
      </div>
    </Link>
  );
}

function TasksSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-28 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        />
      ))}
    </div>
  );
}

export default function StudentTasksPage() {
  const [filter, setFilter] = useState<TaskGroup | "all">("all");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadErrorCopy | null>(null);

  function load() {
    setLoading(true);
    setLoadError(null);

    getMyAssignments()
      .then(setAssignments)
      .catch((err) => setLoadError(describeLoadError(err, "tasks")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const now = new Date();

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: assignments.filter(
      (assignment) => groupFor(assignment, now) === group,
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-ink">
        student / tasks
      </p>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Tasks
      </h1>

      {loading ? (
        <TasksSkeleton />
      ) : loadError ? (
        <ErrorState
          title={loadError.title}
          description={loadError.description}
          onRetry={loadError.canRetry ? load : undefined}
          backTo={ROUTES.STUDENT.MY_COURSES}
          backLabel="View My Courses"
        />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="You're all caught up. Assignments posted by your instructors will appear here."
          action={
            <Link
              to={ROUTES.STUDENT.MY_COURSES}
              className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg transition hover:bg-brand-hover active:bg-brand-active"
            >
              View My Courses
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="category-tabs" aria-label="Task status">
            {(["all", ...GROUP_ORDER] as const).map((value) => (
              <button
                key={value}
                aria-pressed={filter === value}
                className={filter === value ? "selected" : ""}
                onClick={() => setFilter(value)}
              >
                {value === "all" ? "All" : GROUP_LABELS[value]}
              </button>
            ))}
          </div>
          {filter !== "all" &&
            !grouped.some((section) => section.group === filter) && (
              <EmptyState
                title={`No ${GROUP_LABELS[filter].toLowerCase()} tasks`}
                description="Tasks with this status will appear here."
              />
            )}
          {grouped
            .filter((section) => filter === "all" || section.group === filter)
            .map(({ group, items }) => (
              <section key={group}>
                <div className="mb-3 flex items-baseline gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                    {GROUP_LABELS[group]}
                  </h2>

                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                    {items.length}
                  </span>
                </div>

                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  {GROUP_DESCRIPTIONS[group]}
                </p>

                <div className="space-y-3">
                  {items.map((assignment) => (
                    <TaskCard
                      key={assignment.id}
                      assignment={assignment}
                      group={group}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
