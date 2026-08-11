-- backend/supabase/migrations/20260811180000_add_student_profile_details.sql
ALTER TABLE public.student_profiles
  ADD COLUMN address TEXT,
  ADD COLUMN gender VARCHAR(20),
  ADD COLUMN nationality VARCHAR(80);