# Admin 콘솔 설정 가이드

이 가이드는 Admin 콘솔을 사용하기 위해 필요한 Supabase 스키마 적용과 API 엔드포인트 구현 방법을 설명합니다.

## 1. Supabase 스키마 적용

### 1.1 Supabase 대시보드 접속

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택

### 1.2 SQL Editor 열기

1. 왼쪽 사이드바에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭

### 1.3 스키마 파일 실행

#### Step 1: Admin 스키마 적용

1. `scripts/supabase-admin-schema.sql` 파일을 열어서 전체 내용 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭 (또는 `Cmd/Ctrl + Enter`)
4. 성공 메시지 확인

#### Step 2: Rankings 뷰 적용 (선택사항)

1. `scripts/supabase-rankings-views.sql` 파일을 열어서 전체 내용 복사
2. SQL Editor에 붙여넣기
3. **Run** 버튼 클릭
4. 성공 메시지 확인

### 1.4 스키마 확인

#### 테이블 확인

```sql
-- 생성된 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('roles', 'moderation_actions', 'admin_notes', 'app_settings')
ORDER BY table_name;
```

#### 컬럼 확인

```sql
-- review_logs에 admin_status 컬럼 추가 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'review_logs'
  AND column_name = 'admin_status';
```

#### 뷰 확인

```sql
-- 생성된 뷰 확인
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
  AND table_name LIKE 'product_%'
ORDER BY table_name;
```

### 1.5 초기 관리자 계정 생성

```sql
-- 1. 먼저 auth.users에 사용자가 있는지 확인
SELECT id, email FROM auth.users LIMIT 5;

-- 2. 관리자 역할 부여 (YOUR_USER_ID를 실제 사용자 ID로 변경)
INSERT INTO public.roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 3. 확인
SELECT r.user_id, r.role, p.nickname, p.email
FROM public.roles r
JOIN auth.users u ON u.id = r.user_id
LEFT JOIN public.profiles p ON p.id = r.user_id
WHERE r.role = 'admin';
```

## 2. 환경 변수 설정

### 2.1 .env.local 파일 확인/생성

프로젝트 루트에 `.env.local` 파일이 있는지 확인하고, 없으면 생성:

```bash
# 프로젝트 루트에서
touch .env.local
```

### 2.2 Supabase Service Role Key 가져오기

1. Supabase Dashboard → **Settings** → **API**
2. **Project API keys** 섹션에서 **service_role** 키 복사
   - ⚠️ **주의**: 이 키는 절대 클라이언트에 노출되면 안 됩니다!

### 2.3 .env.local에 추가

```env
# 기존 변수들...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 새로 추가
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2.4 환경 변수 확인

```bash
# 서버 재시작
npm run dev
```

## 3. API 엔드포인트 구현

### 3.1 API 라우트 구조

각 리소스별로 다음 엔드포인트를 구현합니다:

```
/api/admin/{resource}/
  ├── list/route.ts      # 목록 조회 (필터, 정렬, 페이지네이션)
  ├── get/route.ts       # 단일 항목 조회
  ├── update/route.ts    # 항목 수정
  ├── moderate/route.ts   # 모더레이션 (hide/unhide/delete)
  └── export/route.ts    # CSV 내보내기
```

### 3.2 공통 유틸리티 함수

먼저 공통 함수를 만들어 재사용합니다:

**`lib/supa/adminQueries.ts`** 파일 생성:

```typescript
import { getAdminClient } from './serverAdmin'

/**
 * 공통: 페이지네이션 파라미터 파싱
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

/**
 * 공통: 정렬 파라미터 파싱
 */
export function parseSortParams(searchParams: URLSearchParams) {
  const sortColumn = searchParams.get('sort') || 'updated_at'
  const sortDirection = searchParams.get('direction') || 'desc'
  
  return { sortColumn, sortDirection: sortDirection as 'asc' | 'desc' }
}

/**
 * 공통: 필터 쿼리 빌더
 */
