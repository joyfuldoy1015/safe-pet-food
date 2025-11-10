# Admin 스키마 적용 오류 해결 가이드

## 문제 상황

`review_logs` 테이블이 존재하지 않아서 `ALTER TABLE` 명령이 실패하는 오류가 발생했습니다.

## 해결 방법

### 방법 1: 기본 스키마 먼저 적용 (권장)

Admin 스키마를 적용하기 전에 기본 스키마를 먼저 적용해야 합니다.

#### Step 1: 기본 스키마 적용

1. Supabase Dashboard → SQL Editor
2. `scripts/supabase-review-logs-schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행
4. 성공 메시지 확인

#### Step 2: Admin 스키마 적용

1. `scripts/supabase-admin-schema.sql` 파일 내용 복사
2. SQL Editor에 붙여넣고 실행
3. 성공 메시지 확인

### 방법 2: 수정된 Admin 스키마 사용

`scripts/supabase-admin-schema.sql` 파일이 이미 수정되어 있어서, 테이블이 없어도 오류가 발생하지 않습니다.

1. Supabase Dashboard → SQL Editor
2. `scripts/supabase-admin-schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행
4. 성공 메시지 확인

## 적용 순서 (권장)

### 1단계: 기본 스키마 적용

```sql
-- scripts/supabase-review-logs-schema.sql 실행
-- 이 파일은 다음 테이블을 생성합니다:
-- - profiles
-- - pets
-- - review_logs
-- - comments
```

### 2단계: Admin 스키마 적용

```sql
-- scripts/supabase-admin-schema.sql 실행
-- 이 파일은 다음을 추가합니다:
-- - roles 테이블
-- - moderation_actions 테이블
-- - admin_notes 테이블
-- - app_settings 테이블
-- - admin_status 컬럼 (review_logs, comments에 추가)
```

### 3단계: Rankings 뷰 적용 (선택사항)

```sql
-- scripts/supabase-rankings-views.sql 실행
-- 이 파일은 랭킹 관련 뷰를 생성합니다
```

## 테이블 존재 여부 확인

스키마 적용 후 다음 쿼리로 테이블이 생성되었는지 확인할 수 있습니다:

```sql
-- 모든 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- review_logs 테이블 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'review_logs'
ORDER BY ordinal_position;
```

## 문제 해결

### 오류: "relation does not exist"

**원인**: 테이블이 아직 생성되지 않음

**해결**:
1. 기본 스키마(`supabase-review-logs-schema.sql`) 먼저 실행
2. 그 다음 Admin 스키마(`supabase-admin-schema.sql`) 실행

### 오류: "column already exists"

**원인**: `admin_status` 컬럼이 이미 존재함

**해결**: 
- `ADD COLUMN IF NOT EXISTS` 구문을 사용하므로 무시해도 됩니다
- 또는 기존 컬럼을 확인하고 필요시 수정

### 오류: "permission denied"

**원인**: RLS 정책이 적용되어 있음

**해결**:
- Service Role Key를 사용하여 Admin 클라이언트로 접근
- 또는 RLS 정책을 확인하고 필요시 수정

## 다음 단계

스키마 적용이 완료되면:

1. **초기 관리자 계정 생성**:
   ```sql
   INSERT INTO public.roles (user_id, role)
   VALUES ('YOUR_USER_ID', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

2. **환경 변수 설정**: `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가

3. **API 엔드포인트 구현**: `docs/ADMIN_SETUP_GUIDE.md` 참조


