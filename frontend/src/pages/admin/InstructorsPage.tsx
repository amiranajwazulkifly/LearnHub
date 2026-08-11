import { Fragment, useEffect, useState } from "react";

import {
  createInstructor,
  deleteInstructor,
  getInstructors,
  updateInstructor,
  setInstructorAccount,
} from "../../services/instructorService";

import type { Instructor } from "../../types/instructor";
import type { PaginationMeta } from "../../types/api";
import { getErrorMessage, getValidationErrors } from "../../utils/errorHandler";
import StatusBadge from "../../components/common/StatusBadge";
import Pagination from "../../components/common/Pagination";
import { usePagination } from "../../hooks/usePagination";
import ConfirmModal from "../../components/common/ConfirmModal";

function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const { page, setPage } = usePagination();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [expertise, setExpertise] = useState("");
  const [biography, setBiography] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [loginTargetId, setLoginTargetId] = useState<string | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSaving, setLoginSaving] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  async function loadInstructors() {
    try {
      setLoading(true);
      setError("");

      const data = await getInstructors(page);

      setInstructors(data.instructors);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load instructors:", error);
      setError("Failed to load instructors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInstructors();
  }, [page]);

  function clearForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setExpertise("");
    setBiography("");
    setIsActive(true);
    setEditingId(null);
  }

  async function handleCreateInstructor(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Instructor name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Instructor email is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createInstructor({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        expertise: expertise.trim(),
        biography: biography.trim(),
        is_active: isActive,
      });

      clearForm();
      await loadInstructors();
    } catch (error) {
      console.error("Instructor operation failed:", error);

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

  function handleEdit(instructor: Instructor) {
    setEditingId(instructor.id);
    setFullName(instructor.full_name);
    setEmail(instructor.email);
    setPhone(instructor.phone ?? "");
    setExpertise(instructor.expertise ?? "");
    setBiography(instructor.biography ?? "");
    setIsActive(instructor.is_active);
    setError("");
  }

  async function handleUpdateInstructor() {
    if (!editingId) {
      return;
    }

    if (!fullName.trim()) {
      setError("Instructor name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Instructor email is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateInstructor(editingId, {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        expertise: expertise.trim(),
        biography: biography.trim(),
        is_active: isActive,
      });

      clearForm();
      await loadInstructors();
    } catch (error) {
      console.error("Instructor operation failed:", error);

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
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    try {
      setError("");

      await deleteInstructor(id);

      if (editingId === id) {
        clearForm();
      }

      await loadInstructors();
    } catch (error) {
      console.error("Failed to delete instructor:", error);
      setError(getErrorMessage(error));
    }
  }

  function handleOpenLoginForm(instructor: Instructor) {
    setLoginTargetId(instructor.id);
    setLoginPassword("");
    setLoginError("");
  }

  function handleCloseLoginForm() {
    setLoginTargetId(null);
    setLoginPassword("");
    setLoginError("");
  }

  async function handleSaveLogin() {
    if (!loginTargetId) {
      return;
    }

    if (loginPassword.trim().length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoginSaving(true);
      setLoginError("");

      await setInstructorAccount(loginTargetId, loginPassword.trim());

      handleCloseLoginForm();
      await loadInstructors();
    } catch (error) {
      console.error("Failed to set instructor login:", error);
      setLoginError(getErrorMessage(error));
    } finally {
      setLoginSaving(false);
    }
  }

  if (loading) {
    return <div>Loading instructors...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Instructor Management</h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">Manage LearnHub instructors.</p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700 dark:bg-red-900/40 dark:text-red-400">{error}</div>
      )}

      <form
        onSubmit={handleCreateInstructor}
        className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Instructor" : "Add Instructor"}
        </h2>

        <div>
          <label className="mb-1 block font-medium">Full Name</label>

          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            placeholder="Example: Dr. Sarah Ahmad"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            placeholder="sarah@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Phone</label>

          <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            placeholder="0111111111"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Expertise</label>

          <input
            type="text"
            value={expertise}
            onChange={(event) => setExpertise(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            placeholder="Web Development"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Biography</label>

          <textarea
            value={biography}
            onChange={(event) => setBiography(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700"
            rows={3}
            placeholder="Enter instructor biography"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active Instructor
        </label>

        <div className="flex gap-3">
          {editingId ? (
            <>
              <button
                type="button"
                onClick={() => void handleUpdateInstructor()}
                disabled={saving}
                className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-white disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Instructor"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={saving}
                className="rounded bg-gray-200 px-4 py-2 dark:bg-gray-700"
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
              {saving ? "Creating..." : "Create Instructor"}
            </button>
          )}
        </div>
      </form>

      <div className="table-scroll overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50 font-mono text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Expertise</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Login</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {instructors.map((instructor) => (
              <Fragment key={instructor.id}>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <td className="px-6 py-4 font-medium">
                    {instructor.full_name}
                  </td>

                  <td className="px-6 py-4">{instructor.email}</td>

                  <td className="px-6 py-4">{instructor.expertise}</td>

                  <td className="px-6 py-4">
                    <StatusBadge
                      label={instructor.is_active ? "Active" : "Inactive"}
                      tone={instructor.is_active ? "green" : "gray"}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge
                      label={instructor.has_login ? "Enabled" : "No Access"}
                      tone={instructor.has_login ? "green" : "gray"}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(instructor)}
                        className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-3 py-2 text-sm text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenLoginForm(instructor)}
                        className="rounded border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        {instructor.has_login ? "Reset Password" : "Set Up Login"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(instructor.id)}
                        className="rounded bg-red-600 px-3 py-2 text-sm text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {loginTargetId === instructor.id && (
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            {instructor.has_login ? "New password" : "Set a login password"}
                          </label>
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(event) => setLoginPassword(event.target.value)}
                            placeholder="At least 8 characters"
                            className="w-64 rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleSaveLogin()}
                          disabled={loginSaving}
                          className="rounded bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                          {loginSaving ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={handleCloseLoginForm}
                          disabled={loginSaving}
                          className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Login email will be this instructor&apos;s existing email address ({instructor.email}).
                      </p>

                      {loginError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{loginError}</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}

            {instructors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No instructors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}

      <ConfirmModal
        open={deleteTargetId !== null}
        title="Delete instructor?"
        message="Are you sure you want to delete this instructor? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

export default InstructorsPage;
