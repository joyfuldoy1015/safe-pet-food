'use client'

import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Table, { Column } from '@/components/admin/Table'
import FilterBar from '@/components/admin/FilterBar'
import { getBrowserClient } from '@/lib/supabase-client'
import { MessageSquare } from 'lucide-react'

interface CommunityQuestion {
  id: string
  title: string
  content: string
  author_nickname: string
  category: string
  votes: number
  answer_count: number
  created_at: string
}

export default function AdminCommunityPage() {
  const [questions, setQuestions] = useState<CommunityQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      let query = supabase
        .from('community_questions')
        .select('id, title, content, author_id, category, votes, answer_count, created_at, author:author_id(nickname)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query
      if (!error && data) {
        setQuestions(data.map((q: any) => ({
          id: q.id,
          title: q.title,
          content: q.content,
          author_nickname: q.author?.nickname || '익명',
          category: q.category || '일반',
          votes: q.votes || 0,
          answer_count: q.answer_count || 0,
          created_at: q.created_at
        })))
      }
    } catch (error) {
      console.error('[AdminCommunityPage] Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const columns: Column<CommunityQuestion>[] = [
    {
      key: 'title',
      label: '제목',
      render: (q) => (
        <div className="max-w-md">
          <p className="text-sm font-medium line-clamp-1">{q.title}</p>
          <p className="text-xs text-gray-400">{q.author_nickname}</p>
        </div>
      )
    },
    {
      key: 'category',
      label: '카테고리',
      render: (q) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{q.category}</span>
      )
    },
    {
      key: 'votes',
      label: '추천',
      render: (q) => <span className="text-sm">{q.votes}</span>
    },
    {
      key: 'answer_count',
      label: '답변',
      render: (q) => <span className="text-sm">{q.answer_count}개</span>
    },
    {
      key: 'created_at',
      label: '작성일',
      render: (q) => (
        <span className="text-sm text-gray-600">{new Date(q.created_at).toLocaleDateString('ko-KR')}</span>
      )
    }
  ]

  const filterChips = Object.entries(filters).filter(([, v]) => v).map(([key, value]) => ({
    key, label: '카테고리', value
  }))

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
          <p className="text-gray-600 mt-1">커뮤니티 질문을 관리하세요 (총 {questions.length}건)</p>
        </div>

        <FilterBar
          chips={filterChips}
          onRemoveChip={(key) => { const f = { ...filters }; delete f[key]; setFilters(f) }}
          onClearAll={() => setFilters({})}
        >
          <select
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">전체 카테고리</option>
            <option value="🍖 사료 & 영양">사료 & 영양</option>
            <option value="❤️ 건강">건강</option>
            <option value="🎓 훈련 & 행동">훈련 & 행동</option>
            <option value="💬 자유토론">자유토론</option>
          </select>
        </FilterBar>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">로딩 중...</div>
        ) : (
          <Table data={questions} columns={columns} />
        )}
      </div>
    </AdminLayout>
  )
}
