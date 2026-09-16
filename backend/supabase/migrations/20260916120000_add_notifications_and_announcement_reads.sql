-- ============================================================
-- In-app notifications
--
-- One row per recipient. Written by the API at the moment something happens
-- (an assignment is posted, a submission graded, a course fills up) and read
-- by polling — there is no push channel, which is enough for a course
-- management system and avoids running a socket server.
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  -- e.g. assignment_posted, submission_graded, submission_received,
  -- announcement_published, student_registered, course_full
  type VARCHAR(50) NOT NULL,

  title VARCHAR(200) NOT NULL,

  body TEXT,

  -- In-app path to open when the notification is clicked. Relative only.
  link VARCHAR(300),

  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL
    DEFAULT now()
);

-- Serves both the bell's unread count and its newest-first list.
CREATE INDEX notifications_user_unread_index
  ON public.notifications (user_id, read_at, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Announcement read state
--
-- Presence of a row means that user has read that announcement. Kept
-- separate from notifications because an announcement is shared content read
-- by many people, not a per-recipient message.
-- ============================================================

CREATE TABLE public.announcement_reads (
  announcement_id UUID NOT NULL
    REFERENCES public.announcements(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  read_at TIMESTAMPTZ NOT NULL
    DEFAULT now(),

  PRIMARY KEY (announcement_id, user_id)
);

CREATE INDEX announcement_reads_user_index
  ON public.announcement_reads (user_id);

ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
