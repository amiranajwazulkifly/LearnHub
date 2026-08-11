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

  async function handleStatusChange(id: string, status: EnrollmentStatus) {
    await updateEnrollmentStatus(id, status);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  if (loading) return <p className="p-6 text-gray-500">Loading enrollments…</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Enrollment Management</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Student</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Course</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Enrolled</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-sm text-gray-800">{r.studentName}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{r.courseTitle}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {new Date(r.enrolledAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm">
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as EnrollmentStatus)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
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
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
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