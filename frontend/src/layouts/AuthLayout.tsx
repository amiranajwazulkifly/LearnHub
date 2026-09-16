import { Link, Outlet } from "react-router-dom";
import Logo from "../components/common/Logo";
import ThemeToggle from "../components/common/ThemeToggle";
export default function AuthLayout() {
  return (
    <main className="auth-page">
      <header>
        <Link to="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <div className="auth-layout">
        <section className="auth-editorial">
          <p className="eyebrow">ONE WORKSPACE. EVERY NEXT STEP.</p>
          <h1>
            Learning
            <br />
            built for <span>what’s next.</span>
          </h1>
          <p>
            Courses, assignments and academic life.
            <br />
            Connected in one place.
          </p>
          <div className="academic-art" aria-hidden="true">
            <span>
              LEARN
              <br />
              MANAGE
              <br />
              GROW
            </span>
          </div>
        </section>
        <section className="auth-form">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
