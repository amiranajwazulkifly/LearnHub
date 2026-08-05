-- ============================================================
-- LearnHub Core Course Management Schema
-- ============================================================

-- ------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------

CREATE TYPE public.course_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE public.enrollment_status AS ENUM (
  'enrolled',
  'cancelled',
  'completed'
);

CREATE TYPE public.announcement_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE public.announcement_audience AS ENUM (
  'all',
  'students',
  'instructors'
);

-- ------------------------------------------------------------
-- STUDENT PROFILES
-- ------------------------------------------------------------

CREATE TABLE public.student_profiles (
  user_id UUID PRIMARY KEY
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  student_number VARCHAR(30),

  phone VARCHAR(30),

  programme VARCHAR(120),

  semester INTEGER
    CHECK (
      semester IS NULL
      OR semester BETWEEN 1 AND 20
    ),

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now()
);

CREATE UNIQUE INDEX student_profiles_student_number_unique
ON public.student_profiles (
  lower(student_number)
)
WHERE student_number IS NOT NULL;

CREATE TRIGGER student_profiles_set_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Automatically create a student profile when a student account
-- is registered or changed to the student role.
CREATE OR REPLACE FUNCTION public.ensure_student_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO public.student_profiles (
      user_id
    )
    VALUES (
      NEW.id
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER users_ensure_student_profile
AFTER INSERT OR UPDATE OF role
ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.ensure_student_profile();

-- Create profiles for students that already exist.
INSERT INTO public.student_profiles (
  user_id
)
SELECT id
FROM public.users
WHERE role = 'student'
ON CONFLICT (user_id) DO NOTHING;

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------

CREATE TABLE public.categories (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL
    CHECK (
      char_length(trim(name)) >= 2
    ),

  description TEXT,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now()
);

CREATE UNIQUE INDEX categories_name_unique
ON public.categories (
  lower(name)
);

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- INSTRUCTORS
-- ------------------------------------------------------------

CREATE TABLE public.instructors (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  full_name VARCHAR(120) NOT NULL
    CHECK (
      char_length(trim(full_name)) >= 2
    ),

  email VARCHAR(255) NOT NULL,

  phone VARCHAR(30),

  expertise VARCHAR(255),

  biography TEXT,

  is_active BOOLEAN NOT NULL
    DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now()
);

CREATE UNIQUE INDEX instructors_email_unique
ON public.instructors (
  lower(email)
);

CREATE INDEX instructors_active_index
ON public.instructors (
  is_active
);

CREATE TRIGGER instructors_set_updated_at
BEFORE UPDATE ON public.instructors
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- COURSES
-- ------------------------------------------------------------

CREATE TABLE public.courses (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  code VARCHAR(30) NOT NULL
    CHECK (
      char_length(trim(code)) >= 2
    ),

  title VARCHAR(180) NOT NULL
    CHECK (
      char_length(trim(title)) >= 2
    ),

  description TEXT,

  category_id UUID
    REFERENCES public.categories(id)
    ON DELETE SET NULL,

  instructor_id UUID
    REFERENCES public.instructors(id)
    ON DELETE SET NULL,

  capacity INTEGER NOT NULL
    DEFAULT 30
    CHECK (
      capacity > 0
    ),

  status public.course_status NOT NULL
    DEFAULT 'draft',

  created_by UUID
    REFERENCES public.users(id)
    ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now()
);

CREATE UNIQUE INDEX courses_code_unique
ON public.courses (
  lower(code)
);

CREATE INDEX courses_title_index
ON public.courses (
  title
);

CREATE INDEX courses_category_index
ON public.courses (
  category_id
);

CREATE INDEX courses_instructor_index
ON public.courses (
  instructor_id
);

CREATE INDEX courses_status_index
ON public.courses (
  status
);

CREATE TRIGGER courses_set_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- COURSE SCHEDULES
--
-- day_of_week:
-- 1 = Monday
-- 2 = Tuesday
-- 3 = Wednesday
-- 4 = Thursday
-- 5 = Friday
-- 6 = Saturday
-- 7 = Sunday
-- ------------------------------------------------------------

CREATE TABLE public.course_schedules (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  day_of_week INTEGER NOT NULL
    CHECK (
      day_of_week BETWEEN 1 AND 7
    ),

  start_time TIME NOT NULL,

  end_time TIME NOT NULL,

  location VARCHAR(150),

  start_date DATE,

  end_date DATE,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  CONSTRAINT course_schedule_time_check
    CHECK (
      end_time > start_time
    ),

  CONSTRAINT course_schedule_date_check
    CHECK (
      end_date IS NULL
      OR start_date IS NULL
      OR end_date >= start_date
    )
);

CREATE UNIQUE INDEX course_schedules_unique_session
ON public.course_schedules (
  course_id,
  day_of_week,
  start_time,
  end_time,
  COALESCE(start_date, DATE '1900-01-01')
);

CREATE INDEX course_schedules_course_index
ON public.course_schedules (
  course_id
);

CREATE INDEX course_schedules_day_time_index
ON public.course_schedules (
  day_of_week,
  start_time
);

CREATE TRIGGER course_schedules_set_updated_at
BEFORE UPDATE ON public.course_schedules
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- ENROLLMENTS
-- ------------------------------------------------------------

CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  student_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  status public.enrollment_status NOT NULL
    DEFAULT 'enrolled',

  enrolled_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  cancelled_at TIMESTAMPTZ,

  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  CONSTRAINT enrollment_cancelled_at_check
    CHECK (
      status <> 'cancelled'
      OR cancelled_at IS NOT NULL
    ),

  CONSTRAINT enrollment_completed_at_check
    CHECK (
      status <> 'completed'
      OR completed_at IS NOT NULL
    )
);

