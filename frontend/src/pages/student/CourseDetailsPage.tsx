import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { getCourseById } from "../../services/courseService";
import { enrollCourse } from "../../services/enrollmentService";
import { getSchedules } from "../../services/scheduleService";

import type { Course } from "../../types/course";
import type { Schedule } from "../../types/schedule";

export default function CourseDetailsPage() {
  const dayNames: Record<number, string> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
  };

  const { id } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      if (!id) {
        setError("Course ID is missing");
        setLoading(false);
        return;
      }

      try {
        const [courseResponse, schedulesResponse] = await Promise.all([
          getCourseById(id),
          getSchedules(),
        ]);

        setCourse(courseResponse);

        const courseSchedule = schedulesResponse.find(
          (schedule) => schedule.course_id === id,
        );

        setSchedule(courseSchedule ?? null);
      } catch (error) {
        console.error(error);
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    void loadCourse();
  }, [id]);

  async function handleEnroll() {
    if (!id) {
      return;
    }

    try {
      setEnrolling(true);
      setMessage("");
      setError("");

      await enrollCourse(id);

      setMessage("Enrollment successful!");
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? "Failed to enroll in course");
      } else {
        setError("Failed to enroll in course");
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">Loading course...</p>
    );
  }

  if (error && !course) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!course) {
    return <p className="text-gray-500 dark:text-gray-400">Course not found</p>;
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
        {course.code}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
        {course.title}
      </h1>

      <p className="mt-4 text-gray-600 dark:text-gray-400">
        {course.description}
      </p>

      <div className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Category:
          </span>{" "}
          {course.category_name}
        </p>

        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Instructor:
          </span>{" "}
          {course.instructor_name}
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

            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                Start Date:
              </span>{" "}
              {new Date(schedule.start_date).toLocaleDateString()}
            </p>

            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                End Date:
              </span>{" "}
              {new Date(schedule.end_date).toLocaleDateString()}
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

        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Status:
          </span>{" "}
          {course.status}
        </p>
      </div>

      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className="mt-6 rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enrolling ? "Enrolling..." : "Enroll"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-green-700 dark:text-green-400">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
