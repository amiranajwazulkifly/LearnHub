import UserMenu from './UserMenu';

interface NavbarProps {
  portalName: string;
}

function Navbar({
  portalName,
}: NavbarProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex min-h-16 items-center justify-between px-6">
        <div>
          <p className="text-lg font-bold text-gray-900">
            LearnHub
          </p>

          <p className="text-xs text-gray-500">
            {portalName}
          </p>
        </div>

        <UserMenu />
      </div>
    </header>
  );
}

export default Navbar;
