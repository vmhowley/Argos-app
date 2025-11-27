-- Fix infinite recursion in RLS policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profiles;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;

-- Create a security definer function to check if user is admin
-- This breaks the recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.users_profiles 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the function
CREATE POLICY "Admins can view all profiles"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete reports"
  ON reports FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
