-- Create report_comments table
CREATE TABLE IF NOT EXISTS report_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view comments"
  ON report_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post comments"
  ON report_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS report_comments_report_id_idx ON report_comments(report_id);
CREATE INDEX IF NOT EXISTS report_comments_created_at_idx ON report_comments(created_at DESC);
