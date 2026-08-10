import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  getDefaultRouteForRole,
  ROUTES,
} from '../../constants/routes';

import {
  loginSchema,
  type LoginFormValues,
} from '../../schemas/authSchema';

import { useAuthStore } from '../../store/useAuthStore';

function LoginForm() {
  const navigate = useNavigate();

  const login = useAuthStore(
    (state) => state.login
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  async function onSubmit(
    values: LoginFormValues
  ) {
    try {
      const user = await login(values);

      navigate(
        getDefaultRouteForRole(user.role),
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
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
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
            autoComplete="current-password"
            {...registerField('password')}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="Enter your password"
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
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-brand-600 underline dark:text-brand-400"
        >
          Register
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
