'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  Flag,
  Send,
  Eye,
  Bookmark,
  Edit,
  X,
  Save,
  Trash2,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import QuestionEditForm from './QuestionEditForm'
import QuestionAnswersSection from './QuestionAnswersSection'
import RelatedQuestionsList from './RelatedQuestionsList'
import { Question } from '@/app/components/qa-forum/QuestionCard'
import CommentThread, { Comment } from '@/app/components/qa-forum/CommentThread'
import { getBrowserClient } from '@/lib/supabase-client'
import { formatTimeAgo } from '@/lib/utils/format'
import { mockQuestionsData, mockComments } from './mock-data'

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.questionId as string
  const { user, profile } = useAuth()

  const [question, setQuestion] = useState<Question | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false)
  
  const [showFullContent, setShowFullContent] = useState(false)

  // 질문 수정 관련 상태
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [editImageUrl, setEditImageUrl] = useState<string | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editImageRemoved, setEditImageRemoved] = useState(false)
  const [editUploadError, setEditUploadError] = useState('')
  const editFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadQuestion = async () => {
      setIsLoadingQuestion(true)
      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          // Fallback to mock data
          const questionData = mockQuestionsData.find((q) => q.id === questionId)
          if (questionData) {
            setQuestion({
              ...questionData,
              isUpvoted: userVotes[questionId] || false
            } as Question)
          }
          setIsLoadingQuestion(false)
          return
        }

        // Fetch question from Supabase
        const { data: questionData, error } = await supabase
          .from('community_questions')
          .select(`
            *,
            author:profiles!author_id(nickname, avatar_url)
          `)
          .eq('id', questionId)
          .eq('admin_status', 'visible')
          .single()

        if (error) {
          console.error('Failed to load question:', error)
          setIsLoadingQuestion(false)
          return
        }

        if (questionData) {
          // Get answer count
          const { count } = await supabase
            .from('community_answers')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', questionData.id)
            .eq('admin_status', 'visible')

          setQuestion({
            id: questionData.id,
            title: questionData.title,
            content: questionData.content,
            summary: questionData.summary || undefined,
            author: {
              name: questionData.author?.nickname || '익명',
              level: 'beginner' as const,
              avatar: questionData.author?.avatar_url,
              id: questionData.author_id
            },
            category: questionData.category,
            categoryEmoji: questionData.category.split(' ')[0],
            votes: questionData.votes || 0,
            answerCount: count || 0,
            views: questionData.views || 0,
            createdAt: questionData.created_at,
            updatedAt: questionData.updated_at,
            status: questionData.status as 'open' | 'answered' | 'closed',
            isUpvoted: false,
            imageUrl: questionData.image_url || undefined,
            author_id: questionData.author_id
          })

          // Increment view count via server API (bypasses RLS)
          fetch('/api/community/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId })
          }).catch(() => {})
        }
      } catch (error) {
        console.error('Failed to load question:', error)
      } finally {
        setIsLoadingQuestion(false)
      }
    }

    const loadComments = async () => {
      setIsLoadingComments(true)
      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          // Fallback to mock data
          const questionComments = mockComments[questionId] || []
          setComments(questionComments.map((c) => ({ ...c, isUpvoted: false })))
          setIsLoadingComments(false)
          return
        }

        // Fetch all answers from Supabase (including nested replies)
        const { data: answersData, error } = await supabase
          .from('community_answers')
          .select(`
            *,
            author:profiles!author_id(nickname, avatar_url)
          `)
          .eq('question_id', questionId)
          .eq('admin_status', 'visible')
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Failed to load answers:', error)
          setIsLoadingComments(false)
          return
        }

        // Build flat list of all answers
        const flatComments: Comment[] = (answersData || []).map((answer: any) => ({
          id: answer.id,
          content: answer.content,
          author: {
            name: answer.author?.nickname || '익명',
            level: 'beginner' as const,
            avatar: answer.author?.avatar_url,
            id: answer.author_id
          },
          votes: answer.votes || 0,
          createdAt: answer.created_at,
          isUpvoted: false,
          parent_id: answer.parent_id
        }))

        // Build nested structure
        const commentMap = new Map<string, Comment>()
        const rootComments: Comment[] = []

        // First pass: create map of all comments
        flatComments.forEach(comment => {
          commentMap.set(comment.id, { ...comment, replies: [] })
        })

        // Second pass: build tree structure
        flatComments.forEach(comment => {
          const commentWithReplies = commentMap.get(comment.id)!
          if (comment.parent_id) {
            // This is a reply, add to parent's replies array
            const parent = commentMap.get(comment.parent_id)
            if (parent) {
              if (!parent.replies) parent.replies = []
              parent.replies.push(commentWithReplies)
            }
          } else {
            // This is a root comment
            rootComments.push(commentWithReplies)
          }
        })

        // Sort root comments by votes (descending) then by creation time
        rootComments.sort((a, b) => {
          if (b.votes !== a.votes) {
            return b.votes - a.votes
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })

        setComments(rootComments)
      } catch (error) {
        console.error('Failed to load answers:', error)
      } finally {
        setIsLoadingComments(false)
      }
    }

    const loadBookmarkStatus = async () => {
      try {
        const supabase = getBrowserClient()
        if (!supabase) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check if user has bookmarked this question
        const { data, error } = await supabase
          .from('community_bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('question_id', questionId)
          .maybeSingle() // Use maybeSingle() instead of single() to avoid 406 error

        if (!error && data) {
          setIsBookmarked(true)
        } else {
          setIsBookmarked(false)
        }
      } catch (error) {
        // Handle any unexpected errors
        setIsBookmarked(false)
      }
    }

    loadQuestion()
    loadComments()
    loadBookmarkStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]) // Only reload when questionId changes

  // Handle question upvote
  const handleQuestionUpvote = () => {
    if (!question) return

    // 로그인 체크
    if (!user) {
      if (confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')) {
        router.push(`/login?redirect=/community/qa-forum/${questionId}`)
      }
      return
    }

    const isCurrentlyUpvoted = userVotes[questionId]

    setQuestion({
      ...question,
      votes: isCurrentlyUpvoted ? question.votes - 1 : question.votes + 1,
      isUpvoted: !isCurrentlyUpvoted
    })

    setUserVotes((prev) => {
      if (isCurrentlyUpvoted) {
        const newVotes = { ...prev }
        delete newVotes[questionId]
        return newVotes
      }
      return { ...prev, [questionId]: true }
    })
  }

  // Handle bookmark toggle
  const handleToggleBookmark = async () => {
    if (isTogglingBookmark) return

    const supabase = getBrowserClient()
    if (!supabase) {
      alert('Supabase에 연결할 수 없습니다.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push(`/login?redirect=${encodeURIComponent(`/community/qa-forum/${questionId}`)}`)
      }
      return
    }

    setIsTogglingBookmark(true)
    try {
      if (isBookmarked) {
        // 북마크 삭제
        const { error } = await supabase
          .from('community_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId)

        if (error) {
          console.error('Failed to remove bookmark:', error)
          alert('북마크 해제에 실패했습니다.')
          return
        }

        setIsBookmarked(false)
      } else {
        // 북마크 추가
        const { error } = await (supabase
          .from('community_bookmarks') as any)
          .insert({
            user_id: user.id,
            question_id: questionId
          })

        if (error) {
          console.error('Failed to add bookmark:', error)
          // 이미 북마크된 경우 (UNIQUE constraint)
          if (error.code === '23505') {
            setIsBookmarked(true)
            return
          }
          alert('북마크 추가에 실패했습니다.')
          return
        }

        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      alert('북마크 처리 중 오류가 발생했습니다.')
    } finally {
      setIsTogglingBookmark(false)
    }
  }

  // Handle comment upvote
  const handleCommentUpvote = (commentId: string) => {
    // 로그인 체크
    if (!user) {
      if (confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')) {
        router.push(`/login?redirect=/community/qa-forum/${questionId}`)
      }
      return
    }

    const isCurrentlyUpvoted = userVotes[commentId]

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            votes: isCurrentlyUpvoted ? c.votes - 1 : c.votes + 1,
            isUpvoted: !isCurrentlyUpvoted
          }
        }
        // Handle nested replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    votes: isCurrentlyUpvoted ? r.votes - 1 : r.votes + 1,
                    isUpvoted: !isCurrentlyUpvoted
                  }
                : r
            )
          }
        }
        return c
      })
    )

    setUserVotes((prev) => {
      if (isCurrentlyUpvoted) {
        const newVotes = { ...prev }
        delete newVotes[commentId]
        return newVotes
      }
      return { ...prev, [commentId]: true }
    })
  }

  // Handle reply - Supabase에 저장하고 재귀적으로 댓글 트리 업데이트
  const handleReply = async (commentId: string, content: string) => {
    if (!user || !profile) {
      if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push(`/login?redirect=${encodeURIComponent(`/community/qa-forum/${questionId}`)}`)
      }
      return
    }

    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      // Insert reply into database
      const { data: newAnswer, error } = await (supabase
        .from('community_answers') as any)
        .insert({
          question_id: questionId,
          author_id: user.id,
          content: content.trim(),
          parent_id: commentId,
          is_accepted: false,
          votes: 0,
          admin_status: 'visible'
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create reply:', error)
        alert('답글 등록에 실패했습니다.')
        return
      }

      // Create new reply object with profile data
      const newReply: Comment = {
        id: newAnswer.id,
        content: newAnswer.content,
        author: {
          name: profile?.nickname || '사용자',
          level: 'beginner',
          avatar: profile?.avatar_url,
          id: user.id
        },
        votes: 0,
        createdAt: newAnswer.created_at
      }

      // 재귀 함수: 댓글 트리에서 대상 ID 찾기
      const addReplyToComment = (comment: Comment): Comment => {
        if (comment.id === commentId) {
          // 찾았으면 답글 추가
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          }
        }
        
        // 하위 답글들도 재귀적으로 탐색
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(addReplyToComment)
          }
        }
        
        return comment
      }

      setComments((prev) => prev.map(addReplyToComment))
    } catch (error) {
      console.error('Failed to submit reply:', error)
      alert('답글 등록 중 오류가 발생했습니다.')
    }
  }

  // Handle edit comment
  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      // Update in database
      const { error } = await (supabase
        .from('community_answers') as any)
        .update({ content: newContent })
        .eq('id', commentId)
        .eq('author_id', user?.id) // RLS: only own comments

      if (error) {
        console.error('Failed to update comment:', error)
        alert('댓글 수정에 실패했습니다.')
        return
      }

      // Update local state
      const editComment = (comment: Comment): Comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content: newContent
          }
        }
        
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(editComment)
          }
        }
        
        return comment
      }

      setComments((prev) => prev.map(editComment))
    } catch (error) {
      console.error('Failed to edit comment:', error)
      alert('댓글 수정 중 오류가 발생했습니다.')
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      // Check if comment has replies
      const findComment = (comments: Comment[], id: string): Comment | null => {
        for (const comment of comments) {
          if (comment.id === id) return comment
          if (comment.replies) {
            const found = findComment(comment.replies, id)
            if (found) return found
          }
        }
        return null
      }

      const targetComment = findComment(comments, commentId)
      if (!targetComment) return

      const hasReplies = targetComment.replies && targetComment.replies.length > 0

      if (hasReplies) {
        // Soft delete: update content only (keep admin_status as 'visible')
        const { error } = await (supabase
          .from('community_answers') as any)
          .update({ 
            content: '작성자가 삭제한 댓글입니다.'
          })
          .eq('id', commentId)
          .eq('author_id', user?.id) // RLS: only own comments

        if (error) {
          console.error('Failed to soft delete comment:', error)
          alert('댓글 삭제에 실패했습니다.')
          return
        }
      } else {
        // Hard delete: remove from database
        const { error } = await supabase
          .from('community_answers')
          .delete()
          .eq('id', commentId)
          .eq('author_id', user?.id) // RLS: only own comments

        if (error) {
          console.error('Failed to delete comment:', error)
          alert('댓글 삭제에 실패했습니다.')
          return
        }
      }

      // Update local state
      const deleteComment = (comment: Comment): Comment | null => {
        if (comment.id === commentId) {
          // 대댓글이 있으면 내용만 삭제 표시
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              content: '작성자가 삭제한 댓글입니다.',
              isDeleted: true
            }
          }
          // 대댓글이 없으면 완전 삭제 (null 반환)
          return null
        }
        
        // 하위 답글 처리
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = comment.replies
            .map(deleteComment)
            .filter((r): r is Comment => r !== null)
          
          return {
            ...comment,
            replies: updatedReplies
          }
        }
        
        return comment
      }

      setComments((prev) => 
        prev
          .map(deleteComment)
          .filter((c): c is Comment => c !== null)
      )
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 질문 수정 카테고리 목록
  const questionCategories = [
    { value: '🐶 강아지', label: '강아지', emoji: '🐶' },
    { value: '🐱 고양이', label: '고양이', emoji: '🐱' },
    { value: '🍖 사료 & 영양', label: '사료 & 영양', emoji: '🍖' },
    { value: '❤️ 건강', label: '건강', emoji: '❤️' },
    { value: '🎓 훈련 & 행동', label: '훈련 & 행동', emoji: '🎓' },
    { value: '💬 자유토론', label: '자유토론', emoji: '💬' }
  ]

  // 질문 수정 모드 시작
  const MAX_EDIT_FILE_SIZE = 5 * 1024 * 1024
  const MAX_EDIT_IMAGE_DIM = 1200
  const EDIT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']

  const compressEditImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_EDIT_IMAGE_DIM || height > MAX_EDIT_IMAGE_DIM) {
          const ratio = Math.min(MAX_EDIT_IMAGE_DIM / width, MAX_EDIT_IMAGE_DIM / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
          'image/jpeg',
          0.8
        )
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleEditImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditUploadError('')
    if (!EDIT_ACCEPTED_TYPES.includes(file.type)) {
      setEditUploadError('JPG, PNG, WebP, GIF, HEIC 형식만 지원합니다.')
      return
    }
    if (file.size > MAX_EDIT_FILE_SIZE) {
      setEditUploadError('파일 크기는 5MB 이하만 가능합니다.')
      return
    }
    try {
      const compressed = await compressEditImage(file)
      setEditImageFile(compressed)
      setEditImagePreview(URL.createObjectURL(compressed))
      setEditImageRemoved(false)
    } catch {
      setEditUploadError('이미지 처리 중 오류가 발생했습니다.')
    }
  }

  const handleEditImageRemove = () => {
    setEditImageFile(null)
    if (editImagePreview) URL.revokeObjectURL(editImagePreview)
    setEditImagePreview(null)
    setEditImageUrl(null)
    setEditImageRemoved(true)
    setEditUploadError('')
    if (editFileInputRef.current) editFileInputRef.current.value = ''
  }

  const resetEditImageState = () => {
    setEditImageFile(null)
    if (editImagePreview) URL.revokeObjectURL(editImagePreview)
    setEditImagePreview(null)
    setEditImageUrl(null)
    setEditImageRemoved(false)
    setEditUploadError('')
    if (editFileInputRef.current) editFileInputRef.current.value = ''
  }

  const handleStartEditQuestion = () => {
    if (!question) return
    setEditTitle(question.title)
    setEditContent(question.content)
    setEditCategory(question.category)
    setEditImageUrl(question.imageUrl || null)
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditImageRemoved(false)
    setEditUploadError('')
    setIsEditingQuestion(true)
  }

  // 질문 수정 취소
  const handleCancelEditQuestion = () => {
    setIsEditingQuestion(false)
    setEditTitle('')
    setEditContent('')
    setEditCategory('')
    resetEditImageState()
  }

  // 질문 수정 저장
  const handleSaveEditQuestion = async () => {
    if (!question || !editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setIsSavingEdit(true)
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      let newImageUrl: string | null | undefined = undefined
      if (editImageFile) {
        const ext = editImageFile.name.split('.').pop() || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const filePath = `qa-images/${fileName}`
        const { error: uploadErr } = await supabase.storage
          .from('qa-images')
          .upload(filePath, editImageFile, { cacheControl: '3600', upsert: false })
        if (uploadErr) {
          console.error('Image upload error:', uploadErr)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('qa-images')
            .getPublicUrl(filePath)
          newImageUrl = publicUrl
        }
      } else if (editImageRemoved) {
        newImageUrl = null
      }

      const updateData: any = {
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        updated_at: new Date().toISOString()
      }
      if (newImageUrl !== undefined) {
        updateData.image_url = newImageUrl
      }

      const { error } = await (supabase
        .from('community_questions') as any)
        .update(updateData)
        .eq('id', questionId)
        .eq('author_id', user?.id)

      if (error) {
        console.error('Failed to update question:', error)
        alert('질문 수정에 실패했습니다.')
        return
      }

      const finalImageUrl = newImageUrl !== undefined
        ? (newImageUrl || undefined)
        : question.imageUrl

      setQuestion({
        ...question,
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        categoryEmoji: editCategory.split(' ')[0],
        imageUrl: finalImageUrl,
        updatedAt: new Date().toISOString()
      })

      setIsEditingQuestion(false)
      resetEditImageState()
      alert('질문이 수정되었습니다.')
    } catch (error) {
      console.error('Failed to save question edit:', error)
      alert('질문 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!question || !user || question.author_id !== user.id) return
    if (!confirm('질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { error } = await (supabase
        .from('community_questions') as any)
        .update({ admin_status: 'deleted' })
        .eq('id', question.id)
        .eq('author_id', user.id)

      if (error) {
        console.error('Failed to delete question:', error)
        alert('질문 삭제에 실패했습니다.')
        return
      }

      alert('질문이 삭제되었습니다.')
      router.push('/community/qa-forum')
    } catch (error) {
      console.error('Failed to delete question:', error)
      alert('질문 삭제 중 오류가 발생했습니다.')
    }
  }

  // Handle new comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !question) return

    // Validate minimum length
    if (newComment.trim().length < 10) {
      alert('답변은 최소 10자 이상 입력해주세요.')
      return
    }

    if (newComment.trim().length > 5000) {
      alert('답변은 최대 5000자까지 입력 가능합니다.')
      return
    }

    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          router.push(`/login?redirect=${encodeURIComponent(`/community/qa-forum/${questionId}`)}`)
        }
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single()

      // Insert answer
      const { data: newAnswer, error } = await (supabase
        .from('community_answers') as any)
        .insert({
          question_id: questionId,
          author_id: user.id,
          content: newComment.trim(),
          is_accepted: false,
          votes: 0,
          admin_status: 'visible'
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create answer:', error)
        alert('답변 등록에 실패했습니다.')
        return
      }

      // Add to local state
      const newCommentObj: Comment = {
        id: newAnswer.id,
        content: newAnswer.content,
        author: {
          name: profile?.nickname || '사용자',
          level: 'beginner',
          avatar: profile?.avatar_url,
          id: user.id
        },
        votes: 0,
        createdAt: newAnswer.created_at,
        isUpvoted: false
      }

      setComments([...comments, newCommentObj])
      setNewComment('')

      // Update question status to 'answered' if it was 'open'
      if (question.status === 'open') {
        await (supabase
          .from('community_questions') as any)
          .update({ status: 'answered' })
          .eq('id', questionId)
      }

      // Update question answer count and status
      setQuestion({
        ...question,
        answerCount: question.answerCount + 1,
        status: 'answered'
      })
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('답변 등록에 실패했습니다.')
    }
  }

  // Related questions state
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([])

  // Load related questions
  useEffect(() => {
    const loadRelatedQuestions = async () => {
      if (!question) return

      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          // Fallback to mock data
          const related = mockQuestionsData
            .filter((q) => q.id !== questionId && q.category === question.category)
            .slice(0, 3)
          setRelatedQuestions(related)
          return
        }

        // Fetch related questions from Supabase
        const { data: questionsData, error } = await supabase
          .from('community_questions')
          .select(`
            *,
            author:profiles!author_id(nickname, avatar_url)
          `)
          .eq('category', question.category)
          .eq('admin_status', 'visible')
          .neq('id', questionId)
          .order('votes', { ascending: false })
          .limit(3)

        if (error) {
          console.error('Failed to load related questions:', error)
          return
        }

        const questions: Question[] = await Promise.all(
          (questionsData || []).map(async (q: any) => {
            const { count } = await supabase
              .from('community_answers')
              .select('*', { count: 'exact', head: true })
              .eq('question_id', q.id)
              .eq('admin_status', 'visible')

            return {
              id: q.id,
              title: q.title,
              content: q.content,
              summary: q.summary || undefined,
              author: {
                name: q.author?.nickname || '익명',
                level: 'beginner' as const
              },
              category: q.category,
              categoryEmoji: q.category.split(' ')[0],
              votes: q.votes || 0,
              answerCount: count || 0,
              views: q.views || 0,
              createdAt: q.created_at,
              updatedAt: q.updated_at,
              status: q.status as 'open' | 'answered' | 'closed',
              isUpvoted: false
            }
          })
        )

        setRelatedQuestions(questions)
      } catch (error) {
        console.error('Failed to load related questions:', error)
      }
    }

    loadRelatedQuestions()
  }, [question?.category, questionId, question])

  if (isLoadingQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            질문을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            요청하신 질문이 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/community/qa-forum"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Q&A 포럼으로 돌아가기</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/community/qa-forum"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">목록으로 돌아가기</span>
        </Link>

        <div className="space-y-4">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              {/* 상단: 프로필 + 상태 배지 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* 아바타 with Q badge */}
                  <div className="relative flex-shrink-0">
                    {question.author.avatar ? (
                      <img
                        src={question.author.avatar}
                        alt={question.author.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white text-[9px] font-bold">Q</span>
                    </div>
                  </div>
                  {/* 작성자 정보 */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {question.author.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimeAgo(question.createdAt)}</span>
                  </div>
                </div>
                {/* 상태 배지 */}
                <div className="flex items-center gap-2">
                  {question.status === 'answered' ? (
                    <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-600 rounded-full">
                      답변 완료
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-medium bg-orange-50 text-orange-600 rounded-full">
                      답변 대기
                    </span>
                  )}
                </div>
              </div>

              {/* 카테고리 태그 */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {question.category.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim()}
                </span>
              </div>

              {/* Title & Content */}
              {isEditingQuestion ? (
                <QuestionEditForm
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  editCategory={editCategory}
                  setEditCategory={setEditCategory}
                  editImagePreview={editImagePreview}
                  editImageUrl={editImageUrl}
                  editImageRemoved={editImageRemoved}
                  editUploadError={editUploadError}
                  isSavingEdit={isSavingEdit}
                  editFileInputRef={editFileInputRef}
                  questionCategories={questionCategories}
                  onImageSelect={handleEditImageSelect}
                  onImageRemove={handleEditImageRemove}
                  onSave={handleSaveEditQuestion}
                  onCancel={handleCancelEditQuestion}
                />
              ) : (
                <>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                    {question.title}
                  </h1>
                  {user && question.author_id === user.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={handleStartEditQuestion}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                        title="질문 수정"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleDeleteQuestion}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="질문 삭제"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  {question.summary && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">AI 요약</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {question.summary}
                      </p>
                    </div>
                  )}

                  {question.summary && !showFullContent ? (
                    <button
                      onClick={() => setShowFullContent(true)}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium mb-3"
                    >
                      전체 내용 보기 ▼
                    </button>
                  ) : (
                    <>
                      {question.summary && showFullContent && (
                        <button
                          onClick={() => setShowFullContent(false)}
                          className="text-sm text-blue-500 hover:text-blue-600 font-medium mb-3"
                        >
                          접기 ▲
                        </button>
                      )}
                      <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                        {question.content}
                      </p>
                    </>
                  )}

                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Question image"
                      className="mt-4 rounded-xl max-w-full"
                    />
                  )}
                </div>
                </>
              )}

              {/* Actions - 하단 통계 및 액션 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {/* 좌측: 좋아요, 답변, 조회수 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleQuestionUpvote}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      question.isUpvoted ? 'bg-red-50' : 'bg-red-50'
                    }`}>
                      <Heart className={`h-4 w-4 ${question.isUpvoted ? 'text-red-500 fill-current' : 'text-red-400'}`} />
                    </span>
                    <span className="font-medium text-gray-600">{question.votes}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    </span>
                    <span className="font-medium text-gray-600">{question.answerCount}</span>
                  </div>
                  {question.views !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </span>
                      <span className="font-medium text-gray-600">{question.views}</span>
                    </div>
                  )}
                </div>
                
                {/* 우측: 북마크, 신고 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    disabled={isTogglingBookmark}
                    className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                      isBookmarked
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                    aria-label="신고하기"
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <QuestionAnswersSection
              answerCount={question.answerCount}
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              user={user}
              questionId={questionId}
              onSubmit={handleCommentSubmit}
              onUpvote={handleCommentUpvote}
              onReply={handleReply}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              formatTimeAgo={formatTimeAgo}
            />

            {/* Related Questions */}
            <RelatedQuestionsList
              relatedQuestions={relatedQuestions}
              formatTimeAgo={formatTimeAgo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
