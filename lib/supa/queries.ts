import { getSupabaseClient } from './client'
import type { Database } from '@/lib/types/database'
import type { ReviewLog as ClientReviewLog } from '@/lib/types/review-log'

type Profile = Database['public']['Tables']['profiles']['Row']
type Pet = Database['public']['Tables']['pets']['Row']
type ReviewLogRow = Database['public']['Tables']['review_logs']['Row']

/**
 * Get owner profile by ID
 */
export async function getOwner(ownerId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', ownerId)
    .single()

  if (error) {
    console.error('[getOwner] Error:', error)
    return null
  }

  return data
}

/**
 * Get pet by ID
 */
export async function getPet(petId: string): Promise<Pet | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single()

  if (error) {
    console.error('[getPet] Error:', error)
    return null
  }

  return data
}

/**
 * Get all review logs for a specific owner and pet
 * Only returns visible logs (admin_status='visible')
 */
export async function getLogsByOwnerPet(
  ownerId: string,
  petId: string
): Promise<ClientReviewLog[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('review_logs')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('pet_id', petId)
    .eq('admin_status', 'visible')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[getLogsByOwnerPet] Error:', error)
    return []
  }

  return (data || []).map(transformReviewLogRow)
}

/**
 * Get owner with their pets
 */
export async function getOwnerWithPets(ownerId: string): Promise<{
  owner: Profile | null
  pets: Pet[]
}> {
  const supabase = getSupabaseClient()
  if (!supabase) return { owner: null, pets: [] }

  const owner = await getOwner(ownerId)
  if (!owner) return { owner: null, pets: [] }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getOwnerWithPets] Error:', error)
    return { owner, pets: [] }
  }

  return { owner, pets: data || [] }
}

/**
 * Get Q&A threads for a review log
 * Only returns visible threads (admin_status='visible')
 */
export async function getThreadsByLog(logId: string): Promise<any[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('qa_threads')
    .select('*')
    .eq('log_id', logId)
    .eq('admin_status', 'visible')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getThreadsByLog] Error:', error)
    return []
  }

  return data || []
}

/**
 * Get posts for a Q&A thread
 * Only returns visible posts (admin_status='visible')
 */
export async function getPostsByThread(threadId: string): Promise<any[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('qa_posts')
    .select('*')
    .eq('thread_id', threadId)
    .eq('admin_status', 'visible')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[getPostsByThread] Error:', error)
    return []
  }

  return data || []
}

/**
 * Get best answer excerpt for a log (from view)
 */
export async function getBestAnswerExcerpt(logId: string): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('qa_best_answer_per_log')
    .select('excerpt')
    .eq('log_id', logId)
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return (data as { excerpt?: string })?.excerpt || null
}

function transformReviewLogRow(row: ReviewLogRow): ClientReviewLog {
  return {
    id: row.id,
    petId: row.pet_id,
    ownerId: row.owner_id,
    category: row.category as ClientReviewLog['category'],
    brand: row.brand || '',
    product: row.product || '',
    status: row.status as ClientReviewLog['status'],
    periodStart: row.period_start || row.created_at,
    periodEnd: row.period_end || undefined,
    durationDays: row.duration_days || undefined,
    rating: typeof row.rating === 'number' ? row.rating : undefined,
    recommend: row.recommend ?? undefined,
    continueReasons: Array.isArray(row.continue_reasons) ? row.continue_reasons : [],
    stopReasons: Array.isArray(row.stop_reasons) ? row.stop_reasons : [],
    excerpt: row.excerpt || '',
    notes: row.notes || undefined,
    likes: row.likes || 0,
    commentsCount: row.comments_count || 0,
    views: row.views || 0,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString()
  }
}

