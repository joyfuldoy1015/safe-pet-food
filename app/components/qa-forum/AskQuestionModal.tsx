'use client'

import React, { useState, useRef } from 'react'
import { X, Image as ImageIcon, Sparkles, Loader2, RefreshCw, Check, Upload, Trash2 } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-client'

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    category: string
    content: string
    isAnonymous: boolean
    imageUrl?: string
    summary?: string
  }) => void
  categories: Array<{ value: string; label: string; emoji: string }>
}

const SUMMARY_THRESHOLD = 200
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGE_DIMENSION = 1200
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const needsResize = width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION
      if (needsResize) {
        const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          } else {
            resolve(file)
          }
        },
        'image/jpeg',
        0.8
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function AskQuestionModal({
  isOpen,
  onClose,
  onSubmit,
  categories
}: AskQuestionModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [summary, setSummary] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState('')
  const [showSummaryPreview, setShowSummaryPreview] = useState(false)

  if (!isOpen) return null

  const contentLength = content.trim().length
  const needsSummary = contentLength >= SUMMARY_THRESHOLD

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('JPG, PNG, WebP, GIF, HEIC 형식만 지원합니다.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('파일 크기는 5MB 이하만 가능합니다.')
      return
    }

    try {
      const compressed = await compressImage(file)
      setImageFile(compressed)
      setImagePreview(URL.createObjectURL(compressed))
    } catch {
      setUploadError('이미지 처리 중 오류가 발생했습니다.')
    }
  }

  const handleImageRemove = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return undefined
    setIsUploading(true)
    try {
      const supabase = getBrowserClient()
      if (!supabase) throw new Error('Supabase 연결 실패')

      const ext = imageFile.name.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = `qa-images/${fileName}`

      const { error } = await supabase.storage
        .from('qa-images')
        .upload(filePath, imageFile, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('qa-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      console.error('Image upload error:', err)
      setUploadError('이미지 업로드에 실패했습니다. 질문은 이미지 없이 등록됩니다.')
      return undefined
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerateSummary = async () => {
    setIsSummarizing(true)
    setSummaryError('')
    setSummary('')

    try {
      const response = await fetch('/api/community/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), title: title.trim() })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || '요약 생성 실패')
      }

      const data = await response.json()
      setSummary(data.summary)
      setShowSummaryPreview(true)
    } catch (error: any) {
      setSummaryError(error.message || '요약 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSummarizing(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setCategory('')
    setContent('')
    handleImageRemove()
    setSummary('')
    setShowSummaryPreview(false)
    setSummaryError('')
  }

  const validateForm = (): boolean => {
    if (!title.trim() || !category || !content.trim()) return false
    if (title.trim().length < 5) { alert('제목은 최소 5자 이상 입력해주세요.'); return false }
    if (title.trim().length > 200) { alert('제목은 최대 200자까지 입력 가능합니다.'); return false }
    if (content.trim().length < 10) { alert('내용은 최소 10자 이상 입력해주세요.'); return false }
    if (content.trim().length > 5000) { alert('내용은 최대 5000자까지 입력 가능합니다.'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const imageUrl = await uploadImage()
    onSubmit({
      title: title.trim(),
      category,
      content: content.trim(),
      isAnonymous: false,
      imageUrl,
      summary: summary.trim() || undefined
    })
    resetForm()
  }

  const handleSkipSummary = () => {
    setSummary('')
    setShowSummaryPreview(false)
    handleSubmitDirect()
  }

  const handleSubmitDirect = async () => {
    if (!validateForm()) return

    const imageUrl = await uploadImage()
    onSubmit({
      title: title.trim(),
      category,
      content: content.trim(),
      isAnonymous: false,
      imageUrl
    })
    resetForm()
  }

  const isFormValid = title.trim().length >= 5 &&
    title.trim().length <= 200 &&
    !!category &&
    content.trim().length >= 10 &&
    content.trim().length <= 5000

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-strong">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">질문하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSummarizing}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!isFormValid) return

          if (needsSummary && !summary && !showSummaryPreview) {
            handleGenerateSummary()
            return
          }
          handleSubmit(e)
        }} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문의 제목을 입력해주세요 (최소 5자 이상)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            />
            <div className="mt-1 text-right">
              <span className={`text-xs ${
                title.trim().length < 5 && title.trim().length > 0
                  ? 'text-red-500'
                  : title.trim().length > 200
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}>
                {title.trim().length} / 200자
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            >
              <option value="">카테고리를 선택해주세요</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                if (showSummaryPreview) {
                  setSummary('')
                  setShowSummaryPreview(false)
                }
              }}
              placeholder="구체적인 상황과 궁금한 점을 자세히 설명해주세요 (최소 10자 이상)"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
              required
            />
            <div className="mt-1 text-right">
              {needsSummary && !showSummaryPreview && (
                <span className="text-xs text-blue-500 flex items-center justify-end gap-1">
                  <Sparkles className="h-3 w-3" />
                  200자 이상일 경우, AI가 요약해 드립니다.
                </span>
              )}
              <span className={`text-xs ${
                contentLength < 10 && contentLength > 0
                  ? 'text-red-500'
                  : contentLength > 5000
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}>
                {contentLength} / 5000자
              </span>
            </div>
            {summaryError && (
              <p className="mt-2 text-xs text-red-500">{summaryError}. 요약 없이 등록할 수 있습니다.</p>
            )}
          </div>

          {/* Summary Preview */}
          {showSummaryPreview && summary && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700">AI 요약 미리보기</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">{summary}</p>
              <p className="text-xs text-gray-500 mb-3">
                이 요약이 질문의 핵심을 잘 담고 있나요? 승인하면 목록에서 요약이 먼저 표시됩니다.
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSubmit as any}
                  className="flex items-center gap-1 px-2 py-1.5 bg-blue-500 text-white text-[11px] rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  <Check className="h-3 w-3 flex-shrink-0" />
                  등록
                </button>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="flex items-center gap-1 px-2 py-1.5 bg-white text-gray-700 text-[11px] rounded-md border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <RefreshCw className={`h-3 w-3 flex-shrink-0 ${isSummarizing ? 'animate-spin' : ''}`} />
                  다시 생성
                </button>
                <button
                  type="button"
                  onClick={handleSkipSummary}
                  className="ml-auto px-2 py-1.5 text-gray-500 text-[11px] hover:text-gray-700 transition-colors whitespace-nowrap"
                >
                  요약 없이 등록
                </button>
              </div>
            </div>
          )}

          {/* Image Upload (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 첨부 (선택사항)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full max-h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  aria-label="이미지 삭제"
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-500">클릭하여 이미지 선택</span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP, GIF, HEIC · 최대 5MB</span>
              </button>
            )}
            {uploadError && (
              <p className="mt-1.5 text-xs text-red-500">{uploadError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSummarizing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            {summaryError && needsSummary ? (
              <button
                type="button"
                onClick={handleSubmitDirect}
                disabled={!isFormValid}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                요약 없이 등록
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isFormValid || isSummarizing || isUploading}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    이미지 업로드 중...
                  </>
                ) : isSummarizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    요약 생성 중...
                  </>
                ) : showSummaryPreview ? (
                  '요약과 함께 등록'
                ) : needsSummary ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    질문 등록
                  </>
                ) : (
                  '질문 등록'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
