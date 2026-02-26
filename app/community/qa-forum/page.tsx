'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Search, Plus, Flame, Clock, HelpCircle, ChevronDown, Loader2 } from 'lucide-react'
import QuestionCard, { Question } from '@/app/components/qa-forum/QuestionCard'
import AskQuestionModal from '@/app/components/qa-forum/AskQuestionModal'
import CategoryTabs from '@/app/components/qa-forum/CategoryTabs'
import { getBrowserClient } from '@/lib/supabase-client'

// Fallback mock data
const mockQuestionsData = [
  {
    id: '1',
    title: '강아지가 사료를 잘 안 먹어요. 어떻게 해야 할까요?',
    content: '3살 골든리트리버인데 최근에 사료를 잘 안 먹습니다. 건강에는 문제가 없어 보이는데 식욕이 떨어진 것 같아요.\n\n평소에는 잘 먹던 아이인데 2주 전부터 갑자기 사료를 남기기 시작했어요. 간식은 잘 먹는데 사료만 안 먹어서 걱정입니다.\n\n혹시 비슷한 경험 있으신 분들 조언 부탁드려요. 병원에 가봐야 할까요?',
    author: { name: '반려인초보', level: 'beginner' },
    category: '🍖 사료 & 영양',
    categoryEmoji: '🍖',
    votes: 15,
    answerCount: 3,
    views: 234,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    status: 'answered'
  },
  {
    id: '2',
    title: '고양이 모래 추천 부탁드립니다',
    content: '털 빠짐이 심한 장모종 고양이를 키우고 있는데, 모래가 털에 잘 붙지 않는 제품이 있을까요?\n\n현재는 일반 벤토나이트 모래를 사용하고 있는데, 털에 많이 붙어서 청소가 힘들어요. 클레이 모래나 다른 종류의 모래를 추천해주시면 감사하겠습니다!',
    author: { name: '냥집사5년차', level: 'experienced' },
    category: '💬 자유토론',
    categoryEmoji: '💬',
    votes: 8,
    answerCount: 2,
    views: 156,
    createdAt: '2024-01-19T15:45:00Z',
    status: 'answered'
  },
  {
    id: '3',
    title: '강아지 영양제 급여 시기가 궁금해요',
    content: '6개월 된 강아지인데 언제부터 영양제를 급여하는 게 좋을까요? 필수 영양제가 있다면 추천해주세요.\n\n현재는 사료만 먹이고 있는데, 주변에서 영양제를 먹여야 한다는 말을 들어서 궁금합니다. 어떤 영양제가 필요한지, 언제부터 시작하는 게 좋은지 알려주세요!',
    author: { name: '퍼피맘', level: 'beginner' },
    category: '❤️ 건강',
    categoryEmoji: '❤️',
    votes: 22,
    answerCount: 5,
    views: 312,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
    status: 'answered'
  },
  {
    id: '4',
    title: '강아지 산책 시 다른 강아지와 싸워요',
    content: '1살 된 믹스견을 키우고 있는데, 산책할 때 다른 강아지를 만나면 짖거나 공격적인 행동을 보여요.\n\n사회화가 부족한 것 같은데, 어떻게 훈련해야 할까요? 전문 훈련사에게 맡겨야 할까요?',
    author: { name: '댕댕이집사', level: 'beginner' },
    category: '🎓 훈련 & 행동',
    categoryEmoji: '🎓',
    votes: 12,
    answerCount: 4,
    views: 189,
    createdAt: '2024-01-17T13:20:00Z',
    status: 'answered'
  },
  {
    id: '5',
    title: '고양이 화장실 훈련 방법',
    content: '새로 입양한 3개월 고양이인데, 화장실을 제대로 사용하지 못해요.\n\n모래는 어디에 두는 게 좋고, 어떻게 훈련해야 할까요?',
    author: { name: '고양이초보', level: 'beginner' },
    category: '🎓 훈련 & 행동',
    categoryEmoji: '🎓',
    votes: 18,
    answerCount: 6,
    views: 267,
    createdAt: '2024-01-16T16:10:00Z',
    updatedAt: '2024-01-17T10:45:00Z',
    status: 'answered'
  },
  {
    id: '6',
    title: '강아지 사료 브랜드 추천해주세요',
    content: '골든리트리버 2살을 키우고 있는데, 어떤 사료 브랜드가 좋을까요?\n\n알레르기가 있어서 곡물 없는 사료를 찾고 있어요. 가격대는 중간 정도면 좋겠습니다.',
    author: { name: '골든맘', level: 'experienced' },
    category: '🍖 사료 & 영양',
    categoryEmoji: '🍖',
    votes: 25,
    answerCount: 8,
    views: 445,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    status: 'answered'
  }
] as Question[]

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOption, setSortOption] = useState<SortOption>('recent')
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [questions, setQuestions] = useState<Question[]>(
    mockQuestionsData.map((q) => ({
      ...q,
      isUpvoted: false
    }))
  )
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
      if (!user) return

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
  }) => {
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()

      // Insert question
      const { data: newQuestion, error } = await (supabase
        .from('community_questions') as any)
        .insert({
          title: data.title,
          content: data.content,
          category: data.category,
          author_id: user.id,
          status: 'open',
          votes: 0,
          views: 0,
          admin_status: 'visible'
        })
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
        author: {
          name: profile?.nickname || '사용자',
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
      
      setQuestions([questionForDisplay, ...questions])
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
          onClick={() => setShowQuestionModal(true)}
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
