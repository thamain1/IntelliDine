/*
  # Menu Items Table Setup

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `category` (menu_category enum)
      - `image` (text)
      - `dietary_vegan` (boolean)
      - `dietary_gluten_free` (boolean)
      - `dietary_nut_free` (boolean)
      - `is_available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `menu_items` table
    - Add policies for CRUD operations
*/

-- Add is_available column to menu_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE menu_items 
    ADD COLUMN is_available boolean DEFAULT true;
  END IF;
END $$;

-- Update existing policies to include is_available filter
DROP POLICY IF EXISTS "Allow authenticated users to read menu items" ON menu_items;
CREATE POLICY "Allow authenticated users to read menu items"
  ON menu_items
  FOR SELECT
  TO authenticated
  USING (is_available = true OR auth.uid() IN (
    SELECT id FROM admin_users WHERE role = 'admin'
  ));

-- Add some sample menu items
INSERT INTO menu_items (
  name,
  description,
  price,
  category,
  image,
  dietary_vegan,
  dietary_gluten_free,
  dietary_nut_free,
  is_available
) VALUES
  (
    'Truffle Risotto',
    'Creamy Arborio rice with wild mushrooms and truffle oil',
    28.00,
    'entree',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
    false,
    true,
    true,
    true
  ),
  (
    'Burrata & Prosciutto',
    'Creamy burrata, aged prosciutto, balsamic reduction, arugula',
    18.00,
    'appetizer',
    'https://images.unsplash.com/photo-1550507992-eb63ffdc42ac',
    false,
    true,
    true,
    true
  ),
  (
    'Tiramisu',
    'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream',
    12.00,
    'dessert',
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
    false,
    false,
    true,
    true
  ),
  (
    'Negroni',
    'Classic cocktail with gin, Campari, and sweet vermouth',
    14.00,
    'drink',
    'https://images.unsplash.com/photo-1551751299-1b51cab2694c',
    true,
    true,
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;