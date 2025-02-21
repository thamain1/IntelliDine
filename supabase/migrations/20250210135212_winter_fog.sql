/*
  # Create inventory management tables

  1. New Tables
    - `inventory`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `quantity` (numeric)
      - `unit` (text)
      - `unit_cost` (numeric)
      - `supplier` (text)
      - `reorder_point` (numeric)
      - `expiration_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `inventory` table
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  quantity numeric NOT NULL CHECK (quantity >= 0),
  unit text NOT NULL,
  unit_cost numeric NOT NULL CHECK (unit_cost >= 0),
  supplier text NOT NULL,
  reorder_point numeric NOT NULL CHECK (reorder_point >= 0),
  expiration_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read inventory"
  ON inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert inventory"
  ON inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update inventory"
  ON inventory
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete inventory"
  ON inventory
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();