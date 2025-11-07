'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X } from 'lucide-react'

interface InlineQuestionComposerProps {
  reviewId: string
  ownerNickname: string
  onClose: () => void
  onSubmit: (content: string) => void
}

export default function InlineQuestionComposer({
  reviewId,
  ownerNickname,
  onClose,
  onSubmit
}: InlineQuestionComposerProps) {
  const [content, setContent] = useState(`@${ownerNickname}님, `)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.trim() === `@${ownerNickname}님, `) {
      return
    }
    onSubmit(content.trim())
    setContent(`@${ownerNickname}님, `)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-4 border-t border-gray-200"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`@${ownerNickname}님에게 질문을 남겨보세요...`}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none text-sm"
          autoFocus
          required
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span>취소</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!content.trim() || content.trim() === `@${ownerNickname}님, `}
            className="px-4 py-2 bg-[#3056F5] text-white rounded-lg hover:bg-[#2545D4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm"
          >
            <Send className="h-4 w-4" />
            <span>질문 등록</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

