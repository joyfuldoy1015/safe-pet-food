import type { ReviewLog } from '@/lib/types/review-log'
import type { Category, Status } from '@/lib/types/review-log'

/**
 * Group review logs by category
 */
export function groupByCategory(logs: ReviewLog[]): Record<Category, ReviewLog[]> {
  const grouped: Record<Category, ReviewLog[]> = {
    feed: [],
    snack: [],
    supplement: [],
    toilet: []
  }

  logs.forEach((log) => {
    if (log.category in grouped) {
      grouped[log.category].push(log)
    }
  })

  return grouped
}

/**
 * Status weight for sorting (lower = higher priority)
 * feeding = 0 (top), completed = 1, paused = 2
 */
export function statusWeight(status: Status): number {
  switch (status) {
    case 'feeding':
      return 0
    case 'completed':
      return 1
    case 'paused':
      return 2
    default:
      return 3
  }
}

/**
 * Sort logs within a category
 * Priority: status weight (feeding first), then updated_at desc
 */
export function sortLogs(logs: ReviewLog[]): ReviewLog[] {
  return [...logs].sort((a, b) => {
    const statusDiff = statusWeight(a.status) - statusWeight(b.status)
    if (statusDiff !== 0) return statusDiff

    const aTime = new Date(a.updatedAt).getTime()
    const bTime = new Date(b.updatedAt).getTime()
    return bTime - aTime // Descending
  })
}

/**
 * Filter logs by category tab
 */
export function filterByTab(logs: ReviewLog[], tab: Category | 'all'): ReviewLog[] {
  if (tab === 'all') return logs
  return logs.filter((log) => log.category === tab)
}

/**
 * Get category statistics
 */
export function getCategoryStats(logs: ReviewLog[]): {
  total: number
  feeding: number
  completed: number
  paused: number
} {
  return {
    total: logs.length,
    feeding: logs.filter((l) => l.status === 'feeding').length,
    completed: logs.filter((l) => l.status === 'completed').length,
    paused: logs.filter((l) => l.status === 'paused').length
  }
}

