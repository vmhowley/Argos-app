-- Rename columns in reports table
ALTER TABLE reports RENAME COLUMN tipo TO type;
ALTER TABLE reports RENAME COLUMN descripcion TO description;
ALTER TABLE reports RENAME COLUMN verificado TO is_verified;

-- Rename columns in barrios table
ALTER TABLE barrios RENAME COLUMN nombre TO name;
ALTER TABLE barrios RENAME COLUMN reportes_total TO total_reports;
ALTER TABLE barrios RENAME COLUMN verificados TO verified_count;
ALTER TABLE barrios RENAME COLUMN premio_actual TO current_prize;

-- Rename columns in users_profiles table
ALTER TABLE users_profiles RENAME COLUMN anonimo_id TO anonymous_id;
ALTER TABLE users_profiles RENAME COLUMN reportes_total TO total_reports;
ALTER TABLE users_profiles RENAME COLUMN reportes_verificados TO verified_reports;
ALTER TABLE users_profiles RENAME COLUMN barrio TO neighborhood;
ALTER TABLE users_profiles RENAME COLUMN recreaciones_usadas TO recreations_used;

-- Update indexes if they use old names (Supabase usually handles this if done via RENAME, but let's be safe if they were manual)
-- Dropping and recreating indexes if necessary, though RENAME COLUMN usually updates associated objects.
-- The existing indexes were:
-- reports_tipo_idx ON reports(tipo)
-- reports_verificado_idx ON reports(verificado)

-- Just to be sure, let's refresh them with new names
DROP INDEX IF EXISTS reports_tipo_idx;
DROP INDEX IF EXISTS reports_verificado_idx;
CREATE INDEX IF NOT EXISTS reports_type_idx ON reports(type);
CREATE INDEX IF NOT EXISTS reports_is_verified_idx ON reports(is_verified);
