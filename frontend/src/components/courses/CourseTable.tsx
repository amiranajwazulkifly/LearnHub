import type { Course } from "../../types/course";

interface Props {
  courses: Course[];
  onDelete: (id: number) => void;
}

export default function CourseTable({ courses, onDelete }: Props) {
  return (
    <table border={1} cellPadding={10} width="100%">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Category</th>
          <th>Instructor</th>
          <th>Level</th>
          <th>Price</th>
          <th>Duration</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {courses.map((course) => (
          <tr key={course.id}>
            <td>{course.id}</td>
            <td>{course.title}</td>
            <td>{course.category_name}</td>
            <td>{course.instructor_name}</td>
            <td>{course.level}</td>
            <td>RM {course.price}</td>
            <td>{course.duration} hrs</td>

            <td>
              <button>Edit</button>

              <button onClick={() => onDelete(course.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
