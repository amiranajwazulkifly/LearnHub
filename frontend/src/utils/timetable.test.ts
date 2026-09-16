import { describe, expect, test } from "vitest";

import { getNextSession, isSessionActiveOn, sessionsOnDate } from "./timetable";

// Local-time constructor, so these don't depend on the machine's timezone.
const on = (y: number, m: number, d: number, h = 9, min = 0) => new Date(y, m - 1, d, h, min);

describe("schedule date ranges", () => {
  // The acceptance case from the spec: a block ending 30 Aug must not recur
  // into September.
  const augustBlock = {
    day_of_week: 3, // Wednesday
    start_time: "12:00",
    start_date: "2026-08-14",
    end_date: "2026-08-30",
  };

  test("a session inside its range is active", () => {
    expect(isSessionActiveOn(augustBlock, on(2026, 8, 19))).toBe(true);
  });

  test("a session is not active after its end date", () => {
    expect(isSessionActiveOn(augustBlock, on(2026, 9, 16))).toBe(false);
  });

  test("a session is not active before its start date", () => {
    expect(isSessionActiveOn(augustBlock, on(2026, 8, 12))).toBe(false);
  });

  test("the end date itself still counts", () => {
    expect(isSessionActiveOn(augustBlock, on(2026, 8, 30, 23, 59))).toBe(true);
  });

  test("open-ended bounds never exclude", () => {
    expect(isSessionActiveOn({ start_date: null, end_date: null }, on(2031, 1, 1))).toBe(true);
  });

  test("an ended course never becomes the next lecture", () => {
    // 16 Sep 2026 is a Wednesday, the same weekday as the ended block.
    expect(getNextSession([augustBlock], on(2026, 9, 16, 8, 0))).toBeNull();
  });

  test("a running course is still found as the next lecture", () => {
    const running = { ...augustBlock, start_date: "2026-08-14", end_date: "2026-11-11" };
    const next = getNextSession([running], on(2026, 9, 16, 8, 0));

    expect(next?.daysUntil).toBe(0);
  });

  test("sessionsOnDate filters by weekday and range, earliest first", () => {
    const sessions = [
      { id: "late", day_of_week: 3, start_time: "14:00", start_date: null, end_date: null },
      { id: "early", day_of_week: 3, start_time: "09:00", start_date: null, end_date: null },
      { id: "ended", ...augustBlock },
      { id: "thursday", day_of_week: 4, start_time: "09:00", start_date: null, end_date: null },
    ];

    expect(sessionsOnDate(sessions, on(2026, 9, 16)).map((s) => s.id)).toEqual(["early", "late"]);
  });
});
