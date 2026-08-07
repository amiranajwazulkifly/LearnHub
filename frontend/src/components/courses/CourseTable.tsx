import type { Course } from "../../types/course";

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
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="border-b bg-gray-100 text-left">
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
            <tr key={course.id} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{course.code}</td>

              <td className="px-6 py-4">
                <div className="font-medium">{course.title}</div>

                {course.description && (
                  <div className="mt-1 max-w-xs truncate text-sm text-gray-500">
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
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    course.status === "published"
                      ? "bg-green-100 text-green-700"
                      : course.status === "archived"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {course.status}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(course)}
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
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
