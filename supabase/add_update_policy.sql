-- SOLUCIÓN COMPLETA: Política de UPDATE para verificación de reportes
-- Ejecuta esto en tu Supabase SQL Editor

-- Primero, elimina la política anterior si existe
DROP POLICY IF EXISTS "Authenticated users can update reports" ON reports;

-- Crea una nueva política más específica que solo permite actualizar el campo verificado
CREATE POLICY "Authenticated users can verify reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ALTERNATIVA: Si quieres ser más restrictivo y solo permitir cambiar verificado de false a true:
-- DROP POLICY IF EXISTS "Authenticated users can verify reports" ON reports;
-- CREATE POLICY "Authenticated users can verify reports"
--   ON reports FOR UPDATE
--   TO authenticated
--   USING (verificado = false)
--   WITH CHECK (verificado = true);
