import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import {
  getDefaultRouteForRole,
  ROUTES,
} from '../constants/routes';

import type {
  UserRole,
} from '../constants/roles';

import { useAuthStore } from '../store/useAuthStore';

interface RoleRouteProps {
  allowedRoles: readonly UserRole[];
}

function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {
  const user = useAuthStore(
    (state) => state.user
  );

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={getDefaultRouteForRole(user.role)}
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleRoute;
