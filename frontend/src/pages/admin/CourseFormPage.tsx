import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getErrorMessage, getValidationErrors } from "../../utils/errorHandler";

import {
  createCourse,
  getCourseById,
  updateCourse,
} from "../../services/courseService";

import { getCategories } from "../../services/categoryService";
import { getInstructors } from "../../services/instructorService";

import type { Category } from "../../types/category";
import type { Instructor } from "../../types/instructor";

function CourseFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    category_id: "",
    instructor_id: "",
    capacity: "30",
    status: "draft",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        setPageLoading(true);
        setError("");

        const [categoryData, instructorData] = await Promise.all([
          getCategories(),
          getInstructors(),
        ]);

        setCategories(categoryData);
        setInstructors(instructorData);

        if (isEditMode && id) {
          const response = await getCourseById(id);
          const course = response.data;

          setFormData({
            code: course.code ?? "",
            title: course.title ?? "",
            description: course.description ?? "",
            category_id: course.category_id ?? "",
            instructor_id: course.instructor_id ?? "",
            capacity: String(course.capacity ?? 30),
            status: course.status ?? "draft",
          });
        }
      } catch (error) {
        console.error("Failed to load course form:", error);
        setError(getErrorMessage(error));
      } finally {
        setPageLoading(false);
      }
    }

    void loadPage();
  }, [id, isEditMode]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!formData.code.trim()) {
      setError("Course code is required.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Course title is required.");
      return;
    }

    if (Number(formData.capacity) < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    const payload = {
      code: formData.code.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      category_id: formData.category_id || null,
      instructor_id: formData.instructor_id || null,
      capacity: Number(formData.capacity),
      status: formData.status,
    };

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateCourse(id, payload);
      } else {
        await createCourse(payload);
      }

      navigate("/admin/courses");
    } catch (error) {
      console.error("Failed to save course:", error);

      const validationErrors = getValidationErrors(error);

      if (validationErrors.length > 0) {
        setError(validationErrors.map((item) => item.message).join(", "));
      } else {
        setError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg bg-white shadow">
        <p className="text-gray-500">Loading course form...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Course" : "Create Course"}
        </h1>

        <p className="mt-2 text-gray-500">
          {isEditMode
            ? "Update the selected course."
            : "Add a new course to LearnHub."}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl bg-white p-6 shadow"
      >
        <div>
          <label htmlFor="code" className="mb-2 block font-medium">
            Course Code
          </label>

          <input
            id="code"
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="title" className="mb-2 block font-medium">
            Course Title
          </label>

          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block font-medium">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="capacity" className="mb-2 block font-medium">
            Capacity
          </label>

          <input
            id="capacity"
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-2 block font-medium">
            Status
          </label>

          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label htmlFor="category_id" className="mb-2 block font-medium">
            Category
          </label>

          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="instructor_id" className="mb-2 block font-medium">
            Instructor
          </label>

          <select
            id="instructor_id"
            name="instructor_id"
            value={formData.instructor_id}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select instructor</option>

            {instructors
              .filter((instructor) => instructor.is_active)
              .map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.full_name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Course"
                : "Create Course"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            disabled={loading}
            className="rounded bg-gray-200 px-5 py-2 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseFormPage;
