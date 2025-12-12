-- ========================================
-- Swathi Botique - COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ========================================
-- This will enable:
-- ✅ Cart sync across devices
-- ✅ Favorites sync across devices  
-- ✅ Order history and tracking
-- ✅ Search history
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USER CARTS TABLE
-- Persistent cart that syncs across devices
-- ========================================
CREATE TABLE IF NOT EXISTS user_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT NOT NULL,
  product_category TEXT NOT NULL,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_product_id ON user_carts(product_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_created_at ON user_carts(created_at DESC);

-- ========================================
-- 2. USER FAVORITES TABLE
-- Wishlist functionality
-- ========================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_data_gin ON user_favorites USING GIN (product_data);

-- ========================================
-- 3. SEARCH HISTORY TABLE
-- Track user searches for personalization
-- ========================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  search_query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  filters_applied JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_session_id ON search_history(session_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history USING GIN (to_tsvector('english', search_query));

-- ========================================
-- 4. ORDERS TABLE
-- Order history and management
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  payment_method TEXT,
  
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  tracking_number TEXT,
  carrier TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  customer_notes TEXT,
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_items_gin ON orders USING GIN (items);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_gin ON orders USING GIN (shipping_address);

-- ========================================
-- 5. ORDER STATUS HISTORY TABLE
-- Track all status changes for audit trail
-- ========================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- ========================================
-- 6. AUTOMATIC TIMESTAMP UPDATES
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_carts_updated_at
  BEFORE UPDATE ON user_carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. TRACK ORDER STATUS CHANGES
-- ========================================
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Status changed');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_change();

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- USER CARTS POLICIES
CREATE POLICY "Users can view own cart"
  ON user_carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart"
  ON user_carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON user_carts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON user_carts FOR DELETE
  USING (auth.uid() = user_id);

-- USER FAVORITES POLICIES
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- SEARCH HISTORY POLICIES
CREATE POLICY "Users can view own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can add to search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ORDERS POLICIES
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_super_admin')::boolean = true
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_super_admin')::boolean = true
    )
  );

-- ORDER STATUS HISTORY POLICIES
CREATE POLICY "Users can view own order status history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order status history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_super_admin')::boolean = true
    )
  );

-- ========================================
-- 9. MERGE GUEST CART TO USER CART ON LOGIN
-- ========================================
CREATE OR REPLACE FUNCTION merge_guest_cart_to_user(
  p_user_id UUID,
  p_guest_cart JSONB
)
RETURNS void AS $$
DECLARE
  cart_item JSONB;
BEGIN
  FOR cart_item IN SELECT * FROM jsonb_array_elements(p_guest_cart)
  LOOP
    INSERT INTO user_carts (
      user_id,
      product_id,
      product_name,
      product_price,
      product_image,
      product_category,
      size,
      color,
      quantity
    ) VALUES (
      p_user_id,
      (cart_item->>'id')::INTEGER,
      cart_item->>'name',
      (cart_item->>'price')::DECIMAL,
      cart_item->>'image',
      cart_item->>'category',
      cart_item->>'size',
      cart_item->>'color',
      (cart_item->>'quantity')::INTEGER
    )
    ON CONFLICT (user_id, product_id, size, color)
    DO UPDATE SET
      quantity = user_carts.quantity + EXCLUDED.quantity,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. GENERATE UNIQUE ORDER NUMBER
-- ========================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_order_number := 'JB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 11. CREATE ORDER FROM CART (TRANSACTIONAL)
-- ========================================
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_payment_method TEXT,
  p_customer_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_cart_items JSONB;
  v_subtotal DECIMAL(10, 2);
  v_tax DECIMAL(10, 2);
  v_shipping DECIMAL(10, 2);
  v_total DECIMAL(10, 2);
BEGIN
  -- Get cart items
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', product_id,
        'name', product_name,
        'price', product_price,
        'quantity', quantity,
        'size', size,
        'color', color,
        'image', product_image
      )
    ),
    '[]'::jsonb
  ) INTO v_cart_items
  FROM user_carts
  WHERE user_id = p_user_id;
  
  -- Check if cart is empty
  IF jsonb_array_length(v_cart_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;
  
  -- Calculate totals
  SELECT SUM(product_price * quantity) INTO v_subtotal
  FROM user_carts
  WHERE user_id = p_user_id;
  
  -- Calculate tax (10%)
  v_tax := v_subtotal * 0.10;
  
  -- Calculate shipping (free over ₹500)
  IF v_subtotal >= 500 THEN
    v_shipping := 0;
  ELSE
    v_shipping := 50;
  END IF;
  
  v_total := v_subtotal + v_tax + v_shipping;
  
  -- Generate order number
  v_order_number := generate_order_number();
  
  -- Create order
  INSERT INTO orders (
    user_id,
    order_number,
    items,
    subtotal,
    tax,
    shipping_cost,
    total,
    shipping_address,
    billing_address,
    payment_method,
    customer_notes,
    status,
    payment_status
  ) VALUES (
    p_user_id,
    v_order_number,
    v_cart_items,
    v_subtotal,
    v_tax,
    v_shipping,
    v_total,
    p_shipping_address,
    p_billing_address,
    p_payment_method,
    p_customer_notes,
    'pending',
    'pending'
  ) RETURNING id INTO v_order_id;
  
  -- Clear user cart
  DELETE FROM user_carts WHERE user_id = p_user_id;
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 12. COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON TABLE user_carts IS 'Persistent user shopping carts synced across devices';
COMMENT ON TABLE user_favorites IS 'User wishlist/favorites for products';
COMMENT ON TABLE search_history IS 'User search history for personalization and analytics';
COMMENT ON TABLE orders IS 'Customer order history and management';
COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';

COMMENT ON FUNCTION merge_guest_cart_to_user IS 'Merges guest cart items into user cart on login';
COMMENT ON FUNCTION generate_order_number IS 'Generates unique order number in format JB-YYYYMMDD-XXXX';
COMMENT ON FUNCTION create_order_from_cart IS 'Creates order from user cart items with automatic total calculation';

-- ========================================
-- ✅ MIGRATION COMPLETE!
-- ========================================
-- Next steps:
-- 1. Deploy your updated code
-- 2. Test cart sync across devices
-- 3. Test favorites sync across devices
-- 4. Test order creation
-- ========================================

