'use client'

import React from 'react'
import Link from 'next/link'
import { Calculator, Star, Heart, ClipboardList, Zap, Droplet, BookOpen, HelpCircle } from 'lucide-react'

interface Feature {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
}

const features: Feature[] = [
  {
    name: '사료 성분 계산기',
    href: '/nutrition-calculator',
    icon: Calculator,
    description: '사료의 보장성분표를 입력하면 건물기준으로 영양 점수를 계산해드려요.',
    color: 'from-orange-500 to-pink-500'
  },
  {
    name: '건강검진표 분석기',
    href: '/health-analyzer',
    icon: ClipboardList,
    description: '건강검진 결과를 업로드하면 AI가 상세하게 분석해드려요.',
    color: 'from-green-500 to-teal-500'
  },
  {
    name: '펫 로그',
    href: '/pet-log',
    icon: BookOpen,
    description: '우리 아이의 사료/간식 급여 이력을 기록하고 다른 집사들과 공유해보세요.',
    color: 'from-blue-500 to-purple-500'
  },
  {
    name: 'Q&A 포럼',
    href: '/community/qa-forum',
    icon: HelpCircle,
    description: '반려동물에 대한 궁금한 점을 질문하고 경험을 나눠보세요.',
    color: 'from-purple-500 to-indigo-500'
  }
]

/**
 * Feature cards component
 */
export default function FeatureCards() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.name} href={feature.href}>
                <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center group border border-gray-100">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors flex-grow">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span>자세히 보기</span>
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

