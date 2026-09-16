-- ============================================================
-- LearnHub demo dataset
--
-- A coherent, internally consistent semester: 6 instructors, 12 students,
-- 8 courses across 5 categories, schedules spread over the week, and an
-- assignment/submission set covering every state the UI can render
-- (upcoming, submitted, graded, late, missing, past due).
--
-- Dates are all relative to CURRENT_DATE rather than hardcoded, so the
-- data stays meaningful whenever it is seeded: the enrollment trend chart
-- always has activity in its 30-day window, some classes are always still
-- running, and at least one course has always already finished.
--
-- Every account uses the password: TestPass123!
-- Re-running is safe — every statement is an idempotent upsert.
-- ============================================================

-- Shared bcrypt hash for TestPass123!. Only the hash is ever stored.
-- ============================================================
-- Users
-- ============================================================

INSERT INTO public.users (id, full_name, email, password_hash, role, status)
VALUES
  -- Admin
  ('00000000-0000-0000-0000-000000000001', 'LearnHub Administrator', 'admin@learnhub.local',   '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'admin',   'active'),

  -- Instructor logins
  ('00000000-0000-0000-0000-000000000003', 'Dr. Sarah Ahmad',    'sarah.ahmad@learnhub.local',    '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'instructor', 'active'),
  ('00000000-0000-0000-0000-000000000004', 'Mr. Daniel Lee',     'daniel.lee@learnhub.local',     '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'instructor', 'active'),
  ('00000000-0000-0000-0000-000000000005', 'Dr. Priya Ramesh',   'priya.ramesh@learnhub.local',   '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'instructor', 'active'),
  ('00000000-0000-0000-0000-000000000006', 'Ms. Farah Idris',    'farah.idris@learnhub.local',    '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'instructor', 'active'),

  -- Students. The first is the documented demo login.
  ('00000000-0000-0000-0000-000000000002', 'Sample Student',     'student@learnhub.local',        '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000002', 'Nabil Farhan',       'nabil.farhan@learnhub.local',   '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000003', 'Aisyah Rahman',      'aisyah.rahman@learnhub.local',  '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000004', 'Wei Jie Tan',        'weijie.tan@learnhub.local',     '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000005', 'Hannah Yusof',       'hannah.yusof@learnhub.local',   '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000006', 'Arjun Nair',         'arjun.nair@learnhub.local',     '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000007', 'Chloe Lim',          'chloe.lim@learnhub.local',      '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000008', 'Imran Zulkifli',     'imran.zulkifli@learnhub.local', '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-000000000009', 'Mei Ling Chong',     'meiling.chong@learnhub.local',  '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-00000000000a', 'Daniel Ooi',         'daniel.ooi@learnhub.local',     '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  ('11000000-0000-0000-0000-00000000000b', 'Siti Nurhaliza',     'siti.nurhaliza@learnhub.local', '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'active'),
  -- One inactive account, so the "status" column has something to show.
  ('11000000-0000-0000-0000-00000000000c', 'Kavita Sharma',      'kavita.sharma@learnhub.local',  '$2b$10$vVXteglVY6QkP86d1d3tyO7UFequ7JgiG8NFkGZ8oIuzmD4xEYVYO', 'student', 'inactive')
ON CONFLICT (id) DO UPDATE SET
  full_name     = EXCLUDED.full_name,
  email         = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role          = EXCLUDED.role,
  status        = EXCLUDED.status;

-- Student profile detail. The rows themselves are created by the trigger on
-- public.users, so this only fills them in.
UPDATE public.student_profiles sp
SET
  student_number = v.student_number,
  phone          = v.phone,
  programme      = v.programme,
  semester       = v.semester,
  updated_at     = now()
FROM (VALUES
  ('00000000-0000-0000-0000-000000000002'::uuid, 'STU2026001', '012-345 6789', 'Computer Science',            5),
  ('11000000-0000-0000-0000-000000000002'::uuid, 'STU2026002', '012-887 1220', 'Software Engineering',        3),
  ('11000000-0000-0000-0000-000000000003'::uuid, 'STU2026003', '013-220 7781', 'Information Systems',        3),
  ('11000000-0000-0000-0000-000000000004'::uuid, 'STU2026004', '016-220 4415', 'Computer Science',            5),
  ('11000000-0000-0000-0000-000000000005'::uuid, 'STU2026005', '011-908 3321', 'Data Science',                1),
  ('11000000-0000-0000-0000-000000000006'::uuid, 'STU2026006', '019-556 7781', 'Software Engineering',        7),
  ('11000000-0000-0000-0000-000000000007'::uuid, 'STU2026007', '012-114 9087', 'Business Analytics',          3),
  ('11000000-0000-0000-0000-000000000008'::uuid, 'STU2026008', '017-664 2012', 'Information Systems',         5),
  ('11000000-0000-0000-0000-000000000009'::uuid, 'STU2026009', '014-778 3390', 'Data Science',                3),
  ('11000000-0000-0000-0000-00000000000a'::uuid, 'STU2026010', '018-223 5567', 'Computer Science',            1),
  ('11000000-0000-0000-0000-00000000000b'::uuid, 'STU2026011', '013-445 9921', 'Business Analytics',          7),
  ('11000000-0000-0000-0000-00000000000c'::uuid, 'STU2026012', '012-667 1143', 'Software Engineering',        5)
) AS v(user_id, student_number, phone, programme, semester)
WHERE sp.user_id = v.user_id;

-- ============================================================
-- Categories
-- ============================================================

INSERT INTO public.categories (id, name, description)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Web Development',    'Front-end and back-end web engineering, from markup to deployment.'),
  ('10000000-0000-0000-0000-000000000002', 'Data & Analytics',   'Statistics, data engineering, visualisation and business intelligence.'),
  ('10000000-0000-0000-0000-000000000003', 'Software Engineering', 'Design, architecture, testing and the practice of building software.'),
  ('10000000-0000-0000-0000-000000000004', 'Cloud & DevOps',     'Infrastructure, automation, containers and continuous delivery.'),
  ('10000000-0000-0000-0000-000000000005', 'Cybersecurity',      'Application security, network defence and secure system design.')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================================
-- Instructors
--
-- The directory is separate from the login accounts: the first four are
-- linked to a user and can sign in, the last two exist in the catalog only.
-- ============================================================

INSERT INTO public.instructors (id, full_name, email, phone, expertise, biography, is_active, user_id)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Dr. Sarah Ahmad',  'sarah.ahmad@learnhub.local',  '03-7788 1200', 'Web Engineering, Accessibility',
   'Sarah leads the web engineering track and has spent twelve years building large-scale front-ends in industry before moving into teaching. Her research interest is accessible interface design.',
   true, '00000000-0000-0000-0000-000000000003'),

  ('20000000-0000-0000-0000-000000000002', 'Mr. Daniel Lee',   'daniel.lee@learnhub.local',   '03-7788 1201', 'Business Analytics, Data Visualisation',
   'Daniel is a practising data consultant who teaches the analytics foundation courses. He focuses on turning messy operational data into decisions people actually make.',
   true, '00000000-0000-0000-0000-000000000004'),

  ('20000000-0000-0000-0000-000000000003', 'Dr. Priya Ramesh', 'priya.ramesh@learnhub.local', '03-7788 1202', 'Distributed Systems, API Design',
   'Priya researches distributed systems and teaches the API and backend engineering courses. She previously worked on payment infrastructure at scale.',
   true, '00000000-0000-0000-0000-000000000005'),

  ('20000000-0000-0000-0000-000000000004', 'Ms. Farah Idris',  'farah.idris@learnhub.local',  '03-7788 1203', 'Application Security',
   'Farah runs the cybersecurity electives, drawing on eight years in offensive security consulting. She is a strong advocate of secure-by-default engineering.',
   true, '00000000-0000-0000-0000-000000000006'),

  ('20000000-0000-0000-0000-000000000005', 'Dr. Marcus Chen',  'marcus.chen@learnhub.local',  '03-7788 1204', 'Cloud Architecture, Kubernetes',
   'Marcus teaches the cloud and platform engineering electives and consults on container migration projects.',
   true, NULL),

  ('20000000-0000-0000-0000-000000000006', 'Ms. Laila Hassan', 'laila.hassan@learnhub.local', '03-7788 1205', 'Technical Writing, UX Research',
   'Laila is a visiting lecturer covering documentation practice and user research methods. She is not teaching this semester.',
   false, NULL)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email     = EXCLUDED.email,
  phone     = EXCLUDED.phone,
  expertise = EXCLUDED.expertise,
  biography = EXCLUDED.biography,
  is_active = EXCLUDED.is_active,
  user_id   = EXCLUDED.user_id;

-- ============================================================
-- Courses
--
-- A mix of lifecycle states so the status filters have something to do:
-- six published, one draft (invisible to students), one archived.
-- ============================================================

INSERT INTO public.courses (id, code, title, description, category_id, instructor_id, capacity, status, created_by)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'WEB202', 'Fundamentals of Web Development',
   'Build and deploy a complete web application. Covers semantic HTML, modern CSS layout, JavaScript fundamentals, and consuming a REST API from the browser.',
   '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 30, 'published', '00000000-0000-0000-0000-000000000001'),

  ('30000000-0000-0000-0000-000000000002', 'API303', 'API Design and Integration',
   'Design, document and secure HTTP APIs. Covers resource modelling, versioning, authentication, rate limiting and integration testing.',
   '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 30, 'published', '00000000-0000-0000-0000-000000000001'),

  ('30000000-0000-0000-0000-000000000003', 'BUS110', 'Introduction to Business Analytics',
   'Turn operational data into decisions. Covers descriptive statistics, dashboard design, and communicating findings to non-technical stakeholders.',
   '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 35, 'published', '00000000-0000-0000-0000-000000000001'),

  ('30000000-0000-0000-0000-000000000004', 'SEC210', 'Application Security Essentials',
   'Identify and fix the vulnerability classes that matter most in web applications, from injection and broken access control through to dependency risk.',
   '10000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 24, 'published', '00000000-0000-0000-0000-000000000001'),

  ('30000000-0000-0000-0000-000000000005', 'DAT250', 'Data Visualisation and Reporting',
   'Choose the right chart, build a readable dashboard, and avoid the most common ways visualisations mislead their readers.',
   '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 28, 'published', '00000000-0000-0000-0000-000000000001'),

  -- Deliberately at capacity, so the "course full" path is visible.
  ('30000000-0000-0000-0000-000000000006', 'SWE301', 'Software Testing and Quality',
   'Write tests that are worth maintaining. Covers unit, integration and end-to-end testing, test doubles, and continuous integration pipelines.',
   '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 4, 'published', '00000000-0000-0000-0000-000000000001'),

  ('30000000-0000-0000-0000-000000000007', 'CLD400', 'Cloud Infrastructure and Containers',
   'Containerise an application and run it in production. Covers Docker, orchestration basics, observability and deployment strategy.',
   '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 26, 'draft', '00000000-0000-0000-0000-000000000001'),

  ('30000000-0000-0000-0000-000000000008', 'WEB101', 'Web Foundations (Retired)',
   'Superseded by WEB202. Retained for the enrollment records of students who completed it in an earlier semester.',
   '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 40, 'archived', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  code          = EXCLUDED.code,
  title         = EXCLUDED.title,
  description   = EXCLUDED.description,
  category_id   = EXCLUDED.category_id,
  instructor_id = EXCLUDED.instructor_id,
  capacity      = EXCLUDED.capacity,
  status        = EXCLUDED.status,
  created_by    = EXCLUDED.created_by;

-- ============================================================
-- Schedules
--
-- Spread across the week. Active courses run from about six weeks ago to
-- eight weeks out; the retired WEB101 block ended a fortnight ago, which is
-- what proves the date-range filtering works — it must not appear as an
-- upcoming class.
-- ============================================================

INSERT INTO public.course_schedules (id, course_id, day_of_week, start_time, end_time, location, start_date, end_date)
VALUES
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, '09:00', '11:00', 'Block A — Lab 2',        CURRENT_DATE - 42, CURRENT_DATE + 56),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 3, '14:00', '16:00', 'Block A — Lab 2',        CURRENT_DATE - 42, CURRENT_DATE + 56),

  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 2, '10:00', '12:00', 'Block C — Seminar 1',    CURRENT_DATE - 42, CURRENT_DATE + 56),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 4, '12:00', '14:00', 'Block C — Big Data Lab', CURRENT_DATE - 42, CURRENT_DATE + 56),

  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 2, '14:00', '16:00', 'Block B — Room 210',     CURRENT_DATE - 42, CURRENT_DATE + 56),

  ('60000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', 3, '09:00', '11:00', 'Block D — Security Lab', CURRENT_DATE - 42, CURRENT_DATE + 56),
  ('60000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', 5, '09:00', '11:00', 'Block D — Security Lab', CURRENT_DATE - 42, CURRENT_DATE + 56),

  ('60000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', 4, '15:00', '17:00', 'Block B — Room 118',     CURRENT_DATE - 42, CURRENT_DATE + 56),

  ('60000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000006', 5, '13:00', '15:00', 'Block A — Lab 4',        CURRENT_DATE - 42, CURRENT_DATE + 56),

  -- Finished two weeks ago — must never render as upcoming.
  ('60000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-000000000008', 1, '11:00', '13:00', 'Block A — Lab 1',        CURRENT_DATE - 120, CURRENT_DATE - 14)
ON CONFLICT (id) DO UPDATE SET
  course_id   = EXCLUDED.course_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time  = EXCLUDED.start_time,
  end_time    = EXCLUDED.end_time,
  location    = EXCLUDED.location,
  start_date  = EXCLUDED.start_date,
  end_date    = EXCLUDED.end_date;

-- ============================================================
-- Enrollments
--
-- 26 records spread across the last 30 days so the enrollment-trend report
-- always has a populated window. Includes completed and cancelled rows, and
-- SWE301 is filled to its capacity of 4.
-- ============================================================

INSERT INTO public.enrollments (id, student_id, course_id, status, enrolled_at, cancelled_at, completed_at)
VALUES
  -- Sample Student: a full picture across three active courses plus history.
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'enrolled',  now() - interval '26 days', NULL, NULL),
  -- Deliberately NOT enrolled in API303: backend/tests/assignments.test.js
  -- pins that course as its "student has no access" fixture.
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 'enrolled',  now() - interval '25 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'enrolled',  now() - interval '12 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008', 'completed', now() - interval '110 days', NULL, now() - interval '14 days'),
  -- Left BUS110, but see the submissions block: the work stays on the record.
  ('70000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'cancelled', now() - interval '24 days', now() - interval '6 days', NULL),

  ('70000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'enrolled',  now() - interval '27 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'enrolled',  now() - interval '22 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000008', '11000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000006', 'enrolled',  now() - interval '20 days', NULL, NULL),

  ('70000000-0000-0000-0000-000000000009', '11000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'enrolled',  now() - interval '27 days', NULL, NULL),
  ('70000000-0000-0000-0000-00000000000a', '11000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'enrolled',  now() - interval '19 days', NULL, NULL),

  ('70000000-0000-0000-0000-00000000000b', '11000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'enrolled',  now() - interval '24 days', NULL, NULL),
  ('70000000-0000-0000-0000-00000000000c', '11000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'enrolled',  now() - interval '17 days', NULL, NULL),
  ('70000000-0000-0000-0000-00000000000d', '11000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000006', 'enrolled',  now() - interval '15 days', NULL, NULL),

  ('70000000-0000-0000-0000-00000000000e', '11000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'enrolled',  now() - interval '21 days', NULL, NULL),
  ('70000000-0000-0000-0000-00000000000f', '11000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'enrolled',  now() - interval '13 days', NULL, NULL),

  ('70000000-0000-0000-0000-000000000010', '11000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'enrolled',  now() - interval '18 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000011', '11000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'enrolled',  now() - interval '11 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000012', '11000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000008', 'completed', now() - interval '108 days', NULL, now() - interval '14 days'),

  ('70000000-0000-0000-0000-000000000013', '11000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', 'enrolled',  now() - interval '16 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000014', '11000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005', 'enrolled',  now() - interval '9 days',  NULL, NULL),

  ('70000000-0000-0000-0000-000000000015', '11000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', 'enrolled',  now() - interval '14 days', NULL, NULL),
  ('70000000-0000-0000-0000-000000000016', '11000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', 'enrolled',  now() - interval '8 days',  NULL, NULL),

  ('70000000-0000-0000-0000-000000000017', '11000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', 'enrolled',  now() - interval '7 days',  NULL, NULL),
  ('70000000-0000-0000-0000-000000000018', '11000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000006', 'enrolled',  now() - interval '5 days',  NULL, NULL),

  ('70000000-0000-0000-0000-000000000019', '11000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-000000000001', 'enrolled',  now() - interval '4 days',  NULL, NULL),
  ('70000000-0000-0000-0000-00000000001a', '11000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-000000000004', 'enrolled',  now() - interval '3 days',  NULL, NULL),

  ('70000000-0000-0000-0000-00000000001b', '11000000-0000-0000-0000-00000000000b', '30000000-0000-0000-0000-000000000003', 'enrolled',  now() - interval '2 days',  NULL, NULL),
  -- Changed their mind the same week.
  ('70000000-0000-0000-0000-00000000001c', '11000000-0000-0000-0000-00000000000b', '30000000-0000-0000-0000-000000000005', 'cancelled', now() - interval '10 days', now() - interval '1 day', NULL)
ON CONFLICT (id) DO UPDATE SET
  student_id   = EXCLUDED.student_id,
  course_id    = EXCLUDED.course_id,
  status       = EXCLUDED.status,
  enrolled_at  = EXCLUDED.enrolled_at,
  cancelled_at = EXCLUDED.cancelled_at,
  completed_at = EXCLUDED.completed_at;

-- ============================================================
-- Assignments
--
-- Nine across four courses, deliberately spanning past-due and upcoming so
-- the student Tasks grouping has something in every bucket.
-- ============================================================

INSERT INTO public.assignments (id, course_id, created_by, title, description, points, due_at, created_at)
VALUES
  ('80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003',
   'Semantic HTML Portfolio',
   'Build a three-page personal portfolio using semantic HTML only — no CSS frameworks. Your markup should pass an accessibility audit with no critical issues.',
   100, now() - interval '18 days', now() - interval '38 days'),

  ('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003',
   'Responsive Layout Challenge',
   'Reproduce the supplied dashboard mockup using CSS Grid and Flexbox. It must be readable from 320px through to 1920px with no horizontal scrolling.',
   100, now() - interval '4 days', now() - interval '24 days'),

  ('80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003',
   'Responsive Web Application',
   'Consume the course REST API and render it as a responsive interface. Handle loading, empty and error states explicitly — an unhandled failure is a failed requirement.',
   100, now() + interval '11 days', now() - interval '9 days'),

  ('80000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005',
   'REST Resource Modelling',
   'Given the supplied domain description, design the resource hierarchy and document every endpoint with its method, status codes and error shape.',
   50, now() - interval '9 days', now() - interval '29 days'),

  ('80000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005',
   'Authentication and Rate Limiting',
   'Add token authentication and a sensible rate-limiting policy to the sample API. Explain in your submission where you placed the middleware and why the order matters.',
   100, now() + interval '6 days', now() - interval '13 days'),

  ('80000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004',
   'Retail Sales Dashboard',
   'Analyse the supplied twelve months of retail data and present three findings a store manager could act on this week.',
   100, now() - interval '6 days', now() - interval '26 days'),

  ('80000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004',
   'Stakeholder Summary Memo',
   'Write a one-page memo communicating your dashboard findings to a non-technical audience. Marks are for clarity, not for volume.',
   50, now() + interval '18 days', now() - interval '4 days'),

  ('80000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006',
   'Broken Access Control Audit',
   'Audit the deliberately vulnerable sample application. Identify every access-control flaw, rate it by severity, and propose a concrete fix for each.',
   100, now() + interval '3 days', now() - interval '17 days'),

  ('80000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003',
   'Test Suite for a Legacy Module',
   'Write a characterisation test suite for the supplied untested module, then refactor it safely behind your tests.',
   100, now() + interval '25 days', now() - interval '2 days')
ON CONFLICT (id) DO UPDATE SET
  course_id   = EXCLUDED.course_id,
  created_by  = EXCLUDED.created_by,
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  points      = EXCLUDED.points,
  due_at      = EXCLUDED.due_at,
  created_at  = EXCLUDED.created_at;

-- ============================================================
-- Submissions
--
-- Covers every roster state: graded, submitted-awaiting-grading, late, and
-- (by omission) missing. The BUS110 row belongs to a student who has since
-- cancelled — it is intentional, and proves historical work stays visible
-- and gradeable to the instructor.
-- ============================================================

INSERT INTO public.assignment_submissions
  (id, assignment_id, student_id, submission_text, submission_link, submitted_at, grade, feedback, graded_at, graded_by)
VALUES
  -- WEB202 / Semantic HTML Portfolio — fully graded round.
  ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
   'Portfolio is deployed and the markup passes axe with no critical issues. Landmarks and heading order are documented in the README.',
   'https://example.edu/portfolios/sample-student', now() - interval '19 days',
   86, 'Good semantic structure and a clean heading order. Tighten the colour contrast on the footer links and this would be close to full marks.',
   now() - interval '16 days', '00000000-0000-0000-0000-000000000003'),

  ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002',
   'Three pages complete. I used a description list for the skills section rather than a table, reasoning included in the README.',
   'https://example.edu/portfolios/nabil-farhan', now() - interval '20 days',
   92, 'Excellent. The description-list choice is well argued and correct. Navigation landmarks are exactly right.',
   now() - interval '16 days', '00000000-0000-0000-0000-000000000003'),

  ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000003',
   'Submitted a little late — I had trouble getting the deployment working.',
   'https://example.edu/portfolios/aisyah-rahman', now() - interval '16 days',
   71, 'The markup is sound but several images are missing alt text, and the contact form inputs have no associated labels. Please review the accessibility checklist.',
   now() - interval '15 days', '00000000-0000-0000-0000-000000000003'),

  ('90000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000004',
   'Portfolio complete, deployed via the university pages host.',
   'https://example.edu/portfolios/weijie-tan', now() - interval '19 days',
   78, 'Solid work. The heading hierarchy skips from h1 to h3 in two places — worth fixing before you reuse this as a real portfolio.',
   now() - interval '15 days', '00000000-0000-0000-0000-000000000003'),

  -- WEB202 / Responsive Layout Challenge — awaiting grading, one of them late.
  ('90000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'Grid for the page shell, Flexbox inside the cards. Tested from 320px to 1920px with no horizontal scroll.',
   'https://example.edu/layouts/sample-student', now() - interval '5 days',
   NULL, NULL, NULL, NULL),

  ('90000000-0000-0000-0000-000000000006', '80000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002',
   'Completed. I used container queries for the card grid rather than media queries — noted in the README.',
   'https://example.edu/layouts/nabil-farhan', now() - interval '6 days',
   NULL, NULL, NULL, NULL),

  -- Late: submitted after the due date, so the roster flags it.
  ('90000000-0000-0000-0000-000000000007', '80000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000004',
   'Sorry for the late submission — I was unwell over the weekend.',
   'https://example.edu/layouts/weijie-tan', now() - interval '2 days',
   NULL, NULL, NULL, NULL),

  -- API303 / REST Resource Modelling — mixed.
  ('90000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000002',
   'Resource hierarchy plus a full endpoint table with status codes and the shared error envelope.',
   NULL, now() - interval '10 days',
   44, 'Clear modelling and a consistent error shape. You are missing 409 handling on the duplicate-create path.',
   now() - interval '8 days', '00000000-0000-0000-0000-000000000005'),

  ('90000000-0000-0000-0000-000000000009', '80000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000006',
   'Endpoint table attached, versioning strategy covered in the final section.',
   NULL, now() - interval '11 days',
   48, 'Very strong. The versioning rationale is the best in the cohort.',
   now() - interval '8 days', '00000000-0000-0000-0000-000000000005'),

  ('90000000-0000-0000-0000-00000000000a', '80000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000008',
   'Submitted — I modelled the nested resources as sub-collections rather than flattening them.',
   NULL, now() - interval '9 days',
   NULL, NULL, NULL, NULL),

  -- BUS110 / Retail Sales Dashboard. This student later cancelled their
  -- enrollment; the submission must remain visible and gradeable.
  ('90000000-0000-0000-0000-00000000000b', '80000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002',
   'Three findings: weekday afternoon dip, the loyalty-card basket premium, and the stockout pattern in the northern stores.',
   NULL, now() - interval '8 days',
   NULL, NULL, NULL, NULL),

  ('90000000-0000-0000-0000-00000000000c', '80000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000005',
   'Dashboard built in the course tooling, three findings summarised on the final tab.',
   NULL, now() - interval '7 days',
   90, 'Genuinely actionable findings and a dashboard that does not overreach. Well done.',
   now() - interval '5 days', '00000000-0000-0000-0000-000000000004'),

  ('90000000-0000-0000-0000-00000000000d', '80000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000007',
   'Findings focus on the promotion cannibalisation effect.',
   NULL, now() - interval '7 days',
   82, 'Good analysis. The cannibalisation argument needs a control comparison to be fully convincing.',
   now() - interval '4 days', '00000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO UPDATE SET
  assignment_id   = EXCLUDED.assignment_id,
  student_id      = EXCLUDED.student_id,
  submission_text = EXCLUDED.submission_text,
  submission_link = EXCLUDED.submission_link,
  submitted_at    = EXCLUDED.submitted_at,
  grade           = EXCLUDED.grade,
  feedback        = EXCLUDED.feedback,
  graded_at       = EXCLUDED.graded_at,
  graded_by       = EXCLUDED.graded_by;

-- ============================================================
-- Announcements
--
-- A mix of published, draft and archived across all three audiences.
-- ============================================================

INSERT INTO public.announcements (id, title, content, audience, status, created_by, published_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'Welcome to the new semester',
   'LearnHub is now the single place to find your timetable, coursework and results. Check your enrolled courses and confirm your weekly schedule looks correct before the end of the first teaching week.',
   'all', 'published', '00000000-0000-0000-0000-000000000001', now() - interval '28 days'),

  ('50000000-0000-0000-0000-000000000002', 'Course registration is open',
   'Browse the catalog and enroll in any published course with seats remaining. Registration closes at the end of week three — after that, changes need approval from your programme coordinator.',
   'students', 'published', '00000000-0000-0000-0000-000000000001', now() - interval '25 days'),

  ('50000000-0000-0000-0000-000000000003', 'Grading deadline reminder',
   'Please return grades and written feedback within ten working days of an assignment due date. The submissions page shows outstanding work per assignment.',
   'instructors', 'published', '00000000-0000-0000-0000-000000000001', now() - interval '12 days'),

  ('50000000-0000-0000-0000-000000000004', 'Block D network maintenance',
   'The security labs in Block D will be offline this Saturday from 08:00 until 14:00 for scheduled network maintenance. Weekend lab bookings have been moved to Block A.',
   'all', 'published', '00000000-0000-0000-0000-000000000001', now() - interval '5 days'),

  ('50000000-0000-0000-0000-000000000005', 'Library extended hours during assessment',
   'The main library will stay open until midnight from next Monday through to the end of the assessment period. Group study rooms can be booked at the front desk.',
   'students', 'published', '00000000-0000-0000-0000-000000000001', now() - interval '2 days'),

  ('50000000-0000-0000-0000-000000000006', 'Semester feedback survey (draft)',
   'The mid-semester feedback survey opens next week. This notice is still being finalised with the student council.',
   'students', 'draft', '00000000-0000-0000-0000-000000000001', NULL),

  ('50000000-0000-0000-0000-000000000007', 'Orientation week schedule',
   'Orientation has now finished. Recordings of the welcome sessions remain available through your programme coordinator.',
   'all', 'archived', '00000000-0000-0000-0000-000000000001', now() - interval '40 days')
ON CONFLICT (id) DO UPDATE SET
  title        = EXCLUDED.title,
  content      = EXCLUDED.content,
  audience     = EXCLUDED.audience,
  status       = EXCLUDED.status,
  created_by   = EXCLUDED.created_by,
  published_at = EXCLUDED.published_at;

-- ============================================================
-- Notifications
--
-- A few per demo account, consistent with the data above, so the bell has
-- something to show on first login. Mixed read/unread.
-- ============================================================

INSERT INTO public.notifications (id, user_id, type, title, body, link, read_at, created_at)
VALUES
  -- Sample Student
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'assignment_posted',
   'Broken Access Control Audit was posted in SEC210', NULL,
   '/student/tasks/80000000-0000-0000-0000-000000000008', NULL, now() - interval '17 days'),

  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'submission_graded',
   'Your WEB202 submission for Semantic HTML Portfolio was graded', '86 / 100',
   '/student/tasks/80000000-0000-0000-0000-000000000001', NULL, now() - interval '16 days'),

  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'assignment_posted',
   'Responsive Web Application was posted in WEB202', NULL,
   '/student/tasks/80000000-0000-0000-0000-000000000003', NULL, now() - interval '9 days'),

  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'announcement_published',
   'New announcement: Library extended hours during assessment', NULL,
   '/student/announcements', now() - interval '1 day', now() - interval '2 days'),

  -- Dr. Sarah Ahmad
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'submission_received',
   'Wei Jie Tan submitted Responsive Layout Challenge', NULL,
   '/instructor/assignments/80000000-0000-0000-0000-000000000002/submissions', NULL, now() - interval '2 days'),

  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'submission_received',
   'Sample Student submitted Responsive Layout Challenge', NULL,
   '/instructor/assignments/80000000-0000-0000-0000-000000000002/submissions', NULL, now() - interval '5 days'),

  -- Administrator
  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'course_full',
   'SWE301 reached full capacity', '4 / 4 seats taken',
   '/admin/courses/30000000-0000-0000-0000-000000000006/edit', NULL, now() - interval '5 days'),

  ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'student_registered',
   'A new student registered: Daniel Ooi', NULL,
   '/admin/students/11000000-0000-0000-0000-00000000000a', now() - interval '3 days', now() - interval '4 days')
ON CONFLICT (id) DO UPDATE SET
  user_id    = EXCLUDED.user_id,
  type       = EXCLUDED.type,
  title      = EXCLUDED.title,
  body       = EXCLUDED.body,
  link       = EXCLUDED.link,
  read_at    = EXCLUDED.read_at,
  created_at = EXCLUDED.created_at;
