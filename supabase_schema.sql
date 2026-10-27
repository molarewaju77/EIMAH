-- ==============================================================================
-- EIMAH BRAND STUDIO — UNIFIED SUPABASE DATABASE SCHEMA & SEED DATA
-- Single unified tables for Products (with JSONB attributes & variants)
-- and Orders (with JSONB items & tracking history)
-- ==============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    blurb TEXT DEFAULT '',
    image TEXT DEFAULT '',
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC NOT NULL,
    compare_at NUMERIC,
    category TEXT REFERENCES public.categories(slug) ON DELETE SET NULL,
    description TEXT DEFAULT '',
    stock INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    images TEXT[] DEFAULT '{}',
    sku TEXT UNIQUE NOT NULL,
    cost_price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    sold INTEGER DEFAULT 0,
    weight NUMERIC,
    attributes JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. ORDERS TABLE (Unified for both Courier & Pickup Station Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    tracking_id TEXT UNIQUE NOT NULL,
    customer TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    total NUMERIC NOT NULL,
    subtotal NUMERIC DEFAULT 0,
    shipping_fee NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Paid',
    delivery_method TEXT DEFAULT 'Courier', -- 'Courier' | 'Pickup Station'
    payment_status TEXT DEFAULT 'Paid',
    address TEXT DEFAULT '',
    waybill_number TEXT DEFAULT '',         -- Optional Fez Tracking/Waybill number
    internal_notes TEXT DEFAULT '',
    items JSONB DEFAULT '[]'::jsonb,
    tracking_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fast search indexes for orders & public tracking
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON public.orders (tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON public.orders (delivery_method);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders (date DESC);

-- Automatic Database-Level Tracking ID Generator (PostgreSQL Trigger)
CREATE OR REPLACE FUNCTION public.generate_order_tracking_id()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    random_str TEXT := '';
    i INTEGER;
    candidate TEXT;
    exists_already BOOLEAN;
BEGIN
    -- If tracking_id is already provided and not empty, keep it
    IF NEW.tracking_id IS NOT NULL AND TRIM(NEW.tracking_id) <> '' THEN
        RETURN NEW;
    END IF;

    -- Determine prefix based on delivery_method
    IF NEW.delivery_method ILIKE '%Pickup%' THEN
        prefix := 'EMH-PK-';
    ELSE
        prefix := 'EMH-CR-';
    END IF;

    -- Generate random 8-character code and ensure uniqueness
    LOOP
        random_str := '';
        FOR i IN 1..8 LOOP
            random_str := random_str || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        candidate := prefix || random_str;

        -- Verify uniqueness
        SELECT EXISTS(SELECT 1 FROM public.orders WHERE tracking_id = candidate) INTO exists_already;
        IF NOT exists_already THEN
            NEW.tracking_id := candidate;
            EXIT;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_tracking_id ON public.orders;
CREATE TRIGGER trg_set_order_tracking_id
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_tracking_id();

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '',
    orders INTEGER DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    status TEXT DEFAULT 'New',  -- 'New' | 'Active' | 'VIP' | 'Inactive'
    last_order TIMESTAMPTZ,
    date_joined TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_date_joined ON public.customers (date_joined DESC);

-- 6. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    eyebrow TEXT DEFAULT '' ,
    title TEXT NOT NULL,
    supporting_text TEXT DEFAULT '',
    cta_text TEXT DEFAULT 'Shop Now',
    cta_target TEXT DEFAULT 'shop',
    cta_url TEXT DEFAULT '/shop',
    image TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS cta_target TEXT DEFAULT 'shop';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS cta_url TEXT DEFAULT '/shop';

-- 7. POPUPS TABLE
CREATE TABLE IF NOT EXISTS public.popups (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Claim Offer',
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SOLUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.solutions (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    price NUMERIC DEFAULT 0,
    discount_percent NUMERIC,
    discount_price NUMERIC,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. SOLUTION PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.solution_payments (
    id TEXT PRIMARY KEY,
    txn_id TEXT NOT NULL,
    solution_id TEXT NOT NULL,
    solution_title TEXT NOT NULL,
    category TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_types TEXT,
    sourcing_needs TEXT,
    order_size TEXT,
    has_supplier TEXT,
    timeline TEXT,
    business_name TEXT,
    experience_level TEXT,
    learning_goals TEXT,
    additional_notes TEXT
);

-- 10. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    order_id TEXT,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. PICKUP STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.pickup_stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    fee NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. RESTOCK REQUESTS TABLE (Customer product demand logs)
CREATE TABLE IF NOT EXISTS public.restock_requests (
    id TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_slug TEXT DEFAULT '',
    variant TEXT DEFAULT 'Standard',
    demanded_quantity INTEGER NOT NULL DEFAULT 1,
    available_stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_restock_requests_email ON public.restock_requests (customer_email);
CREATE INDEX IF NOT EXISTS idx_restock_requests_created_at ON public.restock_requests (created_at DESC);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & ALLOW PUBLIC/ANON ACCESS
-- ==============================================================================
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public full access" ON public.%I;', t);
        EXECUTE format('CREATE POLICY "Public full access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;

-- ==============================================================================
-- DASHBOARD AGGREGATION FUNCTION (SINGLE API CALL FOR ALL DASHBOARD STATS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalRevenue', COALESCE((SELECT SUM(total) FROM public.orders), 0),
        'totalOrders', COALESCE((SELECT COUNT(*) FROM public.orders), 0),
        'totalProducts', COALESCE((SELECT COUNT(*) FROM public.products), 0),
        'totalCustomers', COALESCE((SELECT COUNT(*) FROM public.customers), 0),
        'totalSold', COALESCE((SELECT SUM(sold) FROM public.products), 0),
        'totalProfit', ROUND(COALESCE((SELECT SUM(total) * 0.34 FROM public.orders), 0)),
        'recentOrders', (
            SELECT COALESCE(jsonb_agg(to_jsonb(o)), '[]'::jsonb)
            FROM (
                SELECT id, customer, email, phone, date, total, status, address
                FROM public.orders
                ORDER BY date DESC
                LIMIT 6
            ) o
        ),
        'topProducts', (
            SELECT COALESCE(jsonb_agg(to_jsonb(p)), '[]'::jsonb)
            FROM (
                SELECT id, name, slug, price, category, stock, sold, images, sku, status
                FROM public.products
                ORDER BY sold DESC
                LIMIT 5
            ) p
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- ==============================================================================
-- SEED INITIAL DATA
-- ==============================================================================

-- 1. Categories
INSERT INTO public.categories (slug, name, blurb, image, featured, active, product_count) VALUES
('clothing', 'Clothing', 'Everyday essentials, elevated.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80', true, true, 4),
('shoes', 'Shoes', 'Step into the season.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', true, true, 2),
('bags', 'Bags', 'Carry it in style.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80', true, true, 2),
('home-essentials', 'Home Essentials', 'Rituals for daily life.', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80', false, true, 2),
('kitchen-dining', 'Kitchen & Dining', 'Cook, serve, gather.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80', false, true, 1),
('beauty-self-care', 'Beauty & Self Care', 'Quiet luxury for you.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80', false, true, 2),
('accessories', 'Accessories', 'The finishing touches.', 'https://images.unsplash.com/photo-1611923134239-b9be5816e23b?auto=format&fit=crop&w=900&q=80', false, true, 1),
('gadgets', 'Gadgets', 'Smart, useful, tested.', 'https://images.unsplash.com/photo-1546027658-7aa750153465?auto=format&fit=crop&w=900&q=80', false, true, 1),
('gifts-sets', 'Gifts & Sets', 'Thoughtfully curated.', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80', false, true, 1)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name, 
    blurb = EXCLUDED.blurb, 
    image = EXCLUDED.image, 
    featured = EXCLUDED.featured,
    active = EXCLUDED.active;

-- 2. Products (Single Table with Attributes & Variants in JSONB)
INSERT INTO public.products (id, name, slug, price, compare_at, category, description, stock, featured, images, sku, cost_price, status, sold, attributes, variants) VALUES
('prod-1', 'Relaxed Linen Overshirt', 'relaxed-linen-overshirt', 48500, 58000, 'clothing', 'Woven from premium European flax. Breathable, relaxed silhouette with clean horn buttons and subtle chest patch pockets.', 32, true, ARRAY['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80'], 'EMH-CLO-1001', 28130, 'Active', 120, '[{"name": "Color", "values": ["Sand", "Olive", "Charcoal"]}, {"name": "Size", "values": ["S", "M", "L", "XL"]}]'::jsonb, '[{"id": "var-1-1", "options": {"Color": "Sand", "Size": "M"}, "stock": 10}, {"id": "var-1-2", "options": {"Color": "Olive", "Size": "L"}, "stock": 12}]'::jsonb),
('prod-2', 'Tailored Pleated Trousers', 'tailored-pleated-trousers', 54000, NULL, 'clothing', 'High-rise, double-pleated front with a clean tapered break. Cut from a fluid wool-blend twill that drapes effortlessly.', 18, true, ARRAY['https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1200&q=80'], 'EMH-CLO-1002', 31320, 'Active', 116, '[{"name": "Color", "values": ["Charcoal", "Navy", "Cream"]}, {"name": "Size", "values": ["30", "32", "34", "36"]}]'::jsonb, '[{"id": "var-2-1", "options": {"Color": "Charcoal", "Size": "32"}, "stock": 8}]'::jsonb),
('prod-3', 'Merino Ribbed Knit Top', 'merino-ribbed-knit-top', 42000, 48000, 'clothing', 'Spun from extra-fine Australian merino wool. Micro-rib texture with a comfortable mock neckline for year-round layering.', 40, false, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80'], 'EMH-CLO-1003', 24360, 'Active', 112, '[]'::jsonb, '[]'::jsonb),
('prod-4', 'Structured Minimal Blazer', 'structured-minimal-blazer', 89000, 98000, 'clothing', 'Single-breasted architectural blazer with softened shoulders and welt pockets. Fully lined in cupro.', 12, true, ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80'], 'EMH-CLO-1004', 51620, 'Active', 108, '[]'::jsonb, '[]'::jsonb),
('prod-5', 'Handcrafted Leather Derby', 'handcrafted-leather-derby', 92000, NULL, 'shoes', 'Goodyear welted with full-grain calfskin leather. Built on a sculpted last with stacked leather heels.', 15, true, ARRAY['https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1200&q=80'], 'EMH-SHO-1005', 53360, 'Active', 104, '[{"name": "Color", "values": ["Black", "Cognac"]}, {"name": "Size", "values": ["40", "41", "42", "43", "44", "45"]}]'::jsonb, '[{"id": "var-5-1", "options": {"Color": "Black", "Size": "42"}, "stock": 6}]'::jsonb),
('prod-6', 'Minimalist Suede Runner', 'minimalist-suede-runner', 68000, 75000, 'shoes', 'Italian split suede paired with ultra-lightweight Vibram sole. Soft calfskin lining for barefoot comfort.', 22, false, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'], 'EMH-SHO-1006', 39440, 'Active', 100, '[]'::jsonb, '[]'::jsonb),
('prod-7', 'Arch Tote in Saddle Leather', 'arch-tote-saddle-leather', 115000, NULL, 'bags', 'Clean sculptural tote crafted from vegetable-tanned leather. Includes magnetic clasp and detachable zip pouch.', 8, true, ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80'], 'EMH-BAG-1007', 66700, 'Active', 96, '[]'::jsonb, '[]'::jsonb),
('prod-8', 'Compact Crossbody Pouch', 'compact-crossbody-pouch', 46000, 52000, 'bags', 'Designed for daily mobility. Weather-resistant nylon canvas trimmed with smooth nappa leather.', 26, false, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80'], 'EMH-BAG-1008', 26680, 'Active', 92, '[]'::jsonb, '[]'::jsonb),
('prod-9', 'Ceramic Pour-Over & Carafe', 'ceramic-pour-over-carafe', 29500, NULL, 'kitchen-dining', 'Wheel-thrown stoneware glazed in matte oatmeal. Engineered ribbing for consistent coffee extraction.', 30, false, ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80'], 'EMH-KIT-1009', 17110, 'Active', 88, '[]'::jsonb, '[]'::jsonb),
('prod-10', 'Heavyweight Linen Duvet Set', 'heavyweight-linen-duvet-set', 128000, 142000, 'home-essentials', 'Pre-washed 190 GSM French flax linen for lived-in softness from day one. Includes 1 duvet cover and 2 pillowcases.', 10, true, ARRAY['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80'], 'EMH-HOM-1010', 74240, 'Active', 84, '[]'::jsonb, '[]'::jsonb),
('prod-11', 'Botanical Body Oil No. 3', 'botanical-body-oil-no-3', 24000, NULL, 'beauty-self-care', 'Cold-pressed jojoba, rosehip, and vetiver. Fast-absorbing dry oil that leaves a velvet finish and calming scent.', 45, false, ARRAY['https://images.unsplash.com/photo-1608248597359-00f72365bf87?auto=format&fit=crop&w=1200&q=80'], 'EMH-BEA-1011', 13920, 'Active', 80, '[]'::jsonb, '[]'::jsonb),
('prod-12', 'Cast Aluminum Desk Lamp', 'cast-aluminum-desk-lamp', 72000, 80000, 'gadgets', 'Sand-cast aluminum with integrated warm LED (2700K). Smooth rotary dimmer with tactile detents.', 14, true, ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80'], 'EMH-GAD-1012', 41760, 'Active', 76, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Orders (Single Table with Items & Tracking History in JSONB)
INSERT INTO public.orders (id, customer, email, phone, date, total, subtotal, shipping_fee, status, address, internal_notes, items, tracking_history) VALUES
('EMH-10240', 'Chiamaka Eze', 'chiamaka.eze@example.com', '+234 802 345 6789', '2026-08-13T09:10:48Z', 106000, 102500, 3500, 'Processing', '22 Isaac John Street, Ikeja GRA, Lagos', 'Dispatched with FEZ Courier', '[{"name": "Relaxed Linen Overshirt", "price": 48500, "qty": 1, "subtotal": 48500, "variant": "Sand / M"}, {"name": "Tailored Pleated Trousers", "price": 54000, "qty": 1, "subtotal": 54000, "variant": "Charcoal / 32"}]'::jsonb, '[{"status": "Paid", "date": "2026-08-13T09:10:48Z", "admin": "System"}, {"status": "Processing", "date": "2026-08-13T10:00:00Z", "admin": "Michael Olarewaju"}]'::jsonb),
('EMH-10241', 'Adaeze Okonkwo', 'adaeze.o@example.com', '+234 803 112 4455', '2026-08-12T08:30:00Z', 117500, 115000, 2500, 'Delivered', '14 Admiralty Way, Lekki Phase 1, Lagos', 'Delivered and confirmed by customer', '[{"name": "Arch Tote in Saddle Leather", "price": 115000, "qty": 1, "subtotal": 115000}]'::jsonb, '[{"status": "Paid", "date": "2026-08-12T08:30:00Z", "admin": "System"}, {"status": "Delivered", "date": "2026-08-12T15:30:00Z", "admin": "FEZ Courier"}]'::jsonb),
('EMH-10242', 'Tunde Bakare', 'tunde.b@example.com', '+234 805 998 7766', '2026-08-14T07:15:00Z', 95000, 92000, 3000, 'Processing', '5 Allen Avenue, Ikeja, Lagos', 'Rider is currently on route', '[{"name": "Handcrafted Leather Derby", "price": 92000, "qty": 1, "subtotal": 92000, "variant": "Black / 42"}]'::jsonb, '[{"status": "Paid", "date": "2026-08-14T07:15:00Z", "admin": "System"}]'::jsonb),
('EMH-10243', 'Ibrahim Musa', 'ibrahim.m@example.com', '+234 811 443 2211', '2026-08-14T08:00:00Z', 78500, 72000, 6500, 'Paid', '12 Wuse 2 Commercial District, Abuja, FCT', 'Awaiting intercity dispatch team pickup', '[{"name": "Cast Aluminum Desk Lamp", "price": 72000, "qty": 1, "subtotal": 72000}]'::jsonb, '[{"status": "Paid", "date": "2026-08-14T08:00:00Z", "admin": "System"}]'::jsonb),
('EMH-10244', 'Fatima Bello', 'fatima.b@example.com', '+234 809 332 1100', '2026-08-13T14:45:00Z', 131500, 128000, 3500, 'Processing', '9 Independence Way, Kaduna, Kaduna', 'Picked up from Lekki hub', '[{"name": "Heavyweight Linen Duvet Set", "price": 128000, "qty": 1, "subtotal": 128000}]'::jsonb, '[{"status": "Paid", "date": "2026-08-13T14:45:00Z", "admin": "System"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4. Customers
INSERT INTO public.customers (id, name, email, phone, orders, spent, address, city, state, status, last_order, date_joined, notes) VALUES
('CUS-1001', 'Chiamaka Eze', 'chiamaka.eze@example.com', '+234 802 345 6789', 5, 245000, '22 Isaac John Street, Ikeja GRA', 'Ikeja', 'Lagos', 'Active', '2026-08-13T10:00:00Z', '2026-01-15T08:00:00Z', 'VIP Client. Prefers express delivery.'),
('CUS-1002', 'Adaeze Okonkwo', 'adaeze.o@example.com', '+234 803 112 4455', 3, 168000, '14 Admiralty Way, Lekki Phase 1', 'Lekki', 'Lagos', 'Active', '2026-08-12T09:00:00Z', '2026-02-20T10:30:00Z', 'Enjoys clothing and bags collections.'),
('CUS-1003', 'Tunde Bakare', 'tunde.b@example.com', '+234 805 998 7766', 2, 98500, '5 Allen Avenue', 'Ikeja', 'Lagos', 'Active', '2026-08-14T08:00:00Z', '2026-04-10T14:15:00Z', 'Ordered derby shoes.'),
('CUS-1004', 'Ibrahim Musa', 'ibrahim.m@example.com', '+234 811 443 2211', 1, 72000, '12 Wuse 2 Commercial District', 'Abuja', 'FCT', 'New', '2026-08-14T08:00:00Z', '2026-08-14T08:00:00Z', 'First time buyer from Abuja.'),
('CUS-1005', 'Fatima Bello', 'fatima.b@example.com', '+234 809 332 1100', 4, 210000, '9 Independence Way', 'Kaduna', 'Kaduna', 'Active', '2026-08-13T16:20:00Z', '2026-03-05T11:00:00Z', 'Regular wholesale buyer.')
ON CONFLICT (id) DO NOTHING;

-- 5. Deliveries
INSERT INTO public.deliveries (id, order_id, recipient_name, recipient_phone, address, city, state, courier_name, tracking_number, shipping_fee, status, dispatch_date, estimated_delivery, delivered_at, driver_notes, created_at) VALUES
('DEL-1001', 'EMH-10240', 'Chiamaka Eze', '+234 802 345 6789', '22 Isaac John Street, Ikeja GRA', 'Ikeja', 'Lagos', 'FEZ Delivery', 'FEZ-2026-8891', 3500, 'In Transit', '2026-08-13T10:00:00Z', '2026-08-14', NULL, 'Driver contacted customer. Scheduled for afternoon delivery.', '2026-08-13T09:10:48Z'),
('DEL-1002', 'EMH-10241', 'Adaeze Okonkwo', '+234 803 112 4455', '14 Admiralty Way, Lekki Phase 1', 'Lekki', 'Lagos', 'FEZ Delivery', 'FEZ-2026-9042', 2500, 'Delivered', '2026-08-12T09:00:00Z', '2026-08-12', '2026-08-12T15:30:00Z', 'Package received and signed by estate security guard.', '2026-08-12T08:30:00Z'),
('DEL-1003', 'EMH-10242', 'Tunde Bakare', '+234 805 998 7766', '5 Allen Avenue', 'Ikeja', 'Lagos', 'FEZ Delivery', 'FEZ-2026-9110', 3000, 'Out for Delivery', '2026-08-14T08:00:00Z', '2026-08-14', NULL, 'Courier rider is out for final dropoff.', '2026-08-14T07:15:00Z'),
('DEL-1004', 'EMH-10243', 'Ibrahim Musa', '+234 811 443 2211', '12 Wuse 2 Commercial District', 'Abuja', 'FCT', 'FEZ Express Intercity', 'FEZ-2026-7734', 6500, 'Pending Dispatch', NULL, '2026-08-16', NULL, 'Awaiting intercity dispatch team pickup from hub.', '2026-08-14T08:00:00Z'),
('DEL-1005', 'EMH-10244', 'Fatima Bello', '+234 809 332 1100', '9 Independence Way', 'Kaduna', 'Kaduna', 'FEZ Express Intercity', 'FEZ-2026-6521', 3500, 'Picked Up', '2026-08-13T16:20:00Z', '2026-08-15', NULL, 'Picked up from Lekki hub, currently in sorting center.', '2026-08-13T14:45:00Z')
ON CONFLICT (id) DO NOTHING;

-- 6. Banners, Popups, Pickup Stations, Solutions
INSERT INTO public.banners (id, eyebrow, title, supporting_text, cta_text, image, status, start_date, end_date) VALUES
('ban-1', 'SPRING / SUMMER 2026', 'Curated Living for the Modern Space', 'Explore effortless garments, artisanal footwear, and objects designed to elevate your everyday routines.', 'Shop Collection', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', 'Active', '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z'),
('ban-2', 'EXCLUSIVE DROP', 'The Saddle Leather Collection', 'Vegetable-tanned leather accessories designed to age gracefully with daily use.', 'Explore Leather', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80', 'Draft', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.popups (id, title, body, cta_text, status) VALUES
('pop-1', 'Welcome to EIMAH Studio', 'Join our insider community and receive 10% off your first luxury order plus early access to limited seasonal drops.', 'Claim 10% Off', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pickup_stations (id, name, address, fee) VALUES
('pk-1', 'EIMAH Flagship Studio Hub', '18 Admiralty Way, Lekki Phase 1, Lagos', 0),
('pk-2', 'Ikeja Dispatch & Collection Center', '45 Isaac John Street, Ikeja GRA, Lagos', 1000),
('pk-3', 'Abuja Central Pickup Hub', 'Plot 1042 Kur Mohammed Avenue, Central Business District, Abuja', 2000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.solutions (id, category, title, description, image, price, discount_percent, discount_price, visible) VALUES
('sol-1', 'china-procurement', 'End-to-End China Procurement', 'Direct factory sourcing, quality assurance inspection, supplier negotiation, and consolidated shipping straight to Nigeria.', 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80', 75000, 20, 60000, true),
('sol-2', 'ecommerce-mastery', 'E-commerce Brand Accelerator', '1-on-1 coaching, branding frameworks, high-converting product pages, and local marketing strategies to scale to 8 figures.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 120000, 15, 102000, true),
('sol-3', 'brand-identity', 'Bespoke Brand Identity & Packaging', 'Custom logo systems, premium unboxing design, typography rules, and luxury print preparation for emerging African brands.', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80', 95000, NULL, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- 7. Transactions (Store Order Payments)
INSERT INTO public.transactions (id, customer, order_id, amount, method, status, date) VALUES
('TXN-5001', 'Chiamaka Eze', 'EMH-10240', 106000, 'Card', 'Successful', '2026-08-13T09:10:48Z'),
('TXN-5002', 'Adaeze Okonkwo', 'EMH-10241', 117500, 'Bank Transfer', 'Successful', '2026-08-12T08:30:00Z'),
('TXN-5003', 'Tunde Bakare', 'EMH-10242', 95000, 'Card', 'Successful', '2026-08-14T07:15:00Z'),
('TXN-5004', 'Ibrahim Musa', 'EMH-10243', 78500, 'USSD', 'Successful', '2026-08-14T08:00:00Z'),
('TXN-5005', 'Fatima Bello', 'EMH-10244', 131500, 'Bank Transfer', 'Successful', '2026-08-13T14:45:00Z'),
('TXN-5006', 'Oluwaseun Adeyemi', 'EMH-10238', 48500, 'Card', 'Successful', '2026-08-11T12:20:00Z'),
('TXN-5007', 'Ngozi Nwosu', 'EMH-10239', 92000, 'Card', 'Pending', '2026-08-11T16:45:00Z'),
('TXN-5008', 'Emeka Obi', 'EMH-10235', 54000, 'Bank Transfer', 'Failed', '2026-08-10T11:10:00Z'),
('TXN-5009', 'Zainab Ahmed', 'EMH-10236', 115000, 'Card', 'Successful', '2026-08-09T15:30:00Z'),
('TXN-5010', 'Babajide Sanwo', 'EMH-10232', 42000, 'Card', 'Refunded', '2026-08-08T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 8. Solution Payments (Business & Learning Solution Registrations)
INSERT INTO public.solution_payments (
    id, txn_id, solution_id, solution_title, category, customer_name, customer_email, customer_phone,
    amount, method, status, date, product_types, sourcing_needs, order_size, has_supplier, timeline,
    business_name, experience_level, learning_goals, additional_notes
) VALUES
('SOL-REG-101', 'TXN-8001', 'sol-1', 'End-to-End China Procurement', 'Business', 'Amina Bello', 'amina.bello@example.com', '+234 803 123 4567', 60000, 'Card', 'Successful', '2026-08-10T14:00:00Z', 'Fashion & Apparel', 'Finding products for a new business', 'Medium Quantity (500-1000 units)', 'No, I need help finding one', 'Within 1 month', 'Bello Luxury Wears', 'Intermediate', 'Direct 1688 and factory sourcing without agent commissions', 'Looking for premium linen and cotton fabric manufacturers in Turkey or China.'),
('SOL-REG-102', 'TXN-8002', 'sol-3', 'Bespoke Brand Identity & Packaging', 'Business', 'Chidi Okeke', 'chidi.okeke@enterprise.ng', '+234 802 987 6543', 95000, 'Bank Transfer', 'Successful', '2026-08-08T11:30:00Z', 'Electronics & Accessories', 'Vet new factory before wire transfer', 'Bulk Commercial Order', 'Yes, I already have a supplier', 'Immediately', 'Lagos Tech Gadgets Ltd', 'Advanced', 'Comprehensive custom branding & box packaging', 'Need factory audit report and license verification for a Shenzhen factory.'),
('SOL-REG-103', 'TXN-8003', 'sol-2', 'E-commerce Brand Accelerator', 'Learning', 'Blessing Adebayo', 'blessing.a@startup.ng', '+234 814 555 7890', 102000, 'Card', 'Successful', '2026-08-05T09:15:00Z', 'Home & Lifestyle', 'Complete scaling roadmap from 6 to 8 figures', 'Retail Brand', 'Yes', 'Q3 2026', 'Aura Living', 'Beginner', 'Learn high-converting Meta advertising & inventory management', 'Transitioning from drop-shipping to holding inventory in Lagos.'),
('SOL-REG-104', 'TXN-8004', 'sol-1', 'End-to-End China Procurement', 'Business', 'Kayode Fashola', 'kayode.fashola@ventures.com', '+234 809 444 3322', 60000, 'Bank Transfer', 'Pending', '2026-08-14T16:20:00Z', 'Footwear & Bags', 'Custom mold shoe manufacturer verification', '1000 pairs', 'No', 'Within 2 months', 'Fashola Footwear', 'Intermediate', 'Sourcing verified genuine leather tanneries in Guangzhou', 'Awaiting proforma invoice confirmation from overseas logistics team.'),
('SOL-REG-105', 'TXN-8005', 'sol-2', 'E-commerce Brand Accelerator', 'Learning', 'Halima Danjuma', 'halima.danjuma@gmail.com', '+234 812 333 4455', 102000, 'Card', 'Successful', '2026-08-13T10:05:00Z', 'Beauty & Cosmetics', 'Brand launch strategy & influencer partnerships', 'Direct to Consumer', 'Yes', 'Within 3 weeks', 'Glow African Naturals', 'Beginner', 'Building high retention email flows & influencer seeding', 'Excited to launch our organic body scrub line across Nigeria.')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 9. AUTOMATIC SKU GENERATION TRIGGER & FUNCTIONS
-- ==============================================================================

-- Helper to convert category to standard 3-letter uppercase prefix
CREATE OR REPLACE FUNCTION get_sku_category_code(cat TEXT)
RETURNS TEXT AS $$
BEGIN
  IF cat IS NULL THEN
    RETURN 'GEN';
  END IF;
  
  cat := LOWER(TRIM(cat));
  
  IF cat LIKE '%cloth%' OR cat LIKE '%wear%' THEN
    RETURN 'CLO';
  ELSIF cat LIKE '%bag%' THEN
    RETURN 'BAG';
  ELSIF cat LIKE '%shoe%' OR cat LIKE '%foot%' THEN
    RETURN 'SHO';
  ELSIF cat LIKE '%kitchen%' OR cat LIKE '%dining%' OR cat LIKE '%home%' OR cat = 'he' THEN
    RETURN 'KIT';
  ELSIF cat LIKE '%access%' OR cat LIKE '%jewel%' THEN
    RETURN 'ACC';
  ELSIF cat LIKE '%gadget%' OR cat LIKE '%tech%' THEN
    RETURN 'GAD';
  ELSIF cat LIKE '%beauty%' OR cat LIKE '%skin%' THEN
    RETURN 'BTY';
  ELSE
    RETURN UPPER(SUBSTRING(REGEXP_REPLACE(cat, '[^a-zA-Z]', '', 'g') FROM 1 FOR 3));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function to automatically assign the next SKU before insert
CREATE OR REPLACE FUNCTION generate_product_sku_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_cat_code TEXT;
  v_prefix TEXT;
  v_max_num INT;
BEGIN
  -- Only generate if SKU was not manually provided
  IF NEW.sku IS NULL OR TRIM(NEW.sku) = '' THEN
    v_cat_code := get_sku_category_code(NEW.category);
    v_prefix := 'EMH-' || v_cat_code || '-';
    
    -- Find highest current number for this category (e.g. 1001, 1002...)
    SELECT COALESCE(
      MAX(
        CASE 
          WHEN sku ~ ('^' || v_prefix || '[0-9]+$') 
          THEN (SUBSTRING(sku FROM '[0-9]+$'))::INTEGER 
          ELSE 1000 
        END
      ), 
      1000
    )
    INTO v_max_num
    FROM products
    WHERE sku ILIKE (v_prefix || '%');

    IF v_max_num < 1000 THEN
      v_max_num := 1000;
    END IF;

    -- Assign next sequential SKU
    NEW.sku := v_prefix || (v_max_num + 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to products table
DROP TRIGGER IF EXISTS trg_generate_product_sku ON products;

CREATE TRIGGER trg_generate_product_sku
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION generate_product_sku_trigger();


