import { Link } from "react-router-dom";

import type { Course } from "../../types/course";
import { ROUTES } from "../../constants/routes";
import StatusBadge from "../common/StatusBadge";
import type { StatusTone } from "../common/StatusBadge";

interface CourseCardProps {
  course: Course;
}

const STATUS_TONE: Record<string, StatusTone> = {
  published: "green",
  archived: "gray",
  draft: "amber",
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">{course.code}</p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-50">
            {course.title}
          </h2>
        </div>

        <StatusBadge label={course.status} tone={STATUS_TONE[course.status] ?? "amber"} />
      </div>

      <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">{course.description}</p>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">Category:</span>{" "}
          {course.category_name ?? "Not assigned"}
        </p>

        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">Instructor:</span>{" "}
          {course.instructor_name ?? "Not assigned"}
        </p>

        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">Capacity:</span>{" "}
          {course.capacity}
        </p>
      </div>

      <Link
        to={`${ROUTES.STUDENT.COURSES}/${course.id}`}
        className="mt-5 inline-block rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-center text-sm font-medium text-white transition hover:from-brand-700 hover:to-brand-600"
      >
        View Details
      </Link>
    </div>
  );
}
