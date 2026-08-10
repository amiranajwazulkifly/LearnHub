export type StatusTone = 'green' | 'amber' | 'red' | 'gray' | 'brand';

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
}

const TONE_STYLES: Record<StatusTone, string> = {
  green: 'border-green-200 text-green-700 dark:border-green-900 dark:text-green-400 [&>span]:bg-green-500',
  amber: 'border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-400 [&>span]:bg-amber-500',
  red: 'border-red-200 text-red-700 dark:border-red-900 dark:text-red-400 [&>span]:bg-red-500',
  gray: 'border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400 [&>span]:bg-gray-400',
  brand: 'border-brand-200 text-brand-700 dark:border-brand-900 dark:text-brand-400 [&>span]:bg-brand-500',
};

function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${TONE_STYLES[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" />
      {label}
    </span>
  );
}

export default StatusBadge;
