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
// The chart palette from the design system: lime first, then hues far enough
// apart to tell neighbouring sessions apart on the week board. Chips use a
// soft tint of the same hue with a legible ink.
const COURSE_COLORS = [
  {
    border: "border-l-brand",
    chip: "bg-brand-soft text-brand-ink",
  },
  {
    border: "border-l-sky-400",
    chip: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  },
  {
    border: "border-l-teal-500",
    chip: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
  },
  {
    border: "border-l-indigo-500",
    chip: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  },
  {
    border: "border-l-amber-500",
    chip: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  },
  {
    border: "border-l-rose-500",
    chip: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  },
  {
    border: "border-l-slate-400",
    chip: "bg-slate-500/12 text-slate-700 dark:text-slate-300",
  },
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
  start_date?: string | null;
  end_date?: string | null;
}

// The calendar date on which `session` would next fall, `offset` days from
// `from`. Used to check a recurring session against its date range.
function dateForOffset(from: Date, offset: number): Date {
  const date = new Date(from);
  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseScheduleDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  // Schedule bounds are DATE columns ("2026-08-30"); parse as local midnight
  // so a timezone offset can't shift them onto the wrong day.
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

// A weekly session only actually happens on a given date if that date falls
// within the schedule's configured range:  start_date <= date <= end_date.
// A null bound is open-ended. Without this a course that ended in August
// keeps rendering as an upcoming class forever.
export function isSessionActiveOn(
  session: { start_date?: string | null; end_date?: string | null },
  date: Date,
): boolean {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const start = parseScheduleDate(session.start_date);
  if (start && target < start) return false;

  const end = parseScheduleDate(session.end_date);
  if (end && target > end) return false;

  return true;
}

// The calendar date of a given weekday within the week containing `from`
// (weeks run Monday-first, matching DAY_ORDER). Lets the weekly board check
// each column against the real date it represents.
export function dateForDayThisWeek(
  dayOfWeek: number,
  from: Date = new Date(),
): Date {
  const date = new Date(from);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + (dayOfWeek - getTodayDayOfWeek(from)));
  return date;
}

// Sessions that fall on `date`, respecting both the weekday and the range.
export function sessionsOnDate<T extends SessionLike>(
  sessions: T[],
  date: Date,
): T[] {
  const dow = getTodayDayOfWeek(date);
  return sessions
    .filter((session) => session.day_of_week === dow)
    .filter((session) => isSessionActiveOn(session, date))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
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
    const candidateDate = dateForOffset(now, offset);

    const candidates = sessions
      .filter((session) => session.day_of_week === dow)
      // Skip occurrences that fall outside the schedule's date range, so a
      // finished course never becomes "your next lecture".
      .filter((session) => isSessionActiveOn(session, candidateDate))
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

/** Layout connected overlap groups with stable lanes; adjacent classes can reuse a lane. */
export function layoutDaySessions<
  T extends { start_time: string; end_time: string },
>(sessions: T[]) {
  const sorted = [...sessions].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
  const result: { session: T; lane: number; lanes: number }[] = [];
  let group: { session: T; lane: number; lanes: number }[] = [];
  let laneEnds: string[] = [];
  let groupEnd = "";
  function flush() {
    for (const item of group) item.lanes = laneEnds.length;
    result.push(...group);
    group = [];
    laneEnds = [];
  }
  for (const session of sorted) {
    if (group.length && session.start_time >= groupEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= session.start_time);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = session.end_time;
    groupEnd = group.length
      ? session.end_time > groupEnd
        ? session.end_time
        : groupEnd
      : session.end_time;
    group.push({ session, lane, lanes: 1 });
  }
  flush();
  return result;
}
