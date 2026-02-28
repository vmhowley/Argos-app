-- Remove the CHECK constraint on type that prevents real report types from being inserted.
-- The original constraint was on 'tipo' but was renamed to 'type'. The constraint name usually retains the original column name unless explicitly renamed.
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_tipo_check;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_type_check;

-- Add missing columns that the frontend reportService.ts expects
ALTER TABLE reports ADD COLUMN IF NOT EXISTS confirmations integer DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS has_photo boolean DEFAULT false;
