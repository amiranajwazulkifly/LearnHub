import { useEffect, useState } from "react";

import {
  getMyTimetable,
  type TimetableSession,
} from "../../services/timetableService";

import PageHeader from "../../components/layout/PageHeader";
import { PinIcon, ProfileIcon } from "../../components/common/NavIcons";
import {
  DAY_NAMES,
  DAY_ORDER,
  formatTime,
  getCourseColor,
  getTodayDayOfWeek,
} from "../../utils/timetable";

export default function TimetablePage() {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        setError("");

        const response = await getMyTimetable();

        setSessions(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load timetable");
      } finally {
        setLoading(false);
      }
    }

    void loadTimetable();
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading timetable...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  const todayDow = getTodayDayOfWeek();

  const uniqueCourses = [
    ...new Map(sessions.map((session) => [session.course_id, session])).values(),
  ];

  return (
    <div>
      <PageHeader
        eyebrow="student / timetable"
        title="My Timetable"
        description="Your weekly recurring class schedule, at a glance."
      />

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            No timetable sessions found. Enroll in a course to see your schedule here.
          </p>
        </div>
      ) : (
        <>
          {uniqueCourses.length > 1 && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
              {uniqueCourses.map((course) => (
                <span
                  key={course.course_id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium ${getCourseColor(course.course_id).chip}`}
                >
                  {course.code}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {DAY_ORDER.map((dow) => {
              const daySessions = sessions
                .filter((session) => session.day_of_week === dow)
                .sort((a, b) => a.start_time.localeCompare(b.start_time));

              const isToday = dow === todayDow;

              return (
                <div key={dow} className="min-w-0">
                  <div
                    className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${
                      isToday
                        ? "bg-linear-to-r from-brand-600 to-brand-500 text-white"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <span className="text-sm font-semibold">{DAY_NAMES[dow]}</span>
                    {isToday && (
                      <span className="font-mono text-[10px] uppercase tracking-wide text-white/90">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {daySessions.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400 dark:border-gray-800 dark:text-gray-600">
                        No classes
                      </div>
                    ) : (
                      daySessions.map((session) => {
                        const color = getCourseColor(session.course_id);

                        return (
                          <div
                            key={session.schedule_id}
                            className={`rounded-lg border-l-4 bg-white p-3 shadow-sm dark:bg-gray-900 ${color.border}`}
                          >
                            <p className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                              {formatTime(session.start_time)} - {formatTime(session.end_time)}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
                              {session.code}
                            </p>

                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {session.title}
                            </p>

                            <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                              <p className="flex items-center gap-1.5">
                                <ProfileIcon className="h-3.5 w-3.5 shrink-0" />
                                {session.instructor_name}
                              </p>

                              <p className="flex items-center gap-1.5">
                                <PinIcon className="h-3.5 w-3.5 shrink-0" />
                                {session.location || "TBA"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
