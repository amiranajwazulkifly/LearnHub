import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
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
import { SkeletonDashboard } from "../../components/common/Skeleton";

export default function InstructorDashboardPage() {
  const user = useAuthStore((s) => s.user);
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
    return <SkeletonDashboard />;
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
      <div className="dashboard-heading">
        <p className="eyebrow">Instructor dashboard</p>
        <h1>
          Welcome back,{" "}
          <span className="text-brand-ink">
            {user?.fullName || "Instructor"}!
          </span>
        </h1>
        <p>Here’s what needs your attention today.</p>
      </div>
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
        <section className="panel">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Your courses
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
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-line dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <span className="rounded-md bg-brand-soft px-2 py-1 font-mono text-xs font-medium text-brand-ink">
                        {course.code}
                      </span>

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {course.enrolledCount} / {course.capacity} students
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                      <Link to={`/instructor/courses/${course.id}/assignments`}>
                        {course.title}
                      </Link>
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {course.categoryName ?? "No category"} ·{" "}
                      {course.assignmentCount} assignments
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
        <section className="panel">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Recent Submissions
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Latest student work waiting for review.
            </p>
          </div>

          {recentSubmissions.length === 0 ? (
            <p className="empty-copy">No submissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="submission-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assignment</th>
                    <th>Course</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{submission.studentName}</td>
                      <td>
                        <Link
                          to={`/instructor/assignments/${submission.assignmentId}/submissions`}
                        >
                          {submission.assignmentTitle}
                        </Link>
                      </td>
                      <td>{submission.courseCode}</td>
                      <td>
                        {new Date(submission.submittedAt).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            submission.grade === null
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {submission.grade === null
                            ? "Needs grading"
                            : "Graded"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
