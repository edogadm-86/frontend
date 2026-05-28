-- Migration: add email verification fields
-- Existing users get email_verified = TRUE so they are not affected.
-- New users registered after this migration will be inserted with email_verified = FALSE
-- and must verify their email before accessing the app.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verification_token_expiry TIMESTAMPTZ;
