import {
  NavLink,
} from 'react-router-dom';

interface SidebarItem {
  label: string;
  path: string;
  end?: boolean;
}

interface SidebarProps {
  items: readonly SidebarItem[];
}

function Sidebar({
  items,
}: SidebarProps) {
  return (
    <aside className="w-full border-b border-gray-200 bg-white md:min-h-[calc(100vh-4rem)] md:w-64 md:border-b-0 md:border-r dark:border-gray-800 dark:bg-gray-900">
      <nav className="flex gap-2 overflow-x-auto p-4 md:flex-col">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              [
                'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-linear-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
