# LearnHub — System Summary

A single-document tour of the whole system: what it does, how it is put
together, how a request flows end to end, and where the rough edges are.
Written for an engineer picking up the codebase for the first time.

For *running* the stack see [README.md](README.md); for container-level
detail see [DOCKER.md](DOCKER.md). This document is about the shape of the
code.

---

## 1. What it is

A course management system for a university or training provider. Three
roles share one application, each with its own portal:

| Role | What they do |
| --- | --- |
| **Student** | Browse the catalog, enroll, view a weekly timetable, submit assignments, read announcements |
| **Instructor** | See the courses they teach, their enrolled students, create assignments, grade submissions |
| **Admin** | CRUD over courses, categories, instructors, schedules; manage students and enrollments; publish announcements; view reports |

Roughly 15k lines across a React SPA (126 source files) and an Express API
(58 source files), backed by one PostgreSQL database.

---

## 2. Shape of the system

```
Browser (React SPA, :5175)
    │  JSON over HTTP, JWT in Authorization header
    ▼
Express API (:5001, /api/*)
    │                          ╲
    │ pg (SQL, no ORM)          ╲ @supabase/supabase-js (file uploads)
    ▼                            ▼
PostgreSQL (:54322)          Supabase Storage API
                             bucket: assignment-files
```

Everything runs under Docker Compose. Beyond the app's own two containers,
the stack runs Supabase's self-hosted pieces: `db` (Postgres 17), `storage`
+ `storage-gateway` (the file storage API and its nginx front), `migrate`
and `fix-roles` (one-shot DB bootstrap jobs), and optionally `pg-meta` +
`studio` (a browser DB explorer).

Note that Supabase is used **only** for Postgres and file storage. Supabase
Auth and row-level security are not used — authentication is hand-rolled
JWT in the Express layer, and the backend talks to storage with the
service-role key as the sole writer.

---

## 3. Backend

### Layering

`backend/src/` follows a conventional Express layering, though not every
layer is populated for every resource:

```
routes/       path + middleware wiring        (13 files)
validators/   express-validator rule sets      (8 files)
middleware/   auth, roles, validation, upload, rate limit, errors
controllers/  request handling + most SQL     (17 files)
services/     shared SQL for auth, enrollment, reports
utils/        pagination, tokens, passwords, file storage, ApiError
config/       env validation, pg pool, supabase client
```

The important thing to know: **most SQL lives in the controllers.** The
`services/` directory is only meaningfully used by auth, enrollment, and
reports. There is no ORM — every query is hand-written SQL through `pg`.

### Entry point — `src/app.js`

Mounts helmet, an origin-allowlist CORS policy, JSON/urlencoded body
parsers capped at 100kb, a `/api/health` probe that round-trips the
database, then the twelve route modules under `/api`.

### Authentication

Hand-rolled JWT, and more careful than most:

- **Login** → bcrypt compare → `generateToken` signs `{ userId, role, issuedAtMs }` with HS256, expiring per `JWT_EXPIRES_IN` (default 1d).
- **`issuedAtMs`** is a custom millisecond-precision claim. The standard `iat` claim has only 1-second resolution, which is too coarse to distinguish a login from a logout in the same second.
- **Session revocation** — `users.token_valid_after` is bumped on logout, password change, and admin password reset. `authMiddleware` rejects any token whose `issuedAtMs` predates it, so revocation is immediate rather than waiting out the JWT expiry. This is what makes "log out everywhere" actually work.
- **Every request** re-loads the user from the database (`getAuthContext`) and rejects non-`active` accounts — the JWT is never trusted as the source of truth for role or status.
- **Password reset** stores only a bcrypt hash of the reset token, never the raw token, mirroring how passwords are handled.

`roleMiddleware(...roles)` runs after and gates on `req.user.role`. The
common pattern is a router-level `router.use(authMiddleware,
roleMiddleware("admin","student","instructor"))` for read access, with a
second, narrower `roleMiddleware("admin")` on each write route.

### API surface

