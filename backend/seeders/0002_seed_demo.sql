WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO tenant_domains (tenant_id, subdomain, custom_domain, panel_type, is_active)
SELECT id, 'gym', NULL, 'gym', true FROM target_gym
UNION ALL
SELECT id, 'coach', NULL, 'coach', true FROM target_gym
UNION ALL
SELECT id, 'app', NULL, 'athlete', true FROM target_gym
ON CONFLICT DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO onboarding_state (tenant_id, step, payload, completed_at)
SELECT id, 'gym_name', '{
  "gymName":"Demo Gym",
  "gymType":"mixed",
  "location":"Tehran",
  "sizeSqm":1400,
  "contactInfo":"+98 21 0000 0000",
  "workingHours":"Sat-Thu 06:00-23:00",
  "trainerCount":2
}'::jsonb, now()
FROM target_gym
ON CONFLICT (tenant_id) DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO members (tenant_id, external_ref, full_name, phone, gender, status, joined_at)
SELECT id, 'MEM-001', 'Ava Rahimi', '09120000001', 'female', 'active', now() - interval '22 days' FROM target_gym
UNION ALL
SELECT id, 'MEM-002', 'Mina Karimi', '09120000002', 'female', 'active', now() - interval '14 days' FROM target_gym
UNION ALL
SELECT id, 'MEM-003', 'Reza Jafari', '09120000003', 'male', 'paused', now() - interval '36 days' FROM target_gym
ON CONFLICT (tenant_id, external_ref) DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO attendance_logs (tenant_id, member_id, checkin_at, source)
SELECT id, m.id, now() - interval '12 minutes', 'gate'
FROM target_gym
CROSS JOIN LATERAL (
  SELECT id FROM members WHERE tenant_id = target_gym.id ORDER BY created_at LIMIT 1
) m
UNION ALL
SELECT id, m.id, now() - interval '28 minutes', 'app'
FROM target_gym
CROSS JOIN LATERAL (
  SELECT id FROM members WHERE tenant_id = target_gym.id ORDER BY created_at OFFSET 1 LIMIT 1
) m
ON CONFLICT DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO trainers (tenant_id, user_id, full_name, specialty, status)
SELECT id, NULL, 'Sara Amini', 'Strength', 'active' FROM target_gym
UNION ALL
SELECT id, NULL, 'Navid Hosseini', 'Functional', 'active' FROM target_gym
ON CONFLICT DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO users (email, phone, password_hash, status)
VALUES
  ('trainer@demo-gym.ir', '09120000010', crypt('Trainer#2026', gen_salt('bf')), 'active'),
  ('athlete@demo-gym.ir', '09120000011', crypt('Athlete#2026', gen_salt('bf')), 'active')
ON CONFLICT (email) DO NOTHING;

WITH target_gym AS (
  SELECT id,
         (SELECT id FROM users WHERE email = 'trainer@demo-gym.ir' LIMIT 1) AS trainer_user_id,
         (SELECT id FROM users WHERE email = 'athlete@demo-gym.ir' LIMIT 1) AS athlete_user_id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO gym_users (tenant_id, user_id, role, status, first_login_completed_at)
SELECT id, trainer_user_id, 'trainer', 'active', now() FROM target_gym
UNION ALL
SELECT id, athlete_user_id, 'athlete', 'active', now() FROM target_gym
ON CONFLICT (tenant_id, user_id) DO NOTHING;

WITH target_gym AS (
  SELECT g.id,
         (SELECT id FROM users WHERE email = 'trainer@demo-gym.ir' LIMIT 1) AS trainer_user_id
  FROM gyms g
  WHERE g.slug = 'demo-gym'
  LIMIT 1
)
UPDATE trainers t
SET user_id = target_gym.trainer_user_id
FROM target_gym
WHERE t.tenant_id = target_gym.id
  AND t.full_name = 'Sara Amini';

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO equipment (tenant_id, name, category, quantity, status, last_maintenance_at)
SELECT id, 'Treadmill', 'Cardio', 12, 'active', now() - interval '12 days' FROM target_gym
UNION ALL
SELECT id, 'Bench Press', 'Strength', 6, 'maintenance', now() - interval '2 days' FROM target_gym
UNION ALL
SELECT id, 'Cable Station', 'Strength', 8, 'active', now() - interval '8 days' FROM target_gym
ON CONFLICT DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO subscriptions (tenant_id, plan_id, status, starts_at, ends_at, billing_cycle)
SELECT id, p.id, 'active', now() - interval '1 month', now() + interval '29 days', 'monthly'
FROM target_gym
CROSS JOIN pricing_plans p
WHERE p.code = 'growth'
ON CONFLICT DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO occupancy_snapshots (tenant_id, current_occupancy, capacity, captured_at)
SELECT id, 184, 250, now()
FROM target_gym
ON CONFLICT DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO analytics_events (tenant_id, event_type, entity_type, payload, occurred_at)
SELECT id, 'checkin', 'attendance', '{"source":"gate","delta":1}'::jsonb, now() - interval '4 minutes'
FROM target_gym
ON CONFLICT DO NOTHING;
