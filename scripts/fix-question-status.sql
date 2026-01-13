-- 답변이 있는 질문의 status를 'answered'로 일괄 업데이트
-- 실행 전 현재 상태 확인

-- 1. 현재 상태 확인 (먼저 실행해서 확인)
SELECT 
  cq.id,
  cq.title,
  cq.status,
  COUNT(ca.id) as answer_count
FROM community_questions cq
LEFT JOIN community_answers ca ON cq.id = ca.question_id
GROUP BY cq.id, cq.title, cq.status
ORDER BY answer_count DESC;

-- 2. 답변이 1개 이상인데 status가 'open'인 질문 업데이트
UPDATE community_questions
SET status = 'answered', updated_at = NOW()
WHERE id IN (
  SELECT cq.id
  FROM community_questions cq
  INNER JOIN community_answers ca ON cq.id = ca.question_id
  WHERE cq.status = 'open'
  GROUP BY cq.id
  HAVING COUNT(ca.id) >= 1
);

-- 3. 업데이트 결과 확인
SELECT 
  cq.id,
  cq.title,
  cq.status,
  COUNT(ca.id) as answer_count
FROM community_questions cq
LEFT JOIN community_answers ca ON cq.id = ca.question_id
GROUP BY cq.id, cq.title, cq.status
ORDER BY answer_count DESC;
