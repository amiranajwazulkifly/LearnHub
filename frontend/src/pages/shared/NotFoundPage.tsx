import { Link, useLocation } from "react-router-dom";

import Logo from "../../components/common/Logo";
import { ROUTES } from "../../constants/routes";

/**
 * Shown for any URL that matches no route.
 *
 * Previously an unknown path silently redirected to the dashboard, which made
 * a mistyped or outdated link look like it had worked. Saying so is clearer.
 * The home route already sends a signed-in user to their own dashboard and
 * everyone else to login, so one link covers both.
 */
export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="bg-line-grid flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <Logo className="mx-auto h-7 w-auto" />

        <p className="mt-6 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
          404
        </p>

        <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-50">Page not found</h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          There is no page at{" "}
          <code className="break-all rounded bg-gray-100 px-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {location.pathname}
          </code>
          . The link may be mistyped or out of date.
        </p>

        <Link
          to={ROUTES.HOME}
          className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Go to LearnHub
        </Link>
      </div>
    </div>
  );
}
