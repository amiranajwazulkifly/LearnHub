import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCourseRoster } from "../../services/instructorPortalService";
import type { CourseRoster } from "../../types/instructorPortal";
import StatusBadge from "../../components/common/StatusBadge";
import type { StatusTone } from "../../components/common/StatusBadge";
import { ROUTES } from "../../constants/routes";

const STATUS_TONE: Record<string, StatusTone> = {
  completed: "green",
  cancelled: "gray",
  enrolled: "amber",
};

export default function InstructorCourseStudentsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [roster, setRoster] = useState<CourseRoster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;
    getCourseRoster(courseId)
      .then(setRoster)
      .catch(() => setError("Failed to load this course's roster"))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading roster...</p>;
  }

  if (error || !roster) {
    return <p className="text-red-600 dark:text-red-400">{error || "Course not found."}</p>;
  }

  return (
    <div>
      <Link
        to={ROUTES.INSTRUCTOR.COURSES}
        className="font-mono text-sm text-brand-600 hover:underline dark:text-brand-400"
      >
        ← Back to My Courses
      </Link>

      <p className="mt-2 font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
        {roster.course.code}
      </p>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">{roster.course.title}</h1>

      <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Enrolled Students ({roster.students.length})
      </h2>

      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {roster.students.map((s) => (
              <tr key={s.enrollmentId}>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{s.fullName}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{s.email}</td>
                <td className="px-4 py-2 text-sm">
                  <StatusBadge label={s.status} tone={STATUS_TONE[s.status] ?? "amber"} />
                </td>
                <td className="px-4 py-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                  {new Date(s.enrolledAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {roster.students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No students enrolled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
