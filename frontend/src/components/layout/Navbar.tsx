import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
export default function Navbar({ portalName }: { portalName: string }) {
  return (
    <header className="topbar">
      <Link to="/" className="shell-brand">
        <Logo className="h-8 w-auto" />
        <span>{portalName}</span>
      </Link>
      <div className="topbar-workspace">
        <span className="eyebrow">Your academic workspace</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
