import { useEffect, useState } from "react";

import {
  cancelEnrollment,
  getMyCourses,
  type Enrollment,
} from "../../services/enrollmentService";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

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

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    const enrollmentId = cancelTarget;
    setCancelTarget(null);

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
    return <p className="text-gray-500 dark:text-gray-400">Loading your courses...</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">My Courses</h1>

      {message && (
        <p className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {enrollments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You are not enrolled in any courses.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.enrollment_id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {enrollment.code} - {enrollment.title}
              </h2>

              <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
                {enrollment.description}
              </p>

              <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Category:</span>{" "}
                  {enrollment.category_name}
                </p>

                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Instructor:</span>{" "}
                  {enrollment.instructor_name}
                </p>

                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Status:</span>{" "}
                  {enrollment.enrollment_status}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCancelTarget(enrollment.enrollment_id)}
                className="mt-4 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Cancel Enrollment
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={cancelTarget !== null}
        title="Cancel enrollment?"
        message="Are you sure you want to cancel this enrollment? You may need to re-enroll if space is limited."
        confirmLabel="Cancel Enrollment"
        cancelLabel="Keep Enrollment"
        variant="danger"
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
