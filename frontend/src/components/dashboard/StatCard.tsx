// Dzul
export type StatCardTone = 'brand' | 'green' | 'red' | 'amber';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: StatCardTone;
  helperText?: string;
}

const TONE_STYLES: Record<StatCardTone, string> = {
  brand: 'bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
};

export default function StatCard({ label, value, icon, tone = 'brand', helperText }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      {icon && (
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${TONE_STYLES[tone]}`}>
          {icon}
        </div>
      )}

      <div className="min-w-0">
        <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
        {helperText && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{helperText}</p>
        )}
      </div>
    </div>
  );
}