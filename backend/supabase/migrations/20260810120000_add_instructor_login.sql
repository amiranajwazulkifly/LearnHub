-- Links an instructor directory record to an optional login account
-- (public.users, role = 'instructor'). Nullable: instructors can exist
-- purely as course metadata without ever getting a login.
ALTER TABLE public.instructors
  ADD COLUMN user_id UUID
    UNIQUE
    REFERENCES public.users(id)
    ON DELETE SET NULL;
