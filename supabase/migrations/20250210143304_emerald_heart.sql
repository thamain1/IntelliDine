-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer text NOT NULL,
  items jsonb NOT NULL,
  total numeric NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'delivered', 'cancelled')),
  type text NOT NULL CHECK (type IN ('pickup', 'delivery')),
  address text,
  time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Add indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_time ON orders(time);
CREATE INDEX idx_orders_customer ON orders(customer);

-- Insert sample orders
INSERT INTO orders (customer, items, total, status, type, address, time)
VALUES
  (
    'John Doe',
    '[{"name": "Truffle Risotto", "quantity": 1}, {"name": "Caesar Salad", "quantity": 2}]',
    52.97,
    'preparing',
    'delivery',
    '123 Main St, Anytown, USA',
    now() - interval '30 minutes'
  ),
  (
    'Jane Smith',
    '[{"name": "Margherita Pizza", "quantity": 1}, {"name": "Tiramisu", "quantity": 1}]',
    38.50,
    'new',
    'pickup',
    null,
    now() - interval '15 minutes'
  ),
  (
    'Mike Johnson',
    '[{"name": "Pasta Carbonara", "quantity": 2}, {"name": "Bruschetta", "quantity": 1}]',
    45.00,
    'ready',
    'delivery',
    '456 Oak Ave, Anytown, USA',
    now() - interval '1 hour'
  );