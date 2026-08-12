export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 7] as const;

export const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export const DAY_SHORT_NAMES: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

// JS's Date#getDay() is 0 (Sunday) - 6 (Saturday); schedules use 1 (Monday) - 7 (Sunday).
export function getTodayDayOfWeek(date: Date = new Date()): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

// Stable color per course so the same course always renders with the same
// accent across the weekly board and any legend, without needing a color
// field in the schema.
const COURSE_COLORS = [
  { border: "border-l-emerald-500", chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  { border: "border-l-amber-500", chip: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  { border: "border-l-rose-500", chip: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" },
  { border: "border-l-cyan-500", chip: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300" },
  { border: "border-l-orange-500", chip: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300" },
  { border: "border-l-teal-500", chip: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300" },
  { border: "border-l-fuchsia-500", chip: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300" },
] as const;

export function getCourseColor(courseId: string) {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash * 31 + courseId.charCodeAt(i)) >>> 0;
  }
  return COURSE_COLORS[hash % COURSE_COLORS.length];
}

interface SessionLike {
  day_of_week: number;
  start_time: string;
}

// Nearest upcoming session from now, searching today first (only sessions
// still ahead of the current time) then forward through the week.
export function getNextSession<T extends SessionLike>(
  sessions: T[],
  now: Date = new Date(),
): { session: T; daysUntil: number } | null {
  const todayDow = getTodayDayOfWeek(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const dow = ((todayDow - 1 + offset) % 7) + 1;

    const candidates = sessions
      .filter((session) => session.day_of_week === dow)
      .filter((session) => {
        if (offset > 0) return true;
        const [hours, minutes] = session.start_time.split(":").map(Number);
        return hours * 60 + minutes >= nowMinutes;
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    if (candidates.length > 0) {
      return { session: candidates[0], daysUntil: offset };
    }
  }

  return null;
}

export function formatMinutesUntil(minutes: number): string {
  if (minutes <= 1) return "now";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) return `${hours} hr`;
  return `${hours} hr ${remaining} min`;
}
