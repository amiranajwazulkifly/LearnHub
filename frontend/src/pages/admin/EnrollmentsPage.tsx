// Dzul
import { useEffect, useState } from 'react';
import { getAllEnrollments, updateEnrollmentStatus } from '../../services/studentService';
import type { AdminEnrollmentRow, EnrollmentStatus } from '../../types/student';
import type { PaginationMeta } from '../../types/api';
import Pagination from '../../components/common/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { toast } from "../../store/useToastStore";
import { SkeletonTable } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";

export default function EnrollmentsPage() {
  const [rows, setRows] = useState<AdminEnrollmentRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const { page, setPage } = usePagination();

  useEffect(() => {
    load();
  }, [page]);

  function load() {
    setLoading(true);
    getAllEnrollments(page)
      .then((res) => {
        setRows(res.enrollments);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(id: string, status: EnrollmentStatus) {
    try {
      await updateEnrollmentStatus(id, status);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Enrollment marked as ${status}.`);
    } catch {
      toast.error('Unable to update the enrollment. Please try again.');
    }
  }

  if (loading) return <SkeletonTable />;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-50">Enrollment Management</h1>

      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead>
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
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-focus dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
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
                  <EmptyState variant="plain" title="No enrollments found" description="Try changing your filters." />
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
