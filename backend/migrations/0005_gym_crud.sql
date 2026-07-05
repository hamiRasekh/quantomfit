-- QuantumFit gym panel CRUD entities

CREATE TABLE IF NOT EXISTS gym_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  trainer_id uuid REFERENCES trainers(id) ON DELETE SET NULL,
  title text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  schedule text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gym_classes_tenant_created ON gym_classes (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gym_classes_tenant_status ON gym_classes (tenant_id, status);
