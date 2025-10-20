'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// React Quill 타입 정의
interface ReactQuillComponent {
  (props: {
    theme?: string
    value: string
    onChange: (value: string) => void
    modules?: any
    formats?: string[]
    placeholder?: string
    className?: string
  }): JSX.Element
}

// Quill을 동적으로 import (SSR 방지)
const ReactQuill = dynamic<any>(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />
})

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '내용을 입력하세요...',
  className = ''
}: RichTextEditorProps) {
  // Quill 에디터 설정
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), [])

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'align',
    'list', 'bullet',
    'color', 'background',
    'link'
  ]

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-lg"
      />
    </div>
  )
}

