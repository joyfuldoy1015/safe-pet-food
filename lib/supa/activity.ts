import { getSupabaseClient } from '../supa/client'

/**
 * UUID 형식 검증
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Get recent comments for given log IDs
 * Only returns visible comments (admin_status='visible')
 */
export async function getRecentComments(
  logIds: string[],
  limit: number = 10,
  offset: number = 0
): Promise<any[]> {
  const supabase = getSupabaseClient()
  if (!supabase || logIds.length === 0) return []

  // UUID 검증: 잘못된 형식의 ID들을 필터링
  const validLogIds = logIds.filter(id => isValidUUID(id))
  
  if (validLogIds.length === 0) {
    console.log('[getRecentComments] No valid UUID format IDs, skipping Supabase query')
    return []
  }

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles!comments_author_id_fkey(nickname),
      review_logs!comments_log_id_fkey(id, brand, product)
    `)
    .in('log_id', validLogIds)
    .eq('admin_status', 'visible')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getRecentComments] Error:', error)
    return []
  }

  return data || []
}

/**
 * Get recent Q&A posts for given log IDs
 * Only returns visible posts (admin_status='visible')
 * 
 * TODO: This feature is currently disabled as Q&A system is not yet connected to review_logs
 * The Q&A forum uses community_questions/community_answers tables which are independent
 */
export async function getRecentQA(
  logIds: string[],
  limit: number = 10,
  offset: number = 0
): Promise<any[]> {
  // Q&A 기능이 review_logs와 연결될 때까지 비활성화
  console.log('[getRecentQA] Q&A feature not yet connected to review_logs, returning empty array')
  return []
  
  /* 
  // Original implementation - requires qa_threads and qa_posts tables
  const supabase = getSupabaseClient()
  if (!supabase || logIds.length === 0) return []

  const validLogIds = logIds.filter(id => isValidUUID(id))
  
  if (validLogIds.length === 0) {
    console.log('[getRecentQA] No valid UUID format IDs, skipping Supabase query')
    return []
  }

  const { data, error } = await supabase
    .from('qa_posts')
    .select(`
      *,
      qa_threads!qa_posts_thread_id_fkey(id, title, log_id),
      profiles!qa_posts_author_id_fkey(nickname),
      review_logs!qa_threads_log_id_fkey(id, brand, product)
    `)
    .in('qa_threads.log_id', validLogIds)
    .eq('admin_status', 'visible')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getRecentQA] Error:', error)
    return []
  }

  return data || []
  */
}

