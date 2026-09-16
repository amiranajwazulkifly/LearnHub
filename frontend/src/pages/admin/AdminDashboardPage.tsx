// Dzul
import { useCallback, useEffect, useState } from "react";

import {
  getDashboardStats,
  getRecentActivity,
  getCourseCapacity,
} from "../../services/dashboardService";
import type {
  DashboardStats,
  RecentActivityItem,
  CourseCapacityItem,
  ActivityKind,
} from "../../types/report";

import StatCard from "../../components/dashboard/StatCard";
import { SkeletonDashboard } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { describeLoadError, type LoadErrorCopy } from "../../utils/errorHandler";
import { formatDateTime } from "../../utils/formatters";

// A dot per activity kind, so the feed is scannable without reading every line.
const KIND_DOTS: Record<ActivityKind, string> = {
  enrollment: "bg-brand-500",
  assignment: "bg-amber-500",
  announcement: "bg-emerald-500",
};

/** Turns one activity row into a sentence. */
function describeActivity(item: RecentActivityItem): string {
  const course = item.courseCode ? `${item.courseCode} ` : "";

  switch (item.kind) {
    case "enrollment":
      return item.action === "cancelled"
        ? `${item.actor} cancelled their enrollment in ${course}${item.subject}`
        : `${item.actor} enrolled in ${course}${item.subject}`;
    case "assignment":
      return `${item.actor} posted "${item.subject}" in ${item.courseCode}`;
    case "announcement":
      return `${item.actor} published "${item.subject}"`;
  }
}

function CapacityBar({ course }: { course: CourseCapacityItem }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
        {course.code}
      </span>

      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div
          className={`h-full ${course.isFull ? "bg-red-500" : "bg-brand-600"}`}
          style={{ width: `${Math.min(course.percentFull, 100)}%` }}
        />
      </div>

      <span className="w-16 shrink-0 text-right font-mono text-xs text-gray-500 dark:text-gray-400">
        {course.enrolled} / {course.capacity}
      </span>

      <span className="w-12 shrink-0 text-right">
        {course.isFull ? (
          <span className="font-mono text-[10px] font-semibold uppercase text-red-600 dark:text-red-400">
            Full
          </span>
        ) : (
          <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
            {course.seatsRemaining} left
          </span>
        )}
      </span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [capacity, setCapacity] = useState<CourseCapacityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadErrorCopy | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);

    Promise.all([getDashboardStats(), getRecentActivity(), getCourseCapacity()])
      .then(([s, a, c]) => {
        setStats(s);
        setActivity(a);
        setCapacity(c);
      })
      .catch((err) => setLoadError(describeLoadError(err, "dashboard")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) return <SkeletonDashboard />;

  if (loadError || !stats) {
    const copy = loadError ?? describeLoadError(new Error("no stats"), "dashboard");

    return (
      <div className="p-6">
        <ErrorState
          title={copy.title}
          description={copy.description}
          onRetry={copy.canRetry ? load : undefined}
        />
      </div>
    );
  }

  const fullCourses = capacity.filter((course) => course.isFull).length;

  return (
    <div className="p-4 sm:p-6">
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
        admin / dashboard
      </p>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">Admin Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={stats.totalStudents} />
        <StatCard label="Total Instructors" value={stats.totalInstructors} />
        <StatCard label="Total Courses" value={stats.totalCourses} />
        <StatCard label="Active Enrollments" value={stats.totalActiveEnrollments} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Recent Activity
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {activity.length === 0 ? (
              <EmptyState
                variant="plain"
                title="No recent activity"
                description="Enrollments, new assignments and announcements will appear here."
              />
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {activity.map((item) => (
                  <li key={`${item.kind}-${item.id}`} className="flex gap-3 px-4 py-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND_DOTS[item.kind]}`}
                      aria-hidden="true"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {describeActivity(item)}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-gray-500">
                        {formatDateTime(item.occurredAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Capacity */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            Course Capacity
          </h2>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            {capacity.length === 0 ? (
              <EmptyState
                variant="plain"
                title="No published courses"
                description="Publish a course to track how full it is."
              />
            ) : (
              <>
                {fullCourses > 0 && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    {fullCourses} course{fullCourses === 1 ? " is" : "s are"} at capacity and can no
                    longer take enrollments.
                  </p>
                )}

                <div className="space-y-3">
                  {capacity.map((course) => (
                    <CapacityBar key={course.id} course={course} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
