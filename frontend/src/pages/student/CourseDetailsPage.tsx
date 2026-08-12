import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { getCourseById } from "../../services/courseService";
import {
  cancelEnrollment,
  enrollCourse,
  getMyCourses,
} from "../../services/enrollmentService";
import { getSchedules } from "../../services/scheduleService";

import { ROUTES } from "../../constants/routes";
import ConfirmModal from "../../components/common/ConfirmModal";
import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";
import {
  CalendarIcon,
  ClockIcon,
  PinIcon,
} from "../../components/common/NavIcons";

import type { Course } from "../../types/course";
import type { Schedule } from "../../types/schedule";

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

function getInitials(name: string) {
  const words = name.split(" ").filter((word) => word && !word.endsWith("."));
  const initials = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return initials.toUpperCase() || "?";
}

export default function CourseDetailsPage() {
  const { id } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      if (!id) {
        setError("Course ID is missing");
        setLoading(false);
        return;
      }

      try {
        const [courseResponse, schedulesResponse, myCoursesResponse] = await Promise.all([
          getCourseById(id),
          getSchedules(),
          getMyCourses(),
        ]);

        setCourse(courseResponse);

        const courseSchedule = schedulesResponse.find(
          (schedule) => schedule.course_id === id,
        );

        setSchedule(courseSchedule ?? null);

        const existingEnrollment = myCoursesResponse.data.find(
          (enrollment) =>
            enrollment.course_id === id && enrollment.enrollment_status === "enrolled",
        );

        if (existingEnrollment) {
          setEnrolled(true);
          setEnrollmentId(existingEnrollment.enrollment_id);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    void loadCourse();
  }, [id]);

  async function handleEnroll() {
    if (!id) {
      return;
    }

    try {
      setEnrolling(true);
      setMessage("");
      setError("");

      const response = await enrollCourse(id);

      setMessage("You're enrolled! We'll see you in class.");
      setEnrolled(true);
      setEnrollmentId(response?.data?.id ?? null);
      setCourse((previous) =>
        previous
          ? { ...previous, enrolled_count: (previous.enrolled_count ?? 0) + 1 }
          : previous,
      );
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? "Failed to enroll in course");
      } else {
        setError("Failed to enroll in course");
      }
    } finally {
      setEnrolling(false);
    }
  }

  async function handleConfirmCancel() {
    if (!enrollmentId) {
      return;
    }

    setConfirmCancelOpen(false);

    try {
      setCancelling(true);
      setMessage("");
      setError("");

      await cancelEnrollment(enrollmentId);

      setMessage("Your enrollment has been cancelled.");
      setEnrolled(false);
      setEnrollmentId(null);
      setCourse((previous) =>
        previous
          ? { ...previous, enrolled_count: Math.max((previous.enrolled_count ?? 1) - 1, 0) }
          : previous,
      );
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? "Failed to cancel enrollment");
      } else {
        setError("Failed to cancel enrollment");
      }
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">Loading course...</p>
    );
  }

  if (error && !course) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!course) {
    return <p className="text-gray-500 dark:text-gray-400">Course not found</p>;
  }

  const capacity = course.capacity;
  const enrolledCount = course.enrolled_count ?? 0;
  const seatsRemaining = Math.max(capacity - enrolledCount, 0);
  const fillPercent =
    capacity > 0 ? Math.min(100, Math.round((enrolledCount / capacity) * 100)) : 0;

  const isPublished = course.status === "published";
  const isFull = seatsRemaining <= 0;

  let enrollmentTone: StatusTone = "green";
  let enrollmentLabel = "Open";

  if (!isPublished) {
    enrollmentTone = "gray";
    enrollmentLabel = "Closed";
  } else if (isFull) {
    enrollmentTone = "red";
    enrollmentLabel = "Full";
  }

  let enrollLabel = "Enroll Now";

  if (enrolling) {
    enrollLabel = "Enrolling...";
  } else if (enrolled) {
    enrollLabel = "Enrolled";
  } else if (!isPublished) {
    enrollLabel = "Enrollment Closed";
  } else if (isFull) {
    enrollLabel = "Course Full";
  }

  const enrollDisabled = enrolling || enrolled || !isPublished || isFull;

  if (enrolled) {
    enrollmentTone = "brand";
    enrollmentLabel = "Enrolled";
  }

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link
          to={ROUTES.STUDENT.COURSES}
          className="hover:text-brand-600 dark:hover:text-brand-400"
        >
          Browse Courses
        </Link>

        {course.category_name && (
          <>
            <span>/</span>
            <span>{course.category_name}</span>
          </>
        )}

        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {course.code}
        </span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-300">
                {course.code}
              </span>

              {course.category_name && (
                <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {course.category_name}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {course.title}
            </h1>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {course.description || "No description provided for this course yet."}
            </p>
          </div>

          <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-brand-900 via-brand-700 to-brand-500 sm:h-72">
            <div
              aria-hidden="true"
              className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
            />

            <span className="relative font-mono text-6xl font-bold tracking-widest text-white/20 sm:text-8xl">
              {course.code}
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              About this Course
            </h2>

            <p className="mt-3 whitespace-pre-line text-gray-600 dark:text-gray-400">
              {course.description || "No further details have been added for this course."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Enrollment Status
              </h3>

              <StatusBadge label={enrollmentLabel} tone={enrollmentTone} />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Enrolled Capacity
                </span>

                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {enrolledCount} / {capacity} Seats
                </span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-600 to-brand-400"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {isFull
                  ? "This course is full."
                  : `Only ${seatsRemaining} seat${seatsRemaining === 1 ? "" : "s"} remaining for this semester.`}
              </p>
            </div>

            <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Schedule</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {schedule
                      ? `${dayNames[schedule.day_of_week]}, ${schedule.start_time.slice(0, 5)} - ${schedule.end_time.slice(0, 5)}`
                      : "Not scheduled"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {schedule?.location || "TBA"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Duration Dates
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {schedule
                      ? `${formatDate(schedule.start_date)} - ${formatDate(schedule.end_date)}`
                      : "TBA"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnroll}
              disabled={enrollDisabled}
              className="mt-5 w-full rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enrollLabel}
            </button>

            {enrolled && (
              <button
                onClick={() => setConfirmCancelOpen(true)}
                disabled={cancelling}
                className="mt-2 w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {cancelling ? "Cancelling..." : "Cancel Enrollment"}
              </button>
            )}

            {message && (
              <p className="mt-3 text-sm text-green-700 dark:text-green-400">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {course.instructor_name && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-50">
                About the Instructor
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-600 to-brand-400 text-sm font-bold text-white">
                  {getInitials(course.instructor_name)}
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">
                    {course.instructor_name}
                  </p>

                  {course.instructor_expertise && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {course.instructor_expertise}
                    </p>
                  )}
                </div>
              </div>

              {course.instructor_biography && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  {course.instructor_biography}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmCancelOpen}
        title="Cancel enrollment?"
        message="Are you sure you want to cancel this enrollment? You may need to re-enroll if space is limited."
        confirmLabel="Cancel Enrollment"
        cancelLabel="Keep Enrollment"
        variant="danger"
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </div>
  );
}
