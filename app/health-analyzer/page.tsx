'use client'

import { ArrowLeft, Heart, Clock, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HealthAnalyzerComingSoon() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">돌아가기</span>
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6">
            <Heart className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            건강검진표 AI 분석기
          </h1>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            준비 중
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
            반려동물의 건강검진 결과를 업로드하면 AI가 상세하게 분석하여 
            보호자가 이해하기 쉽게 설명해드리는 기능을 준비하고 있어요.
          </p>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
