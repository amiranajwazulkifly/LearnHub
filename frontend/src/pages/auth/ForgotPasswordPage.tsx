import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../../schemas/authSchema';
import { authService } from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { fieldBorderClasses } from '../../utils/formStyles';
import { getErrorMessage } from '../../utils/errorHandler';

function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError('');
    try {
      await authService.forgotPassword(values);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Check your email</h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          If an account exists for that email, we&apos;ve sent a link to reset your password. It expires
          in 1 hour.
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="mt-6 inline-block text-sm font-medium text-brand-600 underline dark:text-brand-400"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold">Forgot your password?</h2>
      <p className="mb-6 mt-1 text-sm text-gray-600 dark:text-gray-400">
        Enter your account email and we&apos;ll send you a link to reset it.
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
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(!!errors.email)}`}
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-sheen w-full rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 font-medium text-white transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>

        <p className="text-center text-sm">
          <Link to={ROUTES.LOGIN} className="font-medium text-brand-600 underline dark:text-brand-400">
            Back to sign in
          </Link>
        </p>
      </form>
    </>
  );
}

export default ForgotPasswordPage;
