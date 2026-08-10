import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../../schemas/authSchema';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { fieldBorderClasses } from '../../utils/formStyles';
import { getErrorMessage } from '../../utils/errorHandler';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setError('');
    try {
      await authService.resetPassword({ email, token, newPassword: values.newPassword });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (!token || !email) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Invalid reset link</h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          This password reset link is missing information. Please request a new one.
        </p>
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className="mt-6 inline-block text-sm font-medium text-brand-600 underline dark:text-brand-400"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Password reset</h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Your password has been changed. Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold">Set a new password</h2>
      <p className="mb-6 mt-1 text-sm text-gray-600 dark:text-gray-400">
        Choose a new password for <span className="font-medium">{email}</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(!!errors.newPassword)}`}
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(!!errors.confirmPassword)}`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-sheen w-full rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 font-medium text-white transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </>
  );
}

export default ResetPasswordPage;
