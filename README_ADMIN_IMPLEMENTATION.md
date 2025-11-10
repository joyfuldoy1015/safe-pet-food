# Admin 콘솔 구현 가이드

이 문서는 Admin 콘솔의 API 엔드포인트를 구현하는 방법을 단계별로 설명합니다.

## 빠른 시작

1. **Supabase 스키마 적용**: `docs/ADMIN_SETUP_GUIDE.md` 참조
2. **환경 변수 설정**: `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가
3. **API 엔드포인트 구현**: 아래 가이드 따라하기

## 구현 순서

### 1단계: 공통 유틸리티 확인

`lib/supa/adminQueries.ts` 파일이 이미 생성되어 있습니다. 이 파일에는:
- `parsePaginationParams()`: 페이지네이션 파라미터 파싱
- `parseSortParams()`: 정렬 파라미터 파싱
- `buildFilterQuery()`: 필터 쿼리 빌더
- `buildDateRangeQuery()`: 날짜 범위 필터

### 2단계: 예시 API 엔드포인트 확인

다음 파일들이 예시로 구현되어 있습니다:
- `app/api/admin/logs/list/route.ts`: 로그 목록 조회
- `app/api/admin/logs/moderate/route.ts`: 로그 모더레이션
- `app/api/admin/users/list/route.ts`: 사용자 목록 조회

### 3단계: 나머지 API 엔드포인트 구현

각 리소스별로 다음 패턴을 따라 구현합니다:

#### 패턴 1: 목록 조회 (List)

```typescript
// app/api/admin/{resource}/list/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'
import { parsePaginationParams, parseSortParams, buildFilterQuery } from '@/lib/supa/adminQueries'

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const searchParams = request.nextUrl.searchParams
    
    // 1. 파라미터 파싱
    const { limit, offset } = parsePaginationParams(searchParams)
    const { sortColumn, sortDirection } = parseSortParams(searchParams)
    
    // 2. 필터 파싱
    const filters: Record<string, string> = {}
    // 필요한 필터 추가
    
    // 3. 쿼리 빌드
    let query = supabase
      .from('{table_name}')
      .select('*', { count: 'exact' })
    
    // 4. 필터 적용
    query = buildFilterQuery(query, filters)
    
    // 5. 정렬 및 페이지네이션
    query = query
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .range(offset, offset + limit - 1)
    
    // 6. 실행
    const { data, error, count } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### 패턴 2: 모더레이션 (Moderate)

```typescript
// app/api/admin/{resource}/moderate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, setAdminStatus } from '@/lib/supa/serverAdmin'

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const body = await request.json()
    const { id, action, reason } = body
    
    // 1. 유효성 검사
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // 2. action을 admin_status로 변환
    const statusMap: Record<string, 'visible' | 'hidden' | 'deleted'> = {
      hide: 'hidden',
      unhide: 'visible',
      delete: 'deleted',
      restore: 'visible'
    }
    
    const adminStatus = statusMap[action]
    if (!adminStatus) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
    // 3. 상태 변경
    await setAdminStatus({
      table: '{table_name}',
      id,
      status: adminStatus,
      actorId: 'user-id', // TODO: 세션에서 가져오기
      reason
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 4단계: 클라이언트에서 API 호출

각 Admin 페이지에서 API를 호출하도록 수정합니다:

```typescript
// app/admin/{resource}/page.tsx
const loadData = async () => {
  setLoading(true)
  try {
    const params = new URLSearchParams()
    // 필터 파라미터 추가
    if (filters.category) params.set('category', filters.category)
    // 정렬 파라미터 추가
    params.set('sort', sortColumn)
    params.set('direction', sortDirection)
    // 페이지네이션 파라미터 추가
    params.set('page', '1')
    params.set('limit', '20')
    
    const response = await fetch(`/api/admin/{resource}/list?${params}`)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    
    const result = await response.json()
    setData(result.data)
    // pagination 정보도 사용 가능
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    setLoading(false)
  }
}
```

## 구현 체크리스트

### 필수 API 엔드포인트

- [ ] `/api/admin/logs/list` ✅ (예시 완료)
- [ ] `/api/admin/logs/moderate` ✅ (예시 완료)
- [ ] `/api/admin/users/list` ✅ (예시 완료)
- [ ] `/api/admin/users/update` (역할 변경)
- [ ] `/api/admin/pets/list`
- [ ] `/api/admin/comments/list`
- [ ] `/api/admin/comments/moderate`
- [ ] `/api/admin/qa/threads/list`
- [ ] `/api/admin/qa/posts/list`
- [ ] `/api/admin/qa/moderate`
- [ ] `/api/admin/settings/get`
- [ ] `/api/admin/settings/update`

### 선택적 API 엔드포인트

- [ ] `/api/admin/{resource}/get` (단일 항목 조회)
- [ ] `/api/admin/{resource}/update` (항목 수정)
- [ ] `/api/admin/{resource}/export` (CSV 내보내기)

## 권한 확인 추가

현재 예시 코드에는 권한 확인이 주석 처리되어 있습니다. 실제 구현 시 다음을 추가해야 합니다:

```typescript
// 1. 세션에서 사용자 ID 가져오기
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// 2. 관리자 권한 확인
if (!(await isAdmin(user.id))) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## 테스트

### 1. API 직접 테스트

```bash
# 로그 목록 조회
curl http://localhost:3000/api/admin/logs/list?page=1&limit=10

# 필터 적용
curl "http://localhost:3000/api/admin/logs/list?category=feed&status=feeding"

# 모더레이션
curl -X POST http://localhost:3000/api/admin/logs/moderate \
  -H "Content-Type: application/json" \
  -d '{"id": "log-id", "action": "hide", "reason": "테스트"}'
```

### 2. 브라우저에서 테스트

1. `/admin` 페이지 접속
2. 각 페이지에서 데이터 로드 확인
3. 필터, 정렬, 모더레이션 동작 확인

## 문제 해결

### API가 404 반환
- 파일 경로 확인: `app/api/admin/{resource}/list/route.ts`
- 파일명이 정확한지 확인: `route.ts` (소문자)

### API가 500 반환
- 서버 로그 확인
- Supabase 쿼리 오류 확인
- 환경 변수 확인

### 데이터가 로드되지 않음
- 브라우저 개발자 도구 Network 탭 확인
- API 응답 확인
- 클라이언트 코드의 에러 핸들링 확인

## 추가 리소스

- [Next.js API Routes 문서](https://nextjs.org/docs/api-routes/introduction)
- [Supabase JavaScript Client 문서](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Query Builder 문서](https://supabase.com/docs/reference/javascript/select)


