import { useEffect, useState } from "react";

import { getMyStats } from "../../services/instructorPortalService";
import type { InstructorStats } from "../../types/instructorPortal";
import StatCard from "../../components/dashboard/StatCard";

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyStats()
      .then(setStats)
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>;
  }

  if (error || !stats) {
    return <p className="text-red-600 dark:text-red-400">{error || "Failed to load dashboard"}</p>;
  }

  return (
    <div>
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
        instructor / dashboard
      </p>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-50">Instructor Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="My Courses" value={stats.courseCount} />
        <StatCard label="Total Students" value={stats.studentCount} />
      </div>
    </div>
  );
}
