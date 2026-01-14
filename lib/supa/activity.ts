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
 * Uses pet_log_qa_threads and pet_log_qa_posts tables
 */
export async function getRecentQA(
  logIds: string[],
  limit: number = 10,
  offset: number = 0
): Promise<any[]> {
  const supabase = getSupabaseClient()
  if (!supabase || logIds.length === 0) return []

  const validLogIds = logIds.filter(id => isValidUUID(id))
  
  if (validLogIds.length === 0) {
    console.log('[getRecentQA] No valid UUID format IDs, skipping Supabase query')
    return []
  }

  try {
    // 먼저 해당 logIds에 속한 thread들 조회
    const { data: threads, error: threadsError } = await supabase
      .from('pet_log_qa_threads')
      .select('id, log_id, title')
      .in('log_id', validLogIds)

    if (threadsError || !threads || threads.length === 0) {
      console.log('[getRecentQA] No threads found for logIds')
      return []
    }

    const threadIds = threads.map(t => t.id)

    // 해당 thread들의 posts 조회
    const { data: posts, error: postsError } = await supabase
      .from('pet_log_qa_posts')
      .select(`
        id,
        thread_id,
        author_id,
        content,
        kind,
        created_at,
        profiles:author_id(nickname)
      `)
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (postsError) {
      console.error('[getRecentQA] Error fetching posts:', postsError)
      return []
    }

    // review_logs에서 brand, product 정보 가져오기
    const { data: logsData } = await supabase
      .from('review_logs')
      .select('id, brand, product')
      .in('id', validLogIds)

    const logsMap = new Map(logsData?.map(l => [l.id, l]) || [])
    const threadsMap = new Map(threads.map(t => [t.id, t]))

    // 데이터 병합
    const result = posts?.map(post => {
      const thread = threadsMap.get(post.thread_id)
      const log = thread ? logsMap.get(thread.log_id) : null
      return {
        ...post,
        qa_threads: thread ? { id: thread.id, title: thread.title, log_id: thread.log_id } : null,
        review_logs: log ? { id: log.id, brand: log.brand, product: log.product } : null
      }
    }) || []

    return result
  } catch (error) {
    console.error('[getRecentQA] Error:', error)
    return []
  }
}

