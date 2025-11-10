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
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          반려동물과 함께하는 시간<br />
          가장 따뜻한 순간
        </h1>
        <div className="text-6xl mb-6">
          🐱❤️🐶
        </div>
        <p className="text-lg md:text-xl text-gray-600 font-medium mb-8">
          With you, every day is a happy day!
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
            href="/explore"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#3056F5] text-[#3056F5] font-bold py-4 px-8 rounded-xl transition-all duration-200 hover:bg-[#3056F5] hover:text-white shadow-md"
          >
            커뮤니티 둘러보기
          </Link>
        </div>
      </div>
    </section>
  )
}

