import { useEffect, useState } from "react";

import { getCourses, deleteCourse } from "../../services/courseService";

import CourseTable from "../../components/courses/CourseTable";

import type { Course } from "../../types/course";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  async function loadCourses() {
    try {
      const response = await getCourses();

      setCourses(response.data);
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm("Delete this course?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteCourse(id);

      await loadCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>

        <p className="mt-2 text-gray-600">
          Manage courses, instructors and categories.
        </p>
      </div>

      <CourseTable courses={courses} onDelete={handleDelete} />
    </div>
  );
}
