-- Create inventory table if it doesn't exist
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

-- Enable RLS if not already enabled
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to read inventory" ON inventory;
  DROP POLICY IF EXISTS "Allow authenticated users to insert inventory" ON inventory;
  DROP POLICY IF EXISTS "Allow authenticated users to update inventory" ON inventory;
  DROP POLICY IF EXISTS "Allow authenticated users to delete inventory" ON inventory;
END $$;

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

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_updated_at();

-- Drop and recreate indexes
DROP INDEX IF EXISTS idx_inventory_name;
DROP INDEX IF EXISTS idx_inventory_supplier;
DROP INDEX IF EXISTS idx_inventory_expiration_date;

CREATE INDEX idx_inventory_name ON inventory(name);
CREATE INDEX idx_inventory_supplier ON inventory(supplier);
CREATE INDEX idx_inventory_expiration_date ON inventory(expiration_date);