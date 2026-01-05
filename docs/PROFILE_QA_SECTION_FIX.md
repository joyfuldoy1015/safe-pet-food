# 프로필 페이지 Q&A 섹션 수정 완료

## 문제 요약

프로필 페이지의 "내가 작성한 Q&A" 섹션에서 다음 에러가 발생:

```
code: '42703'
message: 'column community_questions.answer_count does not exist'
```

---

## 원인

`community_questions` 테이블에 `answer_count` 컬럼이 존재하지 않음

**테이블 스키마:**
```sql
CREATE TABLE community_questions (
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  category TEXT,
  status TEXT,
  votes INTEGER,
  views INTEGER,
  admin_status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
  -- ❌ answer_count 컬럼 없음!
);
```

---

## 해결 방법

### 옵션 A (적용됨) ✅

**빠른 수정: 코드에서 answer_count 제거**

1. SELECT 쿼리에서 `answer_count` 제거
2. UI에서 답변 개수 표시 제거

**변경 사항:**

```typescript
// Before
.select(`
  id,
  title,
  content,
  category,
  votes,
  views,
  created_at,
  answer_count  // ❌ 제거
`)

// After
.select(`
  id,
  title,
  content,
  category,
  votes,
  views,
  created_at
`)
```

```tsx
// Before: UI에서 답변 개수 표시
<span className="flex items-center gap-1">
  <MessageCircle className="w-3 h-3" />
  {question.answer_count || 0}
</span>

// After: 제거됨
// (votes와 views만 표시)
```

**결과:**
- ✅ 프로필 페이지 정상 작동
- ✅ Q&A 목록 표시됨
- ✅ 제목, 카테고리, 날짜, Upvote, 조회수 표시
- ⚠️ 답변 개수만 표시 안 됨

---

### 옵션 B (미래 구현)

**완전한 해결: 테이블에 answer_count 컬럼 추가**

나중에 필요하면 다음 작업 수행:

#### 1. 컬럼 추가
```sql
ALTER TABLE community_questions 
ADD COLUMN answer_count INTEGER DEFAULT 0;
```

#### 2. 기존 데이터 마이그레이션
```sql
UPDATE community_questions q
SET answer_count = (
  SELECT COUNT(*)
  FROM community_answers a
  WHERE a.question_id = q.id
    AND a.admin_status = 'visible'
);
```

#### 3. 자동 업데이트 트리거 생성
```sql
-- Trigger function
CREATE OR REPLACE FUNCTION update_question_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_questions
    SET answer_count = answer_count + 1
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_questions
    SET answer_count = GREATEST(0, answer_count - 1)
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_answer_count
AFTER INSERT OR DELETE ON community_answers
FOR EACH ROW
EXECUTE FUNCTION update_question_answer_count();
```

#### 4. 코드 복원
```typescript
// SELECT 쿼리에 answer_count 추가
.select(`
  id,
  title,
  content,
  category,
  votes,
  views,
  created_at,
  answer_count  // ✅ 복원
`)

// UI에 답변 개수 표시 복원
<span className="flex items-center gap-1">
  <MessageCircle className="w-3 h-3" />
  {question.answer_count || 0}
</span>
```

---

## 현재 상태

### ✅ 작동하는 기능
- 프로필 페이지 "내가 작성한 Q&A" 섹션
- Q&A 목록 표시
- 제목, 카테고리, 날짜 표시
- Upvote 수, 조회수 표시
- 수정/삭제 메뉴 (⋮)

### ⚠️ 제한 사항
- 답변 개수 표시 안 됨
- 대신 Upvote와 조회수만 표시

---

## 테스트 방법

1. **프로필 페이지 접속**
   ```
   http://localhost:3000/profile
   ```

2. **"내가 작성한 Q&A" 섹션 확인**
   - 작성한 Q&A 목록이 표시되는지 확인
   - 카테고리, 제목, 내용 미리보기 표시 확인
   - ↑ (Upvote), 👁 (조회수) 통계 표시 확인

3. **개발자 도구 확인 (F12)**
   ```
   Console 탭:
   ✅ "Successfully loaded X questions" 메시지
   ❌ 42703 에러 없음
   ```

4. **수정/삭제 기능 테스트**
   - ⋮ 메뉴 클릭
   - "수정" 클릭 → Q&A 상세 페이지로 이동
   - "삭제" 클릭 → 확인 후 삭제

---

## 참고 사항

### 옵션 B를 구현해야 하는 경우:

1. **답변 개수가 중요한 지표인 경우**
   - 사용자가 자주 확인하는 정보
   - 게임화 요소 (배지, 레벨업)

2. **Q&A 포럼이 핵심 기능인 경우**
   - 답변 활동을 강조하고 싶을 때
   - 답변 많은 글을 우대하고 싶을 때

3. **디자인/기획에서 명시한 경우**
   - 와이어프레임에 답변 개수 표시가 있을 때
   - 클라이언트 요구사항에 포함될 때

### 현재 상태로 충분한 경우:

1. **프로필 페이지는 간단한 목록만 필요**
   - 자신이 작성한 글 확인용
   - 언제 작성했는지가 더 중요

2. **Q&A 포럼 메인에서 답변 개수 확인 가능**
   - 메인 페이지에서 상세 정보 제공
   - 프로필은 간단한 목록만

3. **빠른 개발이 우선**
   - MVP 단계에서는 충분
   - 나중에 필요하면 추가

---

## 관련 파일

- **수정된 파일**: `app/profile/page.tsx`
- **관련 SQL**: `scripts/create-community-qa-tables.sql`
- **RLS 정책**: `scripts/fix-community-questions-rls.sql`

---

## 다음 단계

옵션 B 구현이 필요하면:

1. `scripts/add-answer-count-column.sql` 생성
2. Supabase SQL Editor에서 실행
3. `app/profile/page.tsx` 코드 복원
4. 테스트 및 배포

---

**현재 상태: ✅ 프로필 페이지 정상 작동 중**
