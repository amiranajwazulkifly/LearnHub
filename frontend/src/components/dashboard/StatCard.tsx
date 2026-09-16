export type StatCardTone = "brand" | "green" | "red" | "amber";
interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: StatCardTone;
  helperText?: string;
}
export default function StatCard({ label, value, helperText }: StatCardProps) {
  return (
    <div className="metric">
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      {helperText && <p>{helperText}</p>}
    </div>
  );
}
