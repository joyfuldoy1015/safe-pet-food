-- ============================================
-- Admin Schema: Roles, Moderation, Settings
-- ============================================

-- ============================================
-- 1. Roles Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Moderation Actions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('hide', 'unhide', 'soft_delete', 'restore', 'flag', 'note')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Admin Notes Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  note TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. App Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 5. Add admin_status columns to UGC tables
-- ============================================

-- Review Logs (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_logs') THEN
    ALTER TABLE public.review_logs 
      ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'visible' 
      CHECK (admin_status IN ('visible', 'hidden', 'deleted'));
  END IF;
END $$;

-- Comments (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    ALTER TABLE public.comments 
      ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'visible' 
      CHECK (admin_status IN ('visible', 'hidden', 'deleted'));
  END IF;
END $$;

-- QA Threads (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qa_threads') THEN
    ALTER TABLE public.qa_threads 
      ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'visible' 
      CHECK (admin_status IN ('visible', 'hidden', 'deleted'));
  END IF;
END $$;

-- QA Posts (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qa_posts') THEN
    ALTER TABLE public.qa_posts 
      ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'visible' 
      CHECK (admin_status IN ('visible', 'hidden', 'deleted'));
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON public.roles(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_actor_id ON public.moderation_actions(actor_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON public.moderation_actions(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created_at ON public.moderation_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notes_target ON public.admin_notes(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_author_id ON public.admin_notes(author_id);

-- Indexes for admin_status (if tables exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_logs') THEN
    CREATE INDEX IF NOT EXISTS idx_review_logs_admin_status ON public.review_logs(admin_status);
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
    CREATE INDEX IF NOT EXISTS idx_comments_admin_status ON public.comments(admin_status);
  END IF;
END $$;

-- ============================================
-- Functions
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================
-- Drop existing triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
DROP TRIGGER IF EXISTS update_admin_notes_updated_at ON public.admin_notes;

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_notes_updated_at
  BEFORE UPDATE ON public.admin_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Roles RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Admins can read roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

-- Only admins can read roles
CREATE POLICY "Admins can read roles"
  ON public.roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Only admins can insert/update roles
CREATE POLICY "Admins can manage roles"
  ON public.roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- ============================================
-- Moderation Actions RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Admins and moderators can read moderation actions" ON public.moderation_actions;
DROP POLICY IF EXISTS "Admins and moderators can create moderation actions" ON public.moderation_actions;

-- Admins and moderators can read moderation actions
CREATE POLICY "Admins and moderators can read moderation actions"
  ON public.moderation_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'moderator')
    )
  );

-- Admins and moderators can insert moderation actions
CREATE POLICY "Admins and moderators can create moderation actions"
  ON public.moderation_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'moderator')
    )
  );

-- ============================================
-- Admin Notes RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Admins and moderators can read admin notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Admins and moderators can manage admin notes" ON public.admin_notes;

-- Admins and moderators can read admin notes
CREATE POLICY "Admins and moderators can read admin notes"
  ON public.admin_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'moderator')
    )
  );

-- Admins and moderators can manage admin notes
CREATE POLICY "Admins and moderators can manage admin notes"
  ON public.admin_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role IN ('admin', 'moderator')
    )
  );

-- ============================================
-- App Settings RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only admins can update app settings" ON public.app_settings;

-- Anyone can read app settings (public config)
CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Only admins can update app settings
CREATE POLICY "Only admins can update app settings"
  ON public.app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- ============================================
-- Grant Permissions
-- ============================================
GRANT SELECT ON public.roles TO anon, authenticated;
GRANT SELECT ON public.moderation_actions TO anon, authenticated;
GRANT SELECT ON public.admin_notes TO anon, authenticated;
GRANT SELECT ON public.app_settings TO anon, authenticated;

