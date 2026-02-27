'use client'

import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Table, { Column } from '@/components/admin/Table'
import FilterBar from '@/components/admin/FilterBar'
import { getBrowserClient } from '@/lib/supabase-client'
import { User, Shield, Mail } from 'lucide-react'

interface UserData {
  id: string
  email: string
  nickname: string
  pets_count: number
  logs_count: number
  role?: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [totalCount, setTotalCount] = useState(0)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const params = new URLSearchParams({ limit: '50', offset: '0' })
      if (filters.role && filters.role !== '') params.set('role', filters.role)
      if (filters.nickname) params.set('nickname', filters.nickname)

      const res = await fetch(`/api/admin/users/list?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        const json = await res.json()
        setUsers(json.data || [])
        setTotalCount(json.pagination?.total || 0)
      }
    } catch (error) {
      console.error('[AdminUsersPage] Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const columns: Column<UserData>[] = [
    {
      key: 'nickname',
      label: '사용자',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.nickname[0]}
          </div>
          <div>
            <div className="font-medium">{user.nickname}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'pets_count',
      label: '반려동물',
      render: (user) => (
        <span className="text-sm">{user.pets_count}마리</span>
      )
    },
    {
      key: 'logs_count',
      label: '로그',
      render: (user) => (
        <span className="text-sm">{user.logs_count}개</span>
      )
    },
    {
      key: 'role',
      label: '권한',
      render: (user) => (
        <span className={`px-2 py-1 rounded text-xs ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
          user.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {user.role || '일반'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: '가입일',
      render: (user) => (
        <span className="text-sm text-gray-600">
          {new Date(user.created_at).toLocaleDateString('ko-KR')}
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
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-1">회원 정보 및 권한을 관리하세요</p>
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
            value={filters.role || ''}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">전체 권한</option>
            <option value="admin">관리자</option>
            <option value="moderator">모더레이터</option>
            <option value="user">일반</option>
          </select>
        </FilterBar>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            로딩 중...
          </div>
        ) : (
          <Table
            data={users}
            columns={columns}
            onRowClick={(user) => {
              // BACKLOG: 사용자 상세 Drawer 구현 예정
              console.log('Open detail for:', user.id)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
