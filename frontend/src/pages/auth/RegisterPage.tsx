import { Navigate } from 'react-router-dom';

import RegisterForm from '../../components/forms/RegisterForm';

import {
  getDefaultRouteForRole,
} from '../../constants/routes';

import { useAuthStore } from '../../store/useAuthStore';

function RegisterPage() {
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
        Create an account
      </h2>

      <p className="mb-6 mt-1 text-sm text-gray-600">
        Register as a LearnHub student.
      </p>

      <RegisterForm />
    </>
  );
}

export default RegisterPage;
