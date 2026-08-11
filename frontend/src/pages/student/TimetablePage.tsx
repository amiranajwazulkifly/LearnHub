import { useEffect, useState } from "react";

import {
  getMyTimetable,
  type TimetableSession,
} from "../../services/timetableService";

const dayNames: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export default function TimetablePage() {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        setError("");

        const response = await getMyTimetable();

        setSessions(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load timetable");
      } finally {
        setLoading(false);
      }
    }

    void loadTimetable();
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading timetable...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">My Timetable</h1>

      {sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No timetable sessions found.</p>
      ) : (
        <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Day</th>
                <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Course</th>
                <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Time</th>
                <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Instructor</th>
                <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Location</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sessions.map((session) => (
                <tr key={session.schedule_id}>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {dayNames[session.day_of_week] ??
                      `Day ${session.day_of_week}`}
                  </td>

                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {session.code} - {session.title}
                  </td>

                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {session.start_time} - {session.end_time}
                  </td>

                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{session.instructor_name}</td>

                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{session.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
