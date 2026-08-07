import { useEffect, useState } from "react";

import CourseCard from "../../components/courses/CourseCard";
import { getCourses } from "../../services/courseService";

import type { Course } from "../../types/course";

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await getCourses();

        setCourses(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    }

    void loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const keyword = search.toLowerCase();

    return (
      course.title.toLowerCase().includes(keyword) ||
      course.code.toLowerCase().includes(keyword) ||
      (course.category_name ?? "").toLowerCase().includes(keyword) ||
      (course.instructor_name ?? "").toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Browse Courses</h1>

      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <p>{filteredCourses.length} course(s) found</p>

      <div>
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
