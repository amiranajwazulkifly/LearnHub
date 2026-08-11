import { Link } from "react-router-dom";

import type { Course } from "../../types/course";
import type { Schedule } from "../../types/schedule";
import { ROUTES } from "../../constants/routes";
import StatusBadge from "../common/StatusBadge";
import type { StatusTone } from "../common/StatusBadge";

interface CourseCardProps {
  course: Course;
  schedule?: Schedule;
}

const STATUS_TONE: Record<string, StatusTone> = {
  published: "green",
  archived: "gray",
  draft: "amber",
};

const dayNames: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export default function CourseCard({ course, schedule }: CourseCardProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-600">{course.code}</p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-50">
            {course.title}
          </h2>
        </div>

        <StatusBadge
          label={course.status}
          tone={STATUS_TONE[course.status] ?? "amber"}
        />
      </div>

      <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">
        {course.description}
      </p>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Category:
          </span>{" "}
          {course.category_name ?? "Not assigned"}
        </p>

        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Instructor:
          </span>{" "}
          {course.instructor_name ?? "Not assigned"}
        </p>

        {schedule ? (
          <>
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Schedule:
              </span>{" "}
              {dayNames[schedule.day_of_week]},{" "}
              {schedule.start_time.slice(0, 5)} -{" "}
              {schedule.end_time.slice(0, 5)}
            </p>

            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Location:
              </span>{" "}
              {schedule.location || "TBA"}
            </p>
          </>
        ) : (
          <p>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              Schedule:
            </span>{" "}
            Not scheduled
          </p>
        )}

        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Capacity:
          </span>{" "}
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