-- A student can only have one currently active enrollment
-- for the same course.
CREATE UNIQUE INDEX enrollments_active_unique
ON public.enrollments (
  student_id,
  course_id
)
WHERE status = 'enrolled';

CREATE INDEX enrollments_student_index
ON public.enrollments (
  student_id
);

CREATE INDEX enrollments_course_index
ON public.enrollments (
  course_id
);

CREATE INDEX enrollments_status_index
ON public.enrollments (
  status
);

CREATE TRIGGER enrollments_set_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Ensure enrollments can only belong to student accounts.
CREATE OR REPLACE FUNCTION public.validate_enrollment_student()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  account_role public.user_role;
BEGIN
  SELECT role
  INTO account_role
  FROM public.users
  WHERE id = NEW.student_id;

  IF account_role IS NULL THEN
    RAISE EXCEPTION
      'Student account does not exist';
  END IF;

  IF account_role <> 'student' THEN
    RAISE EXCEPTION
      'Only student accounts can enroll in courses';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enrollments_validate_student
BEFORE INSERT OR UPDATE OF student_id
ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.validate_enrollment_student();

-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- ------------------------------------------------------------

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  title VARCHAR(180) NOT NULL
    CHECK (
      char_length(trim(title)) >= 2
    ),

  content TEXT NOT NULL
    CHECK (
      char_length(trim(content)) >= 1
    ),

  audience public.announcement_audience NOT NULL
    DEFAULT 'all',

  status public.announcement_status NOT NULL
    DEFAULT 'draft',

  created_by UUID
    REFERENCES public.users(id)
    ON DELETE SET NULL,

  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  CONSTRAINT announcement_published_at_check
    CHECK (
      status <> 'published'
      OR published_at IS NOT NULL
    )
);

CREATE INDEX announcements_status_index
ON public.announcements (
  status
);

CREATE INDEX announcements_audience_index
ON public.announcements (
  audience
);

CREATE INDEX announcements_published_at_index
ON public.announcements (
  published_at DESC
);

CREATE TRIGGER announcements_set_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
--
-- LearnHub accesses these tables through the Express backend,
-- not directly from the React frontend.
-- ------------------------------------------------------------

ALTER TABLE public.student_profiles
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.categories
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.instructors
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.courses
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.course_schedules
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.enrollments
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.announcements
ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- DOCUMENTATION COMMENTS
-- ------------------------------------------------------------

COMMENT ON TABLE public.student_profiles IS
'Stores additional information for LearnHub student accounts';

COMMENT ON TABLE public.categories IS
'Stores course categories managed by administrators';

COMMENT ON TABLE public.instructors IS
'Stores instructor records assigned to courses';

COMMENT ON TABLE public.courses IS
'Stores LearnHub courses and their capacity and publication status';

COMMENT ON TABLE public.course_schedules IS
'Stores recurring weekly course timetable sessions';

COMMENT ON TABLE public.enrollments IS
'Stores student course enrollment history and current enrollment status';

COMMENT ON TABLE public.announcements IS
'Stores announcements created and published by administrators';
