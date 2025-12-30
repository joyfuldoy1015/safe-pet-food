-- ============================================
-- Community Q&A Tables Schema
-- ============================================
-- Purpose: Independent community Q&A forum
-- (separate from review_logs Q&A)
-- ============================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Community Questions Table
-- ============================================
CREATE TABLE IF NOT EXISTS community_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (LENGTH(TRIM(title)) >= 5 AND LENGTH(title) <= 200),
  content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) >= 10 AND LENGTH(content) <= 5000),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    '🐶 강아지',
    '🐱 고양이',
    '🍖 사료 & 영양',
    '❤️ 건강',
    '🎓 훈련 & 행동',
    '💬 자유토론'
  )),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  votes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  admin_status TEXT DEFAULT 'visible' CHECK (admin_status IN ('visible', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Community Answers Table
-- ============================================
CREATE TABLE IF NOT EXISTS community_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) >= 10 AND LENGTH(content) <= 5000),
  is_accepted BOOLEAN DEFAULT FALSE,
  votes INTEGER DEFAULT 0,
  admin_status TEXT DEFAULT 'visible' CHECK (admin_status IN ('visible', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Community Votes Table (for tracking user votes)
-- ============================================
CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  target_id UUID NOT NULL,
  vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)), -- upvote or downvote
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_community_questions_author ON community_questions(author_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_category ON community_questions(category);
CREATE INDEX IF NOT EXISTS idx_community_questions_status ON community_questions(status);
CREATE INDEX IF NOT EXISTS idx_community_questions_created ON community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_votes ON community_questions(votes DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_admin_status ON community_questions(admin_status);

CREATE INDEX IF NOT EXISTS idx_community_answers_question ON community_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_author ON community_answers(author_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_created ON community_answers(created_at);
CREATE INDEX IF NOT EXISTS idx_community_answers_admin_status ON community_answers(admin_status);

CREATE INDEX IF NOT EXISTS idx_community_votes_user ON community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_target ON community_votes(target_type, target_id);

-- ============================================
-- RLS Enable
-- ============================================
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Community Questions
-- ============================================

-- Everyone can view visible questions
DROP POLICY IF EXISTS "Anyone can view visible questions" ON community_questions;
CREATE POLICY "Anyone can view visible questions"
  ON community_questions FOR SELECT
  USING (admin_status = 'visible');

-- Authenticated users can insert questions
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON community_questions;
CREATE POLICY "Authenticated users can insert questions"
  ON community_questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own questions
DROP POLICY IF EXISTS "Users can update their own questions" ON community_questions;
CREATE POLICY "Users can update their own questions"
  ON community_questions FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own questions
DROP POLICY IF EXISTS "Users can delete their own questions" ON community_questions;
CREATE POLICY "Users can delete their own questions"
  ON community_questions FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- RLS Policies - Community Answers
-- ============================================

-- Everyone can view visible answers
DROP POLICY IF EXISTS "Anyone can view visible answers" ON community_answers;
CREATE POLICY "Anyone can view visible answers"
  ON community_answers FOR SELECT
  USING (admin_status = 'visible');

-- Authenticated users can insert answers
DROP POLICY IF EXISTS "Authenticated users can insert answers" ON community_answers;
CREATE POLICY "Authenticated users can insert answers"
  ON community_answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own answers
DROP POLICY IF EXISTS "Users can update their own answers" ON community_answers;
CREATE POLICY "Users can update their own answers"
  ON community_answers FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own answers
DROP POLICY IF EXISTS "Users can delete their own answers" ON community_answers;
CREATE POLICY "Users can delete their own answers"
  ON community_answers FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- RLS Policies - Community Votes
-- ============================================

-- Users can view their own votes
DROP POLICY IF EXISTS "Users can view their own votes" ON community_votes;
CREATE POLICY "Users can view their own votes"
  ON community_votes FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert votes
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON community_votes;
CREATE POLICY "Authenticated users can insert votes"
  ON community_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
DROP POLICY IF EXISTS "Users can update their own votes" ON community_votes;
CREATE POLICY "Users can update their own votes"
  ON community_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
DROP POLICY IF EXISTS "Users can delete their own votes" ON community_votes;
CREATE POLICY "Users can delete their own votes"
  ON community_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Triggers - Auto update timestamps
-- ============================================

-- Update updated_at on questions
CREATE OR REPLACE FUNCTION update_community_question_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_community_question_updated_at ON community_questions;
CREATE TRIGGER trigger_update_community_question_updated_at
  BEFORE UPDATE ON community_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_community_question_updated_at();

-- Update updated_at on answers
CREATE OR REPLACE FUNCTION update_community_answer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_community_answer_updated_at ON community_answers;
CREATE TRIGGER trigger_update_community_answer_updated_at
  BEFORE UPDATE ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_community_answer_updated_at();

-- ============================================
-- Functions - Update question status when answer is accepted
-- ============================================

CREATE OR REPLACE FUNCTION update_question_status_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_accepted = TRUE AND (OLD.is_accepted IS NULL OR OLD.is_accepted = FALSE) THEN
    UPDATE community_questions
    SET status = 'answered', updated_at = NOW()
    WHERE id = NEW.question_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_question_status_on_accept ON community_answers;
CREATE TRIGGER trigger_update_question_status_on_accept
  AFTER UPDATE ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_status_on_accept();

-- ============================================
-- View - Questions with answer count and author info
-- ============================================

CREATE OR REPLACE VIEW community_questions_with_stats AS
SELECT 
  q.*,
  COALESCE(COUNT(a.id), 0) as answer_count,
  p.nickname as author_nickname,
  p.avatar_url as author_avatar
FROM community_questions q
LEFT JOIN community_answers a ON a.question_id = q.id AND a.admin_status = 'visible'
LEFT JOIN profiles p ON p.id = q.author_id
WHERE q.admin_status = 'visible'
GROUP BY q.id, p.nickname, p.avatar_url;

-- ============================================
-- Confirmation
-- ============================================
SELECT '✅ Community Q&A tables created successfully!' as status;
