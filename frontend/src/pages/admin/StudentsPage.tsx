// Dzul
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudents } from '../../services/studentService';
import type { Student } from '../../types/student';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple debounce: wait 300ms after typing stops before hitting the API.
    const timeout = setTimeout(() => {
      setLoading(true);
      getStudents(search)
        .then((res) => setStudents(res.students))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Students</h1>

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
      />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Enrollments</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">
                  <Link to={`/admin/students/${s.id}`} className="font-medium text-blue-600 hover:underline">
                    {s.full_name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{s.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{s.enrollment_count ?? 0}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!loading && students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
