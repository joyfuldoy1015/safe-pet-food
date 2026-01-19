import { getSupabaseClient } from './client'
import type { Database } from '@/lib/types/database'
import type { ReviewLog as ClientReviewLog } from '@/lib/types/review-log'

type Profile = Database['public']['Tables']['profiles']['Row']
type Pet = Database['public']['Tables']['pets']['Row']
type ReviewLogRow = Database['public']['Tables']['review_logs']['Row']

/**
 * UUID 형식 검증
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Get owner profile by ID
 */
export async function getOwner(ownerId: string): Promise<any | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  // UUID 검증: 잘못된 형식이면 쿼리하지 않고 null 반환
  if (!isValidUUID(ownerId)) {
    console.log('[getOwner] Invalid UUID format, skipping Supabase query:', ownerId)
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', ownerId)
    .single()

  if (error) {
    console.error('[getOwner] Error:', error)
    return null
  }

  if (!data) return null

  // Convert snake_case to camelCase for Owner type
  return {
    id: data.id,
    nickname: data.nickname,
    avatarUrl: data.avatar_url,
    pets: [] // This would need separate query, defaulting to empty for now
  }
}

/**
 * Get pet by ID
 */
export async function getPet(petId: string): Promise<Pet | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  // UUID 검증: 잘못된 형식이면 쿼리하지 않고 null 반환
  if (!isValidUUID(petId)) {
    console.log('[getPet] Invalid UUID format, skipping Supabase query:', petId)
    return null
  }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single()

  if (error) {
    console.error('[getPet] Error:', error)
    return null
  }

  if (!data) return null

  // Convert snake_case to camelCase for Pet type
  return {
    id: data.id,
    name: data.name,
    species: data.species,
    birthDate: data.birth_date,
    weightKg: data.weight_kg,
    tags: data.tags
  } as any
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

  // UUID 검증: 잘못된 형식이면 쿼리하지 않고 빈 배열 반환
  if (!isValidUUID(ownerId) || !isValidUUID(petId)) {
    console.log('[getLogsByOwnerPet] Invalid UUID format, skipping Supabase query:', { ownerId, petId })
    return []
  }

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
  owner: any | null
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

  // Convert snake_case to camelCase for Pet type
  const pets = (data || []).map((pet: any) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    birthDate: pet.birth_date,
    weightKg: pet.weight_kg,
    tags: pet.tags
  })) as any[]

  return { owner, pets }
}

/**
 * Get all pets by owner ID
 */
export async function getPetsByOwner(ownerId: string): Promise<any[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  if (!isValidUUID(ownerId)) {
    console.log('[getPetsByOwner] Invalid UUID format, skipping Supabase query:', ownerId)
    return []
  }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getPetsByOwner] Error:', error)
    return []
  }

  return (data || []).map((pet: any) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    birthDate: pet.birth_date,
    weightKg: pet.weight_kg,
    tags: pet.tags
  }))
}

/**
 * Get all review logs by owner ID
 */
export async function getLogsByOwner(ownerId: string): Promise<ClientReviewLog[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  if (!isValidUUID(ownerId)) {
    console.log('[getLogsByOwner] Invalid UUID format, skipping Supabase query:', ownerId)
    return []
  }

  const { data, error } = await supabase
    .from('review_logs')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('admin_status', 'visible')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[getLogsByOwner] Error:', error)
    return []
  }

  return (data || []).map(transformReviewLogRow)
}

/**
 * Get Q&A threads for a review log
 * Only returns visible threads (admin_status='visible')
 */
export async function getThreadsByLog(logId: string): Promise<any[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  // UUID 검증: 잘못된 형식이면 쿼리하지 않고 빈 배열 반환
  if (!isValidUUID(logId)) {
    console.log('[getThreadsByLog] Invalid UUID format, skipping Supabase query:', logId)
    return []
  }

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

  // UUID 검증: 잘못된 형식이면 쿼리하지 않고 빈 배열 반환
  if (!isValidUUID(threadId)) {
    console.log('[getPostsByThread] Invalid UUID format, skipping Supabase query:', threadId)
    return []
  }

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

  // UUID 검증: 잘못된 형식이면 쿼리하지 않고 null 반환
  if (!isValidUUID(logId)) {
    console.log('[getBestAnswerExcerpt] Invalid UUID format, skipping Supabase query:', logId)
    return null
  }

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

