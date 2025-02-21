/*
  # Labor Management Tables Setup

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text)
      - `hourly_rate` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `employee_schedules`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `day_of_week` (integer)
      - `start_time` (time)
      - `end_time` (time)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  hourly_rate numeric(10,2) NOT NULL CHECK (hourly_rate >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employee schedules table
CREATE TABLE IF NOT EXISTS employee_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Allow authenticated users to read employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert employees"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

CREATE POLICY "Allow authenticated users to update employees"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

CREATE POLICY "Allow authenticated users to delete employees"
  ON employees
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

-- Create policies for employee_schedules table
CREATE POLICY "Allow authenticated users to read schedules"
  ON employee_schedules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert schedules"
  ON employee_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

CREATE POLICY "Allow authenticated users to update schedules"
  ON employee_schedules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

CREATE POLICY "Allow authenticated users to delete schedules"
  ON employee_schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

-- Insert sample employees
INSERT INTO employees (name, role, hourly_rate) VALUES
  ('Marco Rossi', 'Executive Chef', 50.00),
  ('Lucia Bianchi', 'Sous Chef', 40.00),
  ('Giovanni Esposito', 'Line Cook', 30.00),
  ('Sophia Romano', 'Pastry Chef', 35.00),
  ('Alessandro Bruno', 'Bartender', 30.00)
ON CONFLICT DO NOTHING;

-- Insert sample schedules
WITH emp AS (SELECT id, name FROM employees)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  emp.id,
  day_of_week,
  time '14:00',
  time '22:00'
FROM emp
CROSS JOIN (
  VALUES 
    (1),
    (2),
    (3),
    (4),
    (5)
) AS shifts(day_of_week)
WHERE emp.name = 'Marco Rossi'
ON CONFLICT DO NOTHING;