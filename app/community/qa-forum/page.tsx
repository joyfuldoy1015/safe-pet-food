'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, MessageSquare, Plus, ThumbsUp, ThumbsDown, CheckCircle, Clock, XCircle, User, Award, ArrowLeft } from 'lucide-react'

interface Question {
  id: string
  title: string
  content: string
  author: string
  authorLevel: 'beginner' | 'experienced' | 'expert'
  category: 'food' | 'health' | 'behavior' | 'products' | 'general'
  status: 'open' | 'answered' | 'closed'
  createdAt: string
  votes: number
  answerCount: number
  isAnswered: boolean
  answers?: Answer[]
}

interface Answer {
  id: string
  content: string
  author: string
  authorLevel: 'beginner' | 'experienced' | 'expert'
  createdAt: string
  votes: number
  isAccepted: boolean
}

const mockQuestions: Question[] = [
  {
    id: '1',
    title: '강아지가 사료를 잘 안 먹어요. 어떻게 해야 할까요?',
    content: '3살 골든리트리버인데 최근에 사료를 잘 안 먹습니다. 건강에는 문제가 없어 보이는데 식욕이 떨어진 것 같아요.',
    author: '반려인초보',
    authorLevel: 'beginner',
    category: 'food',
    status: 'answered',
    createdAt: '2024-01-20',
    votes: 15,
    answerCount: 3,
    isAnswered: true,
    answers: [
      {
        id: 'a1',
        content: '사료를 바꿔보시거나 토핑을 조금 올려주시는 것도 좋은 방법입니다. 건강검진도 받아보세요.',
        author: '수의사김선생',
        authorLevel: 'expert',
        createdAt: '2024-01-20',
        votes: 12,
        isAccepted: true
      }
    ]
  },
  {
    id: '2',
    title: '고양이 모래 추천 부탁드립니다',
    content: '털 빠짐이 심한 장모종 고양이를 키우고 있는데, 모래가 털에 잘 붙지 않는 제품이 있을까요?',
    author: '냥집사5년차',
    authorLevel: 'experienced',
    category: 'products',
    status: 'open',
    createdAt: '2024-01-19',
    votes: 8,
    answerCount: 2,
    isAnswered: false
  },
  {
    id: '3',
    title: '강아지 영양제 급여 시기가 궁금해요',
    content: '6개월 된 강아지인데 언제부터 영양제를 급여하는 게 좋을까요? 필수 영양제가 있다면 추천해주세요.',
    author: '퍼피맘',
    authorLevel: 'beginner',
    category: 'health',
    status: 'answered',
    createdAt: '2024-01-18',
    votes: 22,
    answerCount: 5,
    isAnswered: true
  }
]

const categoryLabels = {
  all: '전체',
  food: '사료/간식',
  health: '건강/영양',
  behavior: '행동/훈련',
  products: '용품/제품',
  general: '일반'
}

const statusLabels = {
  all: '전체',
  open: '답변 대기',
  answered: '답변 완료',
  closed: '해결됨'
}

export default function CommunityQAForumPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)
  
  // 로그인 상태 관리 (실제 배포 시에는 NextAuth.js, 세션, 또는 인증 컨텍스트에서 가져와야 함)
  // 예: const { data: session } = useSession() 또는 const { user } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || question.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const sortedQuestions = filteredQuestions.sort((a, b) => {
    // 최신순으로 정렬
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleQuestionSubmit = (questionData: any) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      title: questionData.title,
      content: questionData.content,
      author: '익명',
      authorLevel: 'beginner',
      category: questionData.category,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      votes: 0,
      answerCount: 0,
      isAnswered: false
    }
    
    setQuestions([newQuestion, ...questions])
    setShowQuestionModal(false)
  }

  const handleVote = (questionId: string, direction: 'up' | 'down') => {
    const voteChange = direction === 'up' ? 1 : -1
    
    setQuestions(questions.map(question =>
      question.id === questionId
        ? { ...question, votes: question.votes + voteChange }
        : question
    ))

    // 실제로는 여기서 API 호출
    console.log(`Voting ${direction} for question ${questionId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-orange-500" />
    }
  }

  const getAuthorBadge = (level: string) => {
    const badges = {
      beginner: { label: '새싹', color: 'bg-green-100 text-green-800' },
      experienced: { label: '경험자', color: 'bg-blue-100 text-blue-800' },
      expert: { label: '전문가', color: 'bg-purple-100 text-purple-800' }
    }
    const badge = badges[level as keyof typeof badges]
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Q&A 포럼 💬</h1>
              <p className="text-lg text-gray-600 mt-2">
                반려동물에 대한 궁금한 점을 질문하고, 경험을 나눠보세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="질문 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (isLoggedIn) {
                    setShowQuestionModal(true)
                  } else {
                    setShowLoginModal(true)
                  }
                }}
                className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>질문하기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-6">
          {sortedQuestions.length > 0 ? (
            sortedQuestions.map(question => (
              <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(question.status)}
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {categoryLabels[question.category as keyof typeof categoryLabels]}
                      </span>
                    </div>
                    <Link 
                      href={`/community/qa-forum/${question.id}`}
                      className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer block"
                    >
                      {question.title}
                    </Link>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {question.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{question.author}</span>
                      {getAuthorBadge(question.authorLevel)}
                    </div>
                    <span className="text-sm text-gray-500">{question.createdAt}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleVote(question.id, 'up')
                        }}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-600">{question.votes}</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleVote(question.id, 'down')
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{question.answerCount}</span>
                    </div>
                  </div>
                </div>

                {/* Answers Preview */}
                {question.answers && question.answers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-green-800">
                              {question.answers[0].author}
                            </span>
                            {getAuthorBadge(question.answers[0].authorLevel)}
                            <span className="text-xs text-green-600">채택된 답변</span>
                          </div>
                          <p className="text-sm text-green-700 line-clamp-2">
                            {question.answers[0].content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">검색 결과가 없습니다.</p>
              <p className="text-sm mt-1">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          )}
        </div>

        {/* Question Modal */}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">새 질문 작성</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                handleQuestionSubmit({
                  title: formData.get('title'),
                  content: formData.get('content'),
                  category: formData.get('category')
                })
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="질문의 제목을 입력해주세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <select
                      name="category"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">카테고리를 선택해주세요</option>
                      <option value="food">사료/간식</option>
                      <option value="health">건강/영양</option>
                      <option value="behavior">행동/훈련</option>
                      <option value="products">용품/제품</option>
                      <option value="general">일반</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                    <textarea
                      name="content"
                      required
                      rows={6}
                      placeholder="구체적인 상황과 궁금한 점을 자세히 설명해주세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    질문 등록
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Login Required Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  로그인이 필요합니다
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  질문을 작성하려면 먼저 로그인해주세요.<br />
                  로그인 후에 다양한 기능을 이용할 수 있습니다.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    로그인하기
                  </Link>
                  
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  아직 계정이 없으신가요? 
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 ml-1">
                    회원가입
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
