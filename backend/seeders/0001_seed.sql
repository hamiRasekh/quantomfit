INSERT INTO pricing_plans (code, name, limits, is_active)
VALUES
  ('starter', 'Starter', '{"gyms": 1, "members": 250, "trainers": 5}'::jsonb, true),
  ('growth', 'Growth', '{"gyms": 5, "members": 2000, "trainers": 20}'::jsonb, true),
  ('enterprise', 'Enterprise', '{"gyms": 9999, "members": 999999, "trainers": 9999}'::jsonb, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (code, discount_type, discount_value, is_active)
VALUES
  ('WELCOME10', 'percent', 10, true),
  ('GYM2026', 'fixed', 100, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO website_content (locale, section, title, subtitle, body, cta, features, faq, testimonials, images, meta)
VALUES
  (
    'en',
    'homepage',
    'QuantumFit',
    'Premium gym operations with live intelligence.',
    'The public website and all panels read this content from the admin-managed CMS.',
    'Request Demo',
    '["Gym management","Trainer panel","Athlete app","Real-time crowd tracking","Smart SMS automation"]'::jsonb,
    '[{"q":"What is QuantumFit?","a":"A web-based gym ecosystem."},{"q":"Does it support RTL?","a":"Yes, Persian and English."}]'::jsonb,
    '[{"name":"Demo Gym","quote":"Premium and connected."}]'::jsonb,
    '["/images/hero-1.jpg","/images/hero-2.jpg"]'::jsonb,
    '{"planVisibility": true, "theme": "dark"}'::jsonb
  )
ON CONFLICT (locale, section) DO NOTHING;

INSERT INTO users (email, phone, password_hash, status)
VALUES
  ('admin@quantumfit.ir', NULL, crypt('Admin#2026', gen_salt('bf')), 'active'),
  ('superadmin@quantumfit.ir', NULL, crypt('SuperAdmin#2026', gen_salt('bf')), 'active'),
  ('owner@demo-gym.ir', '09120000000', crypt('Owner#2026', gen_salt('bf')), 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO gyms (slug, name, status, plan_code, subdomain, tenant_type, timezone, onboarding_status)
VALUES
  ('demo-gym', 'Demo Gym', 'active', 'growth', 'gym', 'shared', 'Asia/Tehran', 'active')
ON CONFLICT (slug) DO NOTHING;

WITH demo_gym AS (
  SELECT id, (SELECT id FROM users WHERE email = 'owner@demo-gym.ir' LIMIT 1) AS owner_id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO gym_users (tenant_id, user_id, role, status, first_login_completed_at)
SELECT id, owner_id::uuid, 'gym_owner', 'active', now()
FROM demo_gym
ON CONFLICT (tenant_id, user_id) DO NOTHING;
