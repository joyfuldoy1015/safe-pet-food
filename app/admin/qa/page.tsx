'use client'

import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Table, { Column } from '@/components/admin/Table'
import FilterBar from '@/components/admin/FilterBar'
import { getBrowserClient } from '@/lib/supabase-client'
import { HelpCircle, MessageSquare } from 'lucide-react'

interface QAThread {
  id: string
  log_id: string
  author_nickname: string
  posts_count: number
  admin_status: string
  created_at: string
}

interface QAPost {
  id: string
  thread_id: string
  kind: string
  content: string
  author_nickname: string
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

  const loadThreads = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      let query = supabase
        .from('qa_threads')
        .select('id, log_id, author_id, admin_status, created_at, profiles:author_id(nickname), qa_posts(count)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filters.admin_status) {
        query = query.eq('admin_status', filters.admin_status)
      }

      const { data, error } = await query
      if (!error && data) {
        setThreads(data.map((t: any) => ({
          id: t.id,
          log_id: t.log_id,
          author_nickname: t.profiles?.nickname || '익명',
          posts_count: t.qa_posts?.[0]?.count || 0,
          admin_status: t.admin_status || 'visible',
          created_at: t.created_at
        })))
      }
    } catch (error) {
      console.error('[AdminQAPage] Error loading threads:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      let query = supabase
        .from('qa_posts')
        .select('id, thread_id, kind, content, author_id, upvotes, is_accepted, admin_status, created_at, profiles:author_id(nickname)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filters.admin_status) {
        query = query.eq('admin_status', filters.admin_status)
      }

      const { data, error } = await query
      if (!error && data) {
        setPosts(data.map((p: any) => ({
          id: p.id,
          thread_id: p.thread_id,
          kind: p.kind,
          content: p.content,
          author_nickname: p.profiles?.nickname || '익명',
          upvotes: p.upvotes || 0,
          is_accepted: p.is_accepted || false,
          admin_status: p.admin_status || 'visible',
          created_at: p.created_at
        })))
      }
    } catch (error) {
      console.error('[AdminQAPage] Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (activeTab === 'threads') {
      loadThreads()
    } else {
      loadPosts()
    }
  }, [activeTab, loadThreads, loadPosts])

  const handleToggleStatus = async (table: 'qa_threads' | 'qa_posts', id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible'
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.from(table).update({ admin_status: newStatus }).eq('id', id)
      if (!error) {
        if (table === 'qa_threads') {
          setThreads(threads.map(t => t.id === id ? { ...t, admin_status: newStatus } : t))
        } else {
          setPosts(posts.map(p => p.id === id ? { ...p, admin_status: newStatus } : p))
        }
      }
    } catch (error) {
      console.error('상태 변경 오류:', error)
    }
  }

  const threadColumns: Column<QAThread>[] = [
    {
      key: 'author_nickname',
      label: '작성자',
      render: (thread) => <span className="text-sm font-medium">{thread.author_nickname}</span>
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
      render: (thread) => <span className="text-sm">{thread.posts_count}개</span>
    },
    {
      key: 'admin_status',
      label: '상태',
      render: (thread) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleStatus('qa_threads', thread.id, thread.admin_status) }}
          className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 ${
            thread.admin_status === 'visible' ? 'bg-green-100 text-green-700' :
            thread.admin_status === 'hidden' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}
        >
          {thread.admin_status === 'visible' ? '공개' : thread.admin_status === 'hidden' ? '숨김' : '삭제'}
        </button>
      )
    },
    {
      key: 'created_at',
      label: '작성일',
      render: (thread) => (
        <span className="text-sm text-gray-600">{new Date(thread.created_at).toLocaleDateString('ko-KR')}</span>
      )
    }
  ]

  const postColumns: Column<QAPost>[] = [
    {
      key: 'kind',
      label: '종류',
      render: (post) => (
        <span className={`px-2 py-1 rounded text-xs ${
          post.kind === 'question' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {post.kind === 'question' ? '질문' : '답변'}
        </span>
      )
    },
    {
      key: 'content',
      label: '내용',
      render: (post) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-1">{post.content}</p>
          <p className="text-xs text-gray-400">{post.author_nickname}</p>
        </div>
      )
    },
    {
      key: 'upvotes',
      label: '추천',
      render: (post) => <span className="text-sm">{post.upvotes}</span>
    },
    {
      key: 'admin_status',
      label: '상태',
      render: (post) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleStatus('qa_posts', post.id, post.admin_status) }}
          className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 ${
            post.admin_status === 'visible' ? 'bg-green-100 text-green-700' :
            post.admin_status === 'hidden' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}
        >
          {post.admin_status === 'visible' ? '공개' : post.admin_status === 'hidden' ? '숨김' : '삭제'}
        </button>
      )
    },
    {
      key: 'created_at',
      label: '작성일',
      render: (post) => (
        <span className="text-sm text-gray-600">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
      )
    }
  ]

  const filterChips = Object.entries(filters).filter(([, v]) => v).map(([key, value]) => ({
    key,
    label: key === 'admin_status' ? '상태' : key,
    value: value === 'visible' ? '공개' : value === 'hidden' ? '숨김' : value
  }))

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Q&A 관리</h1>
          <p className="text-gray-600 mt-1">Q&A 스레드와 게시물을 관리하세요</p>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('threads')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'threads' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-2" />
            스레드 {threads.length > 0 && `(${threads.length})`}
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            게시물 {posts.length > 0 && `(${posts.length})`}
          </button>
        </div>

        <FilterBar
          chips={filterChips}
          onRemoveChip={(key) => { const f = { ...filters }; delete f[key]; setFilters(f) }}
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
          </select>
        </FilterBar>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">로딩 중...</div>
        ) : activeTab === 'threads' ? (
          <Table<QAThread> data={threads} columns={threadColumns} />
        ) : (
          <Table<QAPost> data={posts} columns={postColumns} />
        )}
      </div>
    </AdminLayout>
  )
}
