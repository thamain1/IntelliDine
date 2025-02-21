/*
  # Create admin user

  1. Changes
    - Creates admin user with specified credentials
    - Ensures user exists in admin_users table
  
  2. Security
    - Maintains existing RLS policies
    - Creates admin user with proper role
*/

-- Create the admin user if it doesn't exist
DO $$
BEGIN
  -- First, ensure the user exists in auth.users
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@4wardmotion.co'
  ) THEN
    -- Insert the user into auth.users
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      role
    )
    VALUES (
      'admin@4wardmotion.co',
      crypt('intellidinedemo', gen_salt('bf')),
      now(),
      'authenticated'
    );
  END IF;

  -- Then ensure the user exists in admin_users
  INSERT INTO admin_users (id, email, role)
  SELECT 
    id,
    'admin@4wardmotion.co',
    'admin'::user_role
  FROM auth.users
  WHERE email = 'admin@4wardmotion.co'
  ON CONFLICT (email) DO NOTHING;
END $$;