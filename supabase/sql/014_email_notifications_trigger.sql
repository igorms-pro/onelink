-- Email Notifications Trigger
-- Creates a database trigger that calls the send-notification-email Edge Function
-- 
-- Dependencies:
-- - 002_drops_and_submissions.sql (creates submissions table)
-- - 013_notifications_system.sql (adds read_at column to submissions)
--
-- Safe to run after 013_notifications_system.sql

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create configuration table for email notification settings
CREATE TABLE IF NOT EXISTS public.email_notification_config (
  id text PRIMARY KEY DEFAULT 'default',
  supabase_url text NOT NULL,
  service_role_key text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_notification_config_single_row CHECK (id = 'default')
);

-- Enable RLS (but allow service role to read)
ALTER TABLE public.email_notification_config ENABLE ROW LEVEL SECURITY;

-- Allow service role to read config (needed for trigger)
CREATE POLICY "email_notification_config_service_role_read"
  ON public.email_notification_config
  FOR SELECT
  TO service_role
  USING (true);

-- Allow authenticated users to read (for admin UI if needed)
CREATE POLICY "email_notification_config_authenticated_read"
  ON public.email_notification_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to call Edge Function (via HTTP)
CREATE OR REPLACE FUNCTION public.trigger_send_notification_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_user_id uuid;
  v_supabase_url text;
  v_service_role_key text;
BEGIN
  -- Get profile owner user_id
  SELECT p.user_id INTO v_owner_user_id
  FROM public.drops d
  JOIN public.profiles p ON p.id = d.profile_id
  WHERE d.id = NEW.drop_id;
  
  -- Skip if no owner found
  IF v_owner_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get Supabase URL and service role key from configuration table
  SELECT supabase_url, service_role_key
  INTO v_supabase_url, v_service_role_key
  FROM public.email_notification_config
  WHERE id = 'default'
  LIMIT 1;
  
  -- Skip if configuration not found
  IF v_supabase_url IS NULL OR v_supabase_url = '' OR 
     v_service_role_key IS NULL OR v_service_role_key = '' THEN
    RAISE WARNING 'Email notification trigger: Configuration not found in email_notification_config table. Skipping email notification.';
    RETURN NEW;
  END IF;
  
  -- Call Edge Function via HTTP (non-blocking)
  -- Using pg_net extension for async HTTP requests
  -- The request is fire-and-forget, so errors won't block the INSERT
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := jsonb_build_object(
      'submission_id', NEW.id,
      'user_id', v_owner_user_id
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the INSERT operation
    -- Email notification failures should not prevent submissions from being created
    RAISE WARNING 'Email notification trigger: Failed to call Edge Function: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission to authenticated users and anonymous (for public submissions)
GRANT EXECUTE ON FUNCTION public.trigger_send_notification_email() TO authenticated, anon;

-- Helper function to set email notification configuration (easier than direct INSERT)
CREATE OR REPLACE FUNCTION public.set_email_notification_config(
  p_supabase_url text,
  p_service_role_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.email_notification_config (id, supabase_url, service_role_key)
  VALUES ('default', p_supabase_url, p_service_role_key)
  ON CONFLICT (id) DO UPDATE
  SET supabase_url = EXCLUDED.supabase_url,
      service_role_key = EXCLUDED.service_role_key,
      updated_at = now();
  
  RAISE NOTICE 'Email notification configuration updated successfully';
END;
$$;

-- Grant execute to service_role (for admin/setup scripts)
GRANT EXECUTE ON FUNCTION public.set_email_notification_config(text, text) TO service_role;

-- Create trigger only if submissions table exists
DO $$
BEGIN
  -- Check if submissions table exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'submissions'
  ) THEN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS submissions_send_email_trigger ON public.submissions;
    
    -- Create trigger
    CREATE TRIGGER submissions_send_email_trigger
      AFTER INSERT ON public.submissions
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_send_notification_email();
    
    RAISE NOTICE 'Email notification trigger created successfully on submissions table';
  ELSE
    RAISE WARNING 'submissions table does not exist. Trigger not created. Please run migration 002_drops_and_submissions.sql first.';
  END IF;
END $$;

-- ============================================================================
-- CONFIGURATION INSTRUCTIONS
-- ============================================================================
-- 
-- To enable email notifications, you must configure the Supabase URL and
-- service role key in the email_notification_config table:
--
-- 1. Get your Supabase project URL (e.g., https://xxxxx.supabase.co)
--    - In production: Your project URL from Supabase Dashboard
--    - In local dev: Usually http://localhost:54321
--
-- 2. Get your service role key:
--    - Production: Supabase Dashboard > Settings > API > service_role key
--    - Local dev: From your .env file (SUPABASE_SERVICE_ROLE_KEY)
--
-- 3. Set the configuration using the helper function (recommended):
--
--    SELECT public.set_email_notification_config(
--      'https://your-project-ref.supabase.co',
--      'your-service-role-key'
--    );
--
--    Or insert directly:
--
--    INSERT INTO public.email_notification_config (id, supabase_url, service_role_key)
--    VALUES ('default', 'https://your-project-ref.supabase.co', 'your-service-role-key')
--    ON CONFLICT (id) DO UPDATE
--    SET supabase_url = EXCLUDED.supabase_url,
--        service_role_key = EXCLUDED.service_role_key,
--        updated_at = now();
--
-- Example for local development:
--    SELECT public.set_email_notification_config(
--      'http://localhost:54321',
--      'your-local-service-role-key'
--    );
--
-- Note: The configuration is stored in a table, making it easy to update
-- without needing database-level settings. Only one row (id='default') is allowed.
