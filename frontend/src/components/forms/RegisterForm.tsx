import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { ROUTES } from '../../constants/routes';

import {
  registerSchema,
  type RegisterFormValues,
} from '../../schemas/authSchema';

import { useAuthStore } from '../../store/useAuthStore';
import { fieldBorderClasses } from '../../utils/formStyles';

function RegisterForm() {
  const navigate = useNavigate();

  const registerAccount = useAuthStore(
    (state) => state.register
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

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function onSubmit(
    values: RegisterFormValues
  ) {
    try {
      await registerAccount(values);

      navigate(
        ROUTES.STUDENT.DASHBOARD,
        { replace: true }
      );
    } catch {
      // The Zustand store already saves the error.
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="fullName"
          className="mb-1 block text-sm font-medium"
        >
          Full name
        </label>

        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>

          <input
            id="fullName"
            type="text"
            autoComplete="name"
            {...registerField('fullName')}
            className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(!!errors.fullName)}`}
            placeholder="Your full name"
          />
        </div>

        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium"
        >
          Email address
        </label>

        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>

          <input
            id="email"
            type="email"
            autoComplete="email"
            {...registerField('email')}
            className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(!!errors.email)}`}
            placeholder="name@example.com"
          />
        </div>

        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium"
        >
          Password
        </label>

        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...registerField('password')}
            className={`w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${fieldBorderClasses(!!errors.password)}`}
            placeholder="At least 8 characters"
          />
        </div>

        {errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-sheen w-full rounded-lg bg-linear-to-r from-brand-600 to-brand-500 px-4 py-2 font-medium text-white transition hover:from-brand-700 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading
          ? 'Creating account...'
          : 'Create student account'}
      </button>

      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-brand-600 underline dark:text-brand-400"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
