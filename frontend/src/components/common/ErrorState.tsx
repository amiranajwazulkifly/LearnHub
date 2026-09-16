import { Link } from "react-router-dom";

export interface ErrorStateProps {
  /** Short headline, e.g. "Assignment unavailable". */
  title: string;
  /** Plain-language explanation. Never a raw API or Postgres message. */
  description: string;
  onRetry?: () => void;
  backTo?: string;
  backLabel?: string;
}

/**
 * The single full-page error presentation for failed data loads.
 *
 * Deliberately shows only human-readable copy — raw Axios/Postgres strings
 * and stack traces are never surfaced to a user. Callers translate a status
 * code into a title/description via `describeLoadError`.
 */
export default function ErrorState({
  title,
  description,
  onRetry,
  backTo,
  backLabel = "Go back",
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
        <svg
          className="h-5 w-5 text-red-600 dark:text-red-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h2>

      <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {backTo && (
          <Link
            to={backTo}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {backLabel}
          </Link>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg transition hover:bg-brand-hover active:bg-brand-active"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