| Prefix | Access | Purpose |
| --- | --- | --- |
| `/api/auth` | public + self | register, login, forgot/reset password, `/me`, change password, logout |
| `/api/courses` | read: all · write: admin | course CRUD |
| `/api/categories` | read: all · write: admin | category CRUD |
| `/api/instructors` | read: all · write: admin | instructor directory CRUD |
| `/api/schedules` | read: all · write: admin | weekly session CRUD |
| `/api/enrollments` | authenticated | enroll, my-courses, my-timetable, cancel |
| `/api/students`, `/api/admin/enrollments` | admin | student directory, enrollment status management |
| `/api/dashboard` | admin | system stats, recent activity |
| `/api/reports` | admin | enrollment trend, course popularity, completion rates |
| `/api/announcements` | read published: all · manage: admin | draft → publish → archive lifecycle |
| `/api/assignments` | mixed per route | assignment CRUD (instructor), submission (student), grading (instructor) |
| `/api/instructor-portal` | instructor | stats, my courses, course students, recent submissions |

Responses are uniformly `{ success, message, data }`; errors are
`{ success, message, errors? }` via `ApiError` and `errorMiddleware`, which
masks 500-level messages outside development.

List endpoints use `utils/pagination.js`: `?page`/`?limit`, defaulting to
20 and capped at 50, returning `{ page, limit, total, totalPages }`.

### File uploads

`uploadMiddleware` (multer) keeps files **in memory only** — nothing is
written to local disk. `utils/fileStorage.js` forwards the buffer to the
Supabase `assignment-files` bucket under an `assignments/` or `submissions/`
prefix with a UUID-prefixed, sanitized filename, capped at 15MB. The database
stores the object's **path**, never a URL.

The bucket is **private**. The API never returns a storage URL; responses
carry `hasAttachment` and `attachmentName` only. To download, the client calls
one of two endpoints, which check access and return a signed link that
expires after 60 seconds:

| Endpoint | Who may download |
| --- | --- |
| `GET /api/assignments/:id/attachment` | the course's instructor, admins, and students with access to the course |
| `GET /api/assignments/:id/submissions/:submissionId/attachment` | the student who submitted it and the course's instructor, nobody else |

The frontend's `AttachmentLink` fetches the link on click. The link is signed
with a download filename, so storage responds with `Content-Disposition:
attachment` and the browser downloads without leaving the page.

One Docker-specific wrinkle: the backend reaches storage by its internal
container address (`SUPABASE_URL`, e.g. `http://storage-gateway:8000`), but
signed links must work from the browser, so `fileStorage` rewrites them to
`SUPABASE_PUBLIC_URL`. Outside Docker the two are identical.

---

## 4. Data model

Nine tables plus enum types, in `backend/supabase/migrations/`
(chronological). All keys are UUIDs; all tables carry
`created_at`/`updated_at`.

```
users ──┬──< student_profiles        (1:1, auto-created by trigger for role='student')
        ├──< enrollments >── courses ──┬──< course_schedules
        ├──< assignment_submissions    ├──< assignments ──< assignment_submissions
        └──< announcements (created_by)├── categories      (SET NULL on delete)
                                       └── instructors     (SET NULL on delete)
instructors ── user_id ──> users       (optional link: gives an instructor a login)
```

**`users`** — `full_name`, `email` (case-insensitively unique),
`password_hash`, `role` (`admin|instructor|student`), `status`, plus the
session-control columns `token_valid_after`, `reset_token_hash`,
`reset_token_expires_at`.

**`student_profiles`** — student number, phone, programme, semester and
other profile detail, split out from `users`. Auto-created by a trigger
whenever a `student` row is inserted.

**`instructors`** — a *directory* table, deliberately separate from
`users`. An instructor can exist in the catalog with no login at all; the
nullable `instructors.user_id` is what links one to an account. The
instructor portal resolves the logged-in user to their `instructors` row
through this column, and every portal query is scoped by it.

**`courses`** — code (unique), title, description, `capacity`, `status`
(draft/published/…), with category and instructor as `ON DELETE SET NULL`
references so deleting a category never cascades away courses.

**`course_schedules`** — recurring weekly sessions: `day_of_week` (1–7),
`start_time`/`end_time`, `location`, optional date range. Constraints
enforce `end_time > start_time` and `end_date >= start_date`, plus a unique
index preventing duplicate sessions.

