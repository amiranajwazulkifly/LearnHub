import { Link } from "react-router-dom";

import type { Course } from "../../types/course";
import { ROUTES } from "../../constants/routes";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div>
      <h3>{course.code}</h3>
      <h2>{course.title}</h2>

      <p>{course.description}</p>

      <p>
        <strong>Category:</strong> {course.category_name}
      </p>

      <p>
        <strong>Instructor:</strong> {course.instructor_name}
      </p>

      <p>
        <strong>Capacity:</strong> {course.capacity}
      </p>

      <Link to={`${ROUTES.STUDENT.COURSES}/${course.id}`}>View Details</Link>
    </div>
  );
}
