import { useEffect, useState } from "react";

import { getMyCourses } from "../../services/enrollmentService";
import { getMyTimetable } from "../../services/timetableService";
import StatCard from "../../components/dashboard/StatCard";

export default function StudentDashboardPage() {
  const [courseCount, setCourseCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [coursesResponse, timetableResponse] = await Promise.all([
          getMyCourses(),
          getMyTimetable(),
        ]);

        setCourseCount(coursesResponse.data.length);
        setSessionCount(timetableResponse.data.length);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">student / dashboard</p>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">Student Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Enrolled Courses" value={courseCount} />
        <StatCard label="Timetable Sessions" value={sessionCount} />
      </div>
    </div>
  );
}
