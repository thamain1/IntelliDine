/*
  # Create authentication user

  1. Changes
    - Creates admin user in auth.users table with proper credentials
    - Sets up proper authentication settings
  
  2. Security
    - Creates user with encrypted password
    - Sets email as confirmed
*/

-- Create the admin user in auth.users if it doesn't exist
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@4wardmotion.co'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@4wardmotion.co',
      crypt('intellidinedemo', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO new_user_id;

    -- Update admin_users table with the new user
    INSERT INTO admin_users (id, email, role)
    VALUES (new_user_id, 'admin@4wardmotion.co', 'admin')
    ON CONFLICT (email) DO UPDATE
    SET id = new_user_id;
  END IF;
END $$;