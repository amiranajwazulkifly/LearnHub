# LearnHub

A course management system for universities and training providers — course
catalog, enrollment, timetabling, assignments, and announcements, with
dedicated portals for **students**, **instructors**, and **admins**.

Built with a React/TypeScript frontend and an Express/PostgreSQL backend
(via Supabase's self-hosted stack, used for file storage), running entirely
in Docker.

## Tech stack

| Layer     | Stack |
| --------- | ----- |
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router, React Hook Form + Zod, Axios |
| Backend   | Node.js, Express 5, PostgreSQL (`pg`), JWT auth, Multer (uploads), Jest + Supertest (tests) |
| Database & storage | Postgres (Supabase's self-hosted image) + Supabase Storage API, for file attachments |
| Infra     | Docker Compose (dev and prod targets) |

## Quick start

The whole stack — database, file storage, API, and frontend — runs in
Docker. Nothing else needs to be installed locally.

```bash
docker compose up -d
```

First run takes a minute or two (pulling images, building, running
migrations + seed data). Once it's up:

| Service     | URL |
| ----------- | --- |
| Frontend    | http://localhost:5175 |
| Backend API | http://localhost:5001/api |
| Postgres    | localhost:54322 (`postgres` / `postgres`) |

Source is bind-mounted, so day-to-day code edits hot-reload (nodemon /
Vite HMR) — no rebuild needed. See **[DOCKER.md](DOCKER.md)** for the full
picture: production deploys, the optional Supabase Studio DB browser, what
each container does and why, and troubleshooting.

## Demo accounts

Every account below uses the same seeded password: **`TestPass123!`**

| Role       | Email                        | Name                  |
| ---------- | ----------------------------- | ---------------------- |
| Admin      | `admin@learnhub.local`        | LearnHub Administrator |
| Student    | `student@learnhub.local`      | Sample Student          |
| Instructor | `sarah.ahmad@learnhub.local`  | Dr. Sarah Ahmad         |

(Defined in [`backend/supabase/seed.sql`](backend/supabase/seed.sql), along
with a second instructor, three sample courses, schedules, and a couple of
announcements to explore right away.)

## Walkthrough

A guided tour of what there is to see, once you're logged in.

### As a student

1. **Dashboard** — a snapshot of your semester: enrolled courses, weekly
   timetable sessions, pending (ungraded/unsubmitted) tasks, and recent
   announcements, plus today's upcoming classes.
2. **Browse Courses** — search and filter the catalog by category,
   instructor, or status; switch between grid and list view.
3. Open a course to see its **details** — schedule, location, seats
   remaining, and instructor bio — and **Enroll**.
4. **My Courses** — everything you're enrolled in, with the option to
   cancel an enrollment.
5. **Timetable** — your weekly schedule as a color-coded board, one column
   per day, today highlighted.
6. **Tasks** — assignments across all your courses, with submission and
   grade status; open one to submit your work.
7. **Announcements** — campus- and course-wide updates.

### As an instructor

1. **Dashboard** — course count and total students at a glance.
2. **My Courses** — the courses you teach.
3. From a course, view its **enrolled students**, manage its
   **assignments**, and open an assignment to **grade submissions**.

### As an admin

1. **Dashboard** — system-wide stats and recent enrollment activity.
2. **Courses**, **Categories**, **Instructors**, **Schedules** — full CRUD
   over the course catalog and timetabling.
3. **Students** — the student directory, with per-student enrollment
   history.
4. **Enrollments** — manage enrollment status across the whole system.
5. **Reports** — aggregate reporting.
6. **Announcements** — compose and publish updates, targeted at everyone,
   students only, or instructors only.

## Project structure

```
LearnHub/
├── backend/
│   ├── src/
│   │   ├── controllers/     # route handlers
│   │   ├── routes/          # /api/* route definitions
│   │   ├── middleware/      # auth, role checks, rate limiting, errors
│   │   └── utils/           # helpers (pagination, file storage, ...)
│   ├── supabase/
│   │   ├── migrations/      # schema, in chronological order
│   │   └── seed.sql         # demo data (accounts, courses, schedules, ...)
│   └── tests/                # Jest + Supertest
├── frontend/
│   └── src/
│       ├── pages/            # admin/, instructor/, student/, auth/
│       ├── components/       # shared UI, by feature area
│       ├── layouts/           # per-role app shells (nav + header)
│       ├── services/          # API clients (one per resource)
│       ├── store/             # Zustand stores (auth, theme)
│       └── routes/            # route table + auth/role guards
├── docker-compose.yml         # dev stack
└── docker-compose.prod.yml    # production overrides
```

## API overview

The backend exposes a REST API under `/api`, grouped by resource:

`/api/auth`, `/api/courses`, `/api/categories`, `/api/instructors`,
`/api/instructor-portal`, `/api/schedules`, `/api/enrollments`,
`/api/students`, `/api/dashboard`, `/api/reports`, `/api/announcements`,
`/api/assignments`.

Every route requires a JWT (`Authorization: Bearer <token>`, obtained from
`/api/auth/login`) except auth itself; most are further restricted by role.

## Running tests

Backend tests run against a real Postgres connection (`DATABASE_URL`), so
start the stack first:

```bash
docker compose up -d
docker compose exec backend npm test
```

## Environment variables

Docker Compose works out of the box with built-in defaults — no `.env`
required for local development. To override anything (ports, secrets, the
production API URL), see [`.env.example`](.env.example) and
[`backend/.env.example`](backend/.env.example), and the "Production"
section of [DOCKER.md](DOCKER.md).
