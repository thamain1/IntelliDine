/*
  # Create default admin user

  1. Changes
    - Insert default admin user into admin_users table
    - Set up admin role for the user
*/

-- Insert admin user into admin_users table
INSERT INTO admin_users (id, email, role)
SELECT 
  id,
  email,
  'admin'::user_role
FROM auth.users
WHERE email = '4wardadmin@intellidine.com'
ON CONFLICT (email) DO NOTHING;