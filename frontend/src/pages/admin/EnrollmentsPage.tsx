// Dzul
import { useEffect, useState } from 'react';
import { getAllEnrollments, updateEnrollmentStatus } from '../../services/studentService';
import type { AdminEnrollmentRow, EnrollmentStatus } from '../../types/student';

export default function EnrollmentsPage() {
  const [rows, setRows] = useState<AdminEnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getAllEnrollments()
      .then(setRows)
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(id: number, status: EnrollmentStatus) {
    await updateEnrollmentStatus(id, status);
    // Local update instead of a full refetch — same instant-feeling
    // pattern used in the useCourses hook.
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  if (loading) return <p className="p-6 text-gray-500 dark:text-gray-400">Loading enrollments…</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">Enrollment Management</h1>

      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Student</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Course</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrolled</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{r.studentName}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{r.courseTitle}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(r.enrolledAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as EnrollmentStatus)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
                  >
                    <option value="enrolled">enrolled</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
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
