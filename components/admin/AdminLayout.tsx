'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import {
  LayoutDashboard,
  Users,
  Heart,
  FileText,
  MessageSquare,
  HelpCircle,
  Trophy,
  Search,
  Settings,
  Download,
  Menu,
  X,
  LogOut,
  Package
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { icon: LayoutDashboard, label: '대시보드', href: '/admin', badgeKey: null },
  { icon: Users, label: '사용자', href: '/admin/users', badgeKey: null },
  { icon: Heart, label: '반려동물', href: '/admin/pets', badgeKey: null },
  { icon: FileText, label: '로그', href: '/admin/logs', badgeKey: null },
  { icon: MessageSquare, label: '댓글', href: '/admin/comments', badgeKey: null },
  { icon: HelpCircle, label: 'Q&A', href: '/admin/qa', badgeKey: null },
  { icon: Package, label: '제품 요청', href: '/admin/product-requests', badgeKey: 'productRequests' },
  { icon: Trophy, label: '랭킹', href: '/admin/rankings', badgeKey: null },
  { icon: Search, label: '탐색 QA', href: '/admin/explore', badgeKey: null },
  { icon: Settings, label: '설정', href: '/admin/settings', badgeKey: null },
  { icon: Download, label: '내보내기', href: '/admin/exports', badgeKey: null }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pendingProductRequests, setPendingProductRequests] = useState(0)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // 대기 중인 제품 요청 수 가져오기
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const supabase = getBrowserClient()
        if (!supabase) return

        const { count, error } = await supabase
          .from('product_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        if (!error && count !== null) {
          setPendingProductRequests(count)
        }
      } catch (error) {
        console.error('대기 중인 요청 수 조회 오류:', error)
      }
    }

    if (mounted) {
      fetchPendingRequests()
      // 30초마다 업데이트
      const interval = setInterval(fetchPendingRequests, 30000)
      return () => clearInterval(interval)
    }
  }, [mounted])

  // Ensure pathname is available before using it
  const currentPathname = mounted ? pathname : null

  const handleLogout = async () => {
    try {
      // 로그아웃 처리
      await signOut()
      
      // 세션 정리 완료 대기
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 페이지 완전 새로고침으로 세션 상태 동기화
      window.location.replace('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 에러가 있어도 홈으로 리다이렉트
      window.location.replace('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          mounted
            ? sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
            : 'lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = mounted && (currentPathname === item.href || (item.href !== '/admin' && currentPathname?.startsWith(item.href)))
                
                // 배지 카운트 가져오기
                let badgeCount = 0
                if (item.badgeKey === 'productRequests') {
                  badgeCount = pendingProductRequests
                }
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {badgeCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full min-w-[20px] text-center">
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">관리자</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

