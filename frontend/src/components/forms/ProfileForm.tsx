import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "../../schemas/profileSchema";

import { useAuthStore } from "../../store/useAuthStore";
import { fieldBorderClasses } from "../../utils/formStyles";
import { toast } from "../../store/useToastStore";

function ProfileForm() {
  const user = useAuthStore((state) => state.user);

  const updateProfile = useAuthStore((state) => state.updateProfile);

  const changePassword = useAuthStore((state) => state.changePassword);

  const isLoading = useAuthStore((state) => state.isLoading);

  const error = useAuthStore((state) => state.error);

  const clearError = useAuthStore((state) => state.clearError);

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const {
    register: registerProfileField,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPasswordField,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName,
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  async function onProfileSubmit(values: ProfileFormValues) {
    setProfileSuccess(null);
    setPasswordSuccess(null);

    try {
      await updateProfile(values);

      setProfileSuccess("Profile updated successfully");
      toast.success("Profile updated.");
    } catch {
      // The message itself is stored in Zustand and rendered inline; the
      // toast just makes the failure noticeable if the form is scrolled off.
      toast.error("Unable to save your profile. Please try again.");
    }
  }

  async function onPasswordSubmit(values: ChangePasswordFormValues) {
    setProfileSuccess(null);
    setPasswordSuccess(null);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      resetPassword();

      setPasswordSuccess("Password changed successfully");
      toast.success("Password changed.");
    } catch {
      toast.error("Unable to change your password. Please try again.");
    }
  }

  if (!user) {
    return null;
  }

  const initials = user.fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-form space-y-6">
      {/* Global error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* Account overview */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                {user.fullName}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium capitalize text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
                  {user.role}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-specific details. Read-only: these are managed by the
          institution (student record) or an administrator (instructor
          directory), not by the account holder. */}
      {user.role === "student" && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex items-start gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Academic Record
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Managed by the registry. Contact your programme office to
                correct these.
              </p>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Student Number", user.studentNumber],
              ["Programme", user.programme],
              [
                "Semester",
                user.semester != null ? `Semester ${user.semester}` : null,
              ],
              ["Phone", user.phone],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/30"
              >
                <dt className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {label}
                </dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                  {value ?? (
                    <span className="font-normal text-gray-400 dark:text-gray-500">
                      Not recorded
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {user.role === "instructor" && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex items-start gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Teaching Profile
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Shown to students on your course pages. An administrator
                maintains these details.
              </p>
            </div>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/30">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Courses
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                {user.courseCount ?? 0}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/30">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Current Students
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                {user.studentCount ?? 0}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/30">
              <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Directory Status
              </p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                {user.isActiveInstructor === false ? "Inactive" : "Active"}
              </p>
            </div>
          </div>

          <dl className="space-y-4">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Expertise
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.expertise ?? (
                  <span className="text-gray-400 dark:text-gray-500">
                    Not recorded
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Biography
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                {user.biography ?? (
                  <span className="text-gray-400 dark:text-gray-500">
                    Not recorded
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Forms */}
      <div className="profile-edit-sections grid gap-6">
        {/* Edit profile */}
        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          noValidate
        >
          <div className="mb-5 flex items-start gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Personal information
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your personal account details.
              </p>
            </div>
          </div>

          {profileSuccess && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
            >
              {profileSuccess}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="profile-full-name"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full name
              </label>

              <div className="relative">
                <input
                  id="profile-full-name"
                  type="text"
                  autoComplete="name"
                  {...registerProfileField("fullName")}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
                    !!profileErrors.fullName,
                  )}`}
                />
              </div>

              {profileErrors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {profileErrors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>

              <div className="relative">
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  {...registerProfileField("email")}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
                    !!profileErrors.email,
                  )}`}
                />
              </div>

              {profileErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {profileErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        {/* Change password */}
        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          noValidate
        >
          <div className="mb-5 flex items-start gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
            >
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="current-password"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Current password
              </label>

              <div className="relative">
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  {...registerPasswordField("currentPassword")}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
                    !!passwordErrors.currentPassword,
                  )}`}
                />
              </div>

              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New password
              </label>

              <div className="relative">
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  {...registerPasswordField("newPassword")}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
                    !!passwordErrors.newPassword,
                  )}`}
                />
              </div>

              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm new password
              </label>

              <div className="relative">
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  {...registerPasswordField("confirmPassword")}
                  className={`w-full rounded-lg border bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
                    !!passwordErrors.confirmPassword,
                  )}`}
                />
              </div>

              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
            >
              {isLoading ? "Changing password..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;
