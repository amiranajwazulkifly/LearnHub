import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  /** Optional sub-label, e.g. the date range the figures cover. */
  subtitle?: string;
  /** Right-aligned slot in the header, e.g. a range selector. */
  action?: ReactNode;
  /**
   * When true the chart is replaced by `emptyMessage`. An empty chart frame
   * with labelled axes and no marks reads as "broken" rather than "no data",
   * so a report with nothing to show says so in words instead.
   */
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

// Generic wrapper so every report chart gets the same heading + card
// styling without repeating markup on every ReportsPage chart.
export default function ChartCard({
  title,
  subtitle,
  action,
  isEmpty = false,
  emptyMessage = "No data for this period.",
  children,
}: ChartCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
        </div>

        {action}
      </div>

      {isEmpty ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 text-center dark:border-gray-800">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{emptyMessage}</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Try changing the date range.
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
