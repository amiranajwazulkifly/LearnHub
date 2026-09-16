interface SeatsIndicatorProps {
  capacity: number;
  /** Currently enrolled. Undefined when the API didn't supply a count. */
  enrolled?: number;
  /** "full" shows the bar and remaining-seat line; "compact" is one line for tables. */
  variant?: "full" | "compact";
}

/**
 * Course capacity as used seats, e.g. "27 / 30 seats · 3 remaining", or
 * "30 / 30 · COURSE FULL". Shared so a seat count reads the same on the
 * catalog, the course page and the admin table.
 */
export default function SeatsIndicator({
  capacity,
  enrolled,
  variant = "full",
}: SeatsIndicatorProps) {
  // Without a count all that is known is the capacity; say only that rather
  // than implying the course is empty.
  if (enrolled === undefined) {
    return <span>{capacity} seats</span>;
  }

  const remaining = Math.max(capacity - enrolled, 0);
  const isFull = remaining === 0;
  const percent = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;

  if (variant === "compact") {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="font-mono text-sm">
          {enrolled} / {capacity}
        </span>

        {isFull && (
          <span className="rounded-full bg-red-100 px-1.5 font-mono text-[10px] font-semibold uppercase text-red-700 dark:bg-red-950/50 dark:text-red-400">
            Full
          </span>
        )}
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {enrolled} / {capacity} seats
        </span>

        {isFull ? (
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
            Course full
          </span>
        ) : (
          <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
            {remaining} seat{remaining === 1 ? "" : "s"} remaining
          </span>
        )}
      </div>

      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={enrolled}
        aria-label="Seats taken"
      >
        <div
          className={`h-full ${isFull ? "bg-red-500" : "bg-brand"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
