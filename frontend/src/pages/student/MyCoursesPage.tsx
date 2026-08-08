import { useEffect, useState } from "react";

import {
  cancelEnrollment,
  getMyCourses,
  type Enrollment,
} from "../../services/enrollmentService";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyCourses();

      setEnrollments(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  async function handleCancel(enrollmentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this enrollment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await cancelEnrollment(enrollmentId);

      setMessage("Enrollment cancelled successfully.");

      await loadCourses();
    } catch (error) {
      console.error(error);
      setError("Failed to cancel enrollment");
    }
  }

  if (loading) {
    return <p>Loading your courses...</p>;
  }

  return (
    <div>
      <h1>My Courses</h1>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}

      {enrollments.length === 0 ? (
        <p>You are not enrolled in any courses.</p>
      ) : (
        <div>
          {enrollments.map((enrollment) => (
            <div key={enrollment.enrollment_id}>
              <h2>
                {enrollment.code} - {enrollment.title}
              </h2>

              <p>{enrollment.description}</p>

              <p>
                <strong>Category:</strong> {enrollment.category_name}
              </p>

              <p>
                <strong>Instructor:</strong> {enrollment.instructor_name}
              </p>

              <p>
                <strong>Status:</strong> {enrollment.enrollment_status}
              </p>

              <button
                type="button"
                onClick={() => handleCancel(enrollment.enrollment_id)}
              >
                Cancel Enrollment
              </button>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
