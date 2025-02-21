-- Create orders table if it doesn't exist
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to read orders" ON orders;
  DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON orders;
  DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;
END $$;

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

-- Create updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION update_orders_updated_at();
  END IF;
END $$;

-- Add indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_orders_status'
  ) THEN
    CREATE INDEX idx_orders_status ON orders(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_orders_time'
  ) THEN
    CREATE INDEX idx_orders_time ON orders(time);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_orders_customer'
  ) THEN
    CREATE INDEX idx_orders_customer ON orders(customer);
  END IF;
END $$;

-- Insert sample orders for the last 30 days
DO $$
DECLARE
  menu_items jsonb[] := ARRAY[
    '[{"name": "Truffle Risotto", "quantity": 1}, {"name": "Caesar Salad", "quantity": 2}]'::jsonb,
    '[{"name": "Margherita Pizza", "quantity": 1}, {"name": "Tiramisu", "quantity": 1}]'::jsonb,
    '[{"name": "Pasta Carbonara", "quantity": 2}, {"name": "Bruschetta", "quantity": 1}]'::jsonb,
    '[{"name": "Osso Buco", "quantity": 1}, {"name": "Wine", "quantity": 2}]'::jsonb,
    '[{"name": "Seafood Risotto", "quantity": 2}, {"name": "Tiramisu", "quantity": 2}]'::jsonb
  ];
  customer_names text[] := ARRAY[
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Robert Brown',
    'Emily Davis', 'Michael Lee', 'Lisa Anderson', 'David Martinez', 'Jennifer Taylor'
  ];
  order_types text[] := ARRAY['pickup', 'delivery'];
  statuses text[] := ARRAY['new', 'preparing', 'ready', 'delivered'];
  i integer;
  random_days integer;
  random_hours integer;
  random_customer text;
  random_items jsonb;
  random_total numeric;
  random_type text;
  random_status text;
  random_address text;
BEGIN
  FOR i IN 1..100 LOOP
    random_days := floor(random() * 30);
    random_hours := floor(random() * 24);
    random_customer := customer_names[floor(random() * array_length(customer_names, 1) + 1)];
    random_items := menu_items[floor(random() * array_length(menu_items, 1) + 1)];
    random_total := (50 + floor(random() * 150))::numeric;
    random_type := order_types[floor(random() * array_length(order_types, 1) + 1)];
    random_status := statuses[floor(random() * array_length(statuses, 1) + 1)];
    random_address := CASE 
      WHEN random_type = 'delivery' 
      THEN (floor(random() * 999 + 1)::text || ' ' || 
            CASE floor(random() * 4 + 1)::integer
              WHEN 1 THEN 'Main'
              WHEN 2 THEN 'Oak'
              WHEN 3 THEN 'Maple'
              ELSE 'Cedar'
            END || ' ' ||
            CASE floor(random() * 3 + 1)::integer
              WHEN 1 THEN 'Street'
              WHEN 2 THEN 'Avenue'
              ELSE 'Road'
            END || ', Anytown, USA')
      ELSE null
    END;

    INSERT INTO orders (
      customer,
      items,
      total,
      status,
      type,
      address,
      time
    ) VALUES (
      random_customer,
      random_items,
      random_total,
      random_status,
      random_type,
      random_address,
      now() - (random_days || ' days')::interval - (random_hours || ' hours')::interval
    );
  END LOOP;
END $$;