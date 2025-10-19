'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MessageSquare, 
  FileText, 
  Eye, 
  ThumbsUp, 
  MessageCircle,
  Trash2, 
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Award,
  User,
  Calendar,
  Tag
} from 'lucide-react'

// Q&A 포럼 인터페이스
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
  views: number
  reports: number
}

// 펫 로그 포스트 인터페이스
interface PetLogPost {
  id: string
  petName: string
  petBreed: string
  ownerName: string
  ownerId: string
  createdAt: string
  totalRecords: number
  views: number
  likes: number
  comments: number
  reports: number
  status: 'active' | 'hidden' | 'reported'
}

export default function CommunityAdminPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'petlogs'>('questions')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  
  // Mock data - 실제로는 API에서 가져와야 함
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q1',
      title: '강아지가 사료를 잘 안 먹어요',
      content: '3개월 된 골든 리트리버인데 갑자기 사료를 거부합니다...',
      author: '김집사',
      authorLevel: 'beginner',
      category: 'food',
      status: 'answered',
      createdAt: '2024-10-18',
      votes: 12,
      answerCount: 5,
      views: 234,
      reports: 0
    },
    {
      id: 'q2',
      title: '고양이 건강검진 주기는?',
      content: '1년에 한 번이면 충분한가요?',
      author: '박집사',
      authorLevel: 'experienced',
      category: 'health',
      status: 'open',
      createdAt: '2024-10-19',
      votes: 8,
      answerCount: 3,
      views: 156,
      reports: 0
    },
    {
      id: 'q3',
      title: '이 사료 안전한가요?',
      content: '중국산이라는데 먹여도 될까요?',
      author: '신고자',
      authorLevel: 'beginner',
      category: 'food',
      status: 'open',
      createdAt: '2024-10-19',
      votes: -3,
      answerCount: 12,
      views: 523,
      reports: 5
    }
  ])

  const [petLogs, setPetLogs] = useState<PetLogPost[]>([
    {
      id: 'post-1',
      petName: '뽀미',
      petBreed: '골든 리트리버',
      ownerName: '김집사',
      ownerId: 'owner-1',
      createdAt: '2024-10-15',
      totalRecords: 9,
      views: 1234,
      likes: 45,
      comments: 12,
      reports: 0,
      status: 'active'
    },
    {
      id: 'post-2',
      petName: '나비',
      petBreed: '샴 고양이',
      ownerName: '이집사',
      ownerId: 'owner-2',
      createdAt: '2024-10-16',
      totalRecords: 5,
      views: 876,
      likes: 32,
      comments: 8,
      reports: 0,
      status: 'active'
    },
    {
      id: 'post-3',
      petName: '부적절포스트',
      petBreed: '믹스',
      ownerName: '스팸러',
      ownerId: 'owner-3',
      createdAt: '2024-10-19',
      totalRecords: 1,
      views: 42,
      likes: 0,
      comments: 0,
      reports: 8,
      status: 'reported'
    }
  ])

  useEffect(() => {
    // 실제로는 API 호출
    setTimeout(() => setLoading(false), 500)
  }, [])

  const getStats = () => {
    const totalQuestions = questions.length
    const openQuestions = questions.filter(q => q.status === 'open').length
    const reportedQuestions = questions.filter(q => q.reports > 0).length
    
    const totalPetLogs = petLogs.length
    const activePetLogs = petLogs.filter(p => p.status === 'active').length
    const reportedPetLogs = petLogs.filter(p => p.reports > 0).length
    
    return {
      totalQuestions,
      openQuestions,
      reportedQuestions,
      totalPetLogs,
      activePetLogs,
      reportedPetLogs,
      totalContent: totalQuestions + totalPetLogs,
      totalReports: reportedQuestions + reportedPetLogs
    }
  }

  const stats = getStats()

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      setQuestions(questions.filter(q => q.id !== questionId))
      alert('질문이 삭제되었습니다.')
    }
  }

  const handleDeletePetLog = (postId: string) => {
    if (confirm('정말로 이 펫 로그를 삭제하시겠습니까?')) {
      setPetLogs(petLogs.filter(p => p.id !== postId))
      alert('펫 로그가 삭제되었습니다.')
    }
  }

  const handleHidePetLog = (postId: string) => {
    setPetLogs(petLogs.map(p => 
      p.id === postId ? { ...p, status: 'hidden' as const } : p
    ))
    alert('펫 로그가 숨김 처리되었습니다.')
  }

  const handleCloseQuestion = (questionId: string) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, status: 'closed' as const } : q
    ))
    alert('질문이 종료되었습니다.')
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'reported' && q.reports > 0) ||
                          (filterStatus === 'open' && q.status === 'open')
    return matchesSearch && matchesFilter
  })

  const filteredPetLogs = petLogs.filter(p => {
    const matchesSearch = p.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'reported' && p.reports > 0) ||
                          (filterStatus === 'active' && p.status === 'active')
    return matchesSearch && matchesFilter
  })

  const getCategoryBadge = (category: string) => {
    const badges = {
      food: { text: '사료/급여', color: 'bg-blue-100 text-blue-700' },
      health: { text: '건강', color: 'bg-green-100 text-green-700' },
      behavior: { text: '행동', color: 'bg-purple-100 text-purple-700' },
      products: { text: '제품', color: 'bg-yellow-100 text-yellow-700' },
      general: { text: '일반', color: 'bg-gray-100 text-gray-700' }
    }
    const badge = badges[category as keyof typeof badges] || badges.general
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { icon: Clock, text: '답변 대기', color: 'bg-yellow-100 text-yellow-700' },
      answered: { icon: MessageSquare, text: '답변 완료', color: 'bg-blue-100 text-blue-700' },
      closed: { icon: CheckCircle, text: '해결됨', color: 'bg-green-100 text-green-700' },
      active: { icon: CheckCircle, text: '활성', color: 'bg-green-100 text-green-700' },
      hidden: { icon: XCircle, text: '숨김', color: 'bg-gray-100 text-gray-700' },
      reported: { icon: Flag, text: '신고됨', color: 'bg-red-100 text-red-700' }
    }
    const badge = badges[status as keyof typeof badges] || badges.open
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            관리자 패널로 돌아가기
          </Link>
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">커뮤니티 관리</h1>
              <p className="text-gray-600">Q&A 포럼 및 펫 로그 게시물 관리</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 콘텐츠</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">답변 대기</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.openQuestions}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">신고 콘텐츠</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalReports}</p>
                </div>
                <Flag className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 펫 로그</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activePetLogs}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Q&A 포럼</span>
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-600">
                    {questions.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('petlogs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'petlogs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>펫 로그</span>
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-purple-100 text-purple-600">
                    {petLogs.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'questions' ? '질문 검색...' : '펫 로그 검색...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="reported">신고됨</option>
            {activeTab === 'questions' ? (
              <option value="open">답변 대기</option>
            ) : (
              <option value="active">활성</option>
            )}
          </select>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === 'questions' ? (
            <div className="divide-y divide-gray-200">
              {filteredQuestions.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">질문이 없습니다</p>
                </div>
              ) : (
                filteredQuestions.map((question) => (
                  <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCategoryBadge(question.category)}
                          {getStatusBadge(question.status)}
                          {question.reports > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <Flag className="h-3 w-3 mr-1" />
                              신고 {question.reports}건
                            </span>
                          )}
                        </div>
                        
                        <Link 
                          href={`/community/qa-forum/${question.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 block mb-2"
                        >
                          {question.title}
                        </Link>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{question.content}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{question.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{question.createdAt}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{question.votes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{question.answerCount}개 답변</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{question.views}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {question.status === 'open' && (
                          <button
                            onClick={() => handleCloseQuestion(question.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="종료"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPetLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">펫 로그가 없습니다</p>
                </div>
              ) : (
                filteredPetLogs.map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusBadge(post.status)}
                          {post.reports > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <Flag className="h-3 w-3 mr-1" />
                              신고 {post.reports}건
                            </span>
                          )}
                        </div>
                        
                        <Link 
                          href={`/pet-log/posts/${post.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 block mb-2"
                        >
                          {post.petName}의 급여 일지 ({post.petBreed})
                        </Link>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{post.ownerName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{post.createdAt}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{post.totalRecords}개 기록</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views.toLocaleString()}회</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments}개 댓글</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {post.status === 'active' && (
                          <button
                            onClick={() => handleHidePetLog(post.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="숨김"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePetLog(post.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">커뮤니티 관리 가이드</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• <strong>신고 콘텐츠</strong>: 신고가 3건 이상인 콘텐츠는 우선 검토가 필요합니다.</li>
                <li>• <strong>답변 대기</strong>: 24시간 이상 답변이 없는 질문은 관리자가 답변을 달아주세요.</li>
                <li>• <strong>부적절한 콘텐츠</strong>: 스팸, 욕설, 광고 등은 즉시 삭제해주세요.</li>
                <li>• <strong>활성 펫 로그</strong>: 좋은 콘텐츠는 메인 페이지에 노출시킬 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

