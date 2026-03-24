'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
      aria-label="이전 페이지"
    >
      <ArrowLeft className="h-4 w-4 text-gray-500" />
    </button>
  )
}
