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
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
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

        <input
          id="fullName"
          type="text"
          autoComplete="name"
          {...registerField('fullName')}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Your full name"
        />

        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">
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
          autoComplete="new-password"
          {...registerField('password')}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="At least 8 characters"
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
        {isLoading
          ? 'Creating account...'
          : 'Create student account'}
      </button>

      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
