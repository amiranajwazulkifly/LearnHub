// Dzul
import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getEnrollmentTrend, getCoursePopularity, getCompletionRates } from '../../services/reportService';
import type { EnrollmentTrendPoint, CoursePopularityItem, CompletionRateItem } from '../../types/report';
import ChartCard from '../../components/reports/ChartCard';

export default function ReportsPage() {
  const [trend, setTrend] = useState<EnrollmentTrendPoint[]>([]);
  const [popularity, setPopularity] = useState<CoursePopularityItem[]>([]);
  const [completion, setCompletion] = useState<CompletionRateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEnrollmentTrend(30), getCoursePopularity(10), getCompletionRates()])
      .then(([t, p, c]) => {
        setTrend(t);
        setPopularity(p);
        setCompletion(c);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading reports…</p>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Reports</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Enrollments — Last 30 Days">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Popular Courses">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={popularity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="totalEnrollments" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-gray-800">Completion Rates by Course</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Course</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Enrolled</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Completed</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {completion.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 text-sm text-gray-800">{c.title}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{c.total}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{c.completed}</td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full bg-blue-600" style={{ width: `${c.completionRate}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{c.completionRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}