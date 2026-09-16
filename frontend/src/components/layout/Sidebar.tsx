import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
interface SidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
  end?: boolean;
  badge?: number;
}
export default function Sidebar({ items }: { items: readonly SidebarItem[] }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const sidebar = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [openedAt, setOpenedAt] = useState(location.pathname);
  const visible = open && openedAt === location.pathname;
  useEffect(() => {
    if (!visible) return;
    const links = sidebar.current?.querySelectorAll<HTMLAnchorElement>("a");
    links?.[0]?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab" && links?.length) {
        const first = links[0];
        const last = links[links.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === toggle.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          toggle.current?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === toggle.current
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible]);
  const ordered = [
    ...items.filter((i) => i.label !== "Profile"),
    ...items.filter((i) => i.label === "Profile"),
  ];
  return (
    <>
      <button
        ref={toggle}
        className="mobile-nav-toggle"
        aria-label={visible ? "Close navigation" : "Open navigation"}
        aria-expanded={visible}
        aria-controls="portal-navigation"
        onClick={() => {
          setOpenedAt(location.pathname);
          setOpen(!visible);
        }}
      >
        {visible ? <X size={20} /> : <Menu size={20} />}
      </button>
      {visible && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside ref={sidebar} className={`sidebar ${visible ? "is-open" : ""}`}>
        <nav id="portal-navigation" aria-label="Portal navigation">
          {ordered.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""} ${item.label === "Profile" ? "nav-account" : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
              {!!item.badge && (
                <span className="nav-badge">
                  {item.badge > 99 ? "99+" : item.badge}
                  <span className="sr-only"> unread</span>
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="accent-rule" />
          <p>
            A brighter
            <br />
            tomorrow
            <br />
            together.
          </p>
          <small>
            LEARNHUB
            <br />
            TEACH · LEARN · GROW
          </small>
        </div>
      </aside>
    </>
  );
}
