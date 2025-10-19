'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  Package, 
  Star, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Database,
  UserCheck,
  Coffee,
  Calculator,
  FileText as FileTextIcon,
  MessageCircle,
  Heart,
  Zap,
  ChevronDown,
  Droplet,
  ClipboardList,
  HelpCircle,
  Info,
  Menu,
  X
} from 'lucide-react'


const categories = {
  '사료/급여': {
    icon: Coffee,
    color: 'from-orange-500 to-pink-500',
    items: [
      { name: '사료 성분 계산기', href: '/nutrition-calculator', icon: Calculator, description: '사료의 보장성분표를 입력하면 건물기준으로 영양 점수를 계산해드려요.' },
      { name: '사료 칼로리&급여량 계산기', href: '/calorie-calculator', icon: Zap, description: '우리 아이에게 맞는 적정 칼로리와 급여량을 계산해보세요.' },
      { name: '브랜드 평가', href: '/brands', icon: Shield, description: '신뢰할 수 있는 브랜드인지 다양한 기준으로 평가해보세요.' }
    ]
  },
  '건강/케어': {
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    items: [
      { name: '건강검진표 분석기', href: '/health-analyzer', icon: FileTextIcon, description: '수의사 건강검진 결과를 AI가 쉽게 해석해드려요.' },
      { name: '일일 음수량 계산기', href: '/water-calculator', icon: Droplet, description: '우리 아이가 하루에 마셔야 할 적정 물의 양을 계산해보세요.' }
    ]
  },
  '커뮤니티': {
    icon: Users,
    color: 'from-blue-500 to-purple-500',
    items: [
      { name: '펫 로그', href: '/pet-log', icon: FileTextIcon, description: '우리 아이의 사료/간식 급여 이력을 기록하고 관리해보세요.' },
      { name: 'Q&A 포럼', href: '/community/qa-forum', icon: HelpCircle, description: '반려동물에 대한 궁금한 점을 질문하고 경험을 나눠보세요.' }
    ]
  }
}

const adminMenuItems = [
  {
    title: '브랜드 관리',
    description: '사료 브랜드 정보 관리 및 리콜 정보 업데이트',
    icon: Shield,
    href: '/admin/brands',
    color: 'from-blue-500 to-cyan-500',
    stats: { total: 156, new: 3 }
  },
  {
    title: '제품 관리',
    description: '사료, 간식, 모래 등 제품 정보 관리',
    icon: Package,
    href: '/admin/products',
    color: 'from-green-500 to-emerald-500',
    stats: { total: 1247, new: 12 }
  },
  {
    title: '사용자 관리',
    description: '회원 정보 및 권한 관리',
    icon: Users,
    href: '/admin/users',
    color: 'from-purple-500 to-violet-500',
    stats: { total: 2845, new: 28 }
  },
  {
    title: '통계 분석',
    description: '사이트 이용 통계 및 인기 제품 분석',
    icon: BarChart3,
    href: '/admin/analytics',
    color: 'from-indigo-500 to-blue-500',
    stats: { visitors: '12.4K', growth: '+15%' }
  },
  {
    title: '커뮤니티 관리',
    description: 'Q&A 포럼 및 펫 로그 게시물 관리',
    icon: MessageCircle,
    href: '/admin/community',
    color: 'from-purple-500 to-pink-500',
    stats: { posts: 487, questions: 156 }
  },
  {
    title: '배포 관리',
    description: '버전 히스토리 및 배포 상태 모니터링',
    icon: Zap,
    href: '/admin/deployments',
    color: 'from-green-500 to-emerald-500',
    stats: { total: 12, status: 'Live' }
  },
  {
    title: '시스템 설정',
    description: '사이트 전반적인 설정 및 환경 관리',
    icon: Settings,
    href: '/admin/settings',
    color: 'from-gray-500 to-slate-500',
    stats: { alerts: 2, status: 'Normal' }
  }
]

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 패널</h1>
              <p className="text-gray-600">Safe Pet Food 시스템을 관리하고 모니터링하세요</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">2,845</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-green-600 mt-2">↗ +12% 이번 달</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 제품</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-green-600 mt-2">↗ +5% 이번 달</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 리뷰</p>
                  <p className="text-2xl font-bold text-gray-900">3,421</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-orange-600 mt-2">15개 승인 대기</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">월 방문자</p>
                  <p className="text-2xl font-bold text-gray-900">12.4K</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-green-600 mt-2">↗ +18% 이번 달</p>
            </div>
          </div>
        </div>

        {/* Admin Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  {item.stats.total && (
                    <p className="text-sm text-gray-500">총 {item.stats.total.toLocaleString()}개</p>
                  )}
                  {item.stats.new && (
                    <p className="text-xs text-green-600">신규 {item.stats.new}개</p>
                  )}
                  {item.stats.visitors && (
                    <p className="text-sm text-gray-500">{item.stats.visitors}</p>
                  )}
                  {item.stats.growth && (
                    <p className="text-xs text-green-600">{item.stats.growth}</p>
                  )}
                  {item.stats.alerts !== undefined && (
                    <p className="text-xs text-red-600">{item.stats.alerts}개 알림</p>
                  )}
                  {item.stats.status && (
                    <p className="text-xs text-green-600">{item.stats.status}</p>
                  )}
                  {item.stats.posts && (
                    <p className="text-sm text-gray-500">포스트: {item.stats.posts}</p>
                  )}
                  {item.stats.questions && (
                    <p className="text-xs text-blue-600">질문: {item.stats.questions}</p>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
              
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                관리하기 →
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">최근 활동</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">새로운 사용자 <strong>김집사님</strong>이 가입했습니다.</p>
                <p className="text-xs text-gray-500">5분 전</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">새로운 Q&A 질문이 <strong>사료 급여량</strong>에 대해 등록되었습니다.</p>
                <p className="text-xs text-gray-500">12분 전</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <FileTextIcon className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">새로운 펫 로그 포스트가 <strong>급여 경험 공유</strong>로 등록되었습니다.</p>
                <p className="text-xs text-gray-500">1시간 전</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Package className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">새로운 제품 <strong>힐스 고양이 사료</strong>가 추가되었습니다.</p>
                <p className="text-xs text-gray-500">2시간 전</p>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  )
}