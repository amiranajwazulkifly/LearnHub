import { Link } from "react-router-dom";
import type { Course } from "../../types/course";
import type { Schedule } from "../../types/schedule";
import { ROUTES } from "../../constants/routes";
import StatusBadge from "../common/StatusBadge";
import { DAY_SHORT_NAMES } from "../../utils/timetable";
export default function CourseCard({
  course,
  schedule,
  layout = "grid",
}: {
  course: Course;
  schedule?: Schedule;
  layout?: "grid" | "list";
}) {
  return (
    <article
      className={`course-card ${layout === "list" ? "course-list" : ""}`}
    >
      <div className="course-card-top">
        <span>{course.code}</span>
        <StatusBadge
          label={course.status}
          tone={
            course.status === "published"
              ? "green"
              : course.status === "draft"
                ? "amber"
                : "gray"
          }
        />
      </div>
      <h2>{course.title}</h2>
      <p className="course-description">
        {course.description || "No description provided."}
      </p>
      <p className="course-meta">
        {course.category_name ?? "Not assigned"}
        <span> | </span>
        {course.instructor_name ?? "Instructor not assigned"}
      </p>
      <div className="course-card-bottom">
        <div>
          <p>
            {course.enrolled_count ?? 0} / {course.capacity} seats
          </p>
          <p>
            {schedule
              ? `${DAY_SHORT_NAMES[schedule.day_of_week]}, ${schedule.start_time.slice(0, 5)}–${schedule.end_time.slice(0, 5)}`
              : "Not scheduled"}
          </p>
          {schedule?.location && <p>{schedule.location}</p>}
        </div>
        <Link
          className="secondary-button"
          to={`${ROUTES.STUDENT.COURSES}/${course.id}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
