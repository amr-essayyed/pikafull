-- Insert a known owner user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'owner@sparkleclean.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Owner","role":"owner"}',
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET 
  encrypted_password = crypt('Admin123!', gen_salt('bf')),
  email_confirmed_at = now();

-- Ensure profile exists
INSERT INTO public.profiles (id, full_name, email, role, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Owner',
  'owner@sparkleclean.com',
  'owner',
  true
) ON CONFLICT (id) DO UPDATE SET role = 'owner';
