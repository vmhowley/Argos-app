-- ============================================
-- FIX: Duplicate User Profiles Issue
-- ============================================
-- This script fixes the duplicate user profiles problem
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Clean up duplicate profiles
-- Keep only the oldest profile for each user_id
DELETE FROM public.users_profiles
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at ASC) as rn
    FROM public.users_profiles
  ) t
  WHERE t.rn > 1
);

-- STEP 2: Fix the trigger function to prevent future duplicates
-- Drop and recreate with ON CONFLICT handling
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Use ON CONFLICT DO NOTHING to prevent duplicate inserts
  -- This ensures that if a profile already exists, it won't create another one
  INSERT INTO public.users_profiles (id, anonimo_id, role)
  VALUES (
    new.id, 
    'Usuario_' || substr(new.id::text, 1, 8),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Ensure we only have one trigger
-- Drop and recreate to avoid duplicate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STEP 4: Verify the fix
-- This query should show you the current state
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT id) as unique_users,
  COUNT(*) - COUNT(DISTINCT id) as duplicates
FROM public.users_profiles;

-- If duplicates = 0, the cleanup was successful!
