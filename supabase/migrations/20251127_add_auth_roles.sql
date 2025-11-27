-- Add role column to users_profiles
ALTER TABLE users_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create a trigger to automatically create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, anonimo_id, role)
  VALUES (
    new.id, 
    'Usuario_' || substr(new.id::text, 1, 8),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies to respect roles

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM users_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON reports FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM users_profiles WHERE id = auth.uid()) = 'admin'
  );
