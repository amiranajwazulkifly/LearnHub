import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import UserMenu from './UserMenu';

interface NavbarProps {
  portalName: string;
}

function Navbar({
  portalName,
}: NavbarProps) {
  return (
    <header className="relative border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-brand-600 via-brand-400 to-transparent" />

      <div className="flex min-h-16 items-center justify-between px-6">
        <div>
          <Logo className="h-7 w-auto" />

          <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {portalName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
