export type StatusTone = "green" | "amber" | "red" | "gray" | "brand";

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
}

// Each tone is a soft tint with a darker ink from the same hue. The tokens
// switch between light and dark values on their own, so no dark: variants
// are needed. Lime ("brand") is reserved for brand states such as upcoming
// work, and never stands in for success.
const TONE_STYLES: Record<StatusTone, string> = {
  green: "bg-success-soft text-success-ink [&>span]:bg-success",
  amber: "bg-warning-soft text-warning-ink [&>span]:bg-warning",
  red: "bg-danger-soft text-danger-ink [&>span]:bg-danger",
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 [&>span]:bg-gray-400",
  brand: "bg-brand-soft text-brand-ink [&>span]:bg-brand-ink",
};

function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize whitespace-nowrap ${TONE_STYLES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" />
      {label}
    </span>
  );
}

export default StatusBadge;
