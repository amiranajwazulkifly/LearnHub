import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/useAuthStore';
import ConfirmModal from '../common/ConfirmModal';

function UserMenu() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleConfirmLogout() {
    setConfirmOpen(false);

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
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
          {user.fullName}
        </p>

        <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
          {user.role}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Logout
      </button>

      <ConfirmModal
        open={confirmOpen}
        title="Log out?"
        message="You'll need to sign in again to continue where you left off."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onConfirm={() => void handleConfirmLogout()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default UserMenu;
