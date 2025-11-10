import { z } from 'zod'

/**
 * Q&A Thread Schema
 * Matches qa_threads table constraints
 */
export const qaThreadSchema = z.object({
  log_id: z.string().uuid('로그 ID는 유효한 UUID여야 합니다'),
  
  title: z.string()
    .trim()
    .min(1, '제목을 입력해주세요')
    .max(120, '제목은 최대 120자까지 입력 가능합니다')
    .refine((val) => val.trim().length > 0, '제목은 공백만 입력할 수 없습니다')
    .refine((val) => {
      // Basic profanity/URL flood guard: check for excessive URLs
      const urlMatches = val.match(/https?:\/\//g)
      return !urlMatches || urlMatches.length <= 2
    }, '제목에 너무 많은 URL이 포함되어 있습니다'),
  
  author_id: z.string().uuid('작성자 ID는 유효한 UUID여야 합니다')
})

/**
 * Q&A Post Schema
 * Matches qa_posts table constraints
 */
export const qaPostSchema = z.object({
  thread_id: z.string().uuid('스레드 ID는 유효한 UUID여야 합니다'),
  
  kind: z.enum(['question', 'answer', 'comment'], {
    errorMap: () => ({ message: '종류는 질문, 답변, 댓글 중 하나여야 합니다' })
  }),
  
  content: z.string()
    .trim()
    .min(10, '내용은 최소 10자 이상이어야 합니다')
    .max(5000, '내용은 최대 5000자까지 입력 가능합니다')
    .refine((val) => val.trim().length >= 10, '내용은 공백만 입력할 수 없습니다')
    .refine((val) => {
      // Strip HTML tags for length check
      const textOnly = val.replace(/<[^>]*>/g, '')
      return textOnly.trim().length >= 10
    }, '내용은 최소 10자 이상의 텍스트가 필요합니다')
    .refine((val) => {
      // Basic profanity/URL flood guard
      const urlMatches = val.match(/https?:\/\//g)
      return !urlMatches || urlMatches.length <= 5
    }, '내용에 너무 많은 URL이 포함되어 있습니다'),
  
  parent_id: z.string().uuid('부모 게시물 ID는 유효한 UUID여야 합니다').optional().nullable(),
  
  author_id: z.string().uuid('작성자 ID는 유효한 UUID여야 합니다'),
  
  is_accepted: z.boolean().default(false).optional()
})
.refine((data) => {
  // parent_id required for answer/comment kinds
  if ((data.kind === 'answer' || data.kind === 'comment') && !data.parent_id) {
    return false
  }
  return true
}, {
  message: '답변 또는 댓글은 부모 게시물 ID가 필요합니다',
  path: ['parent_id']
})

// Create schemas
export const qaThreadCreateSchema = qaThreadSchema

export const qaPostCreateSchema = qaPostSchema

// Base schemas without refinements for extend
const qaThreadBaseSchema = z.object({
  log_id: z.string().uuid('로그 ID는 유효한 UUID여야 합니다'),
  title: z.string()
    .trim()
    .min(1, '제목을 입력해주세요')
    .max(120, '제목은 최대 120자까지 입력 가능합니다')
    .refine((val) => val.trim().length > 0, '제목은 공백만 입력할 수 없습니다')
    .refine((val) => {
      const urlMatches = val.match(/https?:\/\//g)
      return !urlMatches || urlMatches.length <= 2
    }, '제목에 너무 많은 URL이 포함되어 있습니다'),
  author_id: z.string().uuid('작성자 ID는 유효한 UUID여야 합니다')
})

const qaPostBaseSchema = z.object({
  thread_id: z.string().uuid('스레드 ID는 유효한 UUID여야 합니다'),
  kind: z.enum(['question', 'answer', 'comment'], {
    errorMap: () => ({ message: '종류는 질문, 답변, 댓글 중 하나여야 합니다' })
  }),
  content: z.string()
    .trim()
    .min(10, '내용은 최소 10자 이상이어야 합니다')
    .max(5000, '내용은 최대 5000자까지 입력 가능합니다')
    .refine((val) => val.trim().length >= 10, '내용은 공백만 입력할 수 없습니다')
    .refine((val) => {
      const textOnly = val.replace(/<[^>]*>/g, '')
      return textOnly.trim().length >= 10
    }, '내용은 최소 10자 이상의 텍스트가 필요합니다')
    .refine((val) => {
      const urlMatches = val.match(/https?:\/\//g)
      return !urlMatches || urlMatches.length <= 5
    }, '내용에 너무 많은 URL이 포함되어 있습니다'),
  parent_id: z.string().uuid('부모 게시물 ID는 유효한 UUID여야 합니다').optional().nullable(),
  author_id: z.string().uuid('작성자 ID는 유효한 UUID여야 합니다'),
  is_accepted: z.boolean().default(false).optional()
})

// Update schemas
export const qaThreadUpdateSchema = qaThreadBaseSchema.partial().extend({
  id: z.string().uuid('스레드 ID는 유효한 UUID여야 합니다')
})

export const qaPostUpdateSchema = qaPostBaseSchema.partial().extend({
  id: z.string().uuid('게시물 ID는 유효한 UUID여야 합니다')
})
.refine((data) => {
  if ((data.kind === 'answer' || data.kind === 'comment') && !data.parent_id) {
    return false
  }
  return true
}, {
  message: '답변 또는 댓글은 부모 게시물 ID가 필요합니다',
  path: ['parent_id']
})

// Type exports
export type QAThread = z.infer<typeof qaThreadSchema>
export type QAThreadCreate = z.infer<typeof qaThreadCreateSchema>
export type QAThreadUpdate = z.infer<typeof qaThreadUpdateSchema>

export type QAPost = z.infer<typeof qaPostSchema>
export type QAPostCreate = z.infer<typeof qaPostCreateSchema>
export type QAPostUpdate = z.infer<typeof qaPostUpdateSchema>

// Validation helpers
export function validateQAThread(data: unknown) {
  return qaThreadSchema.safeParse(data)
}

export function validateQAThreadCreate(data: unknown) {
  return qaThreadCreateSchema.safeParse(data)
}

export function validateQAPost(data: unknown) {
  return qaPostSchema.safeParse(data)
}

export function validateQAPostCreate(data: unknown) {
  return qaPostCreateSchema.safeParse(data)
}

// Format validation errors in Korean
export function formatQAValidationErrors(errors: z.ZodError) {
  return errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message || '유효하지 않은 값입니다'
  }))
}

