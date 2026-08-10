import type { Course } from "../../types/course";
import StatusBadge from "../common/StatusBadge";
import type { StatusTone } from "../common/StatusBadge";

const STATUS_TONE: Record<string, StatusTone> = {
  published: "green",
  archived: "gray",
  draft: "amber",
};

interface CourseTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

function CourseTable({ courses, onEdit, onDelete }: CourseTableProps) {
  if (courses.length === 0) {
    return <p>No courses found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <thead>
          <tr className="border-b bg-gray-100 text-left font-mono text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <th className="px-6 py-4">Code</th>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Instructor</th>
            <th className="px-6 py-4">Capacity</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="border-b hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60">
              <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700 dark:text-brand-400">{course.code}</td>

              <td className="px-6 py-4">
                <div className="font-medium">{course.title}</div>

                {course.description && (
                  <div className="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                    {course.description}
                  </div>
                )}
              </td>

              <td className="px-6 py-4">
                {course.category_name ?? "Not assigned"}
              </td>

              <td className="px-6 py-4">
                {course.instructor_name ?? "Not assigned"}
              </td>

              <td className="px-6 py-4">{course.capacity}</td>

              <td className="px-6 py-4">
                <StatusBadge label={course.status} tone={STATUS_TONE[course.status] ?? "amber"} />
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(course)}
                    className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-3 py-2 text-sm text-white hover:from-brand-700 hover:to-brand-600"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(course.id)}
                    className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CourseTable;
