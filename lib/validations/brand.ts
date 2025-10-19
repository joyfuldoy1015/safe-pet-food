import { z } from 'zod'

// 리콜 이력 스키마
export const recallHistorySchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜는 YYYY-MM-DD 형식이어야 합니다')
    .refine((date) => {
      const d = new Date(date)
      return d instanceof Date && !isNaN(d.getTime())
    }, '유효한 날짜를 입력해주세요'),
  reason: z.string()
    .min(5, '리콜 사유는 최소 5자 이상이어야 합니다')
    .max(500, '리콜 사유는 최대 500자까지 입력 가능합니다'),
  severity: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: '심각도는 low, medium, high 중 하나여야 합니다' })
  }),
  resolved: z.boolean({
    errorMap: () => ({ message: '해결 여부는 true 또는 false여야 합니다' })
  })
})

// 브랜드 생성 스키마 (엄격한 검증)
export const brandCreateSchema = z.object({
  name: z.string()
    .min(2, '브랜드명은 최소 2자 이상이어야 합니다')
    .max(50, '브랜드명은 최대 50자까지 입력 가능합니다')
    .regex(/^[가-힣a-zA-Z0-9\s\-&.]+$/, '브랜드명에 특수문자는 사용할 수 없습니다'),
  
  manufacturer: z.string()
    .min(2, '제조사명은 최소 2자 이상이어야 합니다')
    .max(100, '제조사명은 최대 100자까지 입력 가능합니다'),
  
  overall_rating: z.number()
    .min(0, '평점은 0 이상이어야 합니다')
    .max(5, '평점은 5 이하여야 합니다')
    .refine((val) => Number.isFinite(val), '평점은 유효한 숫자여야 합니다'),
  
  established_year: z.number()
    .int('설립연도는 정수여야 합니다')
    .min(1800, '설립연도는 1800년 이후여야 합니다')
    .max(new Date().getFullYear(), `설립연도는 ${new Date().getFullYear()}년 이하여야 합니다`)
    .refine((year) => year > 0, '설립연도는 양수여야 합니다'),
  
  country: z.string()
    .min(2, '국가명은 최소 2자 이상이어야 합니다')
    .max(50, '국가명은 최대 50자까지 입력 가능합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '국가명은 한글 또는 영문만 입력 가능합니다'),
  
  product_lines: z.array(z.string().min(1, '제품군명은 비어있을 수 없습니다'))
    .min(1, '최소 1개 이상의 제품군을 입력해야 합니다')
    .max(20, '제품군은 최대 20개까지 입력 가능합니다')
    .refine((lines) => {
      const uniqueLines = new Set(lines.map(l => l.toLowerCase().trim()))
      return uniqueLines.size === lines.length
    }, '중복된 제품군이 있습니다'),
  
  certifications: z.array(z.string().min(1, '인증명은 비어있을 수 없습니다'))
    .max(15, '인증은 최대 15개까지 입력 가능합니다')
    .refine((certs) => {
      const uniqueCerts = new Set(certs.map(c => c.toUpperCase().trim()))
      return uniqueCerts.size === certs.length
    }, '중복된 인증이 있습니다'),
  
  image: z.string()
    .url('유효한 이미지 URL을 입력해주세요')
    .optional()
    .or(z.literal('')),
  
  recall_history: z.array(recallHistorySchema)
    .default([])
    .refine((recalls) => {
      // 날짜 순서 검증 (최신순)
      for (let i = 0; i < recalls.length - 1; i++) {
        const current = new Date(recalls[i].date)
        const next = new Date(recalls[i + 1].date)
        if (current < next) {
          return false
        }
      }
      return true
    }, '리콜 이력은 최신순으로 정렬되어야 합니다')
})

// 브랜드 업데이트 스키마 (부분 업데이트 가능)
export const brandUpdateSchema = brandCreateSchema.partial().extend({
  id: z.string()
    .min(1, '브랜드 ID는 필수입니다')
})

// 브랜드 ID 검증
export const brandIdSchema = z.string()
  .min(1, '브랜드 ID는 필수입니다')
  .regex(/^[0-9a-zA-Z_-]+$/, '유효하지 않은 브랜드 ID입니다')

// 타입 추론
export type BrandCreate = z.infer<typeof brandCreateSchema>
export type BrandUpdate = z.infer<typeof brandUpdateSchema>
export type RecallHistory = z.infer<typeof recallHistorySchema>

// 검증 헬퍼 함수
export function validateBrandCreate(data: unknown) {
  return brandCreateSchema.safeParse(data)
}

export function validateBrandUpdate(data: unknown) {
  return brandUpdateSchema.safeParse(data)
}

export function validateBrandId(id: unknown) {
  return brandIdSchema.safeParse(id)
}

// 에러 메시지 포맷팅 헬퍼
export function formatValidationErrors(errors: z.ZodError) {
  return errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }))
}

