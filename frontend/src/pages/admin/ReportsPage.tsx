// Dzul
import { useCallback, useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

import {
  getEnrollmentTrend,
  getCoursePopularity,
  getCompletionRates,
  downloadReport,
} from "../../services/reportService";
import type {
  EnrollmentTrend,
  CoursePopularityItem,
  CompletionRateItem,
  ExportType,
} from "../../types/report";

import ChartCard from "../../components/reports/ChartCard";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { SkeletonDashboard } from "../../components/common/Skeleton";
import { describeLoadError, type LoadErrorCopy } from "../../utils/errorHandler";
import { formatDate } from "../../utils/formatters";
import { toast } from "../../store/useToastStore";

const RANGES = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
];

const EXPORTS: { type: ExportType; label: string }[] = [
  { type: "students", label: "Students" },
  { type: "courses", label: "Courses" },
  { type: "enrollments", label: "Enrollments" },
  { type: "completion-rates", label: "Completion rates" },
  { type: "instructor-allocation", label: "Instructor allocation" },
  { type: "enrollment-trend", label: "Enrollment trend" },
];

// Chart colours are CSS variables (see --chart-* in index.css), so they
// switch with the theme. The first series is a deeper lime in light mode, so a
// 2px line stays visible on white.
const BRAND = "var(--chart-1)";
// Bars are large areas, visible at full brand lime in both themes.
const BRAND_FILL = "var(--brand)";
const AXIS = "var(--chart-axis)";
const GRID = "var(--chart-grid)";

/** Dates on the axis are short ("5 Sep"); the tooltip shows the full date. */
function shortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function ReportsPage() {
  const [trend, setTrend] = useState<EnrollmentTrend | null>(null);
  const [popularity, setPopularity] = useState<CoursePopularityItem[]>([]);
  const [completion, setCompletion] = useState<CompletionRateItem[]>([]);

  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadErrorCopy | null>(null);
  const [exporting, setExporting] = useState<ExportType | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);

    Promise.all([getEnrollmentTrend(days), getCoursePopularity(10), getCompletionRates()])
      .then(([t, p, c]) => {
        setTrend(t);
        setPopularity(p);
        setCompletion(c);
      })
      .catch((err) => setLoadError(describeLoadError(err, "reports")))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(load, [load]);

  async function handleExport(type: ExportType) {
    setExporting(type);

    try {
      // The trend export honours the range currently on screen; the others
      // are full datasets and ignore it.
      await downloadReport(type, type === "enrollment-trend" ? days : undefined);
      toast.success("Export downloaded.");
    } catch {
      toast.error("Unable to generate that export. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  if (loading) return <SkeletonDashboard stats={0} />;

  if (loadError) {
    return (
      <div className="p-6">
        <ErrorState
          title={loadError.title}
          description={loadError.description}
          onRetry={loadError.canRetry ? load : undefined}
          backTo="/admin"
          backLabel="Back to Dashboard"
        />
      </div>
    );
  }

  const trendPoints = trend?.trend ?? [];
  const trendTotal = trendPoints.reduce((sum, point) => sum + point.count, 0);

  const rangeLabel =
    trend?.range.from && trend.range.to
      ? `${formatDate(trend.range.from)} — ${formatDate(trend.range.to)}`
      : undefined;

  const rangePicker = (
    <div className="flex gap-1" role="group" aria-label="Date range">
      {RANGES.map((range) => (
        <button
          key={range.days}
          type="button"
          onClick={() => setDays(range.days)}
          aria-pressed={days === range.days}
          className={`rounded-md px-2 py-1 font-mono text-xs transition ${
            days === range.days
              ? "bg-brand text-brand-fg"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-ink">
        admin / reports
      </p>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Reports</h1>

      {/* Exports */}
      <div className="mb-6 mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Export as CSV
        </h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Downloads the full dataset. The enrollment trend uses the range selected below.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXPORTS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => void handleExport(item.type)}
              disabled={exporting !== null}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {exporting === item.type ? "Preparing…" : item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Enrollments"
          subtitle={rangeLabel}
          action={rangePicker}
          isEmpty={trendTotal === 0}
          emptyMessage="No enrollment activity for this period."
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendPoints} margin={{ top: 5, right: 8, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                tick={{ fontSize: 11, fill: AXIS }}
                stroke={AXIS}
                minTickGap={24}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: AXIS }} stroke={AXIS} />
              <Tooltip
                labelFormatter={(value) => formatDate(String(value))}
                formatter={(value) => [Number(value ?? 0), "Enrollments"]}
              />
              <Line type="monotone" dataKey="count" stroke={BRAND} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Most Popular Courses"
          subtitle="By total enrollments, all time"
          isEmpty={popularity.length === 0}
          emptyMessage="No courses with enrollments yet."
        >
          <ResponsiveContainer width="100%" height={240}>
            {/* Course codes on the axis, not titles: a code is short enough to
                sit horizontally and stay readable, where a rotated full title
                is neither. The tooltip carries the full name. */}
            <BarChart data={popularity} margin={{ top: 5, right: 8, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis
                dataKey="code"
                tick={{ fontSize: 11, fill: AXIS }}
                stroke={AXIS}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: AXIS }} stroke={AXIS} />
              <Tooltip
                labelFormatter={(code) =>
                  popularity.find((item) => item.code === code)?.title ?? String(code)
                }
                formatter={(value) => [Number(value ?? 0), "Enrollments"]}
              />
              <Bar dataKey="totalEnrollments" fill={BRAND_FILL} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Completion Rates by Course
      </h2>

      {completion.length === 0 ? (
        <EmptyState
          title="No courses to report on"
          description="Completion rates appear once courses have enrollment records."
        />
      ) : (
        <div className="table-scroll overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead>
              <tr>
                {["Course", "Total", "Enrolled", "Completed", "Rate"].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {completion.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-mono text-xs font-semibold text-brand-ink">
                      {c.code}
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">{c.title}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{c.total}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{c.active}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{c.completed}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div className="h-full bg-brand" style={{ width: `${c.completionRate}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {c.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
