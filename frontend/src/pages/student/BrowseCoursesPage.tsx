import { useEffect, useState } from "react";
import { getSchedules } from "../../services/scheduleService";
import type { Schedule } from "../../types/schedule";
import CourseCard from "../../components/courses/CourseCard";
import { getCourses } from "../../services/courseService";
import { GridViewIcon, ListViewIcon } from "../../components/common/NavIcons";

import type { Course } from "../../types/course";
import { SkeletonCards } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";

type ViewLayout = "grid" | "list";

const VIEW_STORAGE_KEY = "learnhub-browse-courses-view";

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [view, setView] = useState<ViewLayout>(
    () => (localStorage.getItem(VIEW_STORAGE_KEY) as ViewLayout) || "grid",
  );

  function changeView(next: ViewLayout) {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  }

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const [courseResult, scheduleResult] = await Promise.all([
          getCourses(),
          getSchedules(),
        ]);

        setCourses(courseResult.courses);
        setSchedules(scheduleResult);
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

    const matchesSearch =
      course.title.toLowerCase().includes(keyword) ||
      course.code.toLowerCase().includes(keyword) ||
      (course.category_name ?? "").toLowerCase().includes(keyword) ||
      (course.instructor_name ?? "").toLowerCase().includes(keyword);

    const matchesCategory = !category || course.category_name === category;

    const matchesInstructor =
      !instructor || course.instructor_name === instructor;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesInstructor &&
      (!status || course.status === status)
    );
  });

  const categories = [
    ...new Set(
      courses
        .map((course) => course.category_name)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  const instructors = [
    ...new Set(
      courses
        .map((course) => course.instructor_name)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  if (loading) {
    return <SkeletonCards />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="catalog-page">
      <div className="dashboard-heading">
        <p className="eyebrow">Courses</p>
        <h1 className="text-3xl font-bold">
          Browse{" "}
          <span className="text-brand-600 dark:text-brand-400">Courses</span>
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Find courses that match your study plan.
        </p>
      </div>

      <div className="category-tabs" aria-label="Course categories">
        {["", ...categories].map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            className={category === item ? "selected" : ""}
            onClick={() => setCategory(item)}
          >
            {item || "All"}
          </button>
        ))}
      </div>
      <div className="mb-6 grid gap-4 rounded-lg border border-gray-200 bg-white p-5 lg:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
        <input
          type="text"
          aria-label="Search courses"
          placeholder="Search title, code, category..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
        />

        <select
          aria-label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
        >
          <option value="">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          aria-label="Instructor"
          value={instructor}
          onChange={(event) => setInstructor(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
        >
          <option value="">All Instructors</option>

          {instructors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <select
            aria-label="Course status"
            className="min-w-0 flex-1 border border-gray-300 bg-white px-3 dark:bg-gray-800 dark:border-gray-700"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {[...new Set(courses.map((c) => c.status))].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            className="text-sm text-brand-600 dark:text-brand-400"
            onClick={() => {
              setSearch("");
              setCategory("");
              setInstructor("");
              setStatus("");
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredCourses.length} course(s) found
        </p>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-800">
          <button
            type="button"
            onClick={() => changeView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={`rounded-md p-1.5 transition ${
              view === "grid"
                ? "bg-brand-600 text-white"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <GridViewIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => changeView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={`rounded-md p-1.5 transition ${
              view === "list"
                ? "bg-brand-600 text-white"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <ListViewIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="text-gray-500 dark:text-gray-400">
            <EmptyState
              title="No courses match your filters"
              description="Try clearing a filter or searching for something broader."
              variant="plain"
            />
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const schedule = schedules.find(
              (schedule) => schedule.course_id === course.id,
            );

            return (
              <CourseCard key={course.id} course={course} schedule={schedule} />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((course) => {
            const schedule = schedules.find(
              (schedule) => schedule.course_id === course.id,
            );

            return (
              <CourseCard
                key={course.id}
                course={course}
                schedule={schedule}
                layout="list"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
