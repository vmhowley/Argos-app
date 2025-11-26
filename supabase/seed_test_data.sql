-- Insert test reports for ArgosApp
-- Run this in your Supabase SQL Editor to add sample data

-- First, you need to get a valid user_id from your auth.users table
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from your Supabase auth

-- Sample reports in Santo Domingo area
INSERT INTO reports (user_id, tipo, lat, lng, descripcion, verificado) VALUES
  ('YOUR_USER_ID_HERE', 'Robo', 18.4861, -69.9312, 'Robo de celular en la esquina', true),
  ('YOUR_USER_ID_HERE', 'Asalto', 18.4901, -69.9402, 'Asalto a mano armada en el parque', true),
  ('YOUR_USER_ID_HERE', 'Homicidio', 18.4821, -69.9252, 'Incidente violento reportado', true),
  ('YOUR_USER_ID_HERE', 'Robo', 18.4951, -69.9362, 'Robo de vehículo estacionado', true),
  ('YOUR_USER_ID_HERE', 'Vandalismo', 18.4881, -69.9332, 'Daño a propiedad privada', true);

-- To get your user_id, first run this query:
-- SELECT id FROM auth.users LIMIT 1;
-- Then replace 'YOUR_USER_ID_HERE' above with the actual ID
