import { useEffect, useState } from "react";

import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "../../services/scheduleService";

import { getCourses } from "../../services/courseService";

import type { Schedule } from "../../types/schedule";
import type { Course } from "../../types/course";

// Formats a date-only string (e.g. "2026-08-09") without going through
// UTC parsing — `new Date("2026-08-09")` interprets it as UTC midnight,
// which can display as the previous day for viewers behind UTC.
function formatDateOnly(dateStr: string) {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [courseId, setCourseId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [scheduleData, courseData] = await Promise.all([
        getSchedules(),
        getCourses(),
      ]);

      setSchedules(scheduleData);
      setCourses(courseData ?? []);
    } catch (error) {
      console.error("Failed to load schedule data:", error);
      setError("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function clearForm() {
    setCourseId("");
    setDayOfWeek("1");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
    setError("");
  }

  function validateForm() {
    if (!courseId) {
      setError("Please select a course.");
      return false;
    }

    if (!startTime) {
      setError("Start time is required.");
      return false;
    }

    if (!endTime) {
      setError("End time is required.");
      return false;
    }

    if (!location.trim()) {
      setError("Location is required.");
      return false;
    }

    if (!startDate) {
      setError("Start date is required.");
      return false;
    }

    if (!endDate) {
      setError("End date is required.");
      return false;
    }

    if (endTime <= startTime) {
      setError("End time must be later than start time.");
      return false;
    }

    if (endDate < startDate) {
      setError("End date must not be earlier than start date.");
      return false;
    }

    return true;
  }

  async function handleCreateSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      await createSchedule({
        course_id: courseId,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        location: location.trim(),
        start_date: startDate,
        end_date: endDate,
      });

      clearForm();
      await loadData();
    } catch (error) {
      console.error("Failed to create schedule:", error);
      setError("Failed to create schedule.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(schedule: Schedule) {
    setEditingId(schedule.id);
    setCourseId(schedule.course_id);
    setDayOfWeek(String(schedule.day_of_week));
    setStartTime(schedule.start_time.slice(0, 5));
    setEndTime(schedule.end_time.slice(0, 5));
    setLocation(schedule.location ?? "");
    setStartDate(schedule.start_date?.slice(0, 10) ?? "");
    setEndDate(schedule.end_date?.slice(0, 10) ?? "");
    setError("");
  }

  async function handleUpdateSchedule() {
    if (!editingId) {
      return;
    }

    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      await updateSchedule(editingId, {
        course_id: courseId,
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        location: location.trim(),
        start_date: startDate,
        end_date: endDate,
      });

      clearForm();
      await loadData();
    } catch (error) {
      console.error("Failed to update schedule:", error);
      setError("Failed to update schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSchedule(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteSchedule(id);

      if (editingId === id) {
        clearForm();
      }

      await loadData();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      setError("Failed to delete schedule.");
    }
  }

  function getDayName(day: number) {
    return DAYS.find((item) => item.value === day)?.label ?? String(day);
  }

  if (loading) {
    return <div>Loading schedules...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Schedule Management</h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Create and manage course schedules.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/40 dark:text-red-400">{error}</div>
      )}

      <form
        onSubmit={handleCreateSchedule}
        className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Schedule" : "Add Schedule"}
        </h2>

        <div>
          <label htmlFor="course" className="mb-1 block font-medium">
            Course
          </label>

          <select
            id="course"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
          >
            <option value="">Select course</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dayOfWeek" className="mb-1 block font-medium">
            Day
          </label>

          <select
            id="dayOfWeek"
            value={dayOfWeek}
            onChange={(event) => setDayOfWeek(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
          >
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startTime" className="mb-1 block font-medium">
              Start Time
            </label>

            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="mb-1 block font-medium">
              End Time
            </label>

            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block font-medium">
            Location
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            placeholder="Example: Computer Lab 1"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="mb-1 block font-medium">
              Start Date
            </label>

            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="mb-1 block font-medium">
              End Date
            </label>

            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="flex gap-3">
          {editingId ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateSchedule()}
                disabled={saving}
                className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-white disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Schedule"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={saving}
                className="rounded bg-gray-200 px-4 py-2 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Schedule"}
            </button>
          )}
        </div>
      </form>

      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50 font-mono text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Day</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Period</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="border-b border-gray-200 dark:border-gray-800">
                <td className="px-6 py-4">
                  <div className="font-medium">
                    {schedule.course_title ?? "Unknown Course"}
                  </div>

                  {schedule.course_code && (
                    <div className="font-mono text-sm text-brand-600 dark:text-brand-400">
                      {schedule.course_code}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  {getDayName(schedule.day_of_week)}
                </td>

                <td className="px-6 py-4">
                  {schedule.start_time.slice(0, 5)}
                  {" - "}
                  {schedule.end_time.slice(0, 5)}
                </td>

                <td className="px-6 py-4">{schedule.location}</td>

                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                  {schedule.start_date && formatDateOnly(schedule.start_date)}
                  {" – "}
                  {schedule.end_date && formatDateOnly(schedule.end_date)}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(schedule)}
                      className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-3 py-2 text-sm text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteSchedule(schedule.id)}
                      className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {schedules.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No schedules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchedulesPage;
