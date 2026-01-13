'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackHref?: string
  className?: string
}

export default function BackButton({ fallbackHref = '/', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // 브라우저 히스토리가 있으면 뒤로 가기, 없으면 fallback
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      aria-label="뒤로 가기"
    >
      <ArrowLeft className="h-5 w-5 text-gray-600" />
    </button>
  )
}
