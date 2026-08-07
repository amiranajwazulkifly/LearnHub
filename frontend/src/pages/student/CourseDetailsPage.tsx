import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { getCourseById } from "../../services/courseService";
import { enrollCourse } from "../../services/enrollmentService";

import type { Course } from "../../types/course";

export default function CourseDetailsPage() {
  const { id } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
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
        const response = await getCourseById(id);

        setCourse(response.data);
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
    return <p>Loading course...</p>;
  }

  if (error && !course) {
    return <p>{error}</p>;
  }

  if (!course) {
    return <p>Course not found</p>;
  }

  return (
    <div>
      <h1>{course.title}</h1>

      <h3>{course.code}</h3>

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

      <p>
        <strong>Status:</strong> {course.status}
      </p>

      <button onClick={handleEnroll} disabled={enrolling}>
        {enrolling ? "Enrolling..." : "Enroll"}
      </button>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}
