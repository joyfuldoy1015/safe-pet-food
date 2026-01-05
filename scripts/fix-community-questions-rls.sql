-- Fix community_questions RLS policies
-- This script adds necessary RLS policies for the community_questions table

-- 1. Enable RLS on community_questions table (if not already enabled)
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view visible questions" ON community_questions;
DROP POLICY IF EXISTS "Users can view own questions" ON community_questions;
DROP POLICY IF EXISTS "Users can insert own questions" ON community_questions;
DROP POLICY IF EXISTS "Users can update own questions" ON community_questions;
DROP POLICY IF EXISTS "Users can delete own questions" ON community_questions;

-- 3. SELECT policies: Allow users to view questions
-- Policy 1: Anyone can view visible questions (admin_status = 'visible')
CREATE POLICY "Anyone can view visible questions"
ON community_questions
FOR SELECT
USING (admin_status = 'visible');

-- Policy 2: Users can always view their own questions (regardless of admin_status)
CREATE POLICY "Users can view own questions"
ON community_questions
FOR SELECT
USING (auth.uid() = author_id);

-- 4. INSERT policy: Authenticated users can create questions
CREATE POLICY "Users can insert own questions"
ON community_questions
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- 5. UPDATE policy: Users can update their own questions
CREATE POLICY "Users can update own questions"
ON community_questions
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- 6. DELETE policy: Users can delete their own questions
CREATE POLICY "Users can delete own questions"
ON community_questions
FOR DELETE
USING (auth.uid() = author_id);

-- 7. Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'community_questions';
