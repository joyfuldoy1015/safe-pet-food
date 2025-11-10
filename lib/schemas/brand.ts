import { z } from 'zod'

/**
 * Brand Rating / Evaluation Schema
 * Matches brand_ratings table constraints
 */
export const brandRatingSchema = z.object({
  species: z.enum(['dog', 'cat'], {
    errorMap: () => ({ message: '종류는 강아지 또는 고양이여야 합니다' })
  }),
  
  brand: z.string()
    .trim()
    .min(1, '브랜드명을 입력해주세요')
    .max(120, '브랜드명은 최대 120자까지 입력 가능합니다')
    .refine((val) => val.trim().length > 0, '브랜드명은 공백만 입력할 수 없습니다'),
  
  product: z.string()
    .trim()
    .max(120, '제품명은 최대 120자까지 입력 가능합니다')
    .optional()
    .nullable()
    .refine((val) => !val || val.trim().length > 0, '제품명은 공백만 입력할 수 없습니다'),
  
  rating: z.number()
    .min(1, '평점은 1 이상이어야 합니다')
    .max(5, '평점은 5 이하여야 합니다')
    .refine((val) => {
      // Allow 0.5 step increments
      return val % 0.5 === 0 || val % 1 === 0
    }, '평점은 0.5 단위로 입력 가능합니다'),
  
  pros: z.array(z.string().trim().min(1, '장점은 공백일 수 없습니다'))
    .max(5, '장점은 최대 5개까지 입력 가능합니다')
    .default([])
    .refine((pros) => {
      const unique = new Set(pros.map(p => p.toLowerCase().trim()))
      return unique.size === pros.length
    }, '중복된 장점이 있습니다'),
  
  cons: z.array(z.string().trim().min(1, '단점은 공백일 수 없습니다'))
    .max(5, '단점은 최대 5개까지 입력 가능합니다')
    .default([])
    .refine((cons) => {
      const unique = new Set(cons.map(c => c.toLowerCase().trim()))
      return unique.size === cons.length
    }, '중복된 단점이 있습니다'),
  
  comment: z.string()
    .trim()
    .max(2000, '코멘트는 최대 2000자까지 입력 가능합니다')
    .optional()
    .nullable()
    .refine((val) => !val || val.trim().length > 0, '코멘트는 공백만 입력할 수 없습니다'),
  
  author_id: z.string().uuid('작성자 ID는 유효한 UUID여야 합니다')
})

// Create schema
export const brandRatingCreateSchema = brandRatingSchema

// Base schema without refinements for extend
const brandRatingBaseSchema = z.object({
  species: z.enum(['dog', 'cat'], {
    errorMap: () => ({ message: '종류는 강아지 또는 고양이여야 합니다' })
  }),
  brand: z.string()
    .trim()
    .min(1, '브랜드명을 입력해주세요')
    .max(120, '브랜드명은 최대 120자까지 입력 가능합니다')
    .refine((val) => val.trim().length > 0, '브랜드명은 공백만 입력할 수 없습니다'),
  product: z.string()
    .trim()
    .max(120, '제품명은 최대 120자까지 입력 가능합니다')
    .optional()
    .nullable()
    .refine((val) => !val || val.trim().length > 0, '제품명은 공백만 입력할 수 없습니다'),
  rating: z.number()
    .min(1, '평점은 1 이상이어야 합니다')
    .max(5, '평점은 5 이하여야 합니다')
    .refine((val) => {
      return val % 0.5 === 0 || val % 1 === 0
    }, '평점은 0.5 단위로 입력 가능합니다'),
  pros: z.array(z.string().trim().min(1, '장점은 공백일 수 없습니다'))
    .max(5, '장점은 최대 5개까지 입력 가능합니다')
    .default([])
    .refine((pros) => {
      const unique = new Set(pros.map(p => p.toLowerCase().trim()))
      return unique.size === pros.length
    }, '중복된 장점이 있습니다'),
  cons: z.array(z.string().trim().min(1, '단점은 공백일 수 없습니다'))
    .max(5, '단점은 최대 5개까지 입력 가능합니다')
    .default([])
    .refine((cons) => {
      const unique = new Set(cons.map(c => c.toLowerCase().trim()))
      return unique.size === cons.length
    }, '중복된 단점이 있습니다'),
  comment: z.string()
    .trim()
    .max(2000, '코멘트는 최대 2000자까지 입력 가능합니다')
    .optional()
    .nullable()
    .refine((val) => !val || val.trim().length > 0, '코멘트는 공백만 입력할 수 없습니다'),
  author_id: z.string().uuid('작성자 ID는 유효한 UUID여야 합니다')
})

// Update schema
export const brandRatingUpdateSchema = brandRatingBaseSchema.partial().extend({
  id: z.string().uuid('평가 ID는 유효한 UUID여야 합니다')
})

// Type exports
export type BrandRating = z.infer<typeof brandRatingSchema>
export type BrandRatingCreate = z.infer<typeof brandRatingCreateSchema>
export type BrandRatingUpdate = z.infer<typeof brandRatingUpdateSchema>

// Validation helpers
export function validateBrandRating(data: unknown) {
  return brandRatingSchema.safeParse(data)
}

export function validateBrandRatingCreate(data: unknown) {
  return brandRatingCreateSchema.safeParse(data)
}

export function validateBrandRatingUpdate(data: unknown) {
  return brandRatingUpdateSchema.safeParse(data)
}

// Format validation errors in Korean
export function formatBrandRatingValidationErrors(errors: z.ZodError) {
  return errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message || '유효하지 않은 값입니다'
  }))
}

