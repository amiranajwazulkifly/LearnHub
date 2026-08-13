import { useEffect, useState } from "react";
import { BookOpen, Users, ClipboardCheck, Clock3 } from "lucide-react";

import {
  getMyStats,
  getMyCourses,
  getRecentSubmissions,
} from "../../services/instructorPortalService";

import type {
  InstructorCourse,
  InstructorStats,
  RecentSubmission,
} from "../../types/instructorPortal";

import StatCard from "../../components/dashboard/StatCard";

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<
    RecentSubmission[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMyStats(), getMyCourses(), getRecentSubmissions()])
      .then(([statsData, coursesData, submissionsData]) => {
        setStats(statsData);
        setCourses(coursesData);
        setRecentSubmissions(submissionsData);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load dashboard");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
    );
  }

  if (error || !stats) {
    return (
      <p className="text-red-600 dark:text-red-400">
        {error || "Failed to load dashboard"}
      </p>
    );
  }

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
        instructor / dashboard
      </p>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">
        Instructor Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Assigned Courses"
          value={stats.courseCount}
          icon={<BookOpen size={20} />}
          tone="brand"
          helperText="Active this semester"
        />

        <StatCard
          label="Total Students"
          value={stats.studentCount}
          icon={<Users size={20} />}
          tone="green"
          helperText="Across your courses"
        />

        <StatCard
          label="Pending Submissions"
          value={stats.pendingSubmissionCount}
          icon={<ClipboardCheck size={20} />}
          tone="red"
          helperText="Waiting for grading"
        />

        <StatCard
          label="Active Assignments"
          value={stats.activeAssignmentCount}
          icon={<Clock3 size={20} />}
          tone="amber"
          helperText="Currently open"
        />
      </div>

      {/* Lower dashboard */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {/* Assigned Courses */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Assigned Courses
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Courses currently assigned to you.
            </p>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                No courses assigned yet.
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-600"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <span className="rounded-md bg-brand-50 px-2 py-1 font-mono text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                        {course.code}
                      </span>

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {course.enrolledCount} / {course.capacity} students
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                      {course.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {course.categoryName ?? "No category"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium uppercase text-green-600 dark:text-green-400">
                    {course.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Submissions */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Recent Submissions
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Latest student work waiting for review.
            </p>
          </div>

          <div className="space-y-3">
            {recentSubmissions.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                No submissions yet.
              </div>
            ) : (
              recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-50">
                        {submission.studentName}
                      </p>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {submission.assignmentTitle}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {submission.courseCode} ·{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    {submission.grade === null ? (
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        Needs grading
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                        Graded
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
