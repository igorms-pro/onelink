-- Fix user_2fa.backup_codes type mismatch
-- The code stores encrypted backup codes as a single text string (encrypted JSON array)
-- But the table was defined as text[] (array)
-- This migration fixes the type to match the code

-- Change backup_codes from text[] to text
alter table public.user_2fa 
  alter column backup_codes type text using backup_codes::text;

-- If the above fails (if there's data), we need to convert it:
-- First, let's check if we can safely convert
do $$
begin
  -- Try to alter the column type
  -- If backup_codes contains arrays, convert them to JSON string
  -- If it's already text, keep it as is
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'user_2fa' 
      and column_name = 'backup_codes'
      and data_type = 'ARRAY'
  ) then
    -- Convert existing array data to text (if any exists)
    -- This assumes arrays are stored as JSON-like strings
    alter table public.user_2fa 
      alter column backup_codes type text 
      using case 
        when backup_codes is null then null
        when array_length(backup_codes, 1) is null then '[]'
        else array_to_json(backup_codes)::text
      end;
  end if;
end $$;

-- Update the default to be an empty string instead of empty array
alter table public.user_2fa 
  alter column backup_codes set default '';

-- Add a comment to document the format
comment on column public.user_2fa.backup_codes is 
  'Encrypted JSON array of backup codes stored as a single text string. Use decryptArray() to decrypt.';

