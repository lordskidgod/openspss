-- ==============================================================================
-- Open SPSS Web - Supabase Database Schema
-- Run this script in your Supabase SQL Editor
-- ==============================================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  data_license_agreed BOOLEAN NOT NULL DEFAULT true,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure avatar_url column exists if profiles table was created earlier
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Cloud Projects & Datasets Table (FULL RAW DATA & VARIABLE METADATA)
-- Drop old/incomplete version if it was created previously with missing columns
DROP TABLE IF EXISTS public.cloud_projects CASCADE;

CREATE TABLE public.cloud_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General' CHECK (category IN (
    'Market Research', 
    'Consumer & Dating Surveys', 
    'E-Commerce & Tech', 
    'Academic & Psychology', 
    'Finance & Business', 
    'Healthcare & Bio', 
    'General'
  )),
  description TEXT,
  row_count INTEGER NOT NULL DEFAULT 0,
  col_count INTEGER NOT NULL DEFAULT 0,
  
  -- Raw Data & Definitions
  variables_schema JSONB NOT NULL,        -- Array of variable metadata (id, name, type, label, values, etc.)
  raw_data JSONB NOT NULL,                -- Complete raw data rows for platform data intelligence & research
  output_items JSONB DEFAULT '[]'::jsonb, -- Generated statistics, tables, and chart configurations
  syntax_code TEXT,                       -- SPSS syntax commands
  
  -- Tracking & License Rights
  can_mine_data BOOLEAN NOT NULL DEFAULT true, -- True for free accounts; False for Pro
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on cloud_projects
ALTER TABLE public.cloud_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own projects" ON public.cloud_projects;
CREATE POLICY "Users can view own projects" ON public.cloud_projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.cloud_projects;
CREATE POLICY "Users can insert own projects" ON public.cloud_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.cloud_projects;
CREATE POLICY "Users can update own projects" ON public.cloud_projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.cloud_projects;
CREATE POLICY "Users can delete own projects" ON public.cloud_projects
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Market Intelligence Logs (Anonymized signals & procedure tracking)
CREATE TABLE IF NOT EXISTS public.market_intelligence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.cloud_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT,
  detected_topics JSONB,
  summary_metrics JSONB,
  can_mine BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.market_intelligence_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert market intelligence logs" ON public.market_intelligence_logs;
CREATE POLICY "Users can insert market intelligence logs" ON public.market_intelligence_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Trigger to automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, subscription_tier, data_license_agreed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'free',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NULLIF(NEW.raw_user_meta_data->>'name', ''), profiles.full_name),
    avatar_url = COALESCE(NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''), NULLIF(NEW.raw_user_meta_data->>'picture', ''), profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. Platform Admin Role & Intelligence RLS Policies
-- To make a user an Admin, run: 
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ==============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Allow Admins to query all projects for platform intelligence
DROP POLICY IF EXISTS "Users can view own projects" ON public.cloud_projects;
DROP POLICY IF EXISTS "Users and admins can view projects" ON public.cloud_projects;
CREATE POLICY "Users and admins can view projects" ON public.cloud_projects
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Allow Admins to view contributor profile info (emails)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;
CREATE POLICY "Users and admins can view profiles" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- ==============================================================================
-- 6. Role & Subscription Security (Anti-Tamper Protection)
-- Prevents ordinary users from self-elevating their role to 'admin' or tier to 'pro'
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.protect_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- If role or subscription_tier is changed, verify caller is an existing admin
  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier) THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: You cannot alter your own role or subscription tier.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_user_roles ON public.profiles;
CREATE TRIGGER tr_protect_user_roles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_roles();

