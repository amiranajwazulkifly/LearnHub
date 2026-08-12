import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyCourses } from "../../services/enrollmentService";
import { getMyTimetable, type TimetableSession } from "../../services/timetableService";
import { getMyAssignments } from "../../services/assignmentService";
import { getPublishedAnnouncements } from "../../services/announcementService";
import type { Assignment } from "../../types/assignment";
import type { Announcement } from "../../types/announcement";

import { useAuthStore } from "../../store/useAuthStore";
import { ROUTES } from "../../constants/routes";
import StatCard from "../../components/dashboard/StatCard";
import {
  AlertIcon,
  AnnouncementsIcon,
  ClockIcon,
  MyCoursesIcon,
  PinIcon,
} from "../../components/common/NavIcons";
import {
  DAY_NAMES,
  formatMinutesUntil,
  formatTime,
  getNextSession,
  getTodayDayOfWeek,
} from "../../utils/timetable";

function getInitials(name: string) {
  const words = name.split(" ").filter((word) => word && !word.endsWith("."));
  return (
    words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function formatRelativeTime(dateString: string | null) {
  if (!dateString) return "";

  const diffMinutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Everyone",
  students: "Students",
  instructors: "Instructors",
};

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const [courseCount, setCourseCount] = useState(0);
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [coursesResponse, timetableResponse, assignmentsResponse, announcementsResponse] =
          await Promise.all([
            getMyCourses(),
            getMyTimetable(),
            getMyAssignments(),
            getPublishedAnnouncements(),
          ]);

        setCourseCount(coursesResponse.data.length);
        setSessions(timetableResponse.data);
        setAssignments(assignmentsResponse);
        setAnnouncements(announcementsResponse);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  const firstName = user?.fullName.split(" ")[0] ?? "there";
  const pendingTasks = assignments.filter((assignment) => !assignment.mySubmission);

  const todayDow = getTodayDayOfWeek();
  const now = new Date();
  const next = getNextSession(sessions, now);

  const subtitleParts: string[] = [];

  if (pendingTasks.length > 0) {
    subtitleParts.push(
      `You have ${pendingTasks.length} assignment${pendingTasks.length === 1 ? "" : "s"} pending.`,
    );
  } else {
    subtitleParts.push("You're all caught up on assignments.");
  }

  if (next) {
    if (next.daysUntil === 0) {
      const [hours, minutes] = next.session.start_time.split(":").map(Number);
      const minutesUntil = Math.max(hours * 60 + minutes - (now.getHours() * 60 + now.getMinutes()), 0);
      subtitleParts.push(`Your next lecture starts in ${formatMinutesUntil(minutesUntil)}.`);
    } else if (next.daysUntil === 1) {
      subtitleParts.push("Your next lecture is tomorrow.");
    } else {
      subtitleParts.push(`Your next lecture is on ${DAY_NAMES[next.session.day_of_week]}.`);
    }
  }

  let upcomingLabel = "Today";
  let upcomingSessions = sessions
    .filter((session) => session.day_of_week === todayDow)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  if (upcomingSessions.length === 0) {
    for (let offset = 1; offset < 7; offset++) {
      const dow = ((todayDow - 1 + offset) % 7) + 1;
      const dayMatches = sessions
        .filter((session) => session.day_of_week === dow)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      if (dayMatches.length > 0) {
        upcomingLabel = DAY_NAMES[dow];
        upcomingSessions = dayMatches;
        break;
      }
    }
  }

  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{subtitleParts.join(" ")}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Enrolled Courses"
          value={courseCount}
          icon={<MyCoursesIcon className="h-5 w-5" />}
          tone="brand"
          helperText="Active this semester"
        />

        <StatCard
          label="Timetable Sessions"
          value={sessions.length}
          icon={<ClockIcon className="h-5 w-5" />}
          tone="green"
          helperText="Weekly lectures"
        />

        <StatCard
          label="Pending Tasks"
          value={pendingTasks.length}
          icon={<AlertIcon className="h-5 w-5" />}
          tone="red"
          helperText="Not yet submitted"
        />

        <StatCard
          label="Announcements"
          value={announcements.length}
          icon={<AnnouncementsIcon className="h-5 w-5" />}
          tone="amber"
          helperText="Recently published"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Upcoming Classes
            </h2>

            <Link
              to={ROUTES.STUDENT.TIMETABLE}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View Timetable &rarr;
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                No upcoming classes. Enroll in a course to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.schedule_id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center rounded-lg bg-gray-50 px-3 py-1.5 text-center dark:bg-gray-800">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                        {upcomingLabel}
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-50">
                        <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                        {formatTime(session.start_time)}
                      </span>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-50">
                        {session.code}: {session.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <PinIcon className="h-3.5 w-3.5 shrink-0" />
                        {session.location || "TBA"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-600 to-brand-400 text-xs font-bold text-white">
                        {getInitials(session.instructor_name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {session.instructor_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Lecturer</p>
                      </div>
                    </div>

                    <Link
                      to={`${ROUTES.STUDENT.COURSES}/${session.course_id}`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
              Recent Announcements
            </h2>

            <Link
              to={ROUTES.STUDENT.ANNOUNCEMENTS}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              All Alerts
            </Link>
          </div>

          {recentAnnouncements.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">No announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {AUDIENCE_LABEL[announcement.audience] ?? announcement.audience}
                    </span>

                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(announcement.publishedAt)}
                    </span>
                  </div>

                  <h3 className="mt-2 font-semibold text-gray-900 dark:text-gray-50">
                    {announcement.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
