'use client'

import React, { useState } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    category: string
    content: string
    isAnonymous: boolean
    imageUrl?: string
  }) => void
  categories: Array<{ value: string; label: string; emoji: string }>
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
  const [imageUrl, setImageUrl] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !content.trim()) {
      return
    }

    // Validate lengths
    if (title.trim().length < 5) {
      alert('제목은 최소 5자 이상 입력해주세요.')
      return
    }

    if (title.trim().length > 200) {
      alert('제목은 최대 200자까지 입력 가능합니다.')
      return
    }

    if (content.trim().length < 10) {
      alert('내용은 최소 10자 이상 입력해주세요.')
      return
    }

    if (content.trim().length > 5000) {
      alert('내용은 최대 5000자까지 입력 가능합니다.')
      return
    }

    onSubmit({
      title: title.trim(),
      category,
      content: content.trim(),
      isAnonymous: false,
      imageUrl: imageUrl.trim() || undefined
    })

    // Reset form
    setTitle('')
    setCategory('')
    setContent('')
    setImageUrl('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-strong">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">질문하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              onChange={(e) => setContent(e.target.value)}
              placeholder="구체적인 상황과 궁금한 점을 자세히 설명해주세요 (최소 10자 이상)"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
            <div className="mt-1 text-right">
              <span className={`text-xs ${
                content.trim().length < 10 && content.trim().length > 0
                  ? 'text-red-500'
                  : content.trim().length > 5000
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}>
                {content.trim().length} / 5000자
              </span>
            </div>
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 URL (선택사항)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                !title.trim() || 
                title.trim().length < 5 || 
                title.trim().length > 200 ||
                !category || 
                !content.trim() || 
                content.trim().length < 10 ||
                content.trim().length > 5000
              }
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              질문 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

