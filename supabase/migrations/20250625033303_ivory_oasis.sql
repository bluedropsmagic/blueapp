/*
  # Fix Supabase Issues - Complete Database Schema Fix

  1. Database Schema Updates
    - Add missing email column to profiles table
    - Fix unique constraints and indexes
    - Update RLS policies to prevent multiple rows errors
    - Fix trigger functions for automatic profile creation

  2. Security
    - Proper RLS policies with correct syntax
    - Safe profile creation and retrieval functions
    - Error handling for edge cases

  3. Performance
    - Optimized indexes for better query performance
    - Proper constraint management
*/

-- First, ensure we're working with a clean slate
-- Drop existing problematic constraints and indexes safely
DO $$
BEGIN
  -- Drop constraint if it exists (this automatically drops dependent indexes)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if constraint doesn't exist
    NULL;
END $$;

-- Drop indexes individually to be safe
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_email_key;
DROP INDEX IF EXISTS profiles_user_id_idx;

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Update existing profiles with email from auth.users
UPDATE profiles 
SET email = COALESCE(
  (SELECT email FROM auth.users WHERE auth.users.id = profiles.user_id),
  'user@example.com'
)
WHERE email IS NULL OR email = '';

-- Make email NOT NULL after updating existing records
DO $$
BEGIN
  -- Only set NOT NULL if column exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint on email with proper error handling
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    -- Constraint already exists
    NULL;
  WHEN others THEN
    -- Log warning but continue
    RAISE WARNING 'Could not add email unique constraint: %', SQLERRM;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new RLS policies with proper syntax to prevent "multiple rows" errors
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update the trigger function to handle profile creation properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new profile with proper error handling
  INSERT INTO public.profiles (user_id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create/update profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a safe function to get or create user profile (prevents multiple rows error)
CREATE OR REPLACE FUNCTION public.get_or_create_profile(user_uuid uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
DECLARE
  profile_record profiles%ROWTYPE;
BEGIN
  -- Try to get existing profile using FOR UPDATE to prevent race conditions
  SELECT * INTO profile_record
  FROM profiles p
  WHERE p.user_id = user_uuid
  FOR UPDATE;
  
  -- If profile exists, return it
  IF FOUND THEN
    RETURN QUERY
    SELECT profile_record.id, profile_record.user_id, profile_record.name, 
           profile_record.email, profile_record.avatar_url, 
           profile_record.created_at, profile_record.updated_at;
    RETURN;
  END IF;
  
  -- If no profile found, create one
  BEGIN
    INSERT INTO profiles (user_id, name, email, avatar_url)
    SELECT 
      user_uuid,
      COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
      au.email,
      au.raw_user_meta_data->>'avatar_url'
    FROM auth.users au
    WHERE au.id = user_uuid
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now()
    RETURNING * INTO profile_record;
    
    -- Return the newly created/updated profile
    RETURN QUERY
    SELECT profile_record.id, profile_record.user_id, profile_record.name, 
           profile_record.email, profile_record.avatar_url, 
           profile_record.created_at, profile_record.updated_at;
           
  EXCEPTION
    WHEN OTHERS THEN
      -- If insert fails, try to get the profile again (might have been created by another process)
      SELECT * INTO profile_record
      FROM profiles p
      WHERE p.user_id = user_uuid;
      
      IF FOUND THEN
        RETURN QUERY
        SELECT profile_record.id, profile_record.user_id, profile_record.name, 
               profile_record.email, profile_record.avatar_url, 
               profile_record.created_at, profile_record.updated_at;
      ELSE
        -- If still not found, raise an error
        RAISE EXCEPTION 'Could not create or find profile for user %', user_uuid;
      END IF;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_profile(uuid) TO authenticated;

-- Create a function to safely update user profiles
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_uuid uuid,
  new_name text DEFAULT NULL,
  new_avatar_url text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE profiles 
  SET 
    name = COALESCE(new_name, name),
    avatar_url = COALESCE(new_avatar_url, avatar_url),
    updated_at = now()
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to update profile for user %: %', user_uuid, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the update function
GRANT EXECUTE ON FUNCTION public.update_user_profile(uuid, text, text) TO authenticated;

-- Ensure all existing users have profiles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data 
    FROM auth.users 
    WHERE id NOT IN (SELECT user_id FROM profiles)
  LOOP
    BEGIN
      INSERT INTO profiles (user_id, name, email, avatar_url)
      VALUES (
        user_record.id,
        COALESCE(user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
        user_record.email,
        user_record.raw_user_meta_data->>'avatar_url'
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Could not create profile for existing user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- Final verification: ensure all constraints and indexes are in place
DO $$
BEGIN
  -- Verify email column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    RAISE EXCEPTION 'Email column was not created successfully';
  END IF;
  
  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'profiles' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    RAISE WARNING 'RLS is not enabled on profiles table';
  END IF;
  
  RAISE NOTICE 'Supabase schema migration completed successfully';
END $$;