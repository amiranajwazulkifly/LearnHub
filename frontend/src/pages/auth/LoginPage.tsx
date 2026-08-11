import { Navigate } from 'react-router-dom';

import LoginForm from '../../components/forms/LoginForm';

import {
  getDefaultRouteForRole,
} from '../../constants/routes';

import { useAuthStore } from '../../store/useAuthStore';

function LoginPage() {
  const user = useAuthStore(
    (state) => state.user
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={getDefaultRouteForRole(user.role)}
        replace
      />
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold">
        Sign in
      </h2>

      <p className="mb-6 mt-1 text-sm text-gray-600 dark:text-gray-400">
        Sign in to continue to LearnHub.
      </p>

      <LoginForm />
    </>
  );
}

export default LoginPage;
