import { getSupabaseClient } from './client'

export type Species = 'dog' | 'cat' | 'all'
export type Category = 'feed' | 'snack' | 'supplement' | 'toilet' | 'all'

export interface ProductRanking {
  category: string
  brand: string
  product: string
  max_days: number
  logs_count: number
  mentions?: number
  last_updated: string
  species?: string
  blended_score?: number
}

/**
 * Get top products by longest single continuous feeding days
 */
export async function getTopLongest({
  limit = 10,
  species,
  category,
  minLogs = 2
}: {
  limit?: number
  species?: Species
  category?: Category
  minLogs?: number
}): Promise<ProductRanking[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('[getTopLongest] Supabase not configured, returning empty array')
    return []
  }

  try {
    let query

    if (species && species !== 'all') {
      // Use view with species filter
      query = supabase
        .from('product_longest_feeding_with_species')
        .select('*')
        .eq('species', species)
    } else {
      // Use base view without species filter
      query = supabase
        .from('product_longest_feeding')
        .select('*')
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Apply minLogs filter
    query = query.gte('logs_count', minLogs)

    // Order by max_days desc, then logs_count desc
    const { data, error } = await query
      .order('max_days', { ascending: false })
      .order('logs_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getTopLongest] Error:', error)
      return []
    }

    return (data || []) as ProductRanking[]
  } catch (err) {
    console.error('[getTopLongest] Exception:', err)
    return []
  }
}

/**
 * Get top products by mentions count (with mild recency decay)
 */
export async function getTopMentions({
  limit = 10,
  species,
  category
}: {
  limit?: number
  species?: Species
  category?: Category
}): Promise<ProductRanking[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('[getTopMentions] Supabase not configured, returning empty array')
    return []
  }

  try {
    let query = supabase
      .from('product_mentions')
      .select('*')

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // If species filter is needed, join with review_logs and pets
    if (species && species !== 'all') {
      // Use a more efficient approach: join with review_logs and pets
      // First, get all products that have logs for this species
      const { data: logsWithSpecies, error: logsError } = await supabase
        .from('review_logs')
        .select('category, brand, product, updated_at, pets!inner(species)')
        .eq('pets.species', species)

      if (logsError) {
        console.error('[getTopMentions] Error fetching logs:', logsError)
        return []
      }

      // Group by product and count mentions
      const productCounts = new Map<string, { category: string; brand: string; product: string; mentions: number; last_updated: string }>()
      
      if (logsWithSpecies) {
        for (const log of logsWithSpecies as Array<{ category: string; brand: string; product: string; updated_at?: string }>) {
          const key = `${log.category}:${log.brand}:${log.product}`
          const existing = productCounts.get(key)
          const logUpdated = log.updated_at || new Date().toISOString()
          
          if (existing) {
            existing.mentions += 1
            // Update last_updated to the most recent
            if (new Date(logUpdated) > new Date(existing.last_updated)) {
              existing.last_updated = logUpdated
            }
          } else {
            productCounts.set(key, {
              category: log.category,
              brand: log.brand,
              product: log.product,
              mentions: 1,
              last_updated: logUpdated
            })
          }
        }
      }

      // Convert to array and apply filters
      let filtered = Array.from(productCounts.values())
      
      if (category && category !== 'all') {
        filtered = filtered.filter(item => item.category === category)
      }

      // Sort by mentions
      filtered.sort((a, b) => b.mentions - a.mentions)

      // Apply recency boost (client-side)
      return applyRecencyBoost(filtered.slice(0, limit) as ProductRanking[], limit)
    } else {
      // No species filter, fetch directly
      const { data, error } = await query
        .order('mentions', { ascending: false })
        .order('last_updated', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[getTopMentions] Error:', error)
        return []
      }

      return applyRecencyBoost((data || []) as ProductRanking[], limit)
    }
  } catch (err) {
    console.error('[getTopMentions] Exception:', err)
    return []
  }
}

/**
 * Apply mild recency boost to mentions ranking
 */
function applyRecencyBoost(items: ProductRanking[], limit: number): ProductRanking[] {
  const now = new Date()
  const itemsWithBoost = items.map(item => {
    const daysSinceUpdate = Math.floor(
      (now.getTime() - new Date(item.last_updated).getTime()) / (1000 * 60 * 60 * 24)
    )
    const recencyBoost = Math.exp(-daysSinceUpdate / 180) // Decay over 180 days
    return {
      ...item,
      mentions: (item.mentions || 0) * recencyBoost
    }
  })

  // Re-sort by boosted mentions
  itemsWithBoost.sort((a, b) => (b.mentions || 0) - (a.mentions || 0))

  return itemsWithBoost.slice(0, limit)
}

/**
 * Get top products by blended score
 * score = 0.6 * norm(max_days) + 0.4 * norm(mentions) * recencyBoost
 */
export async function getBlended({
  limit = 10,
  species,
  category,
  minLogs = 2
}: {
  limit?: number
  species?: Species
  category?: Category
  minLogs?: number
}): Promise<ProductRanking[]> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    console.warn('[getBlended] Supabase not configured, returning empty array')
    return []
  }

  try {
    // Fetch both longest and mentions
    const [longest, mentions] = await Promise.all([
      getTopLongest({ limit: limit * 2, species, category, minLogs }),
      getTopMentions({ limit: limit * 2, species, category })
    ])

    // Create a map to join data
    const productMap = new Map<string, ProductRanking>()

    // Add longest data
    longest.forEach(item => {
      const key = `${item.category}:${item.brand}:${item.product}`
      productMap.set(key, { ...item })
    })

    // Merge mentions data
    mentions.forEach(item => {
      const key = `${item.category}:${item.brand}:${item.product}`
      const existing = productMap.get(key)
      if (existing) {
        existing.mentions = item.mentions
      } else {
        productMap.set(key, { ...item, max_days: 0 })
      }
    })

    // Convert to array and compute blended score
    const products = Array.from(productMap.values())

    if (products.length === 0) return []

    // Normalize and compute blended score
    const maxDays = Math.max(...products.map(p => p.max_days || 0), 1)
    const minDays = Math.min(...products.map(p => p.max_days || 0), 0)
    const maxMentions = Math.max(...products.map(p => p.mentions || 0), 1)
    const minMentions = Math.min(...products.map(p => p.mentions || 0), 0)

    const now = new Date()
    const productsWithScore = products.map(item => {
      const normDays = maxDays > minDays 
        ? (item.max_days - minDays) / (maxDays - minDays)
        : 0
      
      const normMentions = maxMentions > minMentions
        ? ((item.mentions || 0) - minMentions) / (maxMentions - minMentions)
        : 0

      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(item.last_updated).getTime()) / (1000 * 60 * 60 * 24)
      )
      const recencyBoost = Math.exp(-daysSinceUpdate / 180)

      const blendedScore = 0.6 * normDays + 0.4 * normMentions * recencyBoost

      return {
        ...item,
        blended_score: blendedScore
      }
    })

    // Sort by blended score, then logs_count, then last_updated
    productsWithScore.sort((a, b) => {
      if (b.blended_score !== a.blended_score) {
        return (b.blended_score || 0) - (a.blended_score || 0)
      }
      if (b.logs_count !== a.logs_count) {
        return b.logs_count - a.logs_count
      }
      return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    })

    return productsWithScore.slice(0, limit)
  } catch (err) {
    console.error('[getBlended] Exception:', err)
    return []
  }
}

