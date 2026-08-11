-- ============================================================
-- Assignments (instructor-created course tasks, Google Classroom style)
-- ============================================================

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  course_id UUID NOT NULL
    REFERENCES public.courses(id)
    ON DELETE CASCADE,

  created_by UUID
    REFERENCES public.users(id)
    ON DELETE SET NULL,

  title VARCHAR(180) NOT NULL
    CHECK (
      char_length(trim(title)) >= 2
    ),

  description TEXT,

  points INTEGER
    CHECK (
      points IS NULL OR points > 0
    ),

  due_at TIMESTAMPTZ,

  attachment_url TEXT,
  attachment_name TEXT,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now()
);

CREATE INDEX assignments_course_id_index
  ON public.assignments(course_id);

-- ============================================================
-- Assignment submissions (one per student per assignment; a resubmit
-- overwrites the existing row rather than creating a new one)
-- ============================================================

CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  assignment_id UUID NOT NULL
    REFERENCES public.assignments(id)
    ON DELETE CASCADE,

  student_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  submission_text TEXT,
  submission_link TEXT,
  attachment_url TEXT,
  attachment_name TEXT,

  submitted_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  grade NUMERIC
    CHECK (
      grade IS NULL OR grade >= 0
    ),

  feedback TEXT,

  graded_at TIMESTAMPTZ,

  graded_by UUID
    REFERENCES public.users(id)
    ON DELETE SET NULL,

  updated_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  UNIQUE (assignment_id, student_id)
);

CREATE INDEX assignment_submissions_assignment_id_index
  ON public.assignment_submissions(assignment_id);

CREATE INDEX assignment_submissions_student_id_index
  ON public.assignment_submissions(student_id);

-- ============================================================
-- Storage bucket for assignment/submission file attachments.
-- Public bucket: the Express backend (service-role key) is the only
-- writer, and file URLs are only ever handed out by the API after an
-- auth/enrollment check, so a public read bucket is fine here — this app
-- doesn't use Supabase Auth/RLS for anything else either.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', true)
ON CONFLICT (id) DO NOTHING;
