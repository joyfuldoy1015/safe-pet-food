-- ============================================
-- Pet Log Q&A Tables Schema
-- ============================================
-- Purpose: Q&A for review_logs (pet feeding logs)
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Pet Log Q&A Threads Table
-- ============================================
CREATE TABLE IF NOT EXISTS pet_log_qa_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID NOT NULL REFERENCES review_logs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Pet Log Q&A Posts Table
-- ============================================
CREATE TABLE IF NOT EXISTS pet_log_qa_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES pet_log_qa_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('question', 'answer', 'comment')),
  parent_id UUID REFERENCES pet_log_qa_posts(id) ON DELETE CASCADE,
  is_accepted BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_threads_log ON pet_log_qa_threads(log_id);
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_threads_author ON pet_log_qa_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_threads_created ON pet_log_qa_threads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pet_log_qa_posts_thread ON pet_log_qa_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_posts_author ON pet_log_qa_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_posts_parent ON pet_log_qa_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_posts_kind ON pet_log_qa_posts(kind);
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_posts_created ON pet_log_qa_posts(created_at);

-- ============================================
-- RLS Enable
-- ============================================
ALTER TABLE pet_log_qa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_log_qa_posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Pet Log Q&A Threads
-- ============================================

-- Everyone can view threads
DROP POLICY IF EXISTS "Anyone can view pet log qa threads" ON pet_log_qa_threads;
CREATE POLICY "Anyone can view pet log qa threads"
  ON pet_log_qa_threads FOR SELECT
  USING (true);

-- Authenticated users can insert threads
DROP POLICY IF EXISTS "Authenticated users can insert pet log qa threads" ON pet_log_qa_threads;
CREATE POLICY "Authenticated users can insert pet log qa threads"
  ON pet_log_qa_threads FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own threads
DROP POLICY IF EXISTS "Users can update their own pet log qa threads" ON pet_log_qa_threads;
CREATE POLICY "Users can update their own pet log qa threads"
  ON pet_log_qa_threads FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own threads
DROP POLICY IF EXISTS "Users can delete their own pet log qa threads" ON pet_log_qa_threads;
CREATE POLICY "Users can delete their own pet log qa threads"
  ON pet_log_qa_threads FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- RLS Policies - Pet Log Q&A Posts
-- ============================================

-- Everyone can view posts
DROP POLICY IF EXISTS "Anyone can view pet log qa posts" ON pet_log_qa_posts;
CREATE POLICY "Anyone can view pet log qa posts"
  ON pet_log_qa_posts FOR SELECT
  USING (true);

-- Authenticated users can insert posts
DROP POLICY IF EXISTS "Authenticated users can insert pet log qa posts" ON pet_log_qa_posts;
CREATE POLICY "Authenticated users can insert pet log qa posts"
  ON pet_log_qa_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
DROP POLICY IF EXISTS "Users can update their own pet log qa posts" ON pet_log_qa_posts;
CREATE POLICY "Users can update their own pet log qa posts"
  ON pet_log_qa_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Users can delete their own posts
DROP POLICY IF EXISTS "Users can delete their own pet log qa posts" ON pet_log_qa_posts;
CREATE POLICY "Users can delete their own pet log qa posts"
  ON pet_log_qa_posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- Confirmation
-- ============================================
SELECT '✅ Pet Log Q&A tables created successfully!' as status;
