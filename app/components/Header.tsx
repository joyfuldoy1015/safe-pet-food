'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Calculator, 
  Star, 
  Heart, 
  Shield,
  Zap,
  ChevronDown,
  Droplet,
  ClipboardList,
  Coffee,
  Users,
  HelpCircle,
  Menu,
  X,
  BookOpen,
  LogOut,
  Search,
  User
} from 'lucide-react'

const categories = {
  '브랜드/제품': {
    icon: Coffee,
    color: 'from-orange-500 to-pink-500',
    items: [
      { name: '브랜드 둘러보기', href: '/brands', icon: Star, description: '다양한 사료 브랜드의 안전성과 투명성을 확인해보세요.' },
      { name: '제품 검색하기', href: '/search?tab=products', icon: Search, description: '브랜드 구분 없이 모든 제품을 검색하고 비교해보세요.' }
    ]
  },
  '커뮤니티': {
    icon: Users,
    color: 'from-purple-500 to-indigo-500',
    items: [
      { name: '펫 로그', href: '/pet-log', icon: BookOpen, description: '우리 아이의 사료/간식 급여 이력을 기록하고 관리해보세요.' },
      { name: 'Q&A 포럼', href: '/community/qa-forum', icon: HelpCircle, description: '반려동물에 대한 궁금한 점을 질문하고 경험을 나눠보세요.' }
    ]
  },
  '건강/케어': {
    icon: Heart,
    color: 'from-green-500 to-teal-500',
    items: [
      { name: '사료 칼로리&급여량 계산기', href: '/calorie-calculator', icon: Zap, description: '우리 아이에게 맞는 적정 칼로리와 급여량을 계산해보세요.' },
      { name: '건강검진표 분석기', href: '/health-analyzer', icon: ClipboardList, description: '건강검진 결과를 업로드하면 AI가 상세하게 분석해드려요.' },
      { name: '일일 음수량 계산기', href: '/water-calculator', icon: Droplet, description: '우리 아이의 적정 하루 물 섭취량을 계산해보세요.' }
    ]
  }
}

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { user, profile, signOut, isLoading } = useAuth()
  const isLoggedIn = !!user

  const handleLogout = async () => {
    console.log('[Header] 로그아웃 버튼 클릭됨')
    try {
      console.log('[Header] signOut 함수 호출 시작')
      // 로그아웃 처리
      await signOut()
      console.log('[Header] signOut 완료')
      
      // 세션 정리 완료 대기
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('[Header] 리다이렉트 시작')
      
      // 페이지 완전 새로고침으로 세션 상태 동기화 (OAuth 세션 정리를 위해)
      // window.location.href 대신 window.location.replace를 사용하여 히스토리에 남기지 않음
      window.location.replace('/')
    } catch (error) {
      console.error('[Header] 로그아웃 오류:', error)
      // 에러가 있어도 홈으로 리다이렉트 (강제 새로고침)
      alert('로그아웃 중 오류가 발생했습니다. 홈으로 이동합니다.')
      window.location.replace('/')
    }
  }

  return (
    <header className="bg-yellow-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-black">Safe Pet Food</h1>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {Object.entries(categories).map(([categoryName, category]) => (
              <div
                key={categoryName}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(categoryName)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === categoryName ? null : categoryName)}
                  className="flex items-center space-x-1 text-black hover:text-gray-700 font-medium transition-colors px-2 py-1"
                >
                  <span>{categoryName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Dropdown Menu */}
                {activeDropdown === categoryName && (
                  <>
                    {/* Invisible bridge to prevent menu from closing */}
                    <div className="absolute top-full left-0 w-80 h-2 bg-transparent z-40"></div>
                    <div 
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      onMouseEnter={() => setActiveDropdown(categoryName)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {category.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <item.icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>
          
          {/* 로그인/회원가입 또는 로그아웃 버튼 */}
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/profile"
                  className="text-black hover:text-gray-700 font-medium text-sm transition-colors px-3 py-2 rounded-lg hover:bg-yellow-300 flex items-center gap-2"
                  title="마이 페이지"
                >
                  <User className="h-4 w-4" />
                  <span>{profile?.nickname || user?.email || '사용자'}</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('[Header] 로그아웃 버튼 클릭 이벤트 발생')
                    handleLogout()
                  }}
                  className="text-black hover:text-gray-700 font-medium transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-yellow-300"
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-black hover:text-gray-700 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-black" /> : <Menu className="h-6 w-6 text-black" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-yellow-500">
            {Object.entries(categories).map(([categoryName, category]) => (
              <div key={categoryName} className="mb-4">
                <div className="font-semibold text-black mb-2 px-2">{categoryName}</div>
                {category.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-black hover:text-gray-700 hover:bg-yellow-300 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}
            <div className="flex flex-col space-y-2 px-2 mt-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-black font-medium hover:bg-yellow-300 rounded-lg flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>마이 페이지</span>
                  </Link>
                  <div className="px-4 py-2 text-sm text-gray-600">
                    {profile?.nickname || user?.email || '사용자'}
                  </div>
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('[Header] 모바일 로그아웃 버튼 클릭 이벤트 발생')
                      // 먼저 로그아웃 처리 후 메뉴 닫기
                      await handleLogout()
                    }}
                    onTouchEnd={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('[Header] 모바일 로그아웃 버튼 터치 이벤트 발생')
                      await handleLogout()
                    }}
                    className="flex items-center gap-2 text-black hover:text-gray-700 font-medium py-3 text-left px-4 hover:bg-yellow-300 rounded-lg active:bg-yellow-500"
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-black hover:text-gray-700 font-medium py-2 text-left" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-black text-white px-4 py-2 rounded-lg font-medium text-center" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 