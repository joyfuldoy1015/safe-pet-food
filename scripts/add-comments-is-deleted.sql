-- comments 테이블에 is_deleted 컬럼 추가
-- soft delete 기능을 위해 사용됨 (대댓글이 있는 댓글 삭제 시)

ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 인덱스 추가 (선택사항, 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);

-- pet_log_qa_posts 테이블에도 is_deleted 컬럼 추가
-- Q&A 답변에 댓글이 있거나, 질문에 답변이 있는 경우 soft delete 처리

ALTER TABLE pet_log_qa_posts 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_pet_log_qa_posts_is_deleted ON pet_log_qa_posts(is_deleted);
