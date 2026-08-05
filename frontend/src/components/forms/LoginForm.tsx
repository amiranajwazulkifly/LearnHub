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
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
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

        <input
          id="email"
          type="email"
          autoComplete="email"
          {...registerField('email')}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="name@example.com"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-600">
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

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...registerField('password')}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Enter your password"
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
