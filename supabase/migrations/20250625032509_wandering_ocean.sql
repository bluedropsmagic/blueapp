/*
  # Add email column to profiles table

  1. Changes
    - Add `email` column to `profiles` table
    - Set email as NOT NULL with a default empty string for existing records
    - Add unique constraint on email column
    - Update existing records to use email from auth.users if available

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update existing profiles with email from auth.users
UPDATE profiles 
SET email = COALESCE(
  (SELECT email FROM auth.users WHERE auth.users.id = profiles.user_id),
  ''
)
WHERE email IS NULL;

-- Set email as NOT NULL after updating existing records
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_email_key' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Add index on email for better query performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);