import { getSupabaseClient } from '../supa/client'

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

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles!comments_author_id_fkey(nickname),
      review_logs!comments_log_id_fkey(id, brand, product)
    `)
    .in('log_id', logIds)
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
 */
export async function getRecentQA(
  logIds: string[],
  limit: number = 10,
  offset: number = 0
): Promise<any[]> {
  const supabase = getSupabaseClient()
  if (!supabase || logIds.length === 0) return []

  const { data, error } = await supabase
    .from('qa_posts')
    .select(`
      *,
      qa_threads!qa_posts_thread_id_fkey(id, title, log_id),
      profiles!qa_posts_author_id_fkey(nickname),
      review_logs!qa_threads_log_id_fkey(id, brand, product)
    `)
    .in('qa_threads.log_id', logIds)
    .eq('admin_status', 'visible')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[getRecentQA] Error:', error)
    return []
  }

  return data || []
}

