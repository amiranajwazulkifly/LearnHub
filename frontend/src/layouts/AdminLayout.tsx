import {
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import { ROUTES } from '../constants/routes';
import { useAuthStore } from '../store/useAuthStore';

function AdminLayout() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <div>
          <strong>LearnHub Admin</strong>
          <p className="text-sm text-gray-600">
            {user?.fullName}
          </p>
        </div>

        <nav className="flex items-center gap-4">
          <Link to={ROUTES.ADMIN.PROFILE}>
            Profile
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border px-3 py-2"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
