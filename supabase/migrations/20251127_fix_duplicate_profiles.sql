-- Fix duplicate user profiles issue
-- This migration updates the trigger function to prevent duplicate profile creation

-- Drop and recreate the trigger function with ON CONFLICT handling
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Use ON CONFLICT DO NOTHING to prevent duplicate inserts
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

-- Ensure we only have one trigger (drop and recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
