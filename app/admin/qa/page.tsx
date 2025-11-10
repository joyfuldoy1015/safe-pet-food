'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Table, { Column } from '@/components/admin/Table'
import FilterBar from '@/components/admin/FilterBar'
import { HelpCircle, MessageSquare } from 'lucide-react'

interface QAThread {
  id: string
  log_id: string
  title: string
  author_id: string
  posts_count: number
  admin_status: string
  created_at: string
}

interface QAPost {
  id: string
  thread_id: string
  kind: string
  upvotes: number
  is_accepted: boolean
  admin_status: string
  created_at: string
}

export default function AdminQAPage() {
  const [activeTab, setActiveTab] = useState<'threads' | 'posts'>('threads')
  const [threads, setThreads] = useState<QAThread[]>([])
  const [posts, setPosts] = useState<QAPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    if (activeTab === 'threads') {
      loadThreads()
    } else {
      loadPosts()
    }
  }, [activeTab, filters])

  const loadThreads = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      setThreads([])
    } catch (error) {
      console.error('[AdminQAPage] Error loading threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      setPosts([])
    } catch (error) {
      console.error('[AdminQAPage] Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const threadColumns: Column<QAThread>[] = [
    {
      key: 'title',
      label: '제목',
      render: (thread) => (
        <div className="font-medium">{thread.title}</div>
      )
    },
    {
      key: 'log_id',
      label: '로그 ID',
      render: (thread) => (
        <span className="text-xs text-gray-500 font-mono">{thread.log_id.slice(0, 8)}...</span>
      )
    },
    {
      key: 'posts_count',
      label: '답변 수',
      render: (thread) => (
        <span className="text-sm">{thread.posts_count}개</span>
      )
    },
    {
      key: 'admin_status',
      label: '상태',
      render: (thread) => (
        <span className={`px-2 py-1 rounded text-xs ${
          thread.admin_status === 'visible' ? 'bg-green-100 text-green-700' :
          thread.admin_status === 'hidden' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {thread.admin_status === 'visible' ? '공개' :
           thread.admin_status === 'hidden' ? '숨김' : '삭제'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: '작성일',
      render: (thread) => (
        <span className="text-sm text-gray-600">
          {new Date(thread.created_at).toLocaleDateString('ko-KR')}
        </span>
      )
    }
  ]

  const postColumns: Column<QAPost>[] = [
    {
      key: 'kind',
      label: '종류',
      render: (post) => (
        <span className={`px-2 py-1 rounded text-xs ${
          post.kind === 'question' ? 'bg-blue-100 text-blue-700' :
          post.kind === 'answer' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {post.kind === 'question' ? '질문' :
           post.kind === 'answer' ? '답변' : '댓글'}
        </span>
      )
    },
    {
      key: 'thread_id',
      label: '스레드 ID',
      render: (post) => (
        <span className="text-xs text-gray-500 font-mono">{post.thread_id.slice(0, 8)}...</span>
      )
    },
    {
      key: 'upvotes',
      label: '추천',
      render: (post) => (
        <span className="text-sm">{post.upvotes}</span>
      )
    },
    {
      key: 'is_accepted',
      label: '채택',
      render: (post) => (
        <span className={`px-2 py-1 rounded text-xs ${
          post.is_accepted ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {post.is_accepted ? '채택됨' : '-'}
        </span>
      )
    },
    {
      key: 'admin_status',
      label: '상태',
      render: (post) => (
        <span className={`px-2 py-1 rounded text-xs ${
          post.admin_status === 'visible' ? 'bg-green-100 text-green-700' :
          post.admin_status === 'hidden' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {post.admin_status === 'visible' ? '공개' :
           post.admin_status === 'hidden' ? '숨김' : '삭제'}
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
          <h1 className="text-2xl font-bold text-gray-900">Q&A 관리</h1>
          <p className="text-gray-600 mt-1">Q&A 스레드와 게시물을 관리하세요</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('threads')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'threads'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-2" />
            스레드
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            게시물
          </button>
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
        ) : activeTab === 'threads' ? (
          <Table<QAThread>
            data={threads}
            columns={threadColumns}
            onRowClick={(item) => {
              // TODO: Open detail drawer
              console.log('Open detail for:', item.id)
            }}
          />
        ) : (
          <Table<QAPost>
            data={posts}
            columns={postColumns}
            onRowClick={(item) => {
              // TODO: Open detail drawer
              console.log('Open detail for:', item.id)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}


