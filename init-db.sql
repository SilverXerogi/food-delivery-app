CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  key TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),
  category_name TEXT NOT NULL,
  category_key TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  weight TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  total_amount NUMERIC(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','confirmed','preparing','delivering','delivered','cancelled')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  weight TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

INSERT INTO categories (name, description, image_url, key)
VALUES
  ('Овощи', 'Свежие овощи на каждый день', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80', 'vegetables'),
  ('Фрукты', 'Сладкие и полезные фрукты', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80', 'fruits'),
  ('Молочные продукты', 'Молоко, йогурты и сыры', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80', 'dairy'),
  ('Напитки', 'Соки, вода и лимонады', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80', 'beverages')
ON CONFLICT (key) DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, category_name, category_key, in_stock, weight)
SELECT * FROM (
  SELECT
    'Томаты черри'::TEXT,
    'Сладкие томаты для салатов и закусок'::TEXT,
    189.00::NUMERIC(10,2),
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80'::TEXT,
    c.id,
    c.name,
    c.key,
    TRUE,
    '500 г'::TEXT
  FROM categories c WHERE c.key = 'vegetables'
  UNION ALL
  SELECT
    'Бананы'::TEXT,
    'Спелые бананы, готовые к доставке'::TEXT,
    119.00::NUMERIC(10,2),
    'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=900&q=80'::TEXT,
    c.id,
    c.name,
    c.key,
    TRUE,
    '1 кг'::TEXT
  FROM categories c WHERE c.key = 'fruits'
  UNION ALL
  SELECT
    'Молоко 3.2%'::TEXT,
    'Пастеризованное молоко в бутылке'::TEXT,
    99.00::NUMERIC(10,2),
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80'::TEXT,
    c.id,
    c.name,
    c.key,
    TRUE,
    '930 мл'::TEXT
  FROM categories c WHERE c.key = 'dairy'
  UNION ALL
  SELECT
    'Апельсиновый сок'::TEXT,
    'Натуральный сок без добавления сахара'::TEXT,
    149.00::NUMERIC(10,2),
    'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80'::TEXT,
    c.id,
    c.name,
    c.key,
    TRUE,
    '1 л'::TEXT
  FROM categories c WHERE c.key = 'beverages'
  UNION ALL
  SELECT
    'Яблоки Гала'::TEXT,
    'Хрустящие яблоки с лёгкой сладостью'::TEXT,
    139.00::NUMERIC(10,2),
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80'::TEXT,
    c.id,
    c.name,
    c.key,
    TRUE,
    '1 кг'::TEXT
  FROM categories c WHERE c.key = 'fruits'
  UNION ALL
  SELECT
    'Огурцы'::TEXT,
    'Свежие тепличные огурцы'::TEXT,
    129.00::NUMERIC(10,2),
    'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=900&q=80'::TEXT,
    c.id,
    c.name,
    c.key,
    TRUE,
    '600 г'::TEXT
  FROM categories c WHERE c.key = 'vegetables'
) AS seed(name, description, price, image_url, category_id, category_name, category_key, in_stock, weight)
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = seed.name);
