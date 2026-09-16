import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional call to action, e.g. a Link styled as a button. */
  action?: ReactNode;
  /**
   * "card" (default) draws the bordered panel used for a whole empty page.
   * "plain" drops the border and background, for use inside a container that
   * already has one — most often a table cell spanning the full row.
   */
  variant?: "card" | "plain";
}

/**
 * Shared "there is nothing here yet" panel, so empty lists read as a
 * deliberate state rather than a blank page. Intentionally lightweight —
 * one line of emphasis, one line of explanation, at most one action.
 */
export default function EmptyState({
  title,
  description,
  action,
  variant = "card",
}: EmptyStateProps) {
  const shell =
    variant === "card"
      ? "rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900"
      : "px-4 py-10 text-center";

  return (
    <div className={shell}>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h2>

      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
