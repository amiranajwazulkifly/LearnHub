import { zodResolver } from '@hookform/resolvers/zod';
import {
  useEffect,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';

import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from '../../schemas/profileSchema';

import { useAuthStore } from '../../store/useAuthStore';

function ProfileForm() {
  const user = useAuthStore(
    (state) => state.user
  );

  const updateProfile = useAuthStore(
    (state) => state.updateProfile
  );

  const changePassword = useAuthStore(
    (state) => state.changePassword
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );

  const error = useAuthStore(
    (state) => state.error
  );

  const clearError = useAuthStore(
    (state) => state.clearError
  );

  const [
    profileSuccess,
    setProfileSuccess,
  ] = useState<string | null>(null);

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState<string | null>(null);

  const {
    register: registerProfileField,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: {
      errors: profileErrors,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPasswordField,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: {
      errors: passwordErrors,
    },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(
      changePasswordSchema
    ),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
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

  async function onProfileSubmit(
    values: ProfileFormValues
  ) {
    setProfileSuccess(null);
    setPasswordSuccess(null);

    try {
      await updateProfile(values);

      setProfileSuccess(
        'Profile updated successfully'
      );
    } catch {
      // Error is stored in Zustand.
    }
  }

  async function onPasswordSubmit(
    values: ChangePasswordFormValues
  ) {
    setProfileSuccess(null);
    setPasswordSuccess(null);

    try {
      await changePassword({
        currentPassword:
          values.currentPassword,
        newPassword:
          values.newPassword,
      });

      resetPassword();

      setPasswordSuccess(
        'Password changed successfully'
      );
    } catch {
      // Error is stored in Zustand.
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Account information
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Role
            </p>

            <p className="capitalize">
              {user.role}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Account status
            </p>

            <p className="capitalize">
              {user.status}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleProfileSubmit(
          onProfileSubmit
        )}
        className="rounded-xl bg-white p-6 shadow-sm"
        noValidate
      >
        <h2 className="text-xl font-semibold">
          Edit profile
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Update your personal account details.
        </p>

        {profileSuccess && (
          <div
            role="status"
            className="mt-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700"
          >
            {profileSuccess}
          </div>
        )}

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="profile-full-name"
              className="mb-1 block text-sm font-medium"
            >
              Full name
            </label>

            <input
              id="profile-full-name"
              type="text"
              autoComplete="name"
              {...registerProfileField(
                'fullName'
              )}
              className="w-full rounded-lg border px-3 py-2"
            />

            {profileErrors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {
                  profileErrors.fullName
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-1 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              {...registerProfileField(
                'email'
              )}
              className="w-full rounded-lg border px-3 py-2"
            />

            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600">
                {
                  profileErrors.email.message
                }
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? 'Saving...'
              : 'Save profile'}
          </button>
        </div>
      </form>

      <form
        onSubmit={handlePasswordSubmit(
          onPasswordSubmit
        )}
        className="rounded-xl bg-white p-6 shadow-sm"
        noValidate
      >
        <h2 className="text-xl font-semibold">
          Change password
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Enter your current password before
          choosing a new password.
        </p>

        {passwordSuccess && (
          <div
            role="status"
            className="mt-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700"
          >
            {passwordSuccess}
          </div>
        )}

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="current-password"
              className="mb-1 block text-sm font-medium"
            >
              Current password
            </label>

            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              {...registerPasswordField(
                'currentPassword'
              )}
              className="w-full rounded-lg border px-3 py-2"
            />

            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {
                  passwordErrors
                    .currentPassword.message
                }
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-1 block text-sm font-medium"
            >
              New password
            </label>

            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...registerPasswordField(
                'newPassword'
              )}
              className="w-full rounded-lg border px-3 py-2"
            />

            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {
                  passwordErrors.newPassword
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1 block text-sm font-medium"
            >
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              {...registerPasswordField(
                'confirmPassword'
              )}
              className="w-full rounded-lg border px-3 py-2"
            />

            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {
                  passwordErrors
                    .confirmPassword.message
                }
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg border border-black px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? 'Changing password...'
              : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileForm;
