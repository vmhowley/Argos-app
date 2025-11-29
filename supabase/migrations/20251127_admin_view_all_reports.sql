-- Add policy for admins to view all reports (verified and unverified)
-- This allows admins to see all reports in the system

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
