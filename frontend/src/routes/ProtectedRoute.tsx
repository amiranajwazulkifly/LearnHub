import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { ROUTES } from '../constants/routes';
import { useAuthStore } from '../store/useAuthStore';

function ProtectedRoute() {
  const location = useLocation();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isInitialized = useAuthStore(
    (state) => state.isInitialized
  );

  if (!isInitialized) {
    return (
      <main className="p-6">
        Checking your session...
      </main>
    );
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
