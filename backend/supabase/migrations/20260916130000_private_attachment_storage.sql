-- ============================================================
-- Private attachment storage
--
-- Assignment and submission files were served from a public bucket, and the
-- API returned their permanent public URLs. Anyone who ever obtained one of
-- those links — a forwarded email, browser history, a shared screen — could
-- download a student's submitted work indefinitely, without signing in.
--
-- From here on the bucket is private. The API authorizes each request and
-- hands back a signed URL that expires within a minute.
-- ============================================================

UPDATE storage.buckets
SET public = false
WHERE id = 'assignment-files';

-- The columns held full public URLs. What's needed to sign a download is the
-- object's path within the bucket, so store that instead, and rename the
-- columns so their names stop implying a usable link.
UPDATE public.assignments
SET attachment_url = regexp_replace(attachment_url, '^.*/object/public/assignment-files/', '')
WHERE attachment_url LIKE '%/object/public/assignment-files/%';

UPDATE public.assignment_submissions
SET attachment_url = regexp_replace(attachment_url, '^.*/object/public/assignment-files/', '')
WHERE attachment_url LIKE '%/object/public/assignment-files/%';

ALTER TABLE public.assignments
  RENAME COLUMN attachment_url TO attachment_path;

ALTER TABLE public.assignment_submissions
  RENAME COLUMN attachment_url TO attachment_path;
