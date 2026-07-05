-- QuantumFit messaging and athlete notification extensions

CREATE TABLE IF NOT EXISTS sms_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  trigger_type text NOT NULL,
  condition jsonb NOT NULL DEFAULT '{}'::jsonb,
  message_template text NOT NULL,
  channel text NOT NULL DEFAULT 'sms',
  status text NOT NULL DEFAULT 'active',
  last_triggered_at timestamptz,
  next_trigger_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS athlete_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'system',
  source text NOT NULL DEFAULT 'platform',
  status text NOT NULL DEFAULT 'sent',
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_rules_tenant_status ON sms_automation_rules (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_rules_tenant_trigger ON sms_automation_rules (tenant_id, trigger_type);
CREATE UNIQUE INDEX IF NOT EXISTS ux_sms_rules_tenant_name_trigger ON sms_automation_rules (tenant_id, rule_name, trigger_type);
CREATE INDEX IF NOT EXISTS idx_sms_logs_tenant_created ON sms_automation_logs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_athlete_notifications_tenant_member ON athlete_notifications (tenant_id, member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_athlete_notifications_tenant_status ON athlete_notifications (tenant_id, status, created_at DESC);

ALTER TABLE sms_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY sms_rules_tenant_policy ON sms_automation_rules
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY athlete_notifications_tenant_policy ON athlete_notifications
  USING (tenant_id::text = current_setting('app.tenant_id', true));
