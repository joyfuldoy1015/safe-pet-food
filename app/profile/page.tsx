'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import { User, Mail, Calendar, Save, ArrowLeft, Camera, Plus, Heart, MessageCircle, Eye, PawPrint, Edit, Trash2, MoreVertical, Bookmark, ArrowUp, X } from 'lucide-react'
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
        router.push(`/pet-log/pets/${post.pet_id}`)
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
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-blue-50 to-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/')
              }
            }}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">돌아가기</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 mb-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={nickname}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-500" />
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
                      if (!file || !user) return
                      
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
                        // 이미지를 정사각형으로 크롭하는 함수
                        const cropToSquare = (file: File): Promise<Blob> => {
                          return new Promise((resolve, reject) => {
                            const img = new Image()
                            img.onload = () => {
                              const canvas = document.createElement('canvas')
                              const size = Math.min(img.width, img.height)
                              const outputSize = 400 // 출력 크기 (400x400)
                              canvas.width = outputSize
                              canvas.height = outputSize
                              const ctx = canvas.getContext('2d')
                              if (!ctx) {
                                reject(new Error('Canvas context not available'))
                                return
                              }
                              // 중앙 기준으로 정사각형 크롭
                              const sx = (img.width - size) / 2
                              const sy = (img.height - size) / 2
                              ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize)
                              canvas.toBlob((blob) => {
                                if (blob) resolve(blob)
                                else reject(new Error('Failed to create blob'))
                              }, 'image/jpeg', 0.9)
                            }
                            img.onerror = reject
                            img.src = URL.createObjectURL(file)
                          })
                        }

                        // 이미지 크롭
                        const croppedBlob = await cropToSquare(file)
                        const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })

                        const supabase = getBrowserClient()
                        
                        // 파일 확장자 추출
                        const fileName = `${user.id}-${Date.now()}.jpg`
                        const filePath = `avatars/${fileName}`
                        
                        // Supabase Storage에 업로드
                        const { error: uploadError } = await supabase.storage
                          .from('avatars')
                          .upload(filePath, croppedFile, {
                            cacheControl: '3600',
                            upsert: true
                          })
                        
                        if (uploadError) {
                          console.error('Upload error:', uploadError)
                          // Storage가 없으면 Data URL로 fallback
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            const result = reader.result as string
                            setAvatarUrl(result)
                          }
                          reader.readAsDataURL(croppedFile)
                          return
                        }
                        
                        // Public URL 가져오기
                        const { data: { publicUrl } } = supabase.storage
                          .from('avatars')
                          .getPublicUrl(filePath)
                        
                        setAvatarUrl(publicUrl)
                      } catch (error) {
                        console.error('Image upload error:', error)
                        // 에러 시 Data URL로 fallback
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const result = reader.result as string
                          setAvatarUrl(result)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('프로필 사진을 삭제하시겠습니까?')) {
                          setAvatarUrl(null)
                        }
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
            {!isEditing && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {nickname} <span className="text-violet-500">집사님</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
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
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">내 반려동물</h2>
            <Link
              href="/pet-log/pets/new"
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              추가
            </Link>
          </div>
          
          {isLoadingPets ? (
            <p className="text-gray-500 text-center py-6">로딩 중...</p>
          ) : pets.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pet-log/pets/${pet.id}`}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-colors flex-shrink-0"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                    <span className="text-xl">{pet.species === 'cat' ? '🐱' : '🐶'}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{pet.name}</p>
                    <p className="text-xs text-violet-500">
                      {pet.birth_date && `${new Date().getFullYear() - new Date(pet.birth_date).getFullYear()}세`}
                      {pet.species === 'cat' ? ' 고양이' : ' 강아지'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3 text-sm">등록된 반려동물이 없습니다</p>
              <Link
                href="/pet-log/pets/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm hover:bg-violet-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                반려동물 등록하기
              </Link>
            </div>
          )}
        </div>

        {/* 최근 급여 후기 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">내 급여/사용 기록</h2>
            <Link
              href="/pet-log?write=true"
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              작성
            </Link>
          </div>
          
          {isLoadingPosts ? (
            <p className="text-gray-500 text-center py-6">로딩 중...</p>
          ) : recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="relative bg-white rounded-2xl p-4 border border-gray-100 hover:border-violet-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* 아이콘 */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {post.category === 'feed' ? '🍖' :
                         post.category === 'snack' ? '🦴' :
                         post.category === 'supplement' ? '💊' :
                         post.category === 'toilet' ? '🧻' : '📝'}
                      </span>
                    </div>

                    {/* 정보 */}
                    <Link href={`/pet-log/${post.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {post.source === 'pet_log_posts' 
                            ? `${post.pet_name || '반려동물'}의 급여 기록`
                            : post.product || '급여 후기'
                          }
                        </h3>
                        <span className={`flex-shrink-0 ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                          post.status === 'feeding' ? 'bg-green-100 text-green-600' :
                          post.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                          'bg-violet-100 text-violet-600'
                        }`}>
                          {post.status === 'feeding' ? '급여 중' :
                           post.status === 'completed' ? '급여 완료' : '기록'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                        {post.brand && `${post.brand} · `}{new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-red-400" />
                          {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </Link>

                    {/* 메뉴 버튼 */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                        disabled={deletingPostId === post.id}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {openMenuId === post.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-10 z-20 w-28 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                            <button
                              onClick={() => handleEditPost(post.id, post.source)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
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
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3 text-sm">작성한 급여 후기가 없습니다</p>
              <Link
                href="/pet-log?write=true"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl text-sm hover:bg-violet-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                급여 후기 작성하기
              </Link>
            </div>
          )}
        </div>

        {/* 내가 작성한 Q&A 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">내가 작성한 Q&A</h2>
            <Link
              href="/community/qa-forum"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              작성
            </Link>
          </div>
          
          {isLoadingMyQuestions ? (
            <p className="text-gray-500 text-center py-6">로딩 중...</p>
          ) : myQuestions.length > 0 ? (
            <div className="space-y-3">
              {myQuestions.map((question: any) => (
                <div
                  key={question.id}
                  className="relative bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Q 아이콘 */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm font-bold">Q</span>
                    </div>

                    {/* 정보 */}
                    <Link href={`/community/qa-forum/${question.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {question.category?.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim() || 'Q&A'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(question.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-red-400" />
                          {question.votes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5 text-gray-400" />
                          {question.views || 0}
                        </span>
                      </div>
                    </Link>

                    {/* 메뉴 버튼 */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === question.id ? null : question.id)}
                        disabled={deletingPostId === question.id}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {openMenuId === question.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-10 z-20 w-28 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                            <button
                              onClick={() => handleEditQuestion(question.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
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
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3 text-sm">작성한 Q&A가 없습니다</p>
              <Link
                href="/community/qa-forum"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                질문하기
              </Link>
            </div>
          )}
        </div>

        {/* 북마크한 게시글 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">북마크</h2>
            <Link
              href="/community/qa-forum"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Q&A 포럼
            </Link>
          </div>
          
          {isLoadingBookmarks ? (
            <p className="text-gray-500 text-center py-6">로딩 중...</p>
          ) : bookmarkedQuestions.length > 0 ? (
            <div className="space-y-3">
              {bookmarkedQuestions.map((bookmark: any) => (
                <Link
                  key={bookmark.id}
                  href={`/community/qa-forum/${bookmark.question.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 hover:border-yellow-200 transition-all"
                >
                  {/* 북마크 아이콘 */}
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Bookmark className="h-4 w-4 text-yellow-500" />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {bookmark.question.category?.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim() || 'Q&A'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {bookmark.question.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-400" />
                        {bookmark.question.votes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                        {bookmark.question.views || 0}
                      </span>
                      {bookmark.question.author && (
                        <span className="text-gray-400">
                          {bookmark.question.author.nickname || '익명'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3 text-sm">북마크한 게시글이 없습니다</p>
              <Link
                href="/community/qa-forum"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm hover:bg-yellow-600 transition-colors"
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

