'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Table, { Column } from '@/components/admin/Table'
import FilterBar from '@/components/admin/FilterBar'
import { MessageSquare, Eye, EyeOff } from 'lucide-react'

interface Comment {
  id: string
  log_id: string
  author_id: string
  content: string
  admin_status: string
  created_at: string
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    loadComments()
  }, [filters])

  const loadComments = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      setComments([])
    } catch (error) {
      console.error('[AdminCommentsPage] Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<Comment>[] = [
    {
      key: 'content',
      label: '내용',
      render: (comment) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">{comment.content}</p>
        </div>
      )
    },
    {
      key: 'log_id',
      label: '로그 ID',
      render: (comment) => (
        <span className="text-xs text-gray-500 font-mono">{comment.log_id.slice(0, 8)}...</span>
      )
    },
    {
      key: 'admin_status',
      label: '상태',
      render: (comment) => (
        <span className={`px-2 py-1 rounded text-xs ${
          comment.admin_status === 'visible' ? 'bg-green-100 text-green-700' :
          comment.admin_status === 'hidden' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {comment.admin_status === 'visible' ? '공개' :
           comment.admin_status === 'hidden' ? '숨김' : '삭제'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: '작성일',
      render: (comment) => (
        <span className="text-sm text-gray-600">
          {new Date(comment.created_at).toLocaleDateString('ko-KR')}
        </span>
      )
    }
  ]

  const filterChips = Object.entries(filters).map(([key, value]) => ({
    key,
    label: key,
    value
  }))

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">댓글 관리</h1>
          <p className="text-gray-600 mt-1">댓글을 검토하고 관리하세요</p>
        </div>

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
            value={filters.admin_status || ''}
            onChange={(e) => setFilters({ ...filters, admin_status: e.target.value })}
          >
            <option value="">전체 상태</option>
            <option value="visible">공개</option>
            <option value="hidden">숨김</option>
            <option value="deleted">삭제</option>
          </select>
        </FilterBar>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            로딩 중...
          </div>
        ) : (
          <Table
            data={comments}
            columns={columns}
            onRowClick={(comment) => {
              // TODO: Open detail drawer
              console.log('Open detail for:', comment.id)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}



