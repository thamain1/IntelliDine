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

-- Insert additional historical orders with varying patterns
DO $$
DECLARE
  menu_items jsonb[] := ARRAY[
    '[{"name": "Truffle Risotto", "quantity": 1}, {"name": "Caesar Salad", "quantity": 2}]'::jsonb,
    '[{"name": "Margherita Pizza", "quantity": 1}, {"name": "Tiramisu", "quantity": 1}]'::jsonb,
    '[{"name": "Pasta Carbonara", "quantity": 2}, {"name": "Bruschetta", "quantity": 1}]'::jsonb,
    '[{"name": "Osso Buco", "quantity": 1}, {"name": "Wine", "quantity": 2}]'::jsonb,
    '[{"name": "Seafood Risotto", "quantity": 2}, {"name": "Tiramisu", "quantity": 2}]'::jsonb,
    '[{"name": "Burrata & Prosciutto", "quantity": 1}, {"name": "Negroni", "quantity": 2}]'::jsonb,
    '[{"name": "Linguine alle Vongole", "quantity": 1}, {"name": "Aperol Spritz", "quantity": 2}]'::jsonb,
    '[{"name": "Filetto di Manzo", "quantity": 2}, {"name": "Barolo", "quantity": 1}]'::jsonb
  ];
  customer_names text[] := ARRAY[
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Robert Brown',
    'Emily Davis', 'Michael Lee', 'Lisa Anderson', 'David Martinez', 'Jennifer Taylor',
    'William Turner', 'Emma White', 'James Miller', 'Sophia Garcia', 'Daniel Clark'
  ];
  order_types text[] := ARRAY['pickup', 'delivery'];
  i integer;
  random_days integer;
  random_hours integer;
  random_customer text;
  random_items jsonb;
  random_total numeric;
  random_type text;
  random_address text;
BEGIN
  -- Insert orders for the past 90 days with varying patterns
  FOR i IN 1..300 LOOP
    random_days := floor(random() * 90);
    random_hours := floor(random() * 24);
    random_customer := customer_names[floor(random() * array_length(customer_names, 1) + 1)];
    random_items := menu_items[floor(random() * array_length(menu_items, 1) + 1)];
    -- Vary the total amount based on the day of the week to create realistic patterns
    random_total := CASE 
      WHEN EXTRACT(DOW FROM (now() - (random_days || ' days')::interval)) IN (5, 6) THEN
        -- Higher totals on weekends
        (80 + floor(random() * 120))::numeric
      ELSE
        -- Normal totals on weekdays
        (50 + floor(random() * 80))::numeric
    END;
    random_type := order_types[floor(random() * array_length(order_types, 1) + 1)];
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

    -- Insert with all orders marked as 'delivered' since they're historical
    INSERT INTO orders (
      customer,
      items,
      total,
      status,
      type,
      address,
      time,
      created_at,
      updated_at
    ) VALUES (
      random_customer,
      random_items,
      random_total,
      'delivered',
      random_type,
      random_address,
      now() - (random_days || ' days')::interval - (random_hours || ' hours')::interval,
      now() - (random_days || ' days')::interval - (random_hours || ' hours')::interval,
      now() - (random_days || ' days')::interval
    );
  END LOOP;
END $$;