import { useEffect, useState } from "react";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categoryService";

import type { Category } from "../../types/category";

import { getErrorMessage, getValidationErrors } from "../../utils/errorHandler";
import ConfirmModal from "../../components/common/ConfirmModal";

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createCategory({
        name: name.trim(),
        description: description.trim(),
      });

      setName("");
      setDescription("");

      await loadCategories();
    } catch (error) {
      console.error("Failed to create category:", error);

      const validationErrors = getValidationErrors(error);

      if (validationErrors.length > 0) {
        setError(validationErrors.map((item) => item.message).join(", "));
      } else {
        setError(getErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description);
    setError("");
  }

  async function handleUpdateCategory() {
    if (!editingId) {
      return;
    }

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateCategory(editingId, {
        name: name.trim(),
        description: description.trim(),
      });

      setEditingId(null);
      setName("");
      setDescription("");

      await loadCategories();
    } catch (error) {
      console.error("Failed to update category:", error);

      const validationErrors = getValidationErrors(error);

      if (validationErrors.length > 0) {
        setError(validationErrors.map((item) => item.message).join(", "));
      } else {
        setError(getErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);

    try {
      setError("");

      await deleteCategory(id);

      if (editingId === id) {
        setEditingId(null);
        setName("");
        setDescription("");
      }

      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      setError(getErrorMessage(error));
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setName("");
    setDescription("");
    setError("");
  }

  if (loading) {
    return <div className="p-6">Loading categories...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">Manage LearnHub course categories.</p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/40 dark:text-red-400">{error}</div>
      )}

      <form
        onSubmit={handleCreateCategory}
        className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Category" : "Add Category"}
        </h2>

        <div>
          <label htmlFor="category-name" className="mb-1 block font-medium">
            Name
          </label>

          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            placeholder="Example: Technology"
          />
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="mb-1 block font-medium"
          >
            Description
          </label>

          <textarea
            id="category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            rows={3}
            placeholder="Enter category description"
          />
        </div>

        <div className="flex gap-3">
          {editingId ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateCategory()}
                disabled={saving}
                className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-white disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Category"}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded bg-gray-200 px-4 py-2 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Category"}
            </button>
          )}
        </div>
      </form>

      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50 font-mono text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-gray-200 dark:border-gray-800">
                <td className="px-6 py-4 font-medium">{category.name}</td>

                <td className="px-6 py-4">{category.description}</td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-3 py-2 text-sm text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(category.id)}
                      className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete category?"
        message="Are you sure you want to delete this category? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CategoriesPage;
