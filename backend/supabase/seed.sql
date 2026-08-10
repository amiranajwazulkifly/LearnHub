
-- Local development administrator
-- The repository stores only the bcrypt hash.
INSERT INTO public.users (
  id,
  full_name,
  email,
  password_hash,
  role,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'LearnHub Administrator',
  'admin@learnhub.local',
  '$2b$10$9jaR8drAXkYydgk9f9YUl./lSbkt2BlLUdn3eZvzM2Y1Ge9ovE5eC',
  'admin',
  'active'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: core LearnHub demo data
-- ============================================================

-- Sample student account
INSERT INTO public.users (
  id,
  full_name,
  email,
  password_hash,
  role,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Sample Student',
  'student@learnhub.local',
  '$2b$10$toFZrNPYt4auF/VoQ0wf2.BIWgRtYRcBbN46b/jT0LEjeiATP52vy',
  'student',
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

UPDATE public.student_profiles
SET
  student_number = 'STU2026001',
  phone = '0123456789',
  programme = 'Computer Science',
  semester = 5
WHERE user_id = '00000000-0000-0000-0000-000000000002';

-- Categories
INSERT INTO public.categories (
  id,
  name,
  description
)
VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Technology',
  'Technology, software development and computing courses'
),
(
  '10000000-0000-0000-0000-000000000002',
  'Business',
  'Business, entrepreneurship and management courses'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Instructors
INSERT INTO public.instructors (
  id,
  full_name,
  email,
  phone,
  expertise,
  biography,
  is_active
)
VALUES
(
  '20000000-0000-0000-0000-000000000001',
  'Dr. Sarah Ahmad',
  'sarah.ahmad@learnhub.local',
  '0111111111',
  'Web Development',
  'Specialist in modern frontend and backend web development.',
  true
),
(
  '20000000-0000-0000-0000-000000000002',
  'Mr. Daniel Lee',
  'daniel.lee@learnhub.local',
  '0122222222',
  'Business Analytics',
  'Instructor specialising in analytics and business intelligence.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  expertise = EXCLUDED.expertise,
  biography = EXCLUDED.biography,
  is_active = EXCLUDED.is_active;

-- Sample instructor login (Dr. Sarah Ahmad) — same seeded password as the
-- admin/student accounts above.
INSERT INTO public.users (
  id,
  full_name,
  email,
  password_hash,
  role,
  status
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Dr. Sarah Ahmad',
  'sarah.ahmad@learnhub.local',
  '$2b$10$toFZrNPYt4auF/VoQ0wf2.BIWgRtYRcBbN46b/jT0LEjeiATP52vy',
  'instructor',
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

UPDATE public.instructors
SET user_id = '00000000-0000-0000-0000-000000000003'
WHERE id = '20000000-0000-0000-0000-000000000001';

-- Courses
INSERT INTO public.courses (
  id,
  code,
  title,
  description,
  category_id,
  instructor_id,
  capacity,
  status,
  created_by
)
VALUES
(
  '30000000-0000-0000-0000-000000000001',
  'WEB101',
  'Introduction to Web Development',
  'Learn the foundations of HTML, CSS, JavaScript and modern web applications.',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  30,
  'published',
  '00000000-0000-0000-0000-000000000001'
),
(
  '30000000-0000-0000-0000-000000000002',
  'API201',
  'Node.js and REST API Development',
  'Build secure REST APIs using Node.js, Express and PostgreSQL.',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  25,
  'published',
  '00000000-0000-0000-0000-000000000001'
),
(
  '30000000-0000-0000-0000-000000000003',
  'BUS110',
  'Introduction to Business Analytics',
  'Understand business data, reporting and evidence-based decision making.',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  35,
  'published',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  instructor_id = EXCLUDED.instructor_id,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by;

-- Course schedules
INSERT INTO public.course_schedules (
  id,
  course_id,
  day_of_week,
  start_time,
  end_time,
  location,
  start_date,
  end_date
)
VALUES
(
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  1,
  '09:00',
  '11:00',
  'Computer Lab 1',
  '2026-08-10',
  '2026-12-20'
),
(
  '40000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000002',
  3,
  '14:00',
  '16:00',
  'Computer Lab 2',
  '2026-08-10',
  '2026-12-20'
),
(
  '40000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000003',
  5,
  '10:00',
  '12:00',
  'Lecture Room 3',
  '2026-08-10',
  '2026-12-20'
)
ON CONFLICT (id) DO UPDATE SET
  course_id = EXCLUDED.course_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  location = EXCLUDED.location,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date;

-- Sample enrollment
INSERT INTO public.enrollments (
  id,
  student_id,
  course_id,
  status
)
VALUES (
  '60000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001',
  'enrolled'
)
ON CONFLICT (id) DO UPDATE SET
  student_id = EXCLUDED.student_id,
  course_id = EXCLUDED.course_id,
  status = EXCLUDED.status;

-- Announcements
INSERT INTO public.announcements (
  id,
  title,
  content,
  audience,
  status,
  created_by,
  published_at
)
VALUES
(
  '50000000-0000-0000-0000-000000000001',
  'Welcome to LearnHub',
  'Welcome to the new LearnHub course management system.',
  'all',
  'published',
  '00000000-0000-0000-0000-000000000001',
  now()
),
(
  '50000000-0000-0000-0000-000000000002',
  'Course Registration Open',
  'Students may now browse and enroll in published courses.',
  'students',
  'published',
  '00000000-0000-0000-0000-000000000001',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  audience = EXCLUDED.audience,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by,
  published_at = EXCLUDED.published_at;
