// Dzul
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentDetail } from '../../services/studentService';
import type { StudentDetail } from '../../types/student';
import StatusBadge from '../../components/common/StatusBadge';
import type { StatusTone } from '../../components/common/StatusBadge';

const STATUS_TONE: Record<string, StatusTone> = {
  completed: 'green',
  cancelled: 'gray',
  enrolled: 'amber',
};

export default function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getStudentDetail(id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500 dark:text-gray-400">Loading…</p>;
  if (!data) return <p className="p-6 text-red-600">Student not found.</p>;

  const { student, enrollments } = data;

  return (
    <div className="p-6">
      <Link to="/admin/students" className="font-mono text-sm text-brand-600 hover:underline dark:text-brand-400">← Back to Students</Link>

      <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">{student.fullName}</h1>
      <p className="text-gray-500 dark:text-gray-400">{student.email}</p>
      <p className="mt-1 font-mono text-xs text-gray-400 dark:text-gray-500">
        Joined {new Date(student.createdAt).toLocaleDateString()}
      </p>

      <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-800 dark:text-gray-200">Enrollment History</h2>
      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Course</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrolled</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {enrollments.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{e.courseTitle}</td>
                <td className="px-4 py-2 text-sm">
                  <StatusBadge label={e.status} tone={STATUS_TONE[e.status] ?? 'amber'} />
                </td>
                <td className="px-4 py-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                  {new Date(e.enrolledAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                  {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
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
