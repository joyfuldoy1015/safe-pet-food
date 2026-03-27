'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Send, User, Reply, ThumbsUp, Trash2, HelpCircle, MoreVertical, Edit2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProductCategory, FeedingRecord, DetailedPetLogPost, Comment, Reply as ReplyType, categoryConfig } from './types'
import { mockDetailedPosts } from './mock-data'
import FeedingRecordCard from './FeedingRecordCard'
import PostHeaderCard from './PostHeaderCard'

export default function PetLogPostDetail() {
  const params = useParams()
  const router = useRouter()
  const postId = params.postId as string

  const [post, setPost] = useState<DetailedPetLogPost | null>(mockDetailedPosts[postId as keyof typeof mockDetailedPosts] || null)

  // 로컬 스토리지에서 포스트 불러오기 및 Supabase에서 댓글 불러오기
  useEffect(() => {
    const loadPost = async () => {
      try {
        // 1. 포스트 데이터 로드 (localStorage 또는 mock)
        const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
        const savedPost = savedPosts.find((p: any) => p.id === postId)
        
        let currentPost: DetailedPetLogPost | null = null
        
        if (savedPost) {
          currentPost = {
            ...savedPost,
            comments: savedPost.comments || [],
            totalComments: savedPost.totalComments || (savedPost.comments?.length || 0)
          }
        } else if (mockDetailedPosts[postId as keyof typeof mockDetailedPosts]) {
          currentPost = mockDetailedPosts[postId as keyof typeof mockDetailedPosts]
        }
        
        setPost(currentPost)
        
        // 2. Supabase에서 댓글 데이터 로드
        if (currentPost) {
          try {
            const response = await fetch(`/api/pet-log/posts/${postId}`)
            if (response.ok) {
              const data = await response.json()
              if (data.comments && Array.isArray(data.comments)) {
                setComments(data.comments)
                // localStorage 업데이트
                if (savedPost) {
                  savedPost.comments = data.comments
                  savedPost.totalComments = data.comments.length
                  localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
                }
              }
            }
          } catch (error) {
            console.error('댓글 로드 중 오류:', error)
            // 실패 시 localStorage의 댓글 사용
            if (currentPost.comments) {
              setComments(currentPost.comments)
            }
          }
        }
      } catch (error) {
        console.error('포스트 로드 중 오류:', error)
      }
    }
    
    loadPost()
  }, [postId])

  // post가 변경될 때 comments 초기화
  useEffect(() => {
    if (post) {
      setComments(post.comments || [])
    }
  }, [post])
  
  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const promptLogin = () => {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
      router.push(`/login?redirect=${encodeURIComponent(`/pet-log/posts/${params.postId}`)}`)
    }
  }
  
  // 탭 관련 상태
  const [activeTab, setActiveTab] = useState<'comment' | 'inquiry'>('comment')
  const commentsSectionRef = useRef<HTMLDivElement>(null)
  const inquirySectionRef = useRef<HTMLDivElement>(null)
  
  // 수정/삭제 관련 상태
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  
  // 로그인 상태 관리 - Supabase Auth 사용
  const { user, profile } = useAuth()
  const isLoggedIn = !!user
  const currentUser = user ? {
    id: user.id || 'unknown',
    name: profile?.nickname || user.email || '사용자'
  } : null

  // 탭 변경 함수
  const handleTabChange = (tab: 'comment' | 'inquiry') => {
    setActiveTab(tab)
    // 탭 변경 시 해당 섹션으로 스크롤하지 않음 (하단 고정 탭이므로)
  }

  // 댓글/문의 작성 함수
  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      promptLogin()
      return
    }
    
    if (!newComment.trim() || !post) return
    
    const comment: Comment = {
      id: `${activeTab}-${Date.now()}`,
      userId: currentUser?.id || 'temp-user',
      userName: currentUser?.name || '임시사용자',
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
      type: activeTab
    }
    
    try {
      // Supabase에 저장
      const response = await fetch('/api/pet-log/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: postId,
          comment: {
            id: comment.id,
            userId: comment.userId,
            userName: comment.userName,
            content: comment.content,
            likes: comment.likes,
            isLiked: comment.isLiked,
            replies: [],
            type: activeTab
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save comment')
      }
      
      // 성공 시 로컬 state 업데이트
      const updatedComments = [...comments, comment]
      setComments(updatedComments)
      setNewComment('')
      
      // 로컬 스토리지에도 저장 (오프라인 지원)
      try {
        const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
        const postIndex = savedPosts.findIndex((p: any) => p.id === postId)
        
        if (postIndex !== -1) {
          savedPosts[postIndex] = {
            ...savedPosts[postIndex],
            comments: updatedComments,
            totalComments: updatedComments.length
          }
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        } else if (post) {
          const updatedPost = {
            ...post,
            comments: updatedComments,
            totalComments: updatedComments.length
          }
          savedPosts.push(updatedPost)
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        }
      } catch (error) {
        console.error('로컬 스토리지 저장 중 오류:', error)
      }
    } catch (error) {
      console.error('댓글 저장 중 오류:', error)
      alert('댓글 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 댓글/문의 수정 함수
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || !currentUser) return

    try {
      const response = await fetch('/api/pet-log/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: commentId,
          updates: {
            content: editContent.trim()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update comment')
      }

      // 로컬 state 업데이트
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, content: editContent.trim() } : c
      ))
      setEditingCommentId(null)
      setEditContent('')
    } catch (error) {
      console.error('댓글 수정 오류:', error)
      alert('댓글 수정에 실패했습니다.')
    }
  }

  // 댓글/문의 삭제 함수
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser || !confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch('/api/pet-log/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }

      // 로컬 state 업데이트
      setComments(comments.filter(c => c.id !== commentId))
      setMenuOpenId(null)
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  // 답글 작성 함수
  const handleSubmitReply = async (commentId: string) => {
    if (!isLoggedIn) {
      promptLogin()
      return
    }
    
    if (!replyContent.trim() || !post) return
    
    const reply: ReplyType = {
      id: `reply-${Date.now()}`,
      userId: currentUser?.id || 'temp-user',
      userName: currentUser?.name || '임시사용자',
      content: replyContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    }
    
    try {
      // 원본 댓글 찾기
      const originalComment = comments.find(c => c.id === commentId)
      if (!originalComment) return
      
      const updatedComment = {
        ...originalComment,
        replies: [...originalComment.replies, reply]
      }
      
      // Supabase에 업데이트
      const response = await fetch('/api/pet-log/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: commentId,
          updates: {
            replies: updatedComment.replies,
            likes: updatedComment.likes,
            isLiked: updatedComment.isLiked
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save reply')
      }
      
      // 성공 시 로컬 state 업데이트
      const updatedComments = comments.map(comment => 
        comment.id === commentId ? updatedComment : comment
      )
      
      setComments(updatedComments)
      setReplyContent('')
      setReplyingTo(null)
      
      // 로컬 스토리지에도 저장
      try {
        const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
        const postIndex = savedPosts.findIndex((p: any) => p.id === postId)
        
        if (postIndex !== -1) {
          savedPosts[postIndex] = {
            ...savedPosts[postIndex],
            comments: updatedComments,
            totalComments: updatedComments.length
          }
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        } else if (post) {
          const updatedPost = {
            ...post,
            comments: updatedComments,
            totalComments: updatedComments.length
          }
          savedPosts.push(updatedPost)
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        }
      } catch (error) {
        console.error('로컬 스토리지 저장 중 오류:', error)
      }
    } catch (error) {
      console.error('답글 저장 중 오류:', error)
      alert('답글 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 좋아요 토글 함수
  const handleToggleLike = (commentId: string, isReply: boolean = false, replyId?: string) => {
    if (!isLoggedIn) {
      promptLogin()
      return
    }

    let updatedComments: Comment[]
    if (isReply && replyId) {
      updatedComments = comments.map(comment => ({
        ...comment,
        replies: comment.replies.map(reply => 
          reply.id === replyId
            ? { 
                ...reply, 
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                isLiked: !reply.isLiked 
              }
            : reply
        )
      }))
    } else {
      updatedComments = comments.map(comment => 
        comment.id === commentId
          ? { 
              ...comment, 
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked 
            }
          : comment
      )
    }
    
    setComments(updatedComments)
    
    // 로컬 스토리지에 저장
    if (post) {
      try {
        const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
        const postIndex = savedPosts.findIndex((p: any) => p.id === postId)
        
        if (postIndex !== -1) {
          savedPosts[postIndex] = {
            ...savedPosts[postIndex],
            comments: updatedComments
          }
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        } else {
          const updatedPost = {
            ...post,
            comments: updatedComments
          }
          savedPosts.push(updatedPost)
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        }
      } catch (error) {
        console.error('좋아요 저장 중 오류:', error)
      }
    }
  }

  // 로그인 페이지로 이동
  const handleLogin = () => {
    window.location.href = '/login'
  }

  // 포스트 삭제 핸들러
  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까? 삭제된 내용은 복구할 수 없습니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/pet-log/posts/${postId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      alert('게시글이 삭제되었습니다.')
      router.push('/pet-log')
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 포스트 수정 페이지로 이동
  const handleEdit = () => {
    router.push(`/pet-log/posts/${postId}/edit`)
  }

  // 작성자 확인
  const isAuthor = user && post && (post.ownerId === user.id || post.ownerId === user.email)

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">게시글을 찾을 수 없습니다</h2>
          <Link href="/pet-log" className="text-blue-500 hover:text-blue-600">
            펫 로그로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 카테고리별로 기록 분류 및 정렬 (급여중 먼저, 그 다음 최신순)
  const categorizeAndSortRecords = (records: FeedingRecord[]) => {
    const categories: Record<ProductCategory, FeedingRecord[]> = {
      '사료': [],
      '간식': [],
      '영양제': [],
      '화장실': []
    }

    records.forEach(record => {
      categories[record.category].push(record)
    })

    // 각 카테고리별로 정렬 (급여중 먼저, 그 다음 시작일 최신순)
    Object.keys(categories).forEach(category => {
      categories[category as ProductCategory].sort((a, b) => {
        // 1. 급여중인 것을 먼저, 그 다음 급여중지, 마지막에 급여완료
        const statusOrder = { '급여중': 0, '급여중지': 1, '급여완료': 2 }
        const statusDiff = statusOrder[a.status] - statusOrder[b.status]
        if (statusDiff !== 0) return statusDiff
        
        // 2. 같은 상태면 시작일 최신순
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
    })

    return categories
  }

  const categorizedRecords = categorizeAndSortRecords(post.feedingRecords)


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link
          href="/pet-log"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 text-sm sm:text-base"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          돌아가기
        </Link>

        {/* Header */}
        <PostHeaderCard
          post={post}
          isAuthor={!!isAuthor}
          isLoggedIn={isLoggedIn}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLogin={promptLogin}
        />

        {/* Category Sections */}
        <div className="space-y-6 sm:space-y-8">
          {(['사료', '간식', '영양제', '화장실'] as ProductCategory[]).map(category => {
            const records = categorizedRecords[category]
            if (records.length === 0) return null

            const activeCount = records.filter(r => r.status === '급여중').length
            const stoppedCount = records.filter(r => r.status === '급여중지').length
            const completedCount = records.filter(r => r.status === '급여완료').length

            return (
              <div key={category} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                      category === '사료' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      category === '간식' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                      category === '영양제' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>
                      <span className="text-lg sm:text-xl">{categoryConfig[category].icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category}</h2>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {activeCount > 0 && (
                          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-800 text-xs sm:text-sm font-medium rounded-full border border-green-200">
                            {category === '화장실' ? '사용 중' : '급여 중'} {activeCount}개
                          </span>
                        )}
                        {stoppedCount > 0 && (
                          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-100 text-red-800 text-xs sm:text-sm font-medium rounded-full border border-red-200">
                            {category === '화장실' ? '사용 중지' : '급여 중지'} {stoppedCount}개
                          </span>
                        )}
                        {completedCount > 0 && (
                          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium rounded-full border border-gray-200">
                            {category === '화장실' ? '사용 완료' : '급여 완료'} {completedCount}개
                          </span>
                        )}
                        <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-700 text-xs sm:text-sm rounded-full font-semibold border border-gray-200">
                          {records.length}개 제품
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {records.map(record => (
                    <FeedingRecordCard key={record.id} record={record} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Comments & Inquiry Section with Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mt-6 sm:mt-8 hover:shadow-2xl transition-all duration-300 pb-40">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">댓글 & 문의</h2>
                <div className="mt-2 flex gap-2">
                  <span className="px-2.5 sm:px-3 py-1 bg-gray-50 text-gray-700 text-xs rounded-full font-semibold border border-gray-200">
                    댓글 {comments.filter(c => c.type !== 'inquiry').length}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 bg-violet-50 text-violet-700 text-xs rounded-full font-semibold border border-violet-200">
                    문의 {comments.filter(c => c.type === 'inquiry').length}
                  </span>
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <div className="text-xs sm:text-sm text-gray-500">
                {currentUser?.name}님으로 로그인됨
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div ref={commentsSectionRef} className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              댓글 <span className="text-violet-500">{comments.filter(c => c.type !== 'inquiry').length}</span>
            </h3>
            
            {comments.filter(c => c.type !== 'inquiry').length > 0 ? (
              <div className="space-y-4">
                {comments.filter(c => c.type !== 'inquiry').map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-4 relative">
                    {editingCommentId === comment.id ? (
                      // 수정 모드
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditingCommentId(null); setEditContent(''); }}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 일반 모드
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-3.5 w-3.5 text-gray-500" />
                            </div>
                            <span className="font-semibold text-sm text-gray-900">{comment.userName}</span>
                            {comment.userId === post.ownerId && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                작성자
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          {currentUser && currentUser.id === comment.userId && (
                            <div className="relative">
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                                className="p-1 hover:bg-gray-200 rounded-full"
                              >
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </button>
                              {menuOpenId === comment.id && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(comment.id)
                                      setEditContent(comment.content)
                                      setMenuOpenId(null)
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                  >
                                    <Edit2 className="h-3 w-3" /> 수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full"
                                  >
                                    <Trash2 className="h-3 w-3" /> 삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleToggleLike(comment.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors border ${
                              comment.isLiked 
                                ? 'text-blue-600 bg-blue-50 border-blue-200' 
                                : 'text-gray-600 bg-white border-gray-200 hover:text-blue-600'
                            }`}
                          >
                            <ThumbsUp className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likes}</span>
                          </button>
                          
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-600 bg-white border border-gray-200 hover:text-blue-600"
                          >
                            <Reply className="h-3 w-3" />
                            답글
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 pl-4 border-l-2 border-gray-200">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="답글을 작성하세요..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-3 py-1.5 text-xs text-gray-500"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim()}
                                className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
                              >
                                답글 작성
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs text-gray-900">{reply.userName}</span>
                                  {reply.userId === post.ownerId && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">작성자</span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">아직 댓글이 없습니다</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Inquiry Section */}
          <div ref={inquirySectionRef}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-violet-600" />
              문의 <span className="text-violet-500">{comments.filter(c => c.type === 'inquiry').length}</span>
            </h3>
            
            {comments.filter(c => c.type === 'inquiry').length > 0 ? (
              <div className="space-y-4">
                {comments.filter(c => c.type === 'inquiry').map((inquiry) => (
                  <div key={inquiry.id} className="bg-violet-50 rounded-xl p-4 relative">
                    {editingCommentId === inquiry.id ? (
                      // 수정 모드
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditingCommentId(null); setEditContent(''); }}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleEditComment(inquiry.id)}
                            className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-violet-600 font-medium">
                              {inquiry.userName}님의 문의
                            </p>
                            <span className="text-xs text-gray-400">
                              {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          {currentUser && currentUser.id === inquiry.userId && (
                            <div className="relative">
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === `inq-${inquiry.id}` ? null : `inq-${inquiry.id}`)}
                                className="p-1 hover:bg-violet-100 rounded-full"
                              >
                                <MoreVertical className="h-4 w-4 text-violet-400" />
                              </button>
                              {menuOpenId === `inq-${inquiry.id}` && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(inquiry.id)
                                      setEditContent(inquiry.content)
                                      setMenuOpenId(null)
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                  >
                                    <Edit2 className="h-3 w-3" /> 수정
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(inquiry.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full"
                                  >
                                    <Trash2 className="h-3 w-3" /> 삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-800">{inquiry.content}</p>
                        
                        {/* Replies to inquiry */}
                        {inquiry.replies.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-violet-200">
                            {inquiry.replies.map((reply) => (
                              <div key={reply.id} className="bg-white rounded-lg p-3 mt-2">
                                <p className="text-xs text-green-600 font-medium mb-1">
                                  {reply.userId === post.ownerId ? '작성자 답변' : reply.userName}
                                </p>
                                <p className="text-sm text-gray-700">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply button for inquiry */}
                        <div className="mt-3">
                          <button
                            onClick={() => setReplyingTo(replyingTo === inquiry.id ? null : inquiry.id)}
                            className="text-xs text-violet-600 hover:text-violet-700"
                          >
                            답변하기
                          </button>
                          
                          {replyingTo === inquiry.id && (
                            <div className="mt-2">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="답변을 작성하세요..."
                                className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="px-3 py-1.5 text-xs text-gray-500"
                                >
                                  취소
                                </button>
                                <button
                                  onClick={() => handleSubmitReply(inquiry.id)}
                                  disabled={!replyContent.trim()}
                                  className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
                                >
                                  답변 작성
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-violet-50 rounded-xl">
                <HelpCircle className="h-8 w-8 text-violet-300 mx-auto mb-2" />
                <p className="text-sm text-violet-500">아직 문의가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Tab & Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => handleTabChange('comment')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'comment'
                  ? 'bg-violet-500 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              댓글 {comments.filter(c => c.type !== 'inquiry').length > 0 && `(${comments.filter(c => c.type !== 'inquiry').length})`}
            </button>
            <button
              onClick={() => handleTabChange('inquiry')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'inquiry'
                  ? 'bg-violet-500 text-white'
                  : 'bg-white text-gray-600 border-l border-gray-200'
              }`}
            >
              문의 {comments.filter(c => c.type === 'inquiry').length > 0 && `(${comments.filter(c => c.type === 'inquiry').length})`}
            </button>
          </div>

          {/* Input Area */}
          <div className="p-4 flex items-center gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => {
                if (isLoggedIn) {
                  setNewComment(e.target.value)
                }
              }}
              onFocus={() => {
                if (!isLoggedIn) {
                  promptLogin()
                }
              }}
              placeholder={
                !isLoggedIn 
                  ? '로그인 후 이용 가능합니다' 
                  : activeTab === 'comment' 
                    ? '응원 댓글을 남겨주세요...' 
                    : '문의 내용을 입력해주세요...'
              }
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitComment()
                }
              }}
              readOnly={!isLoggedIn}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || !isLoggedIn}
              className="w-12 h-12 bg-violet-500 text-white rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}