**`enrollments`** — student↔course with a status enum. A partial unique
index (`enrollments_active_unique`) allows only one *active* enrollment per
student per course while still permitting historical cancelled rows. CHECK
constraints tie `cancelled_at`/`completed_at` to the matching status, and a
trigger rejects enrolling any account whose role is not `student` —
integrity enforced in the database, not just the application.

**`assignments`** / **`assignment_submissions`** — submissions are unique
on `(assignment_id, student_id)`, so a resubmit **overwrites** the existing
row rather than creating a new one. Grading writes `grade`, `feedback`,
`graded_at`, `graded_by` onto that same row.

**`announcements`** — title/content plus `audience` (all/students/
instructors) and `status` (draft/published/archived), with a CHECK tying
`published_at` to the published state.

**`announcement_reads`** — one row per (announcement, user) once read; drives
the NEW markers and unread badge.

**`notifications`** — one row per recipient: `type`, `title`, optional `body`
and in-app `link`, `read_at`. Written by the API as a side effect of
assignments, grading, submissions, publishing, registration and a course
filling up; read by polling (`GET /api/notifications`, every 60s while the tab
is visible). Writes are best-effort and never fail the triggering request.

Seed data (`backend/supabase/seed.sql`) provides one admin, one student,
two instructors, three courses with schedules, and sample announcements —
all sharing the password `TestPass123!`.

---

## 5. Frontend

React 19 + TypeScript + Vite, Tailwind CSS v4, Zustand for state, React
Router for routing, React Hook Form + Zod for forms, Recharts for report
charts, `lucide-react` for icons.

### Organisation

```
frontend/src/
  routes/       AppRoutes + ProtectedRoute + RoleRoute guards
  layouts/      one app shell per role (Admin/Student/Instructor) + Auth
  pages/        admin/ (14) · student/ (9) · instructor/ (6) · auth/ (4) · shared/
  components/   common/ · layout/ · courses/ · forms/ · dashboard/ · reports/
  services/     one API client per resource (15 files)
  store/        Zustand: useAuthStore, useThemeStore
  types/        one per domain object, mirroring API payloads
  schemas/      Zod validation, paired with the forms
```

### Routing and access control

Two nested guards wrap everything private. `ProtectedRoute` requires an
authenticated session; `RoleRoute allowedRoles={[...]}` then admits only
matching roles and renders that role's layout. `RootRedirect` sends `/` to
the right dashboard via `getDefaultRouteForRole`. On mount, `AppRoutes`
calls `initializeAuth`, which validates the stored token against
`/api/auth/me` and clears it if rejected — routes hold back behind an
`isInitialized` flag until that resolves.

This is convenience, not security: the frontend guard only decides what to
render. Every actual authorization decision is re-made server-side by
`authMiddleware` + `roleMiddleware`.

### API access

All calls go through one Axios instance (`api/axiosInstance.ts`) with a
10s timeout. A request interceptor attaches the bearer token from
`localStorage`; a response interceptor clears the token on any 401.
Per-resource service modules wrap that instance, so pages never call Axios
directly.

### Auth state

`useAuthStore` (Zustand) owns `user`, `token`, `isAuthenticated`,
`isLoading`, `isInitialized`, `error` and the login/register/logout/
profile/password actions. One subtlety worth knowing: on a password
change, the server revokes all prior tokens and returns a fresh one, which
the store persists — otherwise the tab that just changed its own password
would immediately log itself out.

---

## 6. Request lifecycle, end to end

Taking "a student submits an assignment" as the representative case:

1. The page calls `submissionService.submit(...)` with a `FormData` body.
2. The Axios request interceptor attaches `Authorization: Bearer <jwt>`.
3. Express routes it to `POST /api/assignments/:id/submit`.
4. `authMiddleware` verifies the signature, re-loads the user, checks `token_valid_after` and `status === 'active'`, sets `req.user`.
5. The router-level `roleMiddleware` admits the three roles; the route-level `roleMiddleware("student")` narrows to students.
6. `multer` buffers the attachment in memory; `validateSubmission` checks the body.
7. `submissionController` verifies enrollment, uploads via `fileStorage` to the Supabase bucket, and upserts the row on `(assignment_id, student_id)`.
8. The response comes back as `{ success, data }`; any thrown `ApiError` short-circuits into `errorMiddleware` instead.

