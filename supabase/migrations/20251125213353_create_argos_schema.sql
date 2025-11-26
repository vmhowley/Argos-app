/*
  # Create ARGOS App Schema

  ## New Tables
    
  ### `reports`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to auth.users)
    - `tipo` (text) - Type of crime: Robo, Asalto, Homicidio, Vandalismo
    - `lat` (numeric) - Latitude
    - `lng` (numeric) - Longitude
    - `descripcion` (text) - Description of incident
    - `foto_url` (text, nullable) - Photo URL
    - `folio` (text, nullable) - Police report number
    - `verificado` (boolean) - Verified status
    - `created_at` (timestamptz)
    
  ### `barrios`
    - `id` (uuid, primary key)
    - `nombre` (text) - Neighborhood name
    - `reportes_total` (integer) - Total reports
    - `verificados` (integer) - Verified reports
    - `premio_actual` (text) - Current prize
    - `created_at` (timestamptz)
    
  ### `users_profiles`
    - `id` (uuid, primary key, foreign key to auth.users)
    - `anonimo_id` (text) - Anonymous user ID
    - `reportes_total` (integer) - Total reports by user
    - `reportes_verificados` (integer) - Verified reports by user
    - `barrio` (text) - User's neighborhood
    - `premium` (boolean) - Premium subscription status
    - `recreaciones_usadas` (integer) - AI recreations used
    - `created_at` (timestamptz)

  ## Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('Robo', 'Asalto', 'Homicidio', 'Vandalismo')),
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  descripcion text NOT NULL,
  foto_url text,
  folio text,
  verificado boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create barrios table
CREATE TABLE IF NOT EXISTS barrios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  reportes_total integer DEFAULT 0,
  verificados integer DEFAULT 0,
  premio_actual text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create users_profiles table
CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  anonimo_id text NOT NULL UNIQUE,
  reportes_total integer DEFAULT 0,
  reportes_verificados integer DEFAULT 0,
  barrio text DEFAULT '',
  premium boolean DEFAULT false,
  recreaciones_usadas integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrios ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for reports
CREATE POLICY "Anyone can view verified reports"
  ON reports FOR SELECT
  USING (verificado = true);

CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for barrios
CREATE POLICY "Anyone can view barrios"
  ON barrios FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update barrios"
  ON barrios FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for users_profiles
CREATE POLICY "Users can view own profile"
  ON users_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS reports_tipo_idx ON reports(tipo);
CREATE INDEX IF NOT EXISTS reports_verificado_idx ON reports(verificado);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_location_idx ON reports(lat, lng);