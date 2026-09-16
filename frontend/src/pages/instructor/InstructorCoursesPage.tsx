import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  MapPin,
  Users,
  ClipboardList,
} from "lucide-react";

import { getMyCourses } from "../../services/instructorPortalService";
import type { InstructorCourse } from "../../types/instructorPortal";
import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";
import { ROUTES } from "../../constants/routes";
import { SkeletonCards } from "../../components/common/Skeleton";

const STATUS_TONE: Record<string, StatusTone> = {
  published: "green",
  archived: "gray",
  draft: "amber",
};

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch((error) => {
        console.error(error);
        setError("Failed to load courses");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <SkeletonCards cards={3} />;
  }

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-ink">
        instructor / courses
      </p>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          My Courses
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View your assigned courses, students, schedules and assignments.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {courses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <BookOpen
            size={32}
            className="mx-auto mb-3 text-gray-400 dark:text-gray-500"
          />

          <h2 className="font-semibold text-gray-900 dark:text-gray-50">
            No courses assigned
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You are not assigned to any courses yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-line hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Top */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                      <BookOpen size={18} />
                    </div>

                    <p className="font-mono text-sm font-semibold text-brand-ink">
                      {course.code}
                    </p>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {course.title}
                  </h2>
                </div>

                <StatusBadge
                  label={course.status}
                  tone={STATUS_TONE[course.status] ?? "amber"}
                />
              </div>

              {/* Description */}
              <p className="mb-5 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {course.description || "No course description available."}
              </p>

              {/* Category */}
              <div className="mb-4">
                <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {course.categoryName ?? "No category"}
                </span>
              </div>

              {/* Course information */}
              <div className="mb-5 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                {/* Schedule */}
                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={17}
                    className="mt-0.5 shrink-0 text-brand-ink"
                  />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Schedule
                    </p>

                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                      {course.dayOfWeek && course.startTime && course.endTime
                        ? `${DAY_NAMES[course.dayOfWeek]} · ${course.startTime.slice(
                            0,
                            5,
                          )} - ${course.endTime.slice(0, 5)}`
                        : "Schedule not available"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-red-500" />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Location
                    </p>

                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                      {course.location ?? "TBA"}
                    </p>
                  </div>
                </div>

                {/* Students */}
                <div className="flex items-start gap-3">
                  <Users
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Students
                    </p>

                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                      {course.enrolledCount} / {course.capacity} enrolled
                    </p>
                  </div>
                </div>

                {/* Assignments */}
                <div className="flex items-start gap-3">
                  <ClipboardList
                    size={17}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Assignments
                    </p>

                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                      {course.assignmentCount ?? 0} assignment
                      {(course.assignmentCount ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Link
                  to={`${ROUTES.INSTRUCTOR.COURSES}/${course.id}/students`}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:border-brand-line hover:bg-brand-soft hover:text-brand-ink-hover dark:border-gray-700 dark:text-gray-200"
                >
                  <Users size={16} />
                  Students
                </Link>

                <Link
                  to={`${ROUTES.INSTRUCTOR.COURSES}/${course.id}/assignments`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-medium text-brand-fg transition hover:bg-brand-hover active:bg-brand-active"
                >
                  <ClipboardList size={16} />
                  Assignments
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
