import { useEffect, useState } from "react";

import { getMyCourses } from "../../services/enrollmentService";
import { getMyTimetable } from "../../services/timetableService";

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
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Student Dashboard</h1>

      <div>
        <h2>Enrolled Courses</h2>
        <p>{courseCount}</p>
      </div>

      <div>
        <h2>Timetable Sessions</h2>
        <p>{sessionCount}</p>
      </div>
    </div>
  );
}
