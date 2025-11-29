-- Create the storage bucket for SOS audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('sos-audio', 'sos-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files to sos-audio bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sos-audio');

-- Policy: Allow authenticated users to read files from sos-audio bucket
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'sos-audio');
