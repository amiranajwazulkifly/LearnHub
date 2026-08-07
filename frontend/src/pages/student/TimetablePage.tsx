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
    return <p>Loading timetable...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>My Timetable</h1>

      {sessions.length === 0 ? (
        <p>No timetable sessions found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Course</th>
              <th>Time</th>
              <th>Instructor</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => (
              <tr key={session.schedule_id}>
                <td>
                  {dayNames[session.day_of_week] ??
                    `Day ${session.day_of_week}`}
                </td>

                <td>
                  {session.code} - {session.title}
                </td>

                <td>
                  {session.start_time} - {session.end_time}
                </td>

                <td>{session.instructor_name}</td>

                <td>{session.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
