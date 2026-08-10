// Dzul
interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
      </div>
      {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
    </div>
  );
}