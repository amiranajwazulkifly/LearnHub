import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { deleteCourse, getCourses } from "../../services/courseService";

import CourseTable from "../../components/courses/CourseTable";

import type { Course } from "../../types/course";
import type { PaginationMeta } from "../../types/api";
import Pagination from "../../components/common/Pagination";
import { usePagination } from "../../hooks/usePagination";
import ConfirmModal from "../../components/common/ConfirmModal";

function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [status, setStatus] = useState("");
  // No resetKeys here — this form only fetches on explicit Search/Reset
  // clicks (not per keystroke), so page reset is handled manually in
  // handleSearch/handleReset instead of reacting to every filter keystroke.
  const { page, setPage } = usePagination();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const result = await getCourses({
        search: search || undefined,
        category: category || undefined,
        instructor: instructor || undefined,
        status: status || undefined,
        page,
      });

      setCourses(result.courses ?? []);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, [page]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (page !== 1) {
      setPage(1);
      return;
    }
    await loadCourses();
  }

  function handleReset() {
    setSearch("");
    setCategory("");
    setInstructor("");
    setStatus("");
    setPage(1);
  }

  function handleEdit(course: Course) {
    navigate(`/admin/courses/${course.id}/edit`);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);

    try {
      await deleteCourse(id);
      await loadCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
      setError("Failed to delete course.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage, search and filter LearnHub courses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/courses/create")}
          className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-5 py-2 text-white hover:from-brand-700 hover:to-brand-600"
        >
          + Add Course
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/40 dark:text-red-400">{error}</div>
      )}

      <form
        onSubmit={handleSearch}
        className="mb-6 grid gap-4 rounded-lg border border-gray-200 bg-white p-5 md:grid-cols-5 dark:border-gray-800 dark:bg-gray-900"
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title or code"
          className="rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
        />

        <input
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category"
          className="rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
        />

        <input
          type="text"
          value={instructor}
          onChange={(event) => setInstructor(event.target.value)}
          placeholder="Instructor"
          className="rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-white"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded bg-gray-200 px-4 py-2 dark:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <div>Loading courses...</div>
      ) : (
        <>
          <CourseTable
            courses={courses}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
          {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
        </>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete course?"
        message="Are you sure you want to delete this course? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CoursesPage;
