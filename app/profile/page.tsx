'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import { User, Mail, Calendar, Save, ArrowLeft, Camera, Plus, Heart, MessageCircle, Eye, PawPrint, Edit, Trash2, MoreVertical, Bookmark, ArrowUp } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [pets, setPets] = useState<any[]>([])
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([])
  const [myQuestions, setMyQuestions] = useState<any[]>([])
  const [isLoadingPets, setIsLoadingPets] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true)
  const [isLoadingMyQuestions, setIsLoadingMyQuestions] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [isShowingDeleteModal, setIsShowingDeleteModal] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // 세션 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile')
    } else if (!authLoading && user) {
      setIsCheckingAuth(false)
    }
  }, [router, authLoading, user])

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '')
      setAvatarUrl(profile.avatar_url)
    } else if (user && !authLoading) {
      // 프로필이 없으면 기본값 설정
      setNickname(user.email?.split('@')[0] || '사용자')
    }
  }, [profile, user, authLoading])

  // 반려동물 목록 로드
  useEffect(() => {
    const loadPets = async () => {
      if (!user) return
      
      setIsLoadingPets(true)
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4)

        if (!error && data) {
          setPets(data)
        }
      } catch (error) {
        console.error('Failed to load pets:', error)
      } finally {
        setIsLoadingPets(false)
      }
    }

    if (user) {
      loadPets()
    }
  }, [user])

  // 최근 급여 후기 로드
  useEffect(() => {
    const loadRecentPosts = async () => {
      if (!user) return
      
      setIsLoadingPosts(true)
      try {
        const supabase = getBrowserClient()
        
        // 1. Load from pet_log_posts
        const { data: petLogPosts, error: petLogError } = await supabase
          .from('pet_log_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        // 2. Load from review_logs
        const { data: reviewLogs, error: reviewLogsError } = await supabase
          .from('review_logs')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        const allPosts = [
          ...(petLogPosts || []).map(post => ({ ...post, source: 'pet_log_posts' })),
          ...(reviewLogs || []).map(log => ({ ...log, source: 'review_logs' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

        setRecentPosts(allPosts)
      } catch (error) {
        console.error('Failed to load recent posts:', error)
      } finally {
        setIsLoadingPosts(false)
      }
    }

    if (user) {
      loadRecentPosts()
    }
  }, [user])

  // 북마크한 게시글 로드
  useEffect(() => {
    const loadBookmarkedQuestions = async () => {
      if (!user) return
      
      setIsLoadingBookmarks(true)
      try {
        const supabase = getBrowserClient()
        
        const { data, error } = await supabase
          .from('community_bookmarks')
          .select(`
            id,
            created_at,
            question:community_questions(
              id,
              title,
              content,
              category,
              votes,
              views,
              created_at,
              author:profiles!author_id(nickname, avatar_url)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (!error && data) {
          // Filter out bookmarks where question was deleted
          const validBookmarks = data.filter(b => b.question)
          setBookmarkedQuestions(validBookmarks)
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error)
      } finally {
        setIsLoadingBookmarks(false)
      }
    }

    if (user) {
      loadBookmarkedQuestions()
    }
  }, [user])

  // 내가 작성한 Q&A 로드
  useEffect(() => {
    const loadMyQuestions = async () => {
      if (!user) return
      
      setIsLoadingMyQuestions(true)
      try {
        const supabase = getBrowserClient()
        
        const { data, error } = await supabase
          .from('community_questions')
          .select(`
            id,
            title,
            content,
            category,
            votes,
            views,
            created_at
          `)
          .eq('author_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('Failed to load my questions:', error)
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          console.error('User ID:', user.id)
          console.error('This is likely an RLS (Row Level Security) policy issue.')
          console.error('Please run: scripts/fix-community-questions-rls.sql')
        } else if (data) {
          console.log('Successfully loaded', data.length, 'questions')
          setMyQuestions(data)
        }
      } catch (error) {
        console.error('Failed to load my questions (catch):', error)
      } finally {
        setIsLoadingMyQuestions(false)
      }
    }

    if (user) {
      loadMyQuestions()
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = getBrowserClient()
      
      const { error } = await (supabase
        .from('profiles') as any)
        .upsert({
          id: user.id,
          nickname: nickname.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error updating profile:', error)
        }
        alert('프로필 업데이트에 실패했습니다. 잠시 후 다시 시도해주세요.')
        setIsSaving(false)
        return
      }

      await refreshProfile()
      setIsEditing(false)
      alert('프로필이 업데이트되었습니다.')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unexpected error:', error)
      }
      alert('프로필 업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setNickname(profile.nickname || '')
      setAvatarUrl(profile.avatar_url)
    } else if (user) {
      setNickname(user.email?.split('@')[0] || '사용자')
      setAvatarUrl(null)
    }
    setIsEditing(false)
  }

  // 포스트 삭제 핸들러
  const handleDeletePost = async (postId: string, source: 'pet_log_posts' | 'review_logs') => {
    if (!confirm('정말로 이 급여 후기를 삭제하시겠습니까?\n삭제된 후기는 복구할 수 없습니다.')) {
      return
    }

    setDeletingPostId(postId)
    try {
      const endpoint = source === 'pet_log_posts' 
        ? `/api/pet-log/posts/${postId}`
        : `/api/review-logs/${postId}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete post')
      }

      // 목록에서 제거
      setRecentPosts(prev => prev.filter(post => post.id !== postId))
      alert('급여 후기가 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setDeletingPostId(null)
      setOpenMenuId(null)
    }
  }

  // 포스트 수정 페이지로 이동
  const handleEditPost = (postId: string, source: 'pet_log_posts' | 'review_logs') => {
    if (source === 'pet_log_posts') {
      router.push(`/pet-log/posts/${postId}/edit`)
    } else {
      // review_logs는 해당 펫 페이지로 이동
      const post = recentPosts.find(p => p.id === postId)
      if (post && post.pet_id) {
        router.push(`/owners/${user?.id}/pets/${post.pet_id}`)
      }
    }
    setOpenMenuId(null)
  }

  // Q&A 삭제 핸들러
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('정말로 이 Q&A 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
      return
    }

    setDeletingPostId(questionId)
    try {
      const supabase = getBrowserClient()
      
      const { error } = await supabase
        .from('community_questions')
        .delete()
        .eq('id', questionId)
        .eq('author_id', user?.id) // 본인 게시글만 삭제 가능

      if (error) {
        throw error
      }

      // 목록에서 제거
      setMyQuestions(prev => prev.filter(q => q.id !== questionId))
      alert('Q&A 게시글이 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete question:', error)
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setDeletingPostId(null)
      setOpenMenuId(null)
    }
  }

  // Q&A 수정 페이지로 이동
  const handleEditQuestion = (questionId: string) => {
    router.push(`/community/qa-forum/${questionId}`)
    setOpenMenuId(null)
  }

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '회원탈퇴') {
      alert('정확히 "회원탈퇴"를 입력해주세요.')
      return
    }

    setIsDeletingAccount(true)

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '계정 삭제에 실패했습니다.')
      }

      // 성공 시 로그아웃 및 홈으로 리다이렉트
      alert('계정이 삭제되었습니다. 그동안 이용해 주셔서 감사합니다.')
      
      // 로그아웃 처리
      const supabase = getBrowserClient()
      await supabase.auth.signOut()
      
      // 홈으로 리다이렉트
      router.push('/')
    } catch (error: any) {
      console.error('Delete account error:', error)
      alert(error.message || '계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeletingAccount(false)
      setIsShowingDeleteModal(false)
      setDeleteConfirmText('')
    }
  }

  // 로딩 중이거나 세션 확인 중이면 로딩 화면 표시
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 세션 확인이 완료되었고 사용자가 없으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/')
              }
            }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">마이 페이지</h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={nickname}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      // 파일 크기 제한 (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('이미지 크기는 5MB 이하여야 합니다.')
                        return
                      }
                      
                      // 파일 타입 확인
                      if (!file.type.startsWith('image/')) {
                        alert('이미지 파일만 업로드 가능합니다.')
                        return
                      }
                      
                      try {
                        // FileReader로 이미지를 Data URL로 변환
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const result = reader.result as string
                          setAvatarUrl(result)
                        }
                        reader.readAsDataURL(file)
                      } catch (error) {
                        alert('이미지 업로드 중 오류가 발생했습니다.')
                      }
                    }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                </>
              )}
            </div>
            {!isEditing && (
              <h2 className="mt-4 text-xl font-semibold text-gray-900">{nickname}</h2>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                닉네임
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                />
              ) : (
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {nickname || '닉네임이 설정되지 않았습니다'}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                이메일
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                {user.email}
              </div>
              <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                가입일
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '정보 없음'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !nickname.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                프로필 수정
              </button>
            )}
          </div>

          {/* 회원 탈퇴 버튼 - 편집 모드일 때만 표시 */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsShowingDeleteModal(true)}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                회원 탈퇴
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다
              </p>
            </div>
          )}
        </div>

        {/* 내 반려동물 섹션 */}
        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-purple-600" />
              내 반려동물
            </h2>
            <Link
              href="/pet-log/pets/new"
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              추가
            </Link>
          </div>
          
          {isLoadingPets ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : pets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pet-log/pets/${pet.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl">
                      {pet.species === 'cat' ? '🐱' : '🐶'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{pet.name}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {pet.birth_date && `${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()}세`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">등록된 반려동물이 없습니다</p>
              <Link
                href="/pet-log/pets/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                반려동물 등록하기
              </Link>
            </div>
          )}
        </div>

        {/* 최근 급여 후기 섹션 */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              내 급여 후기
            </h2>
            <Link
              href="/pet-log/posts/write"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              작성
            </Link>
          </div>
          
          {isLoadingPosts ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="relative p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  {/* 최상단: 날짜와 메뉴 버튼 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                        disabled={deletingPostId === post.id}
                        className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {openMenuId === post.id && (
                        <>
                          {/* Backdrop to close menu */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          
                          {/* Dropdown menu */}
                          <div className="absolute right-0 top-8 z-20 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => handleEditPost(post.id, post.source)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              수정
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id, post.source)}
                              disabled={deletingPostId === post.id}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingPostId === post.id ? '삭제 중...' : '삭제'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 타이틀 */}
                  <Link
                    href={post.source === 'pet_log_posts' ? `/pet-log/posts/${post.id}` : `/owners/${user?.id}/pets/${post.pet_id}`}
                    className="block"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {post.source === 'pet_log_posts' 
                        ? `${post.pet_name || '반려동물'}의 급여 기록`
                        : `${post.brand} - ${post.product}`
                      }
                    </h3>

                    {/* 본문 */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {post.source === 'pet_log_posts'
                        ? `${post.pet_breed || ''} • ${post.total_records || 0}개 기록`
                        : post.excerpt || post.notes || '급여 후기'
                      }
                    </p>

                    {/* 하단: 통계 및 뱃지 */}
                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments_count || 0}
                      </span>
                      {post.updated_at && post.created_at && new Date(post.updated_at).getTime() > new Date(post.created_at).getTime() + 1000 && (
                        <span className="text-gray-400">• 수정됨</span>
                      )}
                      {post.source === 'review_logs' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                          후기
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">작성한 급여 후기가 없습니다</p>
              <Link
                href="/pet-log/posts/write"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                급여 후기 작성하기
              </Link>
            </div>
          )}
        </div>

        {/* 내가 작성한 Q&A 섹션 */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              내가 작성한 Q&A
            </h2>
            <Link
              href="/community/qa-forum"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              작성
            </Link>
          </div>
          
          {isLoadingMyQuestions ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : myQuestions.length > 0 ? (
            <div className="space-y-3">
              {myQuestions.map((question: any) => (
                <div
                  key={question.id}
                  className="relative p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
                >
                  {/* 최상단: 날짜와 메뉴 버튼 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600 font-medium">{question.category}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {new Date(question.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === question.id ? null : question.id)}
                        disabled={deletingPostId === question.id}
                        className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {openMenuId === question.id && (
                        <>
                          {/* Backdrop to close menu */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          
                          {/* Dropdown menu */}
                          <div className="absolute right-0 top-8 z-20 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => handleEditQuestion(question.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              disabled={deletingPostId === question.id}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingPostId === question.id ? '삭제 중...' : '삭제'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 타이틀과 본문 */}
                  <Link
                    href={`/community/qa-forum/${question.id}`}
                    className="block"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {question.title}
                    </h3>

                    {/* 본문 미리보기 */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {question.content}
                    </p>

                    {/* 하단: 통계 */}
                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        {question.votes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {question.views || 0}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">작성한 Q&A가 없습니다</p>
              <Link
                href="/community/qa-forum"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                질문하기
              </Link>
            </div>
          )}
        </div>

        {/* 북마크한 게시글 섹션 */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-yellow-600" />
              북마크한 게시글
            </h2>
            <Link
              href="/community/qa-forum"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Q&A 포럼
            </Link>
          </div>
          
          {isLoadingBookmarks ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : bookmarkedQuestions.length > 0 ? (
            <div className="space-y-3">
              {bookmarkedQuestions.map((bookmark: any) => (
                <Link
                  key={bookmark.id}
                  href={`/community/qa-forum/${bookmark.question.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-md transition-all"
                >
                  {/* 카테고리와 날짜 */}
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="text-gray-600 font-medium">{bookmark.question.category}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">
                      {new Date(bookmark.created_at).toLocaleDateString('ko-KR')} 북마크
                    </span>
                  </div>
                  
                  {/* 제목 */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {bookmark.question.title}
                  </h3>
                  
                  {/* 본문 미리보기 */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {bookmark.question.content}
                  </p>
                  
                  {/* 통계 */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      {bookmark.question.votes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {bookmark.question.views || 0}
                    </span>
                    {bookmark.question.author && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>{bookmark.question.author.nickname || '익명'}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">북마크한 게시글이 없습니다</p>
              <Link
                href="/community/qa-forum"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                Q&A 포럼 둘러보기
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 회원 탈퇴 확인 모달 */}
      {isShowingDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              정말 탈퇴하시겠습니까?
            </h3>
            
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-semibold mb-2">⚠️ 경고</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>모든 개인정보가 삭제됩니다</li>
                  <li>작성한 모든 게시글과 댓글이 삭제됩니다</li>
                  <li>반려동물 정보가 삭제됩니다</li>
                  <li>북마크 및 활동 기록이 삭제됩니다</li>
                  <li>삭제된 데이터는 복구할 수 없습니다</li>
                </ul>
              </div>

              <p className="text-sm text-gray-700 mb-3">
                계속하려면 아래에 <strong className="text-red-600">&quot;회원탈퇴&quot;</strong>를 정확히 입력해주세요.
              </p>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="회원탈퇴"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeletingAccount}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsShowingDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                disabled={isDeletingAccount}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmText !== '회원탈퇴'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingAccount ? '탈퇴 처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

