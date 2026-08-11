// frontend/src/components/reports/ChartCard.tsx
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

// Generic wrapper so every report chart gets the same heading + card
// styling without repeating markup on every ReportsPage chart.
export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {children}
    </div>
  );
}
