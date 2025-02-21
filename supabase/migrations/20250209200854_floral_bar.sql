/*
  # Update admin credentials

  1. Changes
    - Update admin email to admin@4wardmotion.co
  
  2. Security
    - Maintains existing RLS policies
    - Updates only admin user credentials
*/

-- Update existing admin user email
UPDATE admin_users
SET email = 'admin@4wardmotion.co'
WHERE role = 'admin';

-- Ensure the user exists in admin_users
INSERT INTO admin_users (id, email, role)
SELECT 
  id,
  'admin@4wardmotion.co',
  'admin'::user_role
FROM auth.users
WHERE email = 'admin@4wardmotion.co'
ON CONFLICT (email) DO NOTHING;