import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  cancelEnrollment,
  getMyCourses,
  type Enrollment,
} from "../../services/enrollmentService";

import { getSchedules } from "../../services/scheduleService";
import type { Schedule } from "../../types/schedule";
import { getMyAssignments } from "../../services/assignmentService";
import type { Assignment } from "../../types/assignment";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";

import ConfirmModal from "../../components/common/ConfirmModal";
import { ROUTES } from "../../constants/routes";
import { toast } from "../../store/useToastStore";
import { SkeletonCards } from "../../components/common/Skeleton";

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
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const [enrollmentResponse, scheduleResponse, assignmentList] = await Promise.all([
        getMyCourses(),
        getSchedules(),
        getMyAssignments(),
      ]);

      setEnrollments(enrollmentResponse.data);
      setSchedules(scheduleResponse);
      setAssignments(assignmentList);
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
      toast.success("Enrollment cancelled.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to cancel the enrollment. Please try again.");
      setError("Failed to cancel enrollment");
    }
  }

  if (loading) {
    return <SkeletonCards cards={3} />;
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
        <EmptyState
          title="You're not enrolled in any courses"
          description="Browse the catalog to find a course and enroll."
          action={
            <Link
              to={ROUTES.STUDENT.COURSES}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Browse Courses
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const schedule = schedules.find(
              (schedule) => schedule.course_id === enrollment.course_id,
            );

            // Work still to hand in for this course: no submission yet.
            const openTaskCount = assignments.filter(
              (assignment) =>
                assignment.courseId === enrollment.course_id && !assignment.mySubmission,
            ).length;

            return (
              <div
                key={enrollment.enrollment_id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {enrollment.code}
                  </span>

                  <StatusBadge
                    label={enrollment.enrollment_status}
                    tone={enrollment.enrollment_status === "enrolled" ? "green" : "gray"}
                  />

                  {enrollment.course_status !== "published" && (
                    <StatusBadge label={enrollment.course_status} tone="gray" />
                  )}
                </div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {enrollment.title}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
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

                </div>

                <div className="mt-3 flex-1">
                  {openTaskCount > 0 ? (
                    <p className="font-mono text-xs font-medium text-amber-700 dark:text-amber-400">
                      {openTaskCount} assignment{openTaskCount === 1 ? "" : "s"} outstanding
                    </p>
                  ) : (
                    <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
                      Nothing outstanding
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`${ROUTES.STUDENT.COURSES}/${enrollment.course_id}`}
                    className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-brand-700"
                  >
                    Open Course
                  </Link>

                  <Link
                    to={ROUTES.STUDENT.TASKS}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    View Tasks
                  </Link>
                </div>

                {/* Cancelling is destructive and rarely what someone came here
                    to do, so it stays available but visually quiet. */}
                <button
                  type="button"
                  onClick={() => setCancelTarget(enrollment.enrollment_id)}
                  className="mt-3 self-start text-xs font-medium text-gray-500 underline-offset-2 transition hover:text-red-600 hover:underline dark:text-gray-400 dark:hover:text-red-400"
                >
                  Cancel enrollment
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={cancelTarget !== null}
        title="Cancel enrollment?"
        message="You will lose active access to this course's activities, and you may need to re-enroll if space is limited. Work you have already submitted is kept."
        confirmLabel="Cancel Enrollment"
        cancelLabel="Keep Enrollment"
        variant="danger"
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
