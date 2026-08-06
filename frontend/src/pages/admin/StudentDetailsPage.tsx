// Dzul
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentDetail } from '../../services/studentService';
import type { StudentDetail } from '../../types/student';

export default function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getStudentDetail(Number(id))
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500">Loading…</p>;
  if (!data) return <p className="p-6 text-red-600">Student not found.</p>;

  const { student, enrollments } = data;

  return (
    <div className="p-6">
      <Link to="/admin/students" className="text-sm text-blue-600 hover:underline">← Back to Students</Link>

      <h1 className="mt-2 text-2xl font-bold text-gray-900">{student.full_name}</h1>
      <p className="text-gray-500">{student.email}</p>
      <p className="mt-1 text-xs text-gray-400">
        Joined {new Date(student.created_at).toLocaleDateString()}
      </p>

      <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-800">Enrollment History</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Course</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Enrolled</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2 text-sm text-gray-800">{e.title}</td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : e.status === 'dropped'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {new Date(e.enrolled_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
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
