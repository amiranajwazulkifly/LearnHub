import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BadgeCheck,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from "../../schemas/profileSchema";

import { useAuthStore } from "../../store/useAuthStore";
import { fieldBorderClasses } from "../../utils/formStyles";

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
    } catch {
      // Error is stored in Zustand.
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
    } catch {
      // Error is stored in Zustand.
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
    <div className="space-y-6">
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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-600 to-brand-400 text-xl font-bold text-white shadow-lg shadow-brand-500/20">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                {user.fullName}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Mail size={15} />
                {user.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium capitalize text-brand-700 dark:bg-brand-950/50 dark:text-brand-400">
                  <UserRound size={13} />
                  {user.role}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <BadgeCheck size={13} />
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account info cards */}
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
              <UserRound size={18} />
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Role
              </p>

              <p className="mt-0.5 font-semibold capitalize text-gray-900 dark:text-gray-100">
                {user.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Account Status
              </p>

              <p className="mt-0.5 font-semibold capitalize text-gray-900 dark:text-gray-100">
                {user.status}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Forms */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Edit profile */}
        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          noValidate
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
              <UserRound size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Edit Profile
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
                <UserRound
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="profile-full-name"
                  type="text"
                  autoComplete="name"
                  {...registerProfileField("fullName")}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
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
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  {...registerProfileField("email")}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <KeyRound size={18} />
            </div>

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
                <LockKeyhole
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  {...registerPasswordField("currentPassword")}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
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
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  {...registerPasswordField("newPassword")}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
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
                <ShieldCheck
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  {...registerPasswordField("confirmPassword")}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(
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
              <KeyRound size={16} />

              {isLoading ? "Changing password..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;
