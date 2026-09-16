interface LoadingSpinnerProps {
  /** Tailwind size classes, e.g. "h-5 w-5". */
  className?: string;
  label?: string;
}

/**
 * Small inline busy indicator, for places where a skeleton would be overkill
 * — inside a button, or beside a control that is refetching. Whole-page loads
 * use the skeletons in Skeleton.tsx instead, which avoid layout shift.
 */
export default function LoadingSpinner({
  className = "h-4 w-4",
  label = "Loading",
}: LoadingSpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center">
      <svg
        className={`animate-spin text-current ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
