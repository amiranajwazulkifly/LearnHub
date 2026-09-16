import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";
import ThemeToggle from "../components/common/ThemeToggle";
const roles = [
  {
    id: "students",
    eyebrow: "For students",
    title: "Learn with clarity.",
    description:
      "Stay organized, meet deadlines and make progress toward your goals.",
    features: [
      "Browse and enroll in courses",
      "Track assignments and feedback",
      "Follow your weekly timetable",
    ],
    link: "Explore as a student",
  },
  {
    id: "instructors",
    eyebrow: "For instructors",
    title: "Teach with less friction.",
    description: "Create engaging learning experiences without the busywork.",
    features: [
      "Manage assigned courses",
      "Collect and grade assignments",
      "Keep track of your students",
    ],
    link: "Explore as an instructor",
  },
  {
    id: "institutions",
    eyebrow: "For institutions",
    title: "Scale what works.",
    description: "A focused workspace for everyday academic operations.",
    features: [
      "Manage people, courses and schedules",
      "Track enrollments and capacity",
      "Access academic reports",
    ],
    link: "Explore administration",
  },
];
export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" aria-label="LearnHub home">
          <Logo />
        </Link>
        <nav aria-label="LearnHub">
          <a href="#students">For Students</a>
          <a href="#instructors">For Instructors</a>
          <a href="#institutions">For Institutions</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link className="secondary-button" to="/login">
            Sign in
          </Link>
          <Link className="primary-button landing-start" to="/register">
            Get started <span>→</span>
          </Link>
        </div>
      </header>
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow">Course management system</p>
            <h1>
              Learning
              <br />
              built for <span>what’s next.</span>
            </h1>
            <p className="hero-description">
              LearnHub brings students, instructors and institutions together in
              one place. Manage courses, track progress and focus on what
              matters — education.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" to="/register">
                Get started for free <span>→</span>
              </Link>
              <a href="#workflow">
                View platform <span>↗</span>
              </a>
            </div>
            <div className="capability-strip">
              <div>
                <strong>03 Roles</strong>
                <span>Student · Instructor · Admin</span>
              </div>
              <div>
                <strong>One workspace</strong>
                <span>Teaching and learning, connected</span>
              </div>
            </div>
          </div>
          <div
            className="hero-composition"
            aria-label="LearnHub connects learning, course management, and progress"
          >
            <div className="composition-grid" />
            <p className="composition-label eyebrow">
              Education
              <br />
              connects
              <br />
              people
            </p>
            <div className="learn-block">
              Learn
              <br />
              Manage
              <br />
              Grow
              <span className="accent-rule" />
            </div>
            <div className="workspace-preview">
              <div>
                <strong>Your academic workspace</strong>
                <span>LEARNHUB</span>
              </div>
              {[
                ["01", "Discover courses", "Explore"],
                ["02", "Organize assignments", "Learn"],
                ["03", "Follow your timetable", "Plan"],
                ["04", "Review your feedback", "Grow"],
              ].map(([n, t, s]) => (
                <div key={n}>
                  <b>{n}</b>
                  <p>{t}</p>
                  <span className="preview-state">{s}</span>
                </div>
              ))}
            </div>
            <div className="poster">
              Skills
              <br />
              today.
              <br />
              Opportunities
              <br />
              tomorrow.
              <span className="accent-rule" />
              <small>
                BETTER LEARNING
                <br />
                TOGETHER
              </small>
            </div>
          </div>
        </section>
        <section className="role-columns">
          {roles.map((role) => (
            <article id={role.id} key={role.id}>
              <p className="eyebrow">{role.eyebrow}</p>
              <h2>{role.title}</h2>
              <p>{role.description}</p>
              <ul>
                {role.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link to={role.id === "students" ? "/register" : "/login"}>
                {role.link} <span>→</span>
              </Link>
            </article>
          ))}
        </section>
        <section id="workflow" className="workflow">
          <div className="workflow-intro">
            <p className="eyebrow">
              A simpler way to
              <br />
              manage education
            </p>
            <span className="accent-rule" />
            <h2>
              From enrollment
              <br />
              to achievement,
              <br />
              all in one place.
            </h2>
          </div>
          <div className="workflow-steps">
            <p className="eyebrow">The LearnHub workflow</p>
            <div>
              {[
                ["Set up", "Create your account and join your courses."],
                ["Learn", "Access assignments, attend and participate."],
                ["Track", "Monitor your work and get feedback."],
                ["Achieve", "Build skills for what’s next."],
              ].map(([title, desc], i) => (
                <article key={title}>
                  <span>{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="workflow-poster">
            <p className="eyebrow">
              Education
              <br />
              builds
              <br />
              brighter
              <br />
              futures
            </p>
            <p>
              People.
              <br />
              Progress.
              <br />
              Possibility.
            </p>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <Logo className="h-7 w-auto" />
        <p>A better learning experience for everyone.</p>
        <Link to="/login">Sign in →</Link>
      </footer>
    </div>
  );
}
