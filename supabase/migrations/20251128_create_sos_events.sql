CREATE TABLE IF NOT EXISTS public.sos_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  audio_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own records
CREATE POLICY "Allow insert for authenticated users"
  ON public.sos_events
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to select their own records
CREATE POLICY "Allow select for authenticated users"
  ON public.sos_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
