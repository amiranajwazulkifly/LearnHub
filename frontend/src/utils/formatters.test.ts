import { describe, expect, test } from "vitest";

import { formatGrade, formatRelativeTime, formatTimeRemaining } from "./formatters";

describe("formatTimeRemaining", () => {
  const now = new Date("2026-09-16T12:00:00Z");

  test("counts down in the largest sensible unit", () => {
    expect(formatTimeRemaining("2026-09-19T12:00:00Z", now)).toBe("3 days left");
    expect(formatTimeRemaining("2026-09-16T17:00:00Z", now)).toBe("5 hours left");
    expect(formatTimeRemaining("2026-09-16T12:01:00Z", now)).toBe("1 minute left");
  });

  test("reports lateness once the deadline passes", () => {
    expect(formatTimeRemaining("2026-09-14T12:00:00Z", now)).toBe("2 days late");
  });

  test("returns null without a deadline", () => {
    expect(formatTimeRemaining(null, now)).toBeNull();
  });
});

describe("formatGrade", () => {
  test("shows the score against the points available", () => {
    expect(formatGrade(86, 100)).toBe("86 / 100");
    expect(formatGrade("36", 40)).toBe("36 / 40");
  });

  test("a zero is a real grade, not a missing one", () => {
    expect(formatGrade(0, 100)).toBe("0 / 100");
  });

  test("ungraded is null", () => {
    expect(formatGrade(null, 100)).toBeNull();
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-09-16T12:00:00Z");

  test("uses compact relative units within a week", () => {
    expect(formatRelativeTime("2026-09-16T11:59:30Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-09-16T11:55:00Z", now)).toBe("5m ago");
    expect(formatRelativeTime("2026-09-16T09:00:00Z", now)).toBe("3h ago");
    expect(formatRelativeTime("2026-09-14T12:00:00Z", now)).toBe("2d ago");
  });
});
