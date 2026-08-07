import type { Course } from "../../types/course";

interface Props {
  courses: Course[];
  onDelete: (id: string) => void;
}

export default function CourseTable({ courses, onDelete }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Title</th>
          <th>Category</th>
          <th>Instructor</th>
          <th>Capacity</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {courses.map((course) => (
          <tr key={course.id}>
            <td>{course.code}</td>
            <td>{course.title}</td>
            <td>{course.category_name}</td>
            <td>{course.instructor_name}</td>
            <td>{course.capacity}</td>
            <td>{course.status}</td>

            <td>
              <button onClick={() => onDelete(course.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
