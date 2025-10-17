'use client'

import React from 'react'
import Link from 'next/link'

import { 
  Calculator, 
  Star, 
  Heart, 
  Shield,
  Zap,
  Droplet,
  ClipboardList,
  Coffee,
  Users,
  HelpCircle,
  BookOpen
} from 'lucide-react'

const categories = {
  '사료/급여': {
    icon: Coffee,
    color: 'from-orange-500 to-pink-500',
    items: [
      { name: '사료 성분 계산기', href: '/nutrition-calculator', icon: Calculator, description: '사료의 보장성분표를 입력하면 건물기준으로 영양 점수를 계산해드려요.' },
      { name: '사료 칼로리&급여량 계산기', href: '/calorie-calculator', icon: Zap, description: '우리 아이에게 맞는 적정 칼로리와 급여량을 계산해보세요.' },
      { name: '브랜드 평가', href: '/brands', icon: Star, description: '다양한 사료 브랜드의 안전성과 사용자 리뷰를 확인해보세요.' }
    ]
  },
  '건강/케어': {
    icon: Heart,
    color: 'from-green-500 to-teal-500',
    items: [
      { name: '건강검진표 분석기', href: '/health-analyzer', icon: ClipboardList, description: '건강검진 결과를 업로드하면 AI가 상세하게 분석해드려요.' },
      { name: '일일 음수량 계산기', href: '/water-calculator', icon: Droplet, description: '우리 아이의 적정 하루 물 섭취량을 계산해보세요.' }
    ]
  },
  '커뮤니티': {
    icon: Users,
    color: 'from-purple-500 to-indigo-500',
    items: [
      { name: '펫 로그', href: '/pet-log', icon: BookOpen, description: '우리 아이의 사료/간식 급여 이력을 기록하고 다른 집사들과 공유해보세요.' },
      { name: 'Q&A 포럼', href: '/community/qa-forum', icon: HelpCircle, description: '반려동물에 대한 궁금한 점을 질문하고 경험을 나눠보세요.' }
    ]
  }
}

export default function Home() {
  // 임시로 관리자 계정 여부를 설정 (실제로는 로그인 상태에서 가져와야 함)
  const isAdmin = true // 실제 구현 시 로그인 상태에서 관리자 권한 확인

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-yellow-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            반려동물과 함께하는 시간<br />
            가장 따뜻한 순간
          </h1>
          <div className="text-6xl mb-6">
            🐱❤️🐶
          </div>
          <p className="text-lg md:text-xl text-gray-600 font-medium">
            With you, every day is a happy day!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Categories */}
        {Object.entries(categories).map(([categoryName, category]) => (
          <div key={categoryName} className="mb-16">
            {/* Category Header */}
            <div className="flex items-center mb-8">
              <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mr-4`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{categoryName}</h2>
                <p className="text-gray-600 mt-1">
                  {categoryName === '사료/급여' && '우리 아이의 영양과 급여에 관한 모든 것'}
                  {categoryName === '건강/케어' && '반려동물의 건강 관리를 위한 도구들'}
                  {categoryName === '제품 후기' && '실제 집사들의 솔직한 제품 사용 후기'}
                  {categoryName === '커뮤니티' && '집사들과 함께 나누는 정보와 소통의 공간'}
                </p>
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.items.map((item) => (
                <FeatureCard key={item.name} feature={item} categoryColor={category.color} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지금 바로 시작해보세요!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              우리 아이의 건강한 반려생활을 위한 첫 걸음을 함께 시작해요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/nutrition-calculator"
                className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                사료 성분 계산하기
              </Link>
              <Link
                href="/health-analyzer"
                className="inline-block bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                건강검진표 분석하기
              </Link>
              <Link
                href="/pet-log"
                className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                펫 로그 커뮤니티
              </Link>
            </div>
          </div>
        </div>


      </main>

      {/* Footer */}

    </div>
  )
}

interface FeatureCardProps {
  feature: {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description: string
  }
  categoryColor: string
}

function FeatureCard({ feature, categoryColor }: FeatureCardProps) {
  const Icon = feature.icon

  return (
    <Link href={feature.href}>
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center group border border-gray-100">
        <div className={`w-14 h-14 bg-gradient-to-r ${categoryColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
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
} 