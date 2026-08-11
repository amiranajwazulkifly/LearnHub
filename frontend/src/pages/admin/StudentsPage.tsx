// Dzul
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudents } from '../../services/studentService';
import type { Student } from '../../types/student';
import type { PaginationMeta } from '../../types/api';
import Pagination from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { page, setPage } = usePagination([search]);

  useEffect(() => {
    // Simple debounce: wait 300ms after typing stops before hitting the API.
    const timeout = setTimeout(() => {
      setLoading(true);
      getStudents(search, page)
        .then((res) => {
          setStudents(res.students);
          setPagination(res.pagination);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, page]);

  return (
    <div className="p-6">
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
        admin / students
      </p>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-50">Students</h1>

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
      />

      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Programme</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Enrollments</th>
              <th className="px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-2 text-sm">
                  <Link to={`/admin/students/${s.id}`} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                    {s.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{s.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{s.programme ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{s.enrollmentCount ?? 0}</td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!loading && students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
