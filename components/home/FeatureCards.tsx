'use client'

import React from 'react'
import Link from 'next/link'
import { Star, BookOpen, HelpCircle, Search } from 'lucide-react'

interface Feature {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  iconBg: string
  iconColor: string
}

const features: Feature[] = [
  {
    name: '브랜드 둘러보기',
    href: '/brands',
    icon: Star,
    description: '신뢰할 수 있는 브랜드 찾기',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  {
    name: '제품 검색',
    href: '/search?tab=products',
    icon: Search,
    description: '제품 정보 알아보기',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
  {
    name: '급여 후기',
    href: '/pet-log',
    icon: BookOpen,
    description: '실제 급여 후기 살펴보기',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    name: 'Q&A 포럼',
    href: '/community/qa-forum',
    icon: HelpCircle,
    description: '질문과 답변으로 지식 쌓기',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  }
]

/**
 * Feature cards component
 */
export default function FeatureCards() {
  return (
    <section className="pt-6 sm:pt-10 pb-10 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.name} href={feature.href}>
                <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col items-center text-center group border border-gray-100">
                  <div className={`w-10 h-10 ${feature.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

