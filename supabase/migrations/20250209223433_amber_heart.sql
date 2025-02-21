/*
  # Add Menu Items and Name Constraint

  1. Changes
    - Adds unique constraint on menu_items name
    - Inserts new menu items with categories and dietary information
    - Preserves existing items using ON CONFLICT

  2. Notes
    - Ensures no duplicate menu items by name
    - Uses industry-standard pricing and categorization
*/

-- Add unique constraint on name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'menu_items_name_key'
  ) THEN
    ALTER TABLE menu_items ADD CONSTRAINT menu_items_name_key UNIQUE (name);
  END IF;
END $$;

-- Insert Antipasti
INSERT INTO menu_items (name, description, price, category, image, dietary_vegan, dietary_gluten_free, dietary_nut_free)
VALUES
  ('Burrata & Prosciutto', 'Creamy burrata, aged prosciutto, balsamic reduction, arugula', 18.00, 'appetizer', 'https://images.unsplash.com/photo-1550507992-eb63ffdc42ac', false, true, true),
  ('Carpaccio di Manzo', 'Thinly sliced beef, truffle oil, arugula, shaved Parmesan', 20.00, 'appetizer', 'https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29', false, true, true),
  ('Fritto Misto', 'Lightly fried calamari, shrimp, zucchini, garlic aioli', 22.00, 'appetizer', 'https://images.unsplash.com/photo-1668207009741-f12918186d61', false, false, true),
  ('Bruschetta al Pomodoro', 'Grilled bread, vine tomatoes, basil, extra virgin olive oil', 14.00, 'appetizer', 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f', true, false, true)
ON CONFLICT (name) DO NOTHING;

-- Insert Primi & Secondi (categorized as entrees)
INSERT INTO menu_items (name, description, price, category, image, dietary_vegan, dietary_gluten_free, dietary_nut_free)
VALUES
  ('Tagliatelle al Tartufo', 'House-made tagliatelle, black truffle cream sauce, Parmesan', 32.00, 'entree', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601', false, false, true),
  ('Linguine alle Vongole', 'Fresh clams, white wine, garlic, chili flakes', 28.00, 'entree', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8', false, false, true),
  ('Risotto ai Frutti di Mare', 'Arborio rice, shrimp, scallops, mussels, saffron broth', 34.00, 'entree', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb', false, true, true),
  ('Ravioli di Ricotta e Spinaci', 'Handmade ravioli, ricotta, spinach, brown butter sage sauce', 26.00, 'entree', 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa', false, false, true),
  ('Filetto di Manzo', 'Grilled filet mignon, Barolo wine reduction, potato purée', 48.00, 'entree', 'https://images.unsplash.com/photo-1600891964092-4316c288032e', false, true, true),
  ('Branzino al Forno', 'Mediterranean sea bass, roasted fennel, lemon butter sauce', 42.00, 'entree', 'https://images.unsplash.com/photo-1534080564583-6be75777b70a', false, true, true),
  ('Pollo alla Parmigiana', 'Breaded chicken, San Marzano tomato sauce, melted mozzarella', 36.00, 'entree', 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8', false, false, true),
  ('Osso Buco alla Milanese', 'Slow-braised veal shank, saffron risotto', 50.00, 'entree', 'https://images.unsplash.com/photo-1544359355-efb7d1abb947', false, true, true)
ON CONFLICT (name) DO NOTHING;

-- Insert Dolci
INSERT INTO menu_items (name, description, price, category, image, dietary_vegan, dietary_gluten_free, dietary_nut_free)
VALUES
  ('Tiramisu Classico', 'Espresso-soaked ladyfingers, mascarpone, cocoa', 14.00, 'dessert', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', false, false, true),
  ('Panna Cotta al Limone', 'Lemon-infused panna cotta, raspberry coulis', 12.00, 'dessert', 'https://images.unsplash.com/photo-1488477181946-6428a0291777', false, true, true),
  ('Cannoli Siciliani', 'Crispy pastry shells, ricotta cream, chocolate chips', 14.00, 'dessert', 'https://images.unsplash.com/photo-1607920592519-bab4d7db727d', false, false, true)
ON CONFLICT (name) DO NOTHING;

-- Insert Drinks
INSERT INTO menu_items (name, description, price, category, image, dietary_vegan, dietary_gluten_free, dietary_nut_free)
VALUES
  ('Negroni', 'Gin, Campari, sweet vermouth', 16.00, 'drink', 'https://images.unsplash.com/photo-1551751299-1b51cab2694c', true, true, true),
  ('Aperol Spritz', 'Aperol, prosecco, soda, orange', 14.00, 'drink', 'https://images.unsplash.com/photo-1560512823-829485b8bf24', true, true, true),
  ('Limoncello Martini', 'Vodka, limoncello, fresh lemon juice', 18.00, 'drink', 'https://images.unsplash.com/photo-1605270012917-bf157c5a9541', true, true, true),
  ('Barolo', 'Red wine from Piemonte (bottle)', 90.00, 'drink', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', true, true, true),
  ('Chianti Classico', 'Red wine from Toscana (bottle)', 65.00, 'drink', 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6', true, true, true),
  ('Pinot Grigio', 'White wine from Veneto (bottle)', 50.00, 'drink', 'https://images.unsplash.com/photo-1566552881560-0be862a7c445', true, true, true),
  ('Prosecco', 'Sparkling wine from Veneto (bottle)', 55.00, 'drink', 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb', true, true, true),
  ('Limoncello', 'Digestif from Italy', 10.00, 'drink', 'https://images.unsplash.com/photo-1596403387793-93a1e5052c47', true, true, true),
  ('Grappa Riserva', 'Italian brandy', 12.00, 'drink', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b', true, true, true),
  ('Amaro Montenegro', 'Italian herbal liqueur', 14.00, 'drink', 'https://images.unsplash.com/photo-1574226516831-e1dff420e562', true, true, true)
ON CONFLICT (name) DO NOTHING;