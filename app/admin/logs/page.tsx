'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Table, { Column } from '@/components/admin/Table'
import FilterBar from '@/components/admin/FilterBar'
import { Eye, EyeOff, Trash2, FileText } from 'lucide-react'

interface ReviewLog {
  id: string
  category: string
  brand: string
  product: string
  status: string
  period_start: string
  period_end?: string
  duration_days?: number
  owner_id: string
  admin_status: string
  updated_at: string
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ReviewLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortColumn, setSortColumn] = useState<string>('updated_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadLogs()
  }, [filters, sortColumn, sortDirection])

  const loadLogs = async () => {
    setLoading(true)
    try {
      // Get session token
      const { getBrowserClient } = await import('@/lib/supabase-client')
      const supabase = getBrowserClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('[AdminLogsPage] Session error:', sessionError)
        setLogs([])
        return
      }

      // Build query params
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '50')
      params.set('sort', sortColumn)
      params.set('direction', sortDirection)
      
      if (filters.category) params.set('category', filters.category)
      if (filters.status) params.set('status', filters.status)
      if (filters.admin_status) params.set('admin_status', filters.admin_status)

      // Fetch from API
      const response = await fetch(`/api/admin/logs/list?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to load logs')
      }

      const data = await response.json()
      setLogs(data.data || [])
    } catch (error) {
      console.error('[AdminLogsPage] Error loading logs:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<ReviewLog>[] = [
    {
      key: 'category',
      label: '카테고리',
      sortable: true,
      render: (log) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {log.category}
        </span>
      )
    },
    {
      key: 'product',
      label: '제품',
      sortable: true,
      render: (log) => (
        <div>
          <div className="font-medium">{log.brand} · {log.product}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (log) => (
        <span className={`px-2 py-1 rounded text-xs ${
          log.status === 'feeding' ? 'bg-green-100 text-green-700' :
          log.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {log.status === 'feeding' ? '급여 중' :
           log.status === 'completed' ? '완료' : '중지'}
        </span>
      )
    },
    {
      key: 'period',
      label: '기간',
      render: (log) => (
        <div className="text-sm">
          {log.period_start}
          {log.period_end && ` ~ ${log.period_end}`}
          {log.duration_days && ` (${log.duration_days}일)`}
        </div>
      )
    },
    {
      key: 'admin_status',
      label: '관리 상태',
      sortable: true,
      render: (log) => (
        <span className={`px-2 py-1 rounded text-xs ${
          log.admin_status === 'visible' ? 'bg-green-100 text-green-700' :
          log.admin_status === 'hidden' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {log.admin_status === 'visible' ? '공개' :
           log.admin_status === 'hidden' ? '숨김' : '삭제'}
        </span>
      )
    },
    {
      key: 'updated_at',
      label: '업데이트',
      sortable: true,
      render: (log) => (
        <span className="text-sm text-gray-600">
          {new Date(log.updated_at).toLocaleDateString('ko-KR')}
        </span>
      )
    }
  ]

  const filterChips = Object.entries(filters).map(([key, value]) => ({
    key,
    label: key,
    value
  }))

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const handleBulkAction = async (action: 'hide' | 'unhide' | 'delete') => {
    if (selectedIds.length === 0) return

    if (!confirm(`선택한 ${selectedIds.length}개의 로그를 ${action === 'hide' ? '숨기기' : action === 'unhide' ? '공개하기' : '삭제하기'} 하시겠습니까?`)) {
      return
    }

    try {
      // Get session token
      const { getBrowserClient } = await import('@/lib/supabase-client')
      const supabase = getBrowserClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        alert('세션을 가져올 수 없습니다.')
        return
      }

      // Call bulk moderate API
      const response = await fetch('/api/admin/logs/bulk-moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          reason: `Bulk ${action} by admin`
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Bulk action failed')
      }

      const result = await response.json()
      alert(`${result.results.successful}개의 로그가 성공적으로 처리되었습니다.${result.results.failed > 0 ? ` (${result.results.failed}개 실패)` : ''}`)
      
      setSelectedIds([])
      loadLogs()
    } catch (error) {
      console.error('[AdminLogsPage] Error in bulk action:', error)
      alert(`일괄 작업 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">로그 관리</h1>
            <p className="text-gray-600 mt-1">급여 후기 로그를 검토하고 관리하세요</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('hide')}
                  className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  숨기기 ({selectedIds.length})
                </button>
                <button
                  onClick={() => handleBulkAction('unhide')}
                  className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  공개 ({selectedIds.length})
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제 ({selectedIds.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          chips={filterChips}
          onRemoveChip={(key) => {
            const newFilters = { ...filters }
            delete newFilters[key]
            setFilters(newFilters)
          }}
          onClearAll={() => setFilters({})}
        >
          <select
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">전체 카테고리</option>
            <option value="feed">사료</option>
            <option value="snack">간식</option>
            <option value="supplement">영양제</option>
            <option value="toilet">화장실</option>
          </select>
          <select
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">전체 상태</option>
            <option value="feeding">급여 중</option>
            <option value="paused">중지</option>
            <option value="completed">완료</option>
          </select>
          <select
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            value={filters.admin_status || ''}
            onChange={(e) => setFilters({ ...filters, admin_status: e.target.value })}
          >
            <option value="">전체 관리 상태</option>
            <option value="visible">공개</option>
            <option value="hidden">숨김</option>
            <option value="deleted">삭제</option>
          </select>
        </FilterBar>

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            로딩 중...
          </div>
        ) : (
          <Table
            data={logs}
            columns={columns}
            selectedIds={selectedIds}
            onSelect={(id) => {
              setSelectedIds(prev =>
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
              )
            }}
            onSelectAll={() => {
              setSelectedIds(prev =>
                prev.length === logs.length ? [] : logs.map(log => log.id)
              )
            }}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={(log) => {
              // BACKLOG: 로그 상세 Drawer 구현 예정
              console.log('Open detail for:', log.id)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}


