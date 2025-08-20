/*
  # Fix Profiles Schema and Authentication Issues

  1. Schema Updates
    - Add email column to profiles table if missing
    - Update existing profiles with email data
    - Add proper constraints and indexes
    
  2. Security Updates
    - Fix RLS policies to prevent "multiple rows returned" errors
    - Add helper function for safe profile operations
    - Update trigger function for new user creation
    
  3. Performance Improvements
    - Add proper indexes for better query performance
    - Optimize profile lookup operations
*/

-- First, ensure the email column exists with proper configuration
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Update existing profiles with email from auth.users if email is null
UPDATE profiles 
SET email = COALESCE(
  (SELECT email FROM auth.users WHERE auth.users.id = profiles.user_id),
  split_part((SELECT email FROM auth.users WHERE auth.users.id = profiles.user_id), '@', 1) || '@example.com'
)
WHERE email IS NULL OR email = '';

-- Make email NOT NULL after updating existing records
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Drop existing constraints properly (constraint first, then dependent indexes)
DO $$
BEGIN
  -- Drop unique constraint if it exists (this will also drop the dependent index)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
  END IF;
END $$;

-- Drop any remaining indexes
DROP INDEX IF EXISTS profiles_email_idx;
DROP INDEX IF EXISTS profiles_user_id_idx;

-- Add unique constraint on email
DO $$
BEGIN
  BEGIN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  EXCEPTION
    WHEN duplicate_table THEN
      -- Constraint already exists, ignore
      NULL;
    WHEN others THEN
      -- Log other errors but continue
      RAISE WARNING 'Could not add email unique constraint: %', SQLERRM;
  END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);

-- Drop and recreate RLS policies to fix the "multiple rows returned" issue
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new RLS policies with proper syntax
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
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate key errors
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a function to safely get or create user profile
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
BEGIN
  -- Try to get existing profile
  RETURN QUERY
  SELECT p.id, p.user_id, p.name, p.email, p.avatar_url, p.created_at, p.updated_at
  FROM profiles p
  WHERE p.user_id = user_uuid;
  
  -- If no profile found, create one
  IF NOT FOUND THEN
    INSERT INTO profiles (user_id, name, email)
    SELECT 
      user_uuid,
      COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
      au.email
    FROM auth.users au
    WHERE au.id = user_uuid
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Return the newly created profile
    RETURN QUERY
    SELECT p.id, p.user_id, p.name, p.email, p.avatar_url, p.created_at, p.updated_at
    FROM profiles p
    WHERE p.user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_profile(uuid) TO authenticated;