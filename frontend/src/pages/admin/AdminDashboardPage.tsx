// Dzul
import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentActivity } from '../../services/dashboardService';
import type { DashboardStats, RecentActivityItem } from '../../types/report';
import StatCard from '../../components/dashboard/StatCard';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getRecentActivity()])
      .then(([s, a]) => {
        setStats(s);
        setActivity(a);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-500 dark:text-gray-400">Loading dashboard…</p>;
  if (!stats) return <p className="p-6 text-red-600 dark:text-red-400">Failed to load dashboard stats.</p>;

  return (
    <div className="p-6">
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

      <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Enrollments</h2>
      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Student</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Course</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {activity.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.studentName}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.courseTitle}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{item.status}</td>
                <td className="px-4 py-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.enrolledAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {activity.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No enrollments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}