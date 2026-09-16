// Shared display formatting. Kept in one place so a due date reads the same
// on the task list, the task detail page and the instructor's roster.

const DATE_TIME: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

const DATE_ONLY: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, DATE_TIME);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, DATE_ONLY);
}

/**
 * Human "time left" against a deadline, e.g. "3 days left", "5 hours left",
 * "due now", "2 days late". Returns null when there is no deadline, so
 * callers can omit the line entirely rather than print a placeholder.
 */
export function formatTimeRemaining(
  dueAt: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!dueAt) return null;

  const diffMs = new Date(dueAt).getTime() - now.getTime();
  const overdue = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const minutes = Math.floor(absMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "due now";

  const amount =
    days >= 1
      ? `${days} day${days === 1 ? "" : "s"}`
      : hours >= 1
        ? `${hours} hour${hours === 1 ? "" : "s"}`
        : `${minutes} minute${minutes === 1 ? "" : "s"}`;

  return overdue ? `${amount} late` : `${amount} left`;
}

/** Formats a grade as "86 / 100", or "86" when the assignment has no points. */
export function formatGrade(
  grade: number | string | null | undefined,
  points: number | null | undefined,
): string | null {
  if (grade === null || grade === undefined || grade === "") return null;
  return points ? `${grade} / ${points}` : String(grade);
}

/**
 * Compact relative time for feeds, e.g. "just now", "5m ago", "3h ago",
 * "2d ago". Anything older than a week falls back to a plain date, where a
 * relative figure stops being easier to read.
 */
export function formatRelativeTime(value: string, now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - new Date(value).getTime()) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(value);
}
