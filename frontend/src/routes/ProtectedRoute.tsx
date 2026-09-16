import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { ROUTES } from '../constants/routes';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthStore } from '../store/useAuthStore';

// Shown for the moment it takes to confirm a stored token with the API.
export function SessionCheck() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 text-brand-600 dark:bg-gray-950 dark:text-brand-400">
      <LoadingSpinner className="h-6 w-6" label="Checking your session" />
    </main>
  );
}

function ProtectedRoute() {
  const location = useLocation();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isInitialized = useAuthStore(
    (state) => state.isInitialized
  );

  if (!isInitialized) {
    return <SessionCheck />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
