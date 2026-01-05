# Community Q&A RLS 문제 해결 가이드

## 문제 증상

프로필 페이지에서 "내가 작성한 Q&A" 섹션에 다음과 같은 증상이 나타납니다:

- 400 Bad Request 에러 발생
- 작성한 Q&A가 목록에 표시되지 않음
- 콘솔에 다음 에러 표시:
  ```
  GET .../community_questions?select=...
  400 (Bad Request)
  ```

## 원인

**Supabase RLS (Row Level Security) 정책**이 설정되지 않아서 발생하는 문제입니다.

`community_questions` 테이블에 SELECT 권한 정책이 없어서, 사용자가 자신의 게시글을 조회할 수 없습니다.

---

## 해결 방법

### 1단계: Supabase 대시보드 접속

```
1. https://supabase.com 접속
2. 프로젝트 선택
3. SQL Editor 메뉴 클릭
```

### 2단계: SQL 스크립트 실행

`scripts/fix-community-questions-rls.sql` 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행:

```sql
-- Fix community_questions RLS policies

-- 1. Enable RLS
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Anyone can view visible questions" ON community_questions;
DROP POLICY IF EXISTS "Users can view own questions" ON community_questions;
-- ... (나머지 정책들)

-- 3. CREATE policies
CREATE POLICY "Anyone can view visible questions"
ON community_questions
FOR SELECT
USING (admin_status = 'visible');

CREATE POLICY "Users can view own questions"
ON community_questions
FOR SELECT
USING (auth.uid() = author_id);

-- ... (나머지 정책들)
```

### 3단계: 정책 확인

SQL Editor에서 다음 쿼리 실행:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'community_questions';
```

**확인할 정책 목록:**
- `Anyone can view visible questions` (SELECT)
- `Users can view own questions` (SELECT)
- `Users can insert own questions` (INSERT)
- `Users can update own questions` (UPDATE)
- `Users can delete own questions` (DELETE)

### 4단계: 프로필 페이지 새로고침

```
1. 브라우저에서 http://localhost:3000/profile 접속
2. F5 키를 눌러 페이지 새로고침
3. F12 개발자 도구 > Console 탭 확인
```

**성공 메시지:**
```
Successfully loaded X questions
```

**실패 시:**
- 여전히 400 에러가 표시되면 RLS 정책이 제대로 적용되지 않은 것
- SQL 스크립트를 다시 실행하거나 Supabase 지원팀에 문의

---

## RLS 정책 설명

### SELECT 정책 (조회)

1. **"Anyone can view visible questions"**
   - 모든 사용자가 `admin_status = 'visible'` 인 게시글 조회 가능
   - Q&A 포럼 목록 페이지에서 사용

2. **"Users can view own questions"**
   - 작성자는 자신의 모든 게시글 조회 가능 (admin_status 무관)
   - 프로필 페이지 "내가 작성한 Q&A"에서 사용

### INSERT 정책 (작성)

- 로그인한 사용자만 게시글 작성 가능
- `author_id`가 현재 사용자 ID와 일치해야 함

### UPDATE 정책 (수정)

- 작성자만 자신의 게시글 수정 가능

### DELETE 정책 (삭제)

- 작성자만 자신의 게시글 삭제 가능

---

## 추가 문제 해결

### 여전히 목록에 표시되지 않는 경우

1. **Supabase Table Editor에서 데이터 확인:**
   ```
   Table Editor > community_questions
   ```
   - 작성한 게시글이 실제로 저장되어 있는지 확인
   - `author_id` 값이 올바른지 확인

2. **현재 사용자 ID 확인:**
   - 프로필 페이지 > F12 개발자 도구 > Console
   - 에러 로그에서 "User ID: xxx..." 확인
   - Supabase 테이블의 `author_id`와 일치하는지 비교

3. **`admin_status` 확인:**
   - 게시글의 `admin_status`가 'visible'로 설정되어 있는지 확인
   - 'hidden'이나 'deleted'인 경우 프로필 페이지에서만 보임

---

## 참고 자료

- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Policies 가이드](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## 문제가 계속되는 경우

위 단계를 모두 수행했는데도 문제가 해결되지 않으면:

1. SQL 스크립트 실행 결과 스크린샷
2. 콘솔 에러 메시지 전체
3. Supabase Table Editor에서 `community_questions` 테이블 스크린샷

위 정보를 제공해주시면 추가 진단을 도와드리겠습니다.
