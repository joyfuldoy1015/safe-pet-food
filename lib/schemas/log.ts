import { z } from 'zod'

/**
 * Feeding Review / Log Schema
 * Matches review_logs table constraints
 */

// Base schema with all required fields
export const reviewLogSchema = z.object({
  pet_id: z.string().uuid('반려동물 ID는 유효한 UUID여야 합니다'),
  
  category: z.enum(['feed', 'snack', 'supplement', 'toilet'], {
    errorMap: () => ({ message: '제품군은 사료, 간식, 영양제, 화장실 중 하나여야 합니다' })
  }),
  
  brand: z.string()
    .trim()
    .min(1, '브랜드명을 입력해주세요')
    .max(120, '브랜드명은 최대 120자까지 입력 가능합니다')
    .refine((val) => val.trim().length > 0, '브랜드명은 공백만 입력할 수 없습니다'),
  
  product: z.string()
    .trim()
    .min(1, '제품명을 입력해주세요')
    .max(120, '제품명은 최대 120자까지 입력 가능합니다')
    .refine((val) => val.trim().length > 0, '제품명은 공백만 입력할 수 없습니다'),
  
  status: z.enum(['feeding', 'paused', 'completed'], {
    errorMap: () => ({ message: '상태는 급여 중, 급여 중지, 급여 완료 중 하나여야 합니다' })
  }),
  
  period_start: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '시작일은 YYYY-MM-DD 형식이어야 합니다')
    .refine((date) => {
      const d = new Date(date)
      return d instanceof Date && !isNaN(d.getTime())
    }, '유효한 시작일을 입력해주세요'),
  
  period_end: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '종료일은 YYYY-MM-DD 형식이어야 합니다')
    .refine((date) => {
      const d = new Date(date)
      return d instanceof Date && !isNaN(d.getTime())
    }, '유효한 종료일을 입력해주세요')
    .optional()
    .nullable(),
  
  rating: z.number()
    .min(1, '평점은 1 이상이어야 합니다')
    .max(5, '평점은 5 이하여야 합니다')
    .optional()
    .nullable(),
  
  recommend: z.boolean().optional().nullable(),
  
  continue_reasons: z.array(z.string().trim().min(1, '계속하는 이유는 공백일 수 없습니다'))
    .max(5, '계속하는 이유는 최대 5개까지 입력 가능합니다')
    .default([])
    .refine((reasons) => {
      const unique = new Set(reasons.map(r => r.toLowerCase().trim()))
      return unique.size === reasons.length
    }, '중복된 계속하는 이유가 있습니다'),
  
  stop_reasons: z.array(z.string().trim().min(1, '중지하는 이유는 공백일 수 없습니다'))
    .max(5, '중지하는 이유는 최대 5개까지 입력 가능합니다')
    .default([])
    .refine((reasons) => {
      const unique = new Set(reasons.map(r => r.toLowerCase().trim()))
      return unique.size === reasons.length
    }, '중복된 중지하는 이유가 있습니다'),
  
  excerpt: z.string()
    .trim()
    .min(1, '후기 요약을 입력해주세요')
    .max(80, '후기 요약은 최대 80자까지 입력 가능합니다')
    .refine((val) => val.trim().length > 0, '후기 요약은 공백만 입력할 수 없습니다'),
  
  notes: z.string()
    .trim()
    .max(3000, '상세 메모는 최대 3000자까지 입력 가능합니다')
    .optional()
    .nullable(),
  
  // Feed-only fields (optional)
  kcal_per_kg: z.number()
    .positive('칼로리는 0보다 커야 합니다')
    .optional()
    .nullable(),
  
  dosage_unit: z.string()
    .trim()
    .max(20, '용량 단위는 최대 20자까지 입력 가능합니다')
    .optional()
    .nullable(),
  
  dosage_value: z.number()
    .positive('용량은 0보다 커야 합니다')
    .optional()
    .nullable()
})
.refine((data) => {
  // period_end required if status is 'completed'
  if (data.status === 'completed' && !data.period_end) {
    return false
  }
  return true
}, {
  message: '급여 완료 상태일 경우 종료일을 입력해주세요',
  path: ['period_end']
})
.refine((data) => {
  // period_end must be >= period_start
  if (data.period_start && data.period_end) {
    const start = new Date(data.period_start)
    const end = new Date(data.period_end)
    return end >= start
  }
  return true
}, {
  message: '종료일은 시작일보다 같거나 늦어야 합니다',
  path: ['period_end']
})
.refine((data) => {
  // Feed-only fields should only be set when category is 'feed'
  if (data.category !== 'feed') {
    return !data.kcal_per_kg && !data.dosage_unit && !data.dosage_value
  }
  return true
}, {
  message: '칼로리 및 용량 정보는 사료 카테고리에서만 입력 가능합니다',
  path: ['category']
})

// Create schema (includes owner_id)
export const reviewLogCreateSchema = reviewLogSchema.extend({
  owner_id: z.string().uuid('소유자 ID는 유효한 UUID여야 합니다')
})

// Update schema (all fields optional except id)
export const reviewLogUpdateSchema = reviewLogSchema.partial().extend({
  id: z.string().uuid('로그 ID는 유효한 UUID여야 합니다')
})

// Type exports
export type ReviewLog = z.infer<typeof reviewLogSchema>
export type ReviewLogCreate = z.infer<typeof reviewLogCreateSchema>
export type ReviewLogUpdate = z.infer<typeof reviewLogUpdateSchema>

// Validation helpers
export function validateReviewLog(data: unknown) {
  return reviewLogSchema.safeParse(data)
}

export function validateReviewLogCreate(data: unknown) {
  return reviewLogCreateSchema.safeParse(data)
}

export function validateReviewLogUpdate(data: unknown) {
  return reviewLogUpdateSchema.safeParse(data)
}

// Format validation errors in Korean
export function formatLogValidationErrors(errors: z.ZodError) {
  return errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message || '유효하지 않은 값입니다'
  }))
}

