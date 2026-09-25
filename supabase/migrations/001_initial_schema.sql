-- ============================================================================
-- PinkLoom Database Foundation Migration (001_initial_schema.sql)
-- Tables: projects, brand_states, agent_runs
-- ============================================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  raw_idea TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Brand States Table
CREATE TABLE IF NOT EXISTS brand_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  discovery JSONB NOT NULL DEFAULT '{}'::jsonb,
  positioning JSONB NOT NULL DEFAULT '{}'::jsonb,
  personality JSONB NOT NULL DEFAULT '{}'::jsonb,
  naming JSONB NOT NULL DEFAULT '{}'::jsonb,
  voice JSONB NOT NULL DEFAULT '{}'::jsonb,
  visual_direction JSONB NOT NULL DEFAULT '{}'::jsonb,
  critique JSONB NOT NULL DEFAULT '{}'::jsonb,
  consistency JSONB NOT NULL DEFAULT '{}'::jsonb,
  final_brand JSONB NULL,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_brand_states_project_id ON brand_states(project_id);

-- 3. Agent Runs (Execution Trace Table)
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  stage TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT NULL,
  duration_ms INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_project_id ON agent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_stage ON agent_runs(stage);
