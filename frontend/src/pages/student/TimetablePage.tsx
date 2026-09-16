import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getMyTimetable,
  type TimetableSession,
} from "../../services/timetableService";
import PageHeader from "../../components/layout/PageHeader";
import { SkeletonList } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import {
  DAY_ORDER,
  DAY_SHORT_NAMES,
  DAY_NAMES,
  formatTime,
  dateForDayThisWeek,
  sessionsOnDate,
  getNextSession,
  getCourseColor,
  layoutDaySessions,
} from "../../utils/timetable";
const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
export default function TimetablePage() {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [week, setWeek] = useState(0);
  useEffect(() => {
    getMyTimetable()
      .then((r) => setSessions(r.data))
      .catch(() => setError("Failed to load timetable"))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <SkeletonList rows={3} height="h-40" />;
  if (error)
    return (
      <p role="alert" className="text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  const anchor = new Date();
  anchor.setDate(anchor.getDate() + week * 7);
  const dates = DAY_ORDER.map((d) => dateForDayThisWeek(d, anchor));
  const days = dates.map((date) => sessionsOnDate(sessions, date));
  const weekSessions = days.flat();
  const firstHour = Math.min(
    8,
    ...weekSessions.map((s) => Math.floor(minutes(s.start_time) / 60)),
  );
  const lastHour = Math.max(
    18,
    ...weekSessions.map((s) => Math.ceil(minutes(s.end_time) / 60)),
  );
  const hours = Array.from(
    { length: lastHour - firstHour },
    (_, i) => firstHour + i,
  );
  const courses = [
    ...new Map(weekSessions.map((s) => [s.course_id, s])).values(),
  ];
  const next = getNextSession(sessions);
  const shortDate = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  function sessionContent(session: TimetableSession) {
    return (
      <>
        <strong>{session.code}</strong>
        <span>
          {formatTime(session.start_time)} – {formatTime(session.end_time)}
        </span>
        <span>{session.instructor_name}</span>
        <span>{session.location || "TBA"}</span>
      </>
    );
  }
  return (
    <div>
      <PageHeader
        eyebrow="Student"
        title="My Timetable"
        description="Your weekly class schedule, at a glance."
        actions={
          <div className="week-controls">
            <button
              aria-label="Previous week"
              onClick={() => setWeek((w) => w - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {shortDate(dates[0])} – {shortDate(dates[6])}{" "}
              {dates[6].getFullYear()}
            </span>
            <button
              aria-label="Next week"
              onClick={() => setWeek((w) => w + 1)}
            >
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setWeek(0)}>Today</button>
          </div>
        }
      />
      {sessions.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          description="Once you enroll in a course with weekly sessions, they will appear here."
        />
      ) : (
        <div className="timetable-layout">
          <div>
            <div
              className="week-grid"
              style={{ gridTemplateRows: `64px ${hours.length * 72}px` }}
            >
              <div className="calendar-corner">TIME</div>
              {dates.map((date, i) => (
                <div
                  key={i}
                  className={`calendar-day ${date.toDateString() === new Date().toDateString() ? "today" : ""}`}
                >
                  <strong>{DAY_SHORT_NAMES[DAY_ORDER[i]]}</strong>
                  <span>{shortDate(date)}</span>
                </div>
              ))}
              <div className="calendar-times">
                {hours.map((h) => (
                  <span key={h}>{String(h).padStart(2, "0")}:00</span>
                ))}
              </div>
              {days.map((daySessions, i) => (
                <div
                  key={i}
                  className={`calendar-column ${dates[i].toDateString() === new Date().toDateString() ? "today" : ""}`}
                >
                  {layoutDaySessions(daySessions).map(
                    ({ session, lane, lanes }) => {
                      return (
                        <Link
                          key={session.schedule_id}
                          to={`/student/courses/${session.course_id}`}
                          className={`calendar-event ${getCourseColor(session.course_id).border}`}
                          style={{
                            top:
                              (minutes(session.start_time) - firstHour * 60) *
                              1.2,
                            height: Math.max(
                              (minutes(session.end_time) -
                                minutes(session.start_time)) *
                                1.2 -
                                4,
                              28,
                            ),
                            left: `calc(${(lane / lanes) * 100}% + 3px)`,
                            width: `calc(${100 / lanes}% - 6px)`,
                          }}
                          title={`${session.title} · ${session.instructor_name} · ${session.location || "TBA"}`}
                        >
                          {sessionContent(session)}
                        </Link>
                      );
                    },
                  )}
                </div>
              ))}
            </div>
            <div className="daily-schedule">
              {days.map((daySessions, i) => (
                <section className="panel" key={i}>
                  <h2>
                    {DAY_NAMES[DAY_ORDER[i]]} <span>{shortDate(dates[i])}</span>
                  </h2>
                  {daySessions.length ? (
                    daySessions.map((s) => (
                      <Link
                        className={`daily-event ${getCourseColor(s.course_id).border}`}
                        key={s.schedule_id}
                        to={`/student/courses/${s.course_id}`}
                      >
                        {sessionContent(s)}
                        <span>{s.title}</span>
                      </Link>
                    ))
                  ) : (
                    <p>No classes</p>
                  )}
                </section>
              ))}
            </div>
          </div>
          <aside className="timetable-summary">
            <section className="panel">
              <div className="panel-heading">
                <h2>Next class</h2>
              </div>
              {next ? (
                <>
                  <div className="next-session">
                    {sessionContent(next.session)}
                  </div>
                  <Link
                    className="primary-button"
                    to={`/student/courses/${next.session.course_id}`}
                  >
                    View course →
                  </Link>
                </>
              ) : (
                <p className="empty-copy">No upcoming classes this week.</p>
              )}
            </section>
            <section className="panel">
              <h2>This week’s summary</h2>
              <div className="week-stats">
                <div>
                  <strong>{weekSessions.length}</strong>
                  <span>Classes</span>
                </div>
                <div>
                  <strong>{courses.length}</strong>
                  <span>Courses</span>
                </div>
                <div>
                  <strong>
                    {Number(
                      (
                        weekSessions.reduce(
                          (sum, s) =>
                            sum + minutes(s.end_time) - minutes(s.start_time),
                          0,
                        ) / 60
                      ).toFixed(1),
                    )}
                    h
                  </strong>
                  <span>Total time</span>
                </div>
              </div>
              {courses.map((c) => (
                <div className="week-course" key={c.course_id}>
                  <span>{c.code}</span>
                  <small>
                    {
                      weekSessions.filter((s) => s.course_id === c.course_id)
                        .length
                    }{" "}
                    session(s)
                  </small>
                </div>
              ))}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
