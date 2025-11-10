'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Download, FileText, Users, Heart, MessageSquare, HelpCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'

const exportOptions = [
  { icon: Users, label: '사용자', endpoint: '/api/admin/users/export' },
  { icon: Heart, label: '반려동물', endpoint: '/api/admin/pets/export' },
  { icon: FileText, label: '로그', endpoint: '/api/admin/logs/export' },
  { icon: MessageSquare, label: '댓글', endpoint: '/api/admin/comments/export' },
  { icon: HelpCircle, label: 'Q&A', endpoint: '/api/admin/qa/export' }
]

export default function AdminExportsPage() {
  const { user } = useAuth()
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (endpoint: string, label: string) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      setExporting(endpoint)

      // Get session token
      const supabase = getBrowserClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        alert('세션을 가져올 수 없습니다.')
        setExporting(null)
        return
      }

      // Call export API
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Export failed')
      }

      // Get CSV content
      const csvContent = await response.text()
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${label}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('[AdminExportsPage] Error exporting:', error)
      alert(`내보내기 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">데이터 내보내기</h1>
          <p className="text-gray-600 mt-1">데이터를 CSV 형식으로 내보내세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.endpoint}
                onClick={() => handleExport(option.endpoint, option.label)}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">CSV 다운로드</div>
                  </div>
                  {exporting === option.endpoint ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}


