/**
 * Loading placeholders.
 *
 * These exist so a page never flashes blank or jumps when data lands: each
 * variant mirrors the rough shape and rhythm of the content it stands in
 * for. `aria-hidden` keeps them out of the accessibility tree — the status
 * is announced by the `role="status"` wrapper instead of by a screen reader
 * reading out a dozen empty boxes.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`rounded bg-gray-200 dark:bg-gray-800 ${className}`} aria-hidden="true" />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse">
      {children}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Page title + subtitle, for pages that render their own header. */
export function SkeletonHeader() {
  return (
    <div className="mb-6">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-7 w-56" />
    </div>
  );
}

/** A stack of card rows — lists of courses, assignments, announcements. */
export function SkeletonList({ rows = 4, height = "h-24" }: { rows?: number; height?: string }) {
  return (
    <Shell>
      <SkeletonHeader />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            className={`${height} w-full rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900`}
          />
        ))}
      </div>
    </Shell>
  );
}

/** A grid of cards — course catalogs and similar. */
export function SkeletonCards({ cards = 6 }: { cards?: number }) {
  return (
    <Shell>
      <SkeletonHeader />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-44 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
    </Shell>
  );
}

/** Header row plus body rows, for the admin tables. */
export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <Shell>
      <SkeletonHeader />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/** A row of stat tiles above a content block — the dashboards. */
export function SkeletonDashboard({ stats = 4 }: { stats?: number }) {
  return (
    <Shell>
      <SkeletonHeader />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: stats }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-24 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
        <Skeleton className="h-64 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
      </div>
    </Shell>
  );
}

/** A single form panel. */
export function SkeletonForm() {
  return (
    <Shell>
      <SkeletonHeader />
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-9 w-32" />
      </div>
    </Shell>
  );
}
