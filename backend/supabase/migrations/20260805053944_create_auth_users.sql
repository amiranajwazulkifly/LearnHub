-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Roles available in LearnHub
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'instructor',
  'student'
);

-- Account statuses
CREATE TYPE public.user_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

-- Main application users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name VARCHAR(120) NOT NULL
    CHECK (char_length(trim(full_name)) >= 2),

  email VARCHAR(255) NOT NULL,

  password_hash TEXT NOT NULL,

  role public.user_role NOT NULL DEFAULT 'student',

  status public.user_status NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate emails regardless of uppercase/lowercase
CREATE UNIQUE INDEX users_email_unique_index
ON public.users (lower(email));

-- Automatically update updated_at whenever a user is modified
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Protect the table from direct frontend/PostgREST access.
-- The Express backend will access PostgreSQL directly.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.users IS
'Stores LearnHub application accounts used by the Express authentication system';

COMMENT ON COLUMN public.users.password_hash IS
'Stores bcrypt password hashes only; never stores plain-text passwords';
