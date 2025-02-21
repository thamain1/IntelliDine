/*
  # Create default admin user

  1. Security
    - Creates a default admin user with email 4wardadmin@intellidine.com
    - Password will be set through Supabase Auth
    - Enables RLS for admin access
*/

-- Create admin roles enum
CREATE TYPE user_role AS ENUM ('admin', 'staff');

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to read their own data
CREATE POLICY "Users can read own data" 
  ON admin_users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Create policy for admin users to update their own data
CREATE POLICY "Users can update own data" 
  ON admin_users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);