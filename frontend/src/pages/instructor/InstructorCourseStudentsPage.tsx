import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Mail, UserRound, Users } from "lucide-react";

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
    return (
      <p className="text-gray-500 dark:text-gray-400">Loading roster...</p>
    );
  }

  if (error || !roster) {
    return (
      <p className="text-red-600 dark:text-red-400">
        {error || "Course not found."}
      </p>
    );
  }

  const enrolledCount = roster.students.filter(
    (student) => student.status === "enrolled",
  ).length;

  const completedCount = roster.students.filter(
    (student) => student.status === "completed",
  ).length;

  return (
    <div>
      {/* Back */}
      <Link
        to={ROUTES.INSTRUCTOR.COURSES}
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Back to My Courses
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
          instructor / students
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-brand-100 px-2.5 py-1 font-mono text-xs font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
            {roster.course.code}
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
          {roster.course.title}
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View students enrolled in this course and their enrollment status.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <Users size={18} />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Students
            </p>

            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {roster.students.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <UserRound size={18} />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Enrolled
            </p>

            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {enrolledCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CalendarDays size={18} />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Completed
            </p>

            <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
              {completedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Students table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Course Roster
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Students currently associated with this course.
          </p>
        </div>

        <div className="table-scroll overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-950/40">
              <tr>
                <th className="px-5 py-3 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Student
                </th>

                <th className="px-5 py-3 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </th>

                <th className="px-5 py-3 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>

                <th className="px-5 py-3 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Enrolled On
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {roster.students.map((student) => {
                const initials = student.fullName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={student.enrollmentId}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
                          {initials}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {student.fullName}
                          </p>

                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Student
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail size={14} />
                        {student.email}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={student.status}
                        tone={STATUS_TONE[student.status] ?? "amber"}
                      />
                    </td>

                    {/* Enrolled date */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                        <CalendarDays size={14} />

                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {roster.students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                      <Users size={20} />
                    </div>

                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      No students enrolled yet
                    </p>

                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                      Students will appear here after they enroll in this
                      course.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
