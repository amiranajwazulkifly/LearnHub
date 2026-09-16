import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyCourses } from "../../services/enrollmentService";
import {
  getMyTimetable,
  type TimetableSession,
} from "../../services/timetableService";
import { getMyAssignments } from "../../services/assignmentService";
import { getPublishedAnnouncements } from "../../services/announcementService";
import type { Assignment } from "../../types/assignment";
import type { Announcement } from "../../types/announcement";

import { useAuthStore } from "../../store/useAuthStore";
import { ROUTES } from "../../constants/routes";
import StatCard from "../../components/dashboard/StatCard";
import { SkeletonDashboard } from "../../components/common/Skeleton";
import {
  AlertIcon,
  AnnouncementsIcon,
  ClockIcon,
  MyCoursesIcon,
} from "../../components/common/NavIcons";
import {
  DAY_NAMES,
  formatMinutesUntil,
  formatTime,
  getNextSession,
} from "../../utils/timetable";

function formatRelativeTime(dateString: string | null) {
  if (!dateString) return "";

  const diffMinutes = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 60000,
  );

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
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

        const [
          coursesResponse,
          timetableResponse,
          assignmentsResponse,
          announcementsResponse,
        ] = await Promise.all([
          getMyCourses(),
          getMyTimetable(),
          getMyAssignments(),
          getPublishedAnnouncements(),
        ]);

        setCourseCount(
          coursesResponse.data.filter(
            (course) => course.enrollment_status === "enrolled",
          ).length,
        );
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
    return <SkeletonDashboard />;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }

  const firstName = user?.fullName.split(" ")[0] ?? "there";
  const pendingTasks = assignments.filter(
    (assignment) => !assignment.mySubmission,
  );

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
      const minutesUntil = Math.max(
        hours * 60 + minutes - (now.getHours() * 60 + now.getMinutes()),
        0,
      );
      subtitleParts.push(
        `Your next lecture starts in ${formatMinutesUntil(minutesUntil)}.`,
      );
    } else if (next.daysUntil === 1) {
      subtitleParts.push("Your next lecture is tomorrow.");
    } else {
      subtitleParts.push(
        `Your next lecture is on ${DAY_NAMES[next.session.day_of_week]}.`,
      );
    }
  }

  const nextDate = new Date(now);
  if (next) nextDate.setDate(now.getDate() + next.daysUntil);
  const submittedCount = assignments.filter((a) => a.mySubmission).length;
  const progress = assignments.length
    ? Math.round((submittedCount / assignments.length) * 100)
    : 0;
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div>
      <div className="dashboard-heading">
        <p className="eyebrow">Dashboard</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {subtitleParts.join(" ")}
        </p>
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

      <div className="student-dashboard-grid">
        <section className="panel next-class-panel">
          <div className="panel-heading">
            <h2>Next class</h2>
            <Link to={ROUTES.STUDENT.TIMETABLE}>View timetable →</Link>
          </div>
          {next ? (
            <div className="next-class-content">
              <div className="next-date">
                <span>{DAY_NAMES[next.session.day_of_week].slice(0, 3)}</span>
                <strong>{nextDate.getDate()}</strong>
                <small>
                  {nextDate.toLocaleDateString("en-GB", { month: "short" })}
                </small>
              </div>
              <div className="next-class-info">
                <h3>
                  {next.session.code}: {next.session.title}
                </h3>
                <p>
                  {formatTime(next.session.start_time)} –{" "}
                  {formatTime(next.session.end_time)}
                </p>
                <p>{next.session.instructor_name}</p>
                <p>{next.session.location || "Location to be announced"}</p>
                <Link
                  className="primary-button"
                  to={`${ROUTES.STUDENT.COURSES}/${next.session.course_id}`}
                >
                  View Course →
                </Link>
              </div>
              <div className="academic-art next-art">
                <span>{next.session.code}</span>
                <p>
                  BUILD
                  <br />
                  SKILLS
                  <br />
                  THAT
                  <br />
                  MATTER.
                </p>
              </div>
            </div>
          ) : (
            <p className="empty-copy">
              No upcoming classes. Enroll in a course to see it here.
            </p>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Assignment progress</h2>
            <Link to={ROUTES.STUDENT.TASKS}>View tasks →</Link>
          </div>
          {assignments.length ? (
            <div className="progress-content">
              <div
                className="progress-ring"
                style={{
                  background: `conic-gradient(var(--accent) ${progress}%, var(--line) 0)`,
                }}
              >
                <div>
                  <strong>{progress}%</strong>
                  <span>Submitted</span>
                </div>
              </div>
              <div>
                <h3>
                  {submittedCount} of {assignments.length} assignments
                </h3>
                <p>{pendingTasks.length} still to submit</p>
              </div>
            </div>
          ) : (
            <p className="empty-copy">
              No assignments yet. Your progress will appear here when work is
              assigned.
            </p>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Recent Announcements</h2>
            <Link to={ROUTES.STUDENT.ANNOUNCEMENTS}>View all →</Link>
          </div>
          {recentAnnouncements.length ? (
            recentAnnouncements.map((announcement) => (
              <article key={announcement.id} className="announcement-row">
                <div>
                  <span className="eyebrow">
                    {AUDIENCE_LABEL[announcement.audience] ??
                      announcement.audience}
                  </span>
                  <h3>{announcement.title}</h3>
                  <p>{announcement.content}</p>
                </div>
                <time>{formatRelativeTime(announcement.publishedAt)}</time>
              </article>
            ))
          ) : (
            <p className="empty-copy">No announcements yet.</p>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Upcoming tasks</h2>
            <Link to={ROUTES.STUDENT.TASKS}>View all →</Link>
          </div>
          {pendingTasks.length ? (
            [...pendingTasks]
              .sort((a, b) =>
                (a.dueAt || "9999").localeCompare(b.dueAt || "9999"),
              )
              .slice(0, 4)
              .map((task) => (
                <Link
                  className="task-row"
                  key={task.id}
                  to={`${ROUTES.STUDENT.TASKS}/${task.id}`}
                >
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      {task.courseCode} · {task.courseTitle}
                    </p>
                  </div>
                  <span>
                    {task.dueAt
                      ? new Date(task.dueAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })
                      : "No due date"}{" "}
                    →
                  </span>
                </Link>
              ))
          ) : (
            <div className="empty-copy">
              <strong>No pending tasks</strong>
              <p>You’re currently up to date.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
