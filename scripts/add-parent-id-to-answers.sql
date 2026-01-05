-- =====================================================
-- Add parent_id to community_answers for nested replies
-- =====================================================
-- Purpose: Enable threaded comments/replies in Q&A forum
-- Date: 2024-01-05
-- =====================================================

-- Step 1: Add parent_id column (nullable, references same table)
ALTER TABLE community_answers
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES community_answers(id) ON DELETE CASCADE;

-- Step 2: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_community_answers_parent_id 
ON community_answers(parent_id);

-- Step 3: Create index for question_id + parent_id queries
CREATE INDEX IF NOT EXISTS idx_community_answers_question_parent 
ON community_answers(question_id, parent_id);

-- Step 4: Add comment to explain the column
COMMENT ON COLUMN community_answers.parent_id IS 
'Reference to parent answer for nested replies. NULL for top-level answers.';

-- =====================================================
-- RLS Policies remain the same (already applied)
-- =====================================================
-- The existing RLS policies for community_answers should work fine:
-- - SELECT: anyone can view visible answers
-- - INSERT: authenticated users can create answers
-- - UPDATE: users can update their own answers
-- - DELETE: users can delete their own answers

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the column was added successfully:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'community_answers' AND column_name = 'parent_id';

-- =====================================================
-- Test Query: Get answers with nested structure
-- =====================================================
-- SELECT 
--   a.id,
--   a.content,
--   a.parent_id,
--   a.author_id,
--   p.nickname as author_name,
--   a.created_at
-- FROM community_answers a
-- LEFT JOIN profiles p ON a.author_id = p.id
-- WHERE a.question_id = 'YOUR_QUESTION_ID'
-- ORDER BY a.created_at ASC;
