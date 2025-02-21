-- Insert sample inventory data with past dates
DO $$
DECLARE
  inventory_items jsonb[] := array[
    '{"name": "Fresh Tomatoes", "quantity": 45, "unit": "kg", "unit_cost": 3.50, "supplier": "Local Farms Co", "reorder_point": 20, "expiration_date": "2024-03-15"}'::jsonb,
    '{"name": "Mozzarella", "quantity": 25, "unit": "kg", "unit_cost": 12.00, "supplier": "Dairy Delights", "reorder_point": 15, "expiration_date": "2024-03-10"}'::jsonb,
    '{"name": "Olive Oil", "quantity": 30, "unit": "l", "unit_cost": 15.00, "supplier": "Mediterranean Imports", "reorder_point": 10, "expiration_date": "2024-06-20"}'::jsonb,
    '{"name": "Basil", "quantity": 8, "unit": "kg", "unit_cost": 4.00, "supplier": "Fresh Herbs Inc", "reorder_point": 5, "expiration_date": "2024-02-28"}'::jsonb,
    '{"name": "Flour 00", "quantity": 100, "unit": "kg", "unit_cost": 2.50, "supplier": "Italian Mills", "reorder_point": 50, "expiration_date": "2024-05-15"}'::jsonb,
    '{"name": "Parmesan", "quantity": 15, "unit": "kg", "unit_cost": 25.00, "supplier": "Cheese Artisans", "reorder_point": 8, "expiration_date": "2024-04-10"}'::jsonb,
    '{"name": "Garlic", "quantity": 12, "unit": "kg", "unit_cost": 5.00, "supplier": "Local Farms Co", "reorder_point": 8, "expiration_date": "2024-03-20"}'::jsonb,
    '{"name": "San Marzano Tomatoes", "quantity": 40, "unit": "can", "unit_cost": 4.50, "supplier": "Italian Imports", "reorder_point": 20, "expiration_date": "2024-12-31"}'::jsonb,
    '{"name": "Arborio Rice", "quantity": 35, "unit": "kg", "unit_cost": 6.00, "supplier": "Gourmet Grains", "reorder_point": 20, "expiration_date": "2024-08-15"}'::jsonb,
    '{"name": "Fresh Mushrooms", "quantity": 18, "unit": "kg", "unit_cost": 8.00, "supplier": "Forest Foods", "reorder_point": 10, "expiration_date": "2024-02-25"}'::jsonb
  ];
  item jsonb;
  days integer;
BEGIN
  FOR i IN 1..array_length(inventory_items, 1) LOOP
    item := inventory_items[i];
    days := 30 - (i * 3); -- Spread out the created_at dates
    
    INSERT INTO inventory (
      name,
      quantity,
      unit,
      unit_cost,
      supplier,
      reorder_point,
      expiration_date,
      created_at
    )
    VALUES (
      (item->>'name')::text,
      (item->>'quantity')::numeric,
      (item->>'unit')::text,
      (item->>'unit_cost')::numeric,
      (item->>'supplier')::text,
      (item->>'reorder_point')::numeric,
      (item->>'expiration_date')::date,
      now() - (days || ' days')::interval
    )
    ON CONFLICT (name) DO UPDATE SET
      quantity = EXCLUDED.quantity,
      unit = EXCLUDED.unit,
      unit_cost = EXCLUDED.unit_cost,
      supplier = EXCLUDED.supplier,
      reorder_point = EXCLUDED.reorder_point,
      expiration_date = EXCLUDED.expiration_date,
      updated_at = now();
  END LOOP;
END $$;

-- Insert additional historical orders with varying dates and statuses
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