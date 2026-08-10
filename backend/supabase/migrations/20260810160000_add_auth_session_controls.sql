-- Tokens issued before this timestamp are rejected by authMiddleware, even
-- if they haven't naturally expired yet. Bumped on logout, password change,
-- and admin-triggered password resets so old tokens stop working immediately
-- instead of staying valid until their JWT expiry.
ALTER TABLE public.users
  ADD COLUMN token_valid_after TIMESTAMPTZ NOT NULL DEFAULT now();

-- Self-service "forgot password" flow. Only a bcrypt hash of the reset
-- token is stored (never the raw token), mirroring how password_hash is
-- handled. A NULL expiry means no reset is currently pending.
ALTER TABLE public.users
  ADD COLUMN reset_token_hash TEXT,
  ADD COLUMN reset_token_expires_at TIMESTAMPTZ;
