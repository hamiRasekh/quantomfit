-- QuantumFit workout program assignments

CREATE TABLE IF NOT EXISTS workout_program_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_workout_program_members_tenant_program ON workout_program_members (tenant_id, program_id);
CREATE INDEX IF NOT EXISTS idx_workout_program_members_tenant_member ON workout_program_members (tenant_id, member_id);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  title text NOT NULL,
  day_label text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  notes text NOT NULL DEFAULT '',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_tenant_program ON workout_sessions (tenant_id, program_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_tenant_member ON workout_sessions (tenant_id, member_id, created_at DESC);
