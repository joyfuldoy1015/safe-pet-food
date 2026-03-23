'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Flame, Clock, HelpCircle, ChevronDown, Loader2 } from 'lucide-react'
import QuestionCard, { Question } from '@/app/components/qa-forum/QuestionCard'
import AskQuestionModal from '@/app/components/qa-forum/AskQuestionModal'
import CategoryTabs from '@/app/components/qa-forum/CategoryTabs'
import { getBrowserClient } from '@/lib/supabase-client'

// Categories configuration
const categories = [
  { value: 'all', label: '전체', emoji: '🌐' },
  { value: '🐶 강아지', label: '강아지', emoji: '🐶' },
  { value: '🐱 고양이', label: '고양이', emoji: '🐱' },
  { value: '🍖 사료 & 영양', label: '사료 & 영양', emoji: '🍖' },
  { value: '❤️ 건강', label: '건강', emoji: '❤️' },
  { value: '🎓 훈련 & 행동', label: '훈련 & 행동', emoji: '🎓' },
  { value: '💬 자유토론', label: '자유토론', emoji: '💬' }
]

// Sort options
type SortOption = 'hot' | 'recent' | 'unanswered'

// Number of questions to load per page
const QUESTIONS_PER_PAGE = 5

export default function CommunityQAForumPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOption, setSortOption] = useState<SortOption>('recent')
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const [displayedCount, setDisplayedCount] = useState(QUESTIONS_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)

  // Load questions from Supabase
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true)
      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          setIsLoadingQuestions(false)
          return
        }

        // Fetch questions with answer counts
        const { data: questionsData, error } = await supabase
          .from('community_questions')
          .select(`
            *,
            author:profiles!author_id(nickname, avatar_url)
          `)
          .eq('admin_status', 'visible')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to load questions:', error)
          setIsLoadingQuestions(false)
          return
        }

        // Get answer counts for each question
        const questionsWithAnswers = await Promise.all(
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
                avatar: q.author?.avatar_url || undefined,
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

        setQuestions(questionsWithAnswers)
      } catch (error) {
        console.error('Failed to load questions:', error)
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    loadQuestions()
  }, [])

  // Format time ago helper
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`
    return `${Math.floor(diffInSeconds / 31536000)}년 전`
  }

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter((question) => {
      const matchesSearch =
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || question.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort based on option
    switch (sortOption) {
      case 'hot':
        filtered.sort((a, b) => {
          // Hot = combination of votes, answers, and recency
          const scoreA = a.votes * 2 + a.answerCount + (a.views || 0) / 10
          const scoreB = b.votes * 2 + b.answerCount + (b.views || 0) / 10
          return scoreB - scoreA
        })
        break
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'unanswered':
        filtered = filtered.filter((q) => q.answerCount === 0)
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return filtered
  }, [questions, searchTerm, selectedCategory, sortOption])

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(QUESTIONS_PER_PAGE)
  }, [searchTerm, selectedCategory, sortOption])

  // Questions to display (paginated)
  const displayedQuestions = useMemo(() => {
    return filteredAndSortedQuestions.slice(0, displayedCount)
  }, [filteredAndSortedQuestions, displayedCount])

  // Check if there are more questions to load
  const hasMore = displayedCount < filteredAndSortedQuestions.length

  // Handle load more
  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    setDisplayedCount((prev) => prev + QUESTIONS_PER_PAGE)
    setIsLoadingMore(false)
  }

  // Handle upvote
  const handleUpvote = async (questionId: string) => {
    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          router.push(`/login?redirect=${encodeURIComponent('/community/qa-forum')}`)
        }
        return
      }

      const isCurrentlyUpvoted = userVotes[questionId]

      if (isCurrentlyUpvoted) {
        // Remove vote
        await supabase
          .from('community_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('target_type', 'question')
          .eq('target_id', questionId)

        // Decrement vote count
        await supabase
          .from('community_questions')
          .update({ votes: supabase.rpc('decrement', { row_id: questionId }) } as any)
          .eq('id', questionId)
      } else {
        // Add vote
        await supabase
          .from('community_votes')
          .insert({
            user_id: user.id,
            target_type: 'question',
            target_id: questionId,
            vote_value: 1
          } as any)

        // Increment vote count
        await supabase
          .from('community_questions')
          .update({ votes: supabase.rpc('increment', { row_id: questionId }) } as any)
          .eq('id', questionId)
      }

      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, votes: isCurrentlyUpvoted ? q.votes - 1 : q.votes + 1 }
            : q
        )
      )

      setUserVotes((prev) => {
        if (isCurrentlyUpvoted) {
          const newVotes = { ...prev }
          delete newVotes[questionId]
          return newVotes
        }
        return { ...prev, [questionId]: true }
      })
    } catch (error) {
      console.error('Failed to update vote:', error)
    }
  }

  // Handle question submit
  const handleQuestionSubmit = async (data: {
    title: string
    category: string
    content: string
    isAnonymous: boolean
    imageUrl?: string
    summary?: string
  }) => {
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
          router.push(`/login?redirect=${encodeURIComponent('/community/qa-forum')}`)
        }
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single()

      // Insert question
      const insertData: any = {
        title: data.title,
        content: data.content,
        category: data.category,
        author_id: user.id,
        status: 'open',
        votes: 0,
        views: 0,
        admin_status: 'visible'
      }
      if (data.summary) {
        insertData.summary = data.summary
      }

      const { data: newQuestion, error } = await (supabase
        .from('community_questions') as any)
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Failed to create question:', error)
        alert('질문 등록에 실패했습니다.')
        return
      }

      // Add to local state
      const questionForDisplay: Question = {
        id: newQuestion.id,
        title: newQuestion.title,
        content: newQuestion.content,
        summary: newQuestion.summary || undefined,
        author: {
          name: profile?.nickname || '사용자',
          avatar: profile?.avatar_url || undefined,
          level: 'beginner'
        },
        category: data.category,
        categoryEmoji: categories.find((c) => c.value === data.category)?.emoji || '💬',
        votes: 0,
        answerCount: 0,
        views: 0,
        createdAt: newQuestion.created_at,
        updatedAt: newQuestion.updated_at,
        status: 'open',
        isUpvoted: false
      }
      
      setQuestions(prev => [questionForDisplay, ...prev])
      setShowQuestionModal(false)
    } catch (error) {
      console.error('Failed to submit question:', error)
      alert('질문 등록에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Q&A 포럼
          </h1>
          <p className="text-sm text-gray-500">
            사료 선택 고민을 다른 보호자들과 함께 나눠보세요
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="질문 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSortOption('hot')}
                className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  sortOption === 'hot'
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">인기</span>
              </button>
              <button
                onClick={() => setSortOption('recent')}
                className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  sortOption === 'recent'
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">최신</span>
              </button>
              <button
                onClick={() => setSortOption('unanswered')}
                className={`px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  sortOption === 'unanswered'
                    ? 'bg-violet-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">답변 대기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs - 주제 둘러보기 */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-600 mb-2">주제 둘러보기</h3>
          <CategoryTabs
            categories={categories.filter(c => c.value !== 'all')}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Main Content */}
        <div>
          {/* Questions Feed */}
          <div>
            {displayedQuestions.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {displayedQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={{
                        ...question,
                        isUpvoted: userVotes[question.id] || false
                      }}
                      onUpvote={handleUpvote}
                      formatTimeAgo={formatTimeAgo}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-soft"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>로딩 중...</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-5 w-5" />
                          <span>더 보기</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* End of list message */}
                {!hasMore && displayedQuestions.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">모든 질문을 불러왔습니다.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-soft border border-gray-200">
                <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  질문이 없습니다
                </p>
                <p className="text-sm text-gray-600">
                  첫 번째 질문을 작성해보세요!
                </p>
              </div>
            )}
          </div>

                </div>
                
        {/* Floating Ask Question Button */}
                  <button
          onClick={async () => {
            const supabase = getBrowserClient()
            if (!supabase) return
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
              if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
                router.push(`/login?redirect=${encodeURIComponent('/community/qa-forum')}`)
              }
              return
            }
            setShowQuestionModal(true)
          }}
          className="fixed bottom-6 right-6 h-14 w-14 bg-blue-500 text-white rounded-full shadow-strong hover:bg-blue-600 transition-all duration-200 hover:scale-110 flex items-center justify-center z-40"
          aria-label="질문하기"
                  >
          <Plus className="h-6 w-6" />
                  </button>

        {/* Ask Question Modal */}
        <AskQuestionModal
          isOpen={showQuestionModal}
          onClose={() => setShowQuestionModal(false)}
          onSubmit={handleQuestionSubmit}
          categories={categories.filter((c) => c.value !== 'all')}
        />
      </main>
    </div>
  )
}
