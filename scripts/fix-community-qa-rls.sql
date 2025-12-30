-- ============================================
-- Fix Community Q&A RLS Policies
-- ============================================
-- Purpose: Ensure anyone can view questions
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view visible questions" ON community_questions;
DROP POLICY IF EXISTS "Anyone can view visible answers" ON community_answers;

-- Recreate policies with correct permissions

-- ============================================
-- Community Questions - Public Read
-- ============================================
CREATE POLICY "Anyone can view visible questions"
  ON community_questions FOR SELECT
  USING (admin_status = 'visible');

-- ============================================
-- Community Answers - Public Read
-- ============================================
CREATE POLICY "Anyone can view visible answers"
  ON community_answers FOR SELECT
  USING (admin_status = 'visible');

-- ============================================
-- Test Query
-- ============================================
SELECT 
  '✅ RLS policies updated!' as status,
  COUNT(*) as visible_questions
FROM community_questions
WHERE admin_status = 'visible';
