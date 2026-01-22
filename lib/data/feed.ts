/**
 * Unified feed data structure and fetchers
 * Supports both Q&A and Review/Log items
 */

import { Question } from '@/app/components/qa-forum/QuestionCard'
import { ReviewLog } from '@/lib/types/review-log'
import questionsData from '@/data/questions.json'
import { mockReviewLogs, mockOwners, mockPets } from '@/lib/mock/review-log'
import { getBrowserClient } from '@/lib/supabase-client'

export type FeedItemKind = 'qa' | 'review'

export interface UnifiedFeedItem {
  id: string
  kind: FeedItemKind
  title: string
  meta: string // e.g., "브랜드 · 제품명" or "카테고리"
  excerpt: string
  stats: {
    likes: number
    comments: number
    views: number
  }
  // Review-specific
  period?: {
    status: 'feeding' | 'paused' | 'completed'
    label: string
  }
  rating?: number
  recommend?: boolean
  // Q&A-specific
  answerCount?: number
  status?: 'open' | 'answered' | 'closed'
  // Common
  createdAt: string
  updatedAt?: string
  author: {
    name: string
    level?: 'beginner' | 'experienced' | 'expert'
  }
  category?: string
  categoryEmoji?: string
  // Links
  href: string
}

/**
 * Fetch community_questions from Supabase
 */
async function fetchCommunityQuestions(): Promise<Question[]> {
  try {
    const supabase = getBrowserClient()
    if (!supabase) return questionsData as Question[]

    const { data, error } = await supabase
      .from('community_questions')
      .select(`
        *,
        author:profiles!author_id(nickname, avatar_url)
      `)
      .eq('admin_status', 'visible')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return questionsData as Question[]

    // Get answer counts for each question
    const questionsWithAnswers = await Promise.all(
      data.map(async (q: any) => {
        const { count } = await supabase
          .from('community_answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', q.id)
          .eq('admin_status', 'visible')

        return {
          id: q.id,
          title: q.title,
          content: q.content,
          author: {
            name: q.author?.nickname || '익명',
            level: 'beginner' as const
          },
          category: q.category,
          categoryEmoji: q.category.split(' ')[0],
          votes: q.votes || 0,
          answerCount: count || 0,
          views: q.views || 0,
          createdAt: q.created_at,
          updatedAt: q.updated_at,
          status: q.status as 'open' | 'answered' | 'closed',
          isUpvoted: false
        }
      })
    )

    return questionsWithAnswers
  } catch (error) {
    console.error('Failed to fetch community_questions:', error)
    return questionsData as Question[]
  }
}

/**
 * Fetch review_logs from Supabase
 */
async function fetchReviewLogs(): Promise<ReviewLog[]> {
  try {
    const supabase = getBrowserClient()
    if (!supabase) return mockReviewLogs

    const { data, error } = await supabase
      .from('review_logs')
      .select(`
        *,
        profiles!owner_id(nickname, avatar_url),
        pets!pet_id(id, name, species, birth_date, weight_kg)
      `)
      .eq('admin_status', 'visible')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error || !data) return mockReviewLogs

    return data.map((log: any) => ({
      id: log.id,
      petId: log.pet_id || '',
      ownerId: log.owner_id || '',
      category: log.category || 'feed',
      brand: log.brand || '',
      product: log.product || '',
      status: log.status || 'feeding',
      periodStart: log.period_start || log.created_at,
      periodEnd: log.period_end || undefined,
      durationDays: log.duration_days || undefined,
      rating: log.rating || undefined,
      recommend: log.recommend || undefined,
      continueReasons: log.continue_reasons || undefined,
      stopReasons: log.stop_reasons || undefined,
      excerpt: log.excerpt || '',
      notes: log.notes || undefined,
      likes: log.likes || 0,
      commentsCount: log.comments_count || 0,
      views: log.views || 0,
      createdAt: log.created_at || new Date().toISOString(),
      updatedAt: log.updated_at || log.created_at || new Date().toISOString(),
      // Add owner/pet info for display
      ownerName: log.profiles?.nickname || '익명',
      petName: log.pets?.name || '펫'
    }))
  } catch (error) {
    console.error('Failed to fetch review_logs:', error)
    return mockReviewLogs
  }
}

/**
 * Convert Question to UnifiedFeedItem
 */
function questionToFeedItem(question: Question): UnifiedFeedItem {
  return {
    id: question.id,
    kind: 'qa',
    title: question.title,
    meta: question.category.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF]+[\u200D\uFE0F]*[\uD83C-\uDBFF\uDC00-\uDFFF]*[\u200D\uFE0F]*\s*/, ''),
    excerpt: question.content.substring(0, 150) + (question.content.length > 150 ? '...' : ''),
    stats: {
      likes: question.votes,
      comments: question.answerCount,
      views: question.views || 0
    },
    answerCount: question.answerCount,
    status: question.status,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
    author: {
      name: question.author.name,
      level: question.author.level
    },
    category: question.category,
    categoryEmoji: question.categoryEmoji,
    href: `/community/qa-forum/${question.id}`
  }
}

/**
 * Convert ReviewLog to UnifiedFeedItem
 */
function reviewToFeedItem(review: ReviewLog, ownerName: string, petName: string): UnifiedFeedItem {
  const periodLabel =
    review.status === 'feeding'
      ? `since ${new Date(review.periodStart).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')}`
      : review.periodEnd
      ? `${new Date(review.periodStart).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')} ~ ${new Date(review.periodEnd).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')} (총 ${review.durationDays}일)`
      : new Date(review.periodStart).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')

  return {
    id: review.id,
    kind: 'review',
    title: `${review.brand} · ${review.product}`,
    meta: `${ownerName} · ${petName}`,
    excerpt: review.excerpt,
    stats: {
      likes: review.likes,
      comments: review.commentsCount,
      views: review.views
    },
    period: {
      status: review.status,
      label: periodLabel
    },
    rating: review.rating,
    recommend: review.recommend,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    author: {
      name: ownerName
    },
    href: `/pet-log/${review.id}`
  }
}

/**
 * Get popular feed items (sorted by engagement)
 */
export async function getPopular(limit: number = 20): Promise<UnifiedFeedItem[]> {
  const items: UnifiedFeedItem[] = []

  // Add Q&A items from Supabase
  const questions = await fetchCommunityQuestions()
  const qaItems = questions
    .map(questionToFeedItem)
    .sort((a, b) => {
      const scoreA = a.stats.likes * 2 + a.stats.comments + a.stats.views / 10
      const scoreB = b.stats.likes * 2 + b.stats.comments + b.stats.views / 10
      return scoreB - scoreA
    })
    .slice(0, Math.floor(limit / 2))

  items.push(...qaItems)

  // Add Review items from Supabase
  const reviewLogs = await fetchReviewLogs()
  const reviewItems = reviewLogs
    .slice(0, Math.floor(limit / 2))
    .map((review: any) => 
      reviewToFeedItem(review, review.ownerName || '익명', review.petName || '펫')
    )
    .sort((a, b) => {
      const scoreA = a.stats.likes * 2 + a.stats.comments + a.stats.views / 10
      const scoreB = b.stats.likes * 2 + b.stats.comments + b.stats.views / 10
      return scoreB - scoreA
    })

  items.push(...reviewItems)

  // Sort all items by engagement score
  return items.sort((a, b) => {
    const scoreA = a.stats.likes * 2 + a.stats.comments + a.stats.views / 10
    const scoreB = b.stats.likes * 2 + b.stats.comments + b.stats.views / 10
    return scoreB - scoreA
  }).slice(0, limit)
}

/**
 * Get recent feed items (sorted by createdAt desc)
 */
export async function getRecent(limit: number = 20): Promise<UnifiedFeedItem[]> {
  const items: UnifiedFeedItem[] = []

  // Add Q&A items from Supabase
  const questions = await fetchCommunityQuestions()
  const qaItems = questions
    .map(questionToFeedItem)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  items.push(...qaItems)

  // Add Review items from Supabase
  const reviewLogs = await fetchReviewLogs()
  const reviewItems = reviewLogs.map((review: any) => 
    reviewToFeedItem(review, review.ownerName || '익명', review.petName || '펫')
  )

  items.push(...reviewItems)

  // Sort all by createdAt desc
  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

/**
 * Get Q&A items only
 */
export async function getQA(limit: number = 20): Promise<UnifiedFeedItem[]> {
  const questions = await fetchCommunityQuestions()
  return questions
    .map(questionToFeedItem)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

/**
 * Get Review/Log items only
 */
export async function getReviews(limit: number = 20): Promise<UnifiedFeedItem[]> {
  const reviewLogs = await fetchReviewLogs()
  return reviewLogs
    .map((review: any) => 
      reviewToFeedItem(review, review.ownerName || '익명', review.petName || '펫')
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

