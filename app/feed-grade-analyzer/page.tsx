'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 사료 등급 분석 페이지
 * 서비스에서 제외되어 not-found로 리다이렉트됩니다.
 */
export default function FeedGradeAnalyzer() {
  const router = useRouter()
  
  useEffect(() => {
    // 즉시 not-found 페이지로 리다이렉트
    router.replace('/not-found')
  }, [router])
  
  // 리다이렉트 중 로딩 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
              <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 찾을 수 없습니다</p>
      </div>
    </div>
  )
}
