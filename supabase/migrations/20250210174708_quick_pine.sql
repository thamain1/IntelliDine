/*
  # Vendor Management Schema

  1. New Tables
    - `vendors`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `contact` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `products` (text array)
      - `fulfillment_rate` (numeric)
      - `on_time_delivery` (numeric)
      - `last_order_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `vendor_orders`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, foreign key)
      - `order_date` (timestamptz)
      - `items` (jsonb)
      - `total` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  contact text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  products text[] NOT NULL DEFAULT '{}',
  fulfillment_rate numeric NOT NULL DEFAULT 100 CHECK (fulfillment_rate BETWEEN 0 AND 100),
  on_time_delivery numeric NOT NULL DEFAULT 100 CHECK (on_time_delivery BETWEEN 0 AND 100),
  last_order_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendor orders table
CREATE TABLE IF NOT EXISTS vendor_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  order_date timestamptz NOT NULL DEFAULT now(),
  items jsonb NOT NULL,
  total numeric NOT NULL CHECK (total >= 0),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for vendors table
CREATE POLICY "Allow authenticated users to read vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert vendors"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update vendors"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete vendors"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for vendor_orders table
CREATE POLICY "Allow authenticated users to read vendor orders"
  ON vendor_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert vendor orders"
  ON vendor_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update vendor orders"
  ON vendor_orders
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete vendor orders"
  ON vendor_orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_orders_updated_at
  BEFORE UPDATE ON vendor_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_vendor_orders_vendor_id ON vendor_orders(vendor_id);
CREATE INDEX idx_vendor_orders_status ON vendor_orders(status);
CREATE INDEX idx_vendor_orders_order_date ON vendor_orders(order_date);

-- Insert sample vendors
INSERT INTO vendors (
  name,
  contact,
  email,
  phone,
  address,
  products,
  fulfillment_rate,
  on_time_delivery
) VALUES
  (
    'Fresh Farms Inc.',
    'John Smith',
    'john@freshfarms.com',
    '(555) 123-4567',
    '789 Farm Road, Agricultural Valley, AV 12345',
    ARRAY['Tomatoes', 'Lettuce', 'Onions', 'Fresh Herbs'],
    98.5,
    97.2
  ),
  (
    'Italian Imports Co.',
    'Maria Rossi',
    'maria@italianimports.com',
    '(555) 234-5678',
    '456 Import Drive, Port City, PC 23456',
    ARRAY['Olive Oil', 'Pasta', 'Truffles', 'Parmesan'],
    99.1,
    98.8
  ),
  (
    'Premium Meats',
    'Robert Johnson',
    'robert@premiummeats.com',
    '(555) 345-6789',
    '123 Butcher Lane, Meatpacking District, MD 34567',
    ARRAY['Beef', 'Pork', 'Lamb', 'Veal'],
    97.8,
    96.5
  ),
  (
    'Ocean Fresh Seafood',
    'Sarah Chen',
    'sarah@oceanfresh.com',
    '(555) 456-7890',
    '321 Harbor Road, Seaside, SS 45678',
    ARRAY['Fish', 'Shrimp', 'Lobster', 'Mussels'],
    98.2,
    97.9
  ),
  (
    'Wine & Spirits Ltd.',
    'Pierre Dubois',
    'pierre@winespirits.com',
    '(555) 567-8901',
    '654 Vineyard Ave, Wine Country, WC 56789',
    ARRAY['Red Wine', 'White Wine', 'Spirits', 'Liqueurs'],
    99.5,
    99.2
  );

-- Insert sample vendor orders
WITH sample_orders AS (
  SELECT 
    v.id as vendor_id,
    now() - (random() * interval '30 days') as order_date,
    jsonb_build_array(
      jsonb_build_object(
        'name', v.products[1],
        'quantity', floor(random() * 50 + 10)::int,
        'unit', 'kg'
      )
    ) as items,
    (random() * 1000 + 100)::numeric(10,2) as total,
    (ARRAY['pending', 'confirmed', 'delivered'])[floor(random() * 3 + 1)] as status
  FROM vendors v
  CROSS JOIN generate_series(1, 5)
)
INSERT INTO vendor_orders (vendor_id, order_date, items, total, status)
SELECT vendor_id, order_date, items, total, status
FROM sample_orders;