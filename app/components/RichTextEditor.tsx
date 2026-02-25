'use client'

import React from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Lightweight text editor replacing react-quill (removed due to XSS vulnerability in quill <=1.3.7).
 * If rich-text editing is needed later, consider @tiptap/react or similar.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  className = ''
}: RichTextEditorProps) {
  return (
    <div className={`rich-text-editor ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[8rem] p-3 bg-white border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
