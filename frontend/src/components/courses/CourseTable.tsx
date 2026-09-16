import type { Course } from "../../types/course";
import StatusBadge from "../common/StatusBadge";
import type { StatusTone } from "../common/StatusBadge";
import SeatsIndicator from "./SeatsIndicator";

interface Props {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

const STATUS_TONE: Record<string, StatusTone> = {
  published: "green",
  archived: "gray",
  draft: "amber",
};

export default function CourseTable({ courses, onEdit, onDelete }: Props) {
  return (
    <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <table className="w-full text-left">
        <thead className="border-b border-gray-200 bg-gray-50 font-mono text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            <th className="px-6 py-4">Code</th>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Instructor</th>
            <th className="px-6 py-4">Enrolled</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="border-b border-gray-200 dark:border-gray-800"
            >
              <td className="px-6 py-4 font-mono text-sm text-brand-600 dark:text-brand-400">
                {course.code}
              </td>
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-50">
                {course.title}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                {course.category_name ?? "Not assigned"}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                {course.instructor_name ?? "Not assigned"}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                <SeatsIndicator
                  capacity={course.capacity}
                  enrolled={course.enrolled_count}
                  variant="compact"
                />
              </td>
              <td className="px-6 py-4">
                <StatusBadge
                  label={course.status}
                  tone={STATUS_TONE[course.status] ?? "amber"}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(course)}
                    className="rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
                  >
                    Edit
                  </button>

                  <details className="row-actions">
                    <summary aria-label={`More actions for ${course.code}`}>
                      ···
                    </summary>
                    <div>
                      <button type="button" onClick={() => onDelete(course.id)}>
                        Delete
                      </button>
                    </div>
                  </details>
                </div>
              </td>
            </tr>
          ))}

          {courses.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
