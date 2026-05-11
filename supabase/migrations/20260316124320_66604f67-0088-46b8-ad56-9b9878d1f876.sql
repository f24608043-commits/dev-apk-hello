
-- =============================================
-- TABLES
-- =============================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_price numeric(10,2),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  discount_percent numeric(5,2) NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true
);

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  subtotal numeric(10,2) NOT NULL,
  discount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  shipping_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_purchase numeric(10,2) NOT NULL
);

CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  cover_image_url text,
  author_id uuid REFERENCES public.profiles(id),
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text
);

-- =============================================
-- SECURITY DEFINER HELPER (avoids RLS recursion)
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id;
$$;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow profile insert on signup" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are public" ON public.products FOR SELECT USING (is_active = true OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin update products" ON public.products FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete products" ON public.products FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin update categories" ON public.categories FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete categories" ON public.categories FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands are public" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admin insert brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin update brands" ON public.brands FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete brands" ON public.brands FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active deals are public" ON public.deals FOR SELECT USING ((is_active = true AND end_date > now()) OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin update deals" ON public.deals FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete deals" ON public.deals FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view coupons" ON public.coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin update coupons" ON public.coupons FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete coupons" ON public.coupons FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders or admin" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin update orders" ON public.orders FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')));
CREATE POLICY "Users insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are public" ON public.reviews FOR SELECT USING (is_approved = true OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Users insert reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.user_id = auth.uid() AND o.status = 'delivered' AND oi.product_id = reviews.product_id
  )
);
CREATE POLICY "Admin update reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are public" ON public.blog_posts FOR SELECT USING (is_published = true OR public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view subscribers" ON public.subscribers FOR SELECT TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are public to read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin manage settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin update settings" ON public.settings FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin delete settings" ON public.settings FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'admin');

-- =============================================
-- AUTO-CREATE PROFILE TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- VALIDATE COUPON FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code text, order_subtotal numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon record;
  v_discount numeric;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons WHERE code = coupon_code AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'INVALID_COUPON_CODE');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'COUPON_EXPIRED');
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'COUPON_MAX_USES_REACHED');
  END IF;

  IF order_subtotal < v_coupon.min_order_amount THEN
    RETURN jsonb_build_object('valid', false, 'error', 'MIN_ORDER_AMOUNT_NOT_MET');
  END IF;

  IF v_coupon.discount_type = 'percent' THEN
    v_discount := ROUND(order_subtotal * v_coupon.discount_value / 100, 2);
  ELSE
    v_discount := LEAST(v_coupon.discount_value, order_subtotal);
  END IF;

  RETURN jsonb_build_object('valid', true, 'discount_amount', v_discount, 'coupon_id', v_coupon.id);
END;
$$;

-- =============================================
-- PLACE ORDER FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.place_order(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_coupon_code text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_total numeric;
  v_coupon_id uuid;
  v_coupon_result jsonb;
  v_product record;
BEGIN
  -- Calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'product_id')::uuid;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND: %', v_item->>'product_id';
    END IF;

    IF v_product.stock < (v_item->>'quantity')::int THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK: %', v_product.name;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * (v_item->>'quantity')::int);
  END LOOP;

  -- Validate coupon if provided
  IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
    v_coupon_result := public.validate_coupon(p_coupon_code, v_subtotal);
    IF (v_coupon_result->>'valid')::boolean THEN
      v_discount := (v_coupon_result->>'discount_amount')::numeric;
      v_coupon_id := (v_coupon_result->>'coupon_id')::uuid;
    ELSE
      RAISE EXCEPTION 'INVALID_COUPON: %', v_coupon_result->>'error';
    END IF;
  END IF;

  v_total := v_subtotal - v_discount;

  -- Create order
  INSERT INTO public.orders (user_id, shipping_address, subtotal, discount, total, coupon_id, status)
  VALUES (p_user_id, p_shipping_address, v_subtotal, v_discount, v_total, v_coupon_id, 'pending')
  RETURNING id INTO v_order_id;

  -- Process items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (SELECT price FROM public.products WHERE id = (v_item->>'product_id')::uuid)
    );

    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::int
    WHERE id = (v_item->>'product_id')::uuid;
  END LOOP;

  -- Increment coupon usage
  IF v_coupon_id IS NOT NULL THEN
    UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon_id;
  END IF;

  -- Clear cart
  DELETE FROM public.cart_items WHERE user_id = p_user_id;

  RETURN v_order_id;
END;
$$;
