-- Email Rate Limiting Improvement
-- Adds last_email_sent_at column to drops table for precise rate limiting
-- Safe to run after 014_email_notifications_trigger.sql

-- Add column to track last email sent time per drop
ALTER TABLE public.drops
ADD COLUMN IF NOT EXISTS last_email_sent_at timestamptz;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS drops_last_email_sent_at_idx 
ON public.drops(last_email_sent_at);

-- Comment explaining the column
COMMENT ON COLUMN public.drops.last_email_sent_at IS 
'Timestamp of the last email notification sent for this drop. Used for rate limiting (max 1 email per 5 minutes per drop).';
