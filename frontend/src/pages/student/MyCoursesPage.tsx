import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  cancelEnrollment,
  getMyCourses,
  type Enrollment,
} from "../../services/enrollmentService";

import { getSchedules } from "../../services/scheduleService";
import type { Schedule } from "../../types/schedule";

import ConfirmModal from "../../components/common/ConfirmModal";
import { ROUTES } from "../../constants/routes";

const dayNames: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const [enrollmentResponse, scheduleResponse] = await Promise.all([
        getMyCourses(),
        getSchedules(),
      ]);

      setEnrollments(enrollmentResponse.data);
      setSchedules(scheduleResponse);
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
    return <p>Loading your courses...</p>;
  }

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold text-gray-900 dark:text-gray-50">
        My Courses
      </h1>

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
        <p className="text-gray-500 dark:text-gray-400">
          You are not enrolled in any courses.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const schedule = schedules.find(
              (schedule) => schedule.course_id === enrollment.course_id,
            );

            return (
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
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Category:
                    </span>{" "}
                    {enrollment.category_name}
                  </p>

                  <p>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Instructor:
                    </span>{" "}
                    {enrollment.instructor_name}
                  </p>

                  {schedule ? (
                    <>
                      <p>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          Schedule:
                        </span>{" "}
                        {dayNames[schedule.day_of_week]},{" "}
                        {schedule.start_time.slice(0, 5)} -{" "}
                        {schedule.end_time.slice(0, 5)}
                      </p>

                      <p>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          Location:
                        </span>{" "}
                        {schedule.location || "TBA"}
                      </p>

                      <p>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          Period:
                        </span>{" "}
                        {formatDate(schedule.start_date)} -{" "}
                        {formatDate(schedule.end_date)}
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        Schedule:
                      </span>{" "}
                      Not scheduled
                    </p>
                  )}

                  <p>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Status:
                    </span>{" "}
                    {enrollment.enrollment_status}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`${ROUTES.STUDENT.COURSES}/${enrollment.course_id}`}
                    className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                  >
                    View Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => setCancelTarget(enrollment.enrollment_id)}
                    className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Cancel Enrollment
                  </button>
                </div>
              </div>
            );
          })}
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
