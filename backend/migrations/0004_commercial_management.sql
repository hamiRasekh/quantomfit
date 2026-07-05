-- QuantumFit commercial management extensions

ALTER TABLE pricing_plans
  ADD COLUMN IF NOT EXISTS monthly_price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS yearly_price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS applicable_plan_code text,
  ADD COLUMN IF NOT EXISTS panel_type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_purchase_only boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS usage_limit integer,
  ADD COLUMN IF NOT EXISTS usage_per_customer integer,
  ADD COLUMN IF NOT EXISTS stackable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS internal_note text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS customer_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_code text NOT NULL,
  discount_type text NOT NULL,
  discount_value numeric(12,2) NOT NULL DEFAULT 0,
  duration_months integer NOT NULL DEFAULT 1,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  reason text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  stackable boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_accesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  demo_type text NOT NULL,
  panel_type text NOT NULL,
  account_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  feature_access_level text NOT NULL DEFAULT 'full',
  read_only boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL DEFAULT 'demo',
  panel_type text NOT NULL DEFAULT 'gym',
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'website',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_discounts_gym_plan ON customer_discounts (gym_id, plan_code, is_active);
CREATE INDEX IF NOT EXISTS idx_customer_discounts_active_window ON customer_discounts (is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_demo_accesses_type_active ON demo_accesses (demo_type, is_active, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status_created ON demo_requests (status, created_at DESC);

INSERT INTO pricing_plans (code, name, monthly_price, yearly_price, currency, description, limits, is_active)
VALUES
  ('starter', 'Starter', 49, 490, 'USD', 'Entry plan for a single gym.', '{"gyms": 1, "members": 250, "trainers": 5}'::jsonb, true),
  ('growth', 'Growth', 149, 1490, 'USD', 'For scaling gyms with analytics.', '{"gyms": 5, "members": 2000, "trainers": 20}'::jsonb, true),
  ('enterprise', 'Enterprise', 399, 3990, 'USD', 'Multi-location and high-volume operations.', '{"gyms": 9999, "members": 999999, "trainers": 9999}'::jsonb, true)
ON CONFLICT (code) DO UPDATE SET
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  currency = EXCLUDED.currency,
  description = EXCLUDED.description,
  limits = EXCLUDED.limits,
  is_active = EXCLUDED.is_active;

UPDATE coupons
SET panel_type = COALESCE(panel_type, ''),
    stackable = COALESCE(stackable, true),
    description = COALESCE(description, ''),
    internal_note = COALESCE(internal_note, '')
WHERE true;
