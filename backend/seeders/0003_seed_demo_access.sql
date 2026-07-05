WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO demo_accesses (tenant_id, demo_type, panel_type, account_name, username, password_hash, feature_access_level, read_only, expires_at, is_active, notes)
SELECT id, 'gym', 'gym', 'Gym Demo Account', 'demo-gym-admin', crypt('Demo#Gym2026', gen_salt('bf')), 'full', false, now() + interval '90 days', true, 'Seeded demo gym access'
FROM target_gym
UNION ALL
SELECT id, 'coach', 'coach', 'Coach Demo Account', 'demo-gym-coach', crypt('Demo#Coach2026', gen_salt('bf')), 'full', false, now() + interval '90 days', true, 'Seeded demo coach access'
FROM target_gym
UNION ALL
SELECT id, 'athlete', 'app', 'Athlete Demo Account', 'demo-gym-athlete', crypt('Demo#Athlete2026', gen_salt('bf')), 'read', true, now() + interval '90 days', true, 'Seeded demo athlete access'
FROM target_gym
ON CONFLICT (username) DO NOTHING;

WITH target_gym AS (
  SELECT id
  FROM gyms
  WHERE slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO sms_automation_rules (tenant_id, rule_name, trigger_type, condition, message_template, channel, status, last_triggered_at, next_trigger_at)
SELECT id, 'Inactive member win-back', 'inactivity', '{"days": 7}'::jsonb, 'We miss you at QuantumFit. Come back today for a free session.', 'sms', 'active', now() - interval '3 days', now() + interval '4 hours'
FROM target_gym
UNION ALL
SELECT id, 'Renewal reminder', 'subscription_expiry', '{"daysBefore": 3}'::jsonb, 'Your membership expires soon. Renew now to keep your plan active.', 'sms', 'active', now() - interval '1 day', now() + interval '1 day'
FROM target_gym
ON CONFLICT DO NOTHING;

WITH target_gym AS (
  SELECT g.id,
         (
           SELECT m.id
           FROM members m
           WHERE m.tenant_id = g.id
           ORDER BY m.created_at
           LIMIT 1
         ) AS first_member_id
  FROM gyms g
  WHERE g.slug = 'demo-gym'
  LIMIT 1
)
INSERT INTO athlete_notifications (tenant_id, member_id, title, body, category, source, status, sent_at, metadata)
SELECT id, first_member_id, 'Workout ready', 'Your pull day session is waiting in the app.', 'workout', 'platform', 'sent', now() - interval '45 minutes', '{"priority":"high"}'::jsonb
FROM target_gym
UNION ALL
SELECT id, first_member_id, 'Membership reminder', 'Your renewal date is coming up in 3 days.', 'billing', 'platform', 'sent', now() - interval '2 hours', '{"priority":"normal"}'::jsonb
FROM target_gym
ON CONFLICT DO NOTHING;
