-- ================================================================
-- Migration 001: 조회수 원자적 업데이트 RPC
-- Supabase 대시보드 > SQL Editor 에서 실행
-- ================================================================

-- 조회수 원자적 증가 RPC (community_questions)
CREATE OR REPLACE FUNCTION public.increment_question_views(question_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.community_questions
  SET views = views + 1
  WHERE id = question_id;
$$;

-- 조회수 원자적 증가 RPC (review_logs)
CREATE OR REPLACE FUNCTION public.increment_review_log_views(log_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.review_logs
  SET views = views + 1
  WHERE id = log_id;
$$;
