-- ============================================
-- FIX: Admins Cannot View All Reports
-- ============================================
-- This script adds a policy to allow admins to view all reports
-- Run this in Supabase SQL Editor
-- ============================================

-- Add policy for admins to view all reports (verified and unverified)
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'reports'
ORDER BY policyname;
