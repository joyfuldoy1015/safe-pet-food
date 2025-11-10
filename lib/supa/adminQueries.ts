import { PostgrestQueryBuilder } from '@supabase/postgrest-js'

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
  if (filters.role) {
    query = query.eq('role', filters.role)
  }
  if (filters.species) {
    // pets 테이블과 조인 필요
    query = query.eq('pets.species', filters.species)
  }
  if (filters.search) {
    query = query.or(`brand.ilike.%${filters.search}%,product.ilike.%${filters.search}%`)
  }
  if (filters.email) {
    query = query.ilike('email', `%${filters.email}%`)
  }
  if (filters.nickname) {
    query = query.ilike('nickname', `%${filters.nickname}%`)
  }
  
  return query
}

/**
 * 공통: 날짜 범위 필터
 */
export function buildDateRangeQuery(
  query: any,
  searchParams: URLSearchParams,
  dateColumn: string = 'created_at'
) {
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  
  if (startDate) {
    query = query.gte(dateColumn, startDate)
  }
  if (endDate) {
    query = query.lte(dateColumn, endDate)
  }
  
  return query
}


