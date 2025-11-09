/**
 * Format period label for review log
 * - feeding: "급여 중 · since YYYY.MM.DD (총 X일)"
 * - else: "YYYY.MM.DD ~ YYYY.MM.DD (총 X일)"
 */
export function formatPeriodLabel(
  status: 'feeding' | 'paused' | 'completed',
  periodStart: string,
  periodEnd?: string,
  durationDays?: number
): string {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '')
  }

  const startFormatted = formatDate(periodStart)

  if (status === 'feeding') {
    const days = durationDays || calculateDays(periodStart, new Date().toISOString().split('T')[0])
    return `급여 중 · since ${startFormatted} (총 ${days}일)`
  }

  if (periodEnd) {
    const endFormatted = formatDate(periodEnd)
    const days = durationDays || calculateDays(periodStart, periodEnd)
    return `${startFormatted} ~ ${endFormatted} (총 ${days}일)`
  }

  return startFormatted
}

/**
 * Calculate days between two dates
 */
function calculateDays(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

