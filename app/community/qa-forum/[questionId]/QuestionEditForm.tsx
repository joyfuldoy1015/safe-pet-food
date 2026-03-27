'use client'

import React from 'react'
import { X, Save, Upload, Trash2 } from 'lucide-react'

interface QuestionCategory {
  value: string
  label: string
  emoji: string
}

interface QuestionEditFormProps {
  editTitle: string
  setEditTitle: (value: string) => void
  editContent: string
  setEditContent: (value: string) => void
  editCategory: string
  setEditCategory: (value: string) => void
  editImagePreview: string | null
  editImageUrl: string | null
  editImageRemoved: boolean
  editUploadError: string
  isSavingEdit: boolean
  editFileInputRef: React.RefObject<HTMLInputElement | null>
  questionCategories: QuestionCategory[]
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: () => void
  onSave: () => void
  onCancel: () => void
}

export default function QuestionEditForm({
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  editCategory,
  setEditCategory,
  editImagePreview,
  editImageUrl,
  editImageRemoved,
  editUploadError,
  isSavingEdit,
  editFileInputRef,
  questionCategories,
  onImageSelect,
  onImageRemove,
  onSave,
  onCancel,
}: QuestionEditFormProps) {
  return (
    <>
      {/* Title input */}
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="w-full text-xl font-bold text-gray-900 mb-4 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="질문 제목"
      />

      {/* Edit form body */}
      <div className="space-y-4 mb-6">
        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {questionCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>
        {/* 내용 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="질문 내용을 입력하세요"
          />
        </div>
        {/* 이미지 편집 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이미지 첨부 (선택사항)</label>
          <input
            ref={editFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            onChange={onImageSelect}
            className="hidden"
          />
          {editImagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={editImagePreview} alt="미리보기" className="w-full max-h-48 object-cover" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  title="이미지 교체"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  title="이미지 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : editImageUrl && !editImageRemoved ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img src={editImageUrl} alt="기존 이미지" className="w-full max-h-48 object-cover" />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  title="이미지 교체"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onImageRemove}
                  className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  title="이미지 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => editFileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500">클릭하여 이미지 선택</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP, GIF, HEIC · 최대 5MB</span>
            </button>
          )}
          {editUploadError && (
            <p className="mt-1.5 text-xs text-red-500">{editUploadError}</p>
          )}
        </div>

        {/* 저장/취소 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isSavingEdit}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            취소
          </button>
          <button
            onClick={onSave}
            disabled={isSavingEdit || !editTitle.trim() || !editContent.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSavingEdit ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </>
  )
}