---

## 7. Testing

**Backend** — Jest + Supertest, 15 suites / 148 tests in `backend/tests/`,
covering auth and session revocation, route access, courses, categories,
instructors, schedules, the assignment workflow and its cross-screen count
invariant, enrollments, report exports and CSV escaping, notifications,
announcement read state, course lifecycle visibility, attachment access
control, and rate limiting.

They run against the **real Postgres database** and the demo seed, not
mocks, so the stack has to be up. Tests that create data clean up after
themselves (including notifications that creating an assignment triggers), so
a run leaves the demo data unchanged.

```bash
docker compose up -d
docker compose exec backend npm test
```

`tests/setup.js` raises the general rate limit for the suite, since it makes
hundreds of requests from one address; `rateLimit.test.js` checks the limiter
against a low ceiling.

**Frontend** — Vitest + Testing Library, `src/**/*.test.{ts,tsx}`, 42 tests:
schedule date-range logic, formatters, error-copy mapping, routing and role
guards, login, enrolling (including full and closed courses), cancelling with
confirmation, submitting and the read-only cancelled state, grading, and
creating assignments and courses. Services are mocked; these run without the
stack.

```bash
cd frontend && npm test
```

---

## 8. Operational notes

Things worth knowing that aren't obvious from the code layout.

- **Migrations are tracked.** `backend/supabase/docker-init/migrate.sh`
  records applied files in `public.schema_migrations` and applies only new
  ones on each `docker compose up`. (It previously skipped every migration once
  the schema existed, so a new migration never reached an existing database.)
  Databases created before tracking record the original seven migrations as
  a baseline on first run.
- **Rate limiting** is on for the whole API. The default is 1000 requests per
  IP per 15 minutes, and 20 failed auth attempts. Both are configurable with
  `API_RATE_LIMIT_MAX` and `AUTH_RATE_LIMIT_MAX`. Behind a reverse proxy, set
  `TRUST_PROXY` to the number of hops, or every user shares the proxy's
  bucket. Without a proxy leave it unset, or clients can spoof their IP.
  (Until this was fixed the limiter was mounted after the routers and never
  ran.)
- **Enrollment endpoints are student-only** and follow the same
  `asyncHandler` / `ApiError` pattern as every other controller. `ApiError`
  takes an optional `extra` object for the few error responses that carry
  more than a message, such as the clashing session on a timetable conflict.
- **A malformed id in a URL is a 400**, mapped centrally in
  `errorMiddleware`, instead of surfacing as a Postgres 500.
- **Submissions outlive enrollments.** Cancelling removes the ability to
  submit, but work already submitted stays visible to the student (read-only)
  and on the instructor's roster, where it can still be graded. See the
  comment on `getSubmissionsForAssignment`.
- **Orphaned storage objects.** Deleting an assignment or submission row
  directly in SQL leaves its file in the bucket; only the API removes files.
  Three such orphans from August development data exist in the local volume.
- **Frontend bundle size.** The production build is a single chunk over
  500 kB, and Vite warns about it. Route-level code splitting would fix this;
  it hasn't been needed yet.

## 9. Where to start reading

| To understand… | Read |
| --- | --- |
| The API surface | [backend/src/app.js](backend/src/app.js), then `routes/` |
| Auth and sessions | [authMiddleware.js](backend/src/middleware/authMiddleware.js), [generateToken.js](backend/src/utils/generateToken.js), [services/authService.js](backend/src/services/authService.js) |
| The data model | [backend/supabase/migrations/](backend/supabase/migrations/) in filename order |
| Frontend navigation | [AppRoutes.tsx](frontend/src/routes/AppRoutes.tsx) and `layouts/` |
| Frontend↔API contract | [axiosInstance.ts](frontend/src/api/axiosInstance.ts) and `services/` |
| A worked domain example | [enrollmentController.js](backend/src/controllers/enrollmentController.js) — capacity, duplicates, and timetable clashes in one flow |
