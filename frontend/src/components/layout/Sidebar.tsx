import type { ReactNode } from 'react';
import {
  NavLink,
} from 'react-router-dom';

interface SidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
  end?: boolean;
  /** Small count shown after the label, e.g. unread announcements. Hidden at 0. */
  badge?: number;
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
                'flex items-center gap-2.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-linear-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {item.icon}
                {item.label}

                {item.badge ? (
                  <span
                    className={`ml-auto rounded-full px-1.5 font-mono text-[10px] font-semibold leading-4 ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                    <span className="sr-only"> unread</span>
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
