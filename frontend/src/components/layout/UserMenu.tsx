import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/useAuthStore';

function UserMenu() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  async function handleLogout() {
    await logout();

    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-gray-900">
          {user.fullName}
        </p>

        <p className="text-xs capitalize text-gray-500">
          {user.role}
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Logout
      </button>
    </div>
  );
}

export default UserMenu;
