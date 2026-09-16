import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useAuthStore } from "../../store/useAuthStore";
import ConfirmModal from "../common/ConfirmModal";
export default function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    }
    if (open) {
      document.addEventListener("mousedown", outside);
      document.addEventListener("keydown", escape);
    }
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  if (!user) return null;
  return (
    <div ref={ref} className="account-menu">
      <button
        className="account-trigger"
        aria-expanded={open}
        aria-controls="account-actions"
        onClick={() => setOpen(!open)}
      >
        <span className="avatar">
          {user.fullName
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </span>
        <span className="account-name">
          <strong>{user.fullName}</strong>
          <small>{user.role}</small>
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div id="account-actions" className="account-dropdown">
          <strong>{user.fullName}</strong>
          <p>{user.email}</p>
          <Link onClick={() => setOpen(false)} to={`/${user.role}/profile`}>
            Profile
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              setConfirmOpen(true);
            }}
          >
            Sign out
          </button>
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        title="Log out?"
        message="You'll need to sign in again to continue where you left off."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onConfirm={() => {
          setConfirmOpen(false);
          void logout().then(() => navigate(ROUTES.LOGIN, { replace: true }));
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
