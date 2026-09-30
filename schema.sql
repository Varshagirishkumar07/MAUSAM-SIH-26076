-- ====================================================================
-- MAUSAM - Personalized Weather Advisory System
-- Smart India Hackathon (SIH) Problem Statement 26076
-- Module 2.4: Database Schema & RLS Architecture (PostgreSQL on Supabase)
-- ====================================================================

-- 1. Create saved_plans table matching TRD and Module 2.4 Planning Context
CREATE TABLE IF NOT EXISTS public.saved_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  language VARCHAR(10) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  activity VARCHAR(50) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  planned_date DATE NOT NULL,
  planned_time TIME WITHOUT TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'active'
);

-- 2. Enable Row Level Security (RLS)
-- In accordance with strict security specifications:
-- Broad/unrestricted anonymous policies (e.g. FOR SELECT/INSERT TO anon USING (true))
-- are strictly disallowed to prevent unrestricted scraping or tampering.
ALTER TABLE public.saved_plans ENABLE ROW LEVEL SECURITY;

-- 3. Security Architecture & Fallback Design:
-- - Client connects using the public anon/publishable key only.
-- - Without broad anonymous write policies, RLS safeguards the database.
-- - If Supabase RLS blocks direct anonymous insertion (code 42501 / HTTP 403),
--   the application does NOT crash and gracefully falls back to local device
--   persistence (localStorage: 'mausam_app_context') with a clear user notice:
--   "Your plan could not be saved online. Your current plan is still available on this device."
-- - In production with user authentication, user-scoped policies can be added:
--   CREATE POLICY "User plan isolation" ON public.saved_plans
--     FOR ALL TO authenticated USING (auth.uid() = user_id);

COMMENT ON TABLE public.saved_plans IS 'Stores personalized MAUSAM planning contexts with RLS enforcement.';
