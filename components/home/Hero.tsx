'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface HeroProps {
  onCTAClick?: () => void
}

/**
 * Hero section component
 */
export default function Hero({ onCTAClick }: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-yellow-50 to-white py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          우리 반려동물에게<br />
          정말 괜찮은 제품,<br />
          <span className="text-yellow-500">함께 기록하고 함께 안심해요.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
          실제 반려인의 장기 급여 데이터로<br />
          안심하고 선택해 보세요.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/pet-log"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            지금 기록하기
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/pet-log"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#3056F5] text-[#3056F5] font-bold py-4 px-8 rounded-xl transition-all duration-200 hover:bg-[#3056F5] hover:text-white shadow-md"
          >
            급여 기록 둘러보기
          </Link>
        </div>
      </div>
    </section>
  )
}

