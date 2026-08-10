import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyCourses } from "../../services/instructorPortalService";
import type { InstructorCourse } from "../../types/instructorPortal";
import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";
import { ROUTES } from "../../constants/routes";

const STATUS_TONE: Record<string, StatusTone> = {
  published: "green",
  archived: "gray",
  draft: "amber",
};

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>;
  }

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
        instructor / courses
      </p>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">My Courses</h1>

      {error && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {courses.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You are not assigned to any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {course.code}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {course.title}
                  </h2>
                </div>

                <StatusBadge label={course.status} tone={STATUS_TONE[course.status] ?? "amber"} />
              </div>

              <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">
                {course.description}
              </p>

              <div className="mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Category:</span>{" "}
                  {course.categoryName ?? "Not assigned"}
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Enrolled:</span>{" "}
                  {course.enrolledCount} / {course.capacity}
                </p>
              </div>

              <div className="mt-auto flex gap-2">
                <Link
                  to={`${ROUTES.INSTRUCTOR.COURSES}/${course.id}/students`}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Students
                </Link>
                <Link
                  to={`${ROUTES.INSTRUCTOR.COURSES}/${course.id}/assignments`}
                  className="flex-1 rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-center text-sm font-medium text-white transition hover:from-brand-700 hover:to-brand-600"
                >
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
