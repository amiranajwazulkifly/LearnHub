import { Link } from "react-router-dom";

import type { Course } from "../../types/course";
import { ROUTES } from "../../constants/routes";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-600">{course.code}</p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            {course.title}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            course.status === "published"
              ? "bg-green-100 text-green-700"
              : course.status === "archived"
                ? "bg-gray-200 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {course.status}
        </span>
      </div>

      <p className="mb-4 flex-1 text-sm text-gray-600">{course.description}</p>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-800">Category:</span>{" "}
          {course.category_name ?? "Not assigned"}
        </p>

        <p>
          <span className="font-medium text-gray-800">Instructor:</span>{" "}
          {course.instructor_name ?? "Not assigned"}
        </p>

        <p>
          <span className="font-medium text-gray-800">Capacity:</span>{" "}
          {course.capacity}
        </p>
      </div>

      <Link
        to={`${ROUTES.STUDENT.COURSES}/${course.id}`}
        className="mt-5 inline-block rounded bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
      >
        View Details
      </Link>
    </div>
  );
}
