-- Na-Ogrodowej initial schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE public.user_role AS ENUM ('user', 'admin');
CREATE TYPE public.package_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.order_status AS ENUM ('submitted', 'fulfilled', 'cancelled');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Singleton app settings
CREATE TABLE public.app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  seed_drop_hour INTEGER NOT NULL DEFAULT 18 CHECK (seed_drop_hour >= 0 AND seed_drop_hour <= 23),
  max_packages_per_user INTEGER NOT NULL DEFAULT 5 CHECK (max_packages_per_user > 0),
  max_quantity_per_seed_per_user INTEGER NOT NULL DEFAULT 3 CHECK (max_quantity_per_seed_per_user > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

INSERT INTO public.app_settings (id) VALUES (1);

-- Seed packages submitted by users
CREATE TABLE public.seed_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  variety TEXT,
  quantity_total INTEGER NOT NULL CHECK (quantity_total > 0),
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  description TEXT,
  status public.package_status NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quantity_available_lte_total CHECK (quantity_available <= quantity_total)
);

CREATE INDEX idx_seed_packages_user ON public.seed_packages(user_id);
CREATE INDEX idx_seed_packages_status_available ON public.seed_packages(status, quantity_available)
  WHERE status = 'approved' AND quantity_available > 0;

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.order_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);

-- Order line items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  seed_package_id UUID NOT NULL REFERENCES public.seed_packages(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, seed_package_id)
);

CREATE INDEX idx_order_items_package ON public.order_items(seed_package_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER seed_packages_updated_at BEFORE UPDATE ON public.seed_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin check helper for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seed_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- App settings
CREATE POLICY "Anyone authenticated reads settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.app_settings
  FOR UPDATE USING (public.is_admin());

-- Seed packages
CREATE POLICY "Users read approved available seeds" ON public.seed_packages
  FOR SELECT USING (
    (status = 'approved' AND quantity_available > 0)
    OR user_id = auth.uid()
    OR public.is_admin()
  );
CREATE POLICY "Users insert own packages" ON public.seed_packages
  FOR INSERT WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Users update own pending packages" ON public.seed_packages
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins manage all packages" ON public.seed_packages
  FOR ALL USING (public.is_admin());

-- Orders
CREATE POLICY "Users read own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users insert own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order items
CREATE POLICY "Users read own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );
CREATE POLICY "Users insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );
