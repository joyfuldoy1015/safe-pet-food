/**
 * Unified feed data structure and fetchers
 * Supports both Q&A and Review/Log items
 */

import { Question } from '@/app/components/qa-forum/QuestionCard'
import { ReviewLog } from '@/lib/types/review-log'
import questionsData from '@/data/questions.json'
import { mockReviewLogs, mockOwners, mockPets } from '@/lib/mock/review-log'

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
    href: `/owners/${review.ownerId}/pets/${review.petId}`
  }
}

/**
 * Get popular feed items (sorted by engagement)
 */
export async function getPopular(limit: number = 20): Promise<UnifiedFeedItem[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/feed/popular?limit=' + limit)
  // return response.json()

  const items: UnifiedFeedItem[] = []

  // Add Q&A items
  const qaItems = (questionsData as Question[])
    .map(questionToFeedItem)
    .sort((a, b) => {
      const scoreA = a.stats.likes * 2 + a.stats.comments + a.stats.views / 10
      const scoreB = b.stats.likes * 2 + b.stats.comments + b.stats.views / 10
      return scoreB - scoreA
    })
    .slice(0, Math.floor(limit / 2))

  items.push(...qaItems)

  // Add Review items
  const reviewItems = mockReviewLogs
    .slice(0, Math.floor(limit / 2))
    .map((review) => {
      const owner = mockOwners.find((o) => o.id === review.ownerId)
      const pet = mockPets.find((p) => p.id === review.petId)
      return reviewToFeedItem(review, owner?.nickname || '익명', pet?.name || '펫')
    })
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
  // TODO: Replace with actual API call
  const items: UnifiedFeedItem[] = []

  // Add Q&A items
  const qaItems = (questionsData as Question[])
    .map(questionToFeedItem)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  items.push(...qaItems)

  // Add Review items
  const reviewItems = mockReviewLogs.map((review) => {
    const owner = mockOwners.find((o) => o.id === review.ownerId)
    const pet = mockPets.find((p) => p.id === review.petId)
    return reviewToFeedItem(review, owner?.nickname || '익명', pet?.name || '펫')
  })

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
  // TODO: Replace with actual API call
  return (questionsData as Question[])
    .map(questionToFeedItem)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

/**
 * Get Review/Log items only
 */
export async function getReviews(limit: number = 20): Promise<UnifiedFeedItem[]> {
  // TODO: Replace with actual API call
  return mockReviewLogs
    .map((review) => {
      const owner = mockOwners.find((o) => o.id === review.ownerId)
      const pet = mockPets.find((p) => p.id === review.petId)
      return reviewToFeedItem(review, owner?.nickname || '익명', pet?.name || '펫')
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

