export type GradeStyleVariant = 'default' | 'subtle'

interface GradeStyle {
  bg: string
  text: string
  border: string
  label: string
  combined: string
  combinedSubtle: string
}

const GRADE_STYLES: Record<string, GradeStyle> = {
  S: {
    bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', label: 'S',
    combined: 'bg-violet-100 text-violet-700 border-violet-200',
    combinedSubtle: 'bg-violet-50 text-violet-600 border-violet-200',
  },
  A: {
    bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'A',
    combined: 'bg-green-100 text-green-700 border-green-200',
    combinedSubtle: 'bg-green-50 text-green-600 border-green-200',
  },
  B: {
    bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'B',
    combined: 'bg-blue-100 text-blue-700 border-blue-200',
    combinedSubtle: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  C: {
    bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'C',
    combined: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    combinedSubtle: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  },
  D: {
    bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'D',
    combined: 'bg-orange-100 text-orange-700 border-orange-200',
    combinedSubtle: 'bg-orange-50 text-orange-600 border-orange-200',
  },
  F: {
    bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'F',
    combined: 'bg-red-100 text-red-700 border-red-200',
    combinedSubtle: 'bg-red-50 text-red-600 border-red-200',
  },
}

const DEFAULT_STYLE: GradeStyle = {
  bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: '-',
  combined: 'bg-gray-100 text-gray-600 border-gray-200',
  combinedSubtle: 'bg-gray-50 text-gray-500 border-gray-200',
}

export function getGradeStyle(grade?: string): GradeStyle {
  if (!grade) return DEFAULT_STYLE
  return GRADE_STYLES[grade.toUpperCase()] ?? DEFAULT_STYLE
}

export function getGradeColor(grade?: string, variant: GradeStyleVariant = 'default'): string {
  const style = getGradeStyle(grade)
  return variant === 'subtle' ? style.combinedSubtle : style.combined
}