export function buildFilterQuery(
  query: any,
  filters: Record<string, string>
) {
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.admin_status) {
    query = query.eq('admin_status', filters.admin_status)
  }
  if (filters.species) {
    // pets 테이블과 조인 필요
    query = query.eq('pets.species', filters.species)
  }
  if (filters.search) {
    query = query.or(`brand.ilike.%${filters.search}%,product.ilike.%${filters.search}%`)
  }
  
  return query
}
```

### 3.3 예시: Logs API 구현

**`app/api/admin/logs/list/route.ts`** 파일 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'
import { parsePaginationParams, parseSortParams, buildFilterQuery } from '@/lib/supa/adminQueries'

/**
 * GET /api/admin/logs/list
 * 로그 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 권한 확인
    const supabase = getAdminClient()
    // TODO: 실제 사용자 ID를 세션에서 가져오기
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || !(await isAdmin(user.id))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    // 파라미터 파싱
    const searchParams = request.nextUrl.searchParams
    const { limit, offset } = parsePaginationParams(searchParams)
    const { sortColumn, sortDirection } = parseSortParams(searchParams)
    
    // 필터 파싱
    const filters: Record<string, string> = {}
    if (searchParams.get('category')) filters.category = searchParams.get('category')!
    if (searchParams.get('status')) filters.status = searchParams.get('status')!
    if (searchParams.get('admin_status')) filters.admin_status = searchParams.get('admin_status')!
    if (searchParams.get('search')) filters.search = searchParams.get('search')!

    // 쿼리 빌드
    let query = supabase
      .from('review_logs')
      .select(`
        *,
        profiles!review_logs_owner_id_fkey(nickname, avatar_url),
        pets!review_logs_pet_id_fkey(name, species)
      `, { count: 'exact' })

    // 필터 적용
    query = buildFilterQuery(query, filters)

    // 정렬 적용
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' })

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    // 실행
    const { data, error, count } = await query

    if (error) {
      console.error('[API /admin/logs/list] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('[API /admin/logs/list] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**`app/api/admin/logs/moderate/route.ts`** 파일 생성:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, setAdminStatus, isModerator } from '@/lib/supa/serverAdmin'

/**
 * POST /api/admin/logs/moderate
 * 로그 모더레이션 (hide/unhide/delete)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    
    // 권한 확인
    // TODO: 실제 사용자 ID를 세션에서 가져오기
    const userId = 'temp-user-id' // 실제로는 세션에서 가져와야 함
    // if (!(await isModerator(userId))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    const body = await request.json()
    const { id, action, reason } = body

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // action을 admin_status로 변환
    const statusMap: Record<string, 'visible' | 'hidden' | 'deleted'> = {
      hide: 'hidden',
      unhide: 'visible',
      delete: 'deleted',
      restore: 'visible'
    }

    const adminStatus = statusMap[action]
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // 상태 변경
    await setAdminStatus({
      table: 'review_logs',
      id,
      status: adminStatus,
      actorId: userId,
      reason
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /admin/logs/moderate] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 3.4 클라이언트에서 API 호출

**`app/admin/logs/page.tsx`** 수정 예시:

```typescript
const loadLogs = async () => {
  setLoading(true)
  try {
    // 필터와 정렬 파라미터 구성
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.status) params.set('status', filters.status)
    if (filters.admin_status) params.set('admin_status', filters.admin_status)
    params.set('sort', sortColumn)
    params.set('direction', sortDirection)
    params.set('page', '1')
    params.set('limit', '20')

    const response = await fetch(`/api/admin/logs/list?${params}`)
    if (!response.ok) {
      throw new Error('Failed to fetch logs')
    }

    const result = await response.json()
    setLogs(result.data)
    // pagination 정보도 사용 가능: result.pagination
  } catch (error) {
    console.error('[AdminLogsPage] Error loading logs:', error)
  } finally {
    setLoading(false)
  }
}

const handleBulkAction = async (action: 'hide' | 'unhide' | 'delete') => {
  if (selectedIds.length === 0) return

  try {
    // 각 항목에 대해 모더레이션 실행
    await Promise.all(
      selectedIds.map(id =>
        fetch('/api/admin/logs/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action })
        })
      )
    )

    setSelectedIds([])
    loadLogs()
  } catch (error) {
    console.error('[AdminLogsPage] Error in bulk action:', error)
    alert('작업 중 오류가 발생했습니다.')
  }
}
```

## 4. 구현 체크리스트

### 4.1 Supabase 스키마
- [ ] `scripts/supabase-admin-schema.sql` 실행 완료
- [ ] `scripts/supabase-rankings-views.sql` 실행 완료 (선택)
- [ ] 테이블 생성 확인
- [ ] 컬럼 추가 확인
- [ ] 초기 관리자 계정 생성

### 4.2 환경 변수
- [ ] `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가
- [ ] 서버 재시작 후 환경 변수 로드 확인

### 4.3 API 엔드포인트
- [ ] `/api/admin/logs/list` 구현
- [ ] `/api/admin/logs/moderate` 구현
- [ ] `/api/admin/users/list` 구현
- [ ] `/api/admin/comments/list` 구현
- [ ] `/api/admin/qa/list` 구현
- [ ] 각 페이지에서 API 호출 연결

### 4.4 권한 확인
- [ ] 미들웨어에서 권한 확인 로직 추가
- [ ] 각 API 엔드포인트에서 권한 확인
- [ ] 클라이언트 페이지에서 권한 확인

## 5. 테스트 방법

### 5.1 관리자 권한 확인

```sql
-- 현재 관리자 목록 확인
SELECT r.user_id, r.role, p.nickname
FROM public.roles r
LEFT JOIN public.profiles p ON p.id = r.user_id
WHERE r.role = 'admin';
```

### 5.2 API 테스트

```bash
# 로그 목록 조회 테스트
curl http://localhost:3000/api/admin/logs/list?page=1&limit=10

# 모더레이션 테스트
curl -X POST http://localhost:3000/api/admin/logs/moderate \
  -H "Content-Type: application/json" \
  -d '{"id": "log-id", "action": "hide", "reason": "테스트"}'
```

### 5.3 브라우저 테스트

1. `/admin` 페이지 접속
2. 관리자 계정으로 로그인
3. 각 페이지에서 데이터 로드 확인
4. 필터, 정렬, 모더레이션 동작 확인

## 6. 문제 해결

### 문제: "Unauthorized" 오류
- **원인**: 관리자 권한이 없음
- **해결**: `roles` 테이블에 관리자 계정 추가

### 문제: "Service role key not found"
- **원인**: 환경 변수가 설정되지 않음
- **해결**: `.env.local` 파일 확인 및 서버 재시작

### 문제: 테이블이 보이지 않음
- **원인**: SQL 스크립트 실행 실패
- **해결**: SQL Editor에서 오류 메시지 확인 및 수정

### 문제: API가 500 에러 반환
- **원인**: 쿼리 오류 또는 권한 문제
- **해결**: 서버 로그 확인 및 Supabase 로그 확인

## 7. 추가 리소스

- [Supabase SQL Editor 문서](https://supabase.com/docs/guides/database/overview)
- [Supabase RLS 정책 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes 문서](https://nextjs.org/docs/api-routes/introduction)


