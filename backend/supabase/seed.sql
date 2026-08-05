
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
