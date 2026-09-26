-- ============================================================================
-- PinkLoom Auth & User Profiles Migration (002_auth_and_user_profiles.sql)
-- Adds per-user profiles and enforces RLS so no user can access another s data.
-- Run AFTER 001_initial_schema.sql.
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  display_name TEXT,
  avatar_url   TEXT,
  provider     TEXT NOT NULL DEFAULT ''google'',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone(''utc'', now()),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT timezone(''utc'', now())
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ============================================================================
-- 2. ADD user_id TO PROJECTS (idempotent)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = ''public'' AND table_name = ''projects'' AND column_name = ''user_id''
  ) THEN
    ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_states   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs     ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RLS POLICIES — user_profiles
-- ============================================================================
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
CREATE POLICY "users_select_own_profile"
  ON public.user_profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.user_profiles FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ============================================================================
-- 5. RLS POLICIES — projects
-- ============================================================================
DROP POLICY IF EXISTS "users_crud_own_projects" ON public.projects;
CREATE POLICY "users_crud_own_projects"
  ON public.projects FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 6. RLS POLICIES — brand_states (via projects.user_id)
-- ============================================================================
DROP POLICY IF EXISTS "users_crud_own_brand_states" ON public.brand_states;
CREATE POLICY "users_crud_own_brand_states"
  ON public.brand_states FOR ALL
  USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

-- ============================================================================
-- 7. RLS POLICIES — agent_runs (via projects.user_id)
-- ============================================================================
DROP POLICY IF EXISTS "users_crud_own_agent_runs" ON public.agent_runs;
CREATE POLICY "users_crud_own_agent_runs"
  ON public.agent_runs FOR ALL
  USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

-- ============================================================================
-- 8. AUTO-CREATE PROFILE TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>''full_name'', NEW.raw_user_meta_data->>''name'', split_part(NEW.email, ''@'', 1)),
    NEW.raw_user_meta_data->>''avatar_url'',
    COALESCE(NEW.raw_app_meta_data->>''provider'', ''google'')
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.user_profiles.display_name),
    avatar_url   = COALESCE(EXCLUDED.avatar_url,   public.user_profiles.avatar_url),
    updated_at   = timezone(''utc'', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. FUNCTION: list_user_projects
-- ============================================================================
CREATE OR REPLACE FUNCTION public.list_user_projects()
RETURNS TABLE (
  id            UUID,
  raw_idea      TEXT,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ,
  has_brand     BOOLEAN,
  brand_version INT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.id,
    p.raw_idea,
    p.created_at,
    p.updated_at,
    (bs.id IS NOT NULL) AS has_brand,
    bs.version          AS brand_version
  FROM public.projects p
  LEFT JOIN public.brand_states bs ON bs.project_id = p.id
  WHERE p.user_id = auth.uid()
  ORDER BY p.updated_at DESC;
$$;
