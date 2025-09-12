'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  User, 
  Calendar, 
  Tag, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Award,
  Flag,
  Reply,
  Send
} from 'lucide-react'

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
  views: number
  answerCount: number
  isAnswered: boolean
  answers: Answer[]
}

interface Answer {
  id: string
  content: string
  author: string
  authorLevel: 'beginner' | 'experienced' | 'expert'
  createdAt: string
  votes: number
  isAccepted: boolean
  replies: Reply[]
}

interface Reply {
  id: string
  content: string
  author: string
  authorLevel: 'beginner' | 'experienced' | 'expert'
  createdAt: string
  votes: number
}

// 목업 데이터
const mockQuestions: Record<string, Question> = {
  '1': {
    id: '1',
    title: '강아지가 사료를 잘 안 먹어요. 어떻게 해야 할까요?',
    content: `3살 골든리트리버인데 최근에 사료를 잘 안 먹습니다. 건강에는 문제가 없어 보이는데 식욕이 떨어진 것 같아요.

평소에는 잘 먹던 아이인데 2주 전부터 갑자기 사료를 남기기 시작했어요. 간식은 잘 먹는데 사료만 안 먹어서 걱정입니다.

혹시 비슷한 경험 있으신 분들 조언 부탁드려요. 병원에 가봐야 할까요?`,
    author: '반려인초보',
    authorLevel: 'beginner',
    category: 'food',
    status: 'answered',
    createdAt: '2024-01-20',
    votes: 15,
    views: 234,
    answerCount: 3,
    isAnswered: true,
    answers: [
      {
        id: 'a1',
        content: `안녕하세요. 수의사입니다.

먼저 건강검진을 받아보시는 것을 권합니다. 갑작스러운 식욕 저하는 여러 원인이 있을 수 있어요:

1. **스트레스**: 환경 변화, 새로운 가족 구성원 등
2. **치아 문제**: 잇몸 염증이나 치석
3. **소화기 문제**: 위장 불편감
4. **사료 자체의 문제**: 상한 사료나 맛의 변화

**임시 해결책:**
- 사료에 따뜻한 물을 조금 부어서 향을 높여보세요
- 평소 좋아하는 토핑을 조금 올려주세요 (삶은 닭가슴살, 단호박 등)
- 사료 그릇을 깨끗이 씻어보세요

그래도 계속 안 먹으면 꼭 병원에 가보세요.`,
        author: '수의사김선생',
        authorLevel: 'expert',
        createdAt: '2024-01-20',
        votes: 12,
        isAccepted: true,
        replies: [
          {
            id: 'r1',
            content: '정말 자세한 답변 감사합니다! 내일 병원 예약하겠어요.',
            author: '반려인초보',
            authorLevel: 'beginner',
            createdAt: '2024-01-20',
            votes: 3
          }
        ]
      },
      {
        id: 'a2',
        content: `저희 아이도 비슷한 경험이 있었어요. 

사료를 바꿔보니까 잘 먹더라구요. 혹시 같은 사료를 오래 먹여서 질린 걸 수도 있어요. 

다른 브랜드로 천천히 바꿔보시는 것도 방법이에요. 단, 갑자기 바꾸면 설사할 수 있으니까 기존 사료와 7:3, 5:5, 3:7 이런 식으로 점진적으로 바꿔주세요.`,
        author: '골든맘5년차',
        authorLevel: 'experienced',
        createdAt: '2024-01-21',
        votes: 8,
        isAccepted: false,
        replies: []
      },
      {
        id: 'a3',
        content: `운동량은 어떠신가요? 운동 부족으로도 식욕이 떨어질 수 있어요.

산책 시간을 늘려보시거나, 집에서 놀아주는 시간을 늘려보세요. 에너지를 충분히 소모하면 배가 고파서 사료도 잘 먹을 거예요.

그리고 사료 주는 시간을 일정하게 맞춰주시는 것도 중요해요.`,
        author: '댕댕이훈련사',
        authorLevel: 'experienced',
        createdAt: '2024-01-21',
        votes: 5,
        isAccepted: false,
        replies: []
      }
    ]
  }
}

const categoryLabels = {
  food: '사료/간식',
  health: '건강/영양',
  behavior: '행동/훈련',
  products: '용품/제품',
  general: '일반'
}

export default function QuestionDetailPage() {
  const params = useParams()
  const questionId = params.questionId as string
  const [question, setQuestion] = useState<Question | null>(null)
  const [newAnswer, setNewAnswer] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // 실제로는 API에서 데이터를 가져옴
    const questionData = mockQuestions[questionId]
    if (questionData) {
      setQuestion(questionData)
      // 조회수 증가 (실제로는 API 호출)
      questionData.views += 1
    }
  }, [questionId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'closed': return <XCircle className="h-5 w-5 text-gray-500" />
      default: return <Clock className="h-5 w-5 text-orange-500" />
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

  const handleVote = async (type: 'question' | 'answer' | 'reply', id: string, direction: 'up' | 'down') => {
    if (!question || isVoting[id]) return

    const voteKey = `${type}-${id}`
    const currentVote = userVotes[voteKey]
    
    // 같은 투표를 다시 누르면 취소
    if (currentVote === direction) {
      return
    }

    setIsVoting(prev => ({ ...prev, [id]: true }))

    // 투표 변경량 계산
    let voteChange = 0
    if (currentVote === null) {
      // 처음 투표
      voteChange = direction === 'up' ? 1 : -1
    } else {
      // 투표 변경 (기존 투표 취소 + 새 투표)
      voteChange = direction === 'up' ? 2 : -2
    }

    // UI 즉시 업데이트
    if (type === 'question') {
      setQuestion({
        ...question,
        votes: question.votes + voteChange
      })
    } else if (type === 'answer') {
      const updatedAnswers = question.answers.map(answer => 
        answer.id === id 
          ? { ...answer, votes: answer.votes + voteChange }
          : answer
      )
      setQuestion({
        ...question,
        answers: updatedAnswers
      })
    } else if (type === 'reply') {
      const updatedAnswers = question.answers.map(answer => ({
        ...answer,
        replies: answer.replies.map(reply =>
          reply.id === id
            ? { ...reply, votes: reply.votes + voteChange }
            : reply
        )
      }))
      setQuestion({
        ...question,
        answers: updatedAnswers
      })
    }

    // 사용자 투표 기록 업데이트
    setUserVotes(prev => ({
      ...prev,
      [voteKey]: direction
    }))

    // 실제로는 여기서 API 호출
    try {
      console.log(`Voting ${direction} for ${type} ${id}`)
      // await api.vote(type, id, direction)
    } catch (error) {
      console.error('투표 실패:', error)
      // 실패 시 롤백
      // ... 롤백 로직
    } finally {
      setIsVoting(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswer.trim() || !question) return

    const answer: Answer = {
      id: `a${Date.now()}`,
      content: newAnswer,
      author: '익명',
      authorLevel: 'beginner',
      createdAt: new Date().toISOString().split('T')[0],
      votes: 0,
      isAccepted: false,
      replies: []
    }

    setQuestion({
      ...question,
      answers: [...question.answers, answer],
      answerCount: question.answerCount + 1
    })
    setNewAnswer('')
  }

  const handleReplySubmit = (answerId: string) => {
    if (!replyContent.trim() || !question) return

    const reply: Reply = {
      id: `r${Date.now()}`,
      content: replyContent,
      author: '익명',
      authorLevel: 'beginner',
      createdAt: new Date().toISOString().split('T')[0],
      votes: 0
    }

    const updatedAnswers = question.answers.map(answer => 
      answer.id === answerId 
        ? { ...answer, replies: [...answer.replies, reply] }
        : answer
    )

    setQuestion({
      ...question,
      answers: updatedAnswers
    })
    setReplyContent('')
    setReplyingTo(null)
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">질문을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 질문이 존재하지 않거나 삭제되었습니다.</p>
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/community/qa-forum" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getStatusIcon(question.status)}
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {categoryLabels[question.category as keyof typeof categoryLabels]}
                </span>
                <span className="text-xs text-gray-500">
                  조회 {question.views}회
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {question.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question */}
        <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-gray-400" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{question.author}</span>
                  {getAuthorBadge(question.authorLevel)}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{question.createdAt}</span>
                </div>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <Flag className="h-4 w-4" />
            </button>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-line">{question.content}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handleVote('question', question.id, 'up')}
                  disabled={isVoting[question.id]}
                  className={`p-1 transition-colors ${
                    userVotes[`question-${question.id}`] === 'up'
                      ? 'text-green-500'
                      : 'text-gray-400 hover:text-green-500'
                  } ${isVoting[question.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600 font-medium">{question.votes}</span>
                <button 
                  onClick={() => handleVote('question', question.id, 'down')}
                  disabled={isVoting[question.id]}
                  className={`p-1 transition-colors ${
                    userVotes[`question-${question.id}`] === 'down'
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-red-500'
                  } ${isVoting[question.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{question.answerCount}개 답변</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            {question.answerCount}개의 답변
          </h2>

          {question.answers.map(answer => (
            <div key={answer.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${answer.isAccepted ? 'ring-2 ring-green-500' : ''}`}>
              {answer.isAccepted && (
                <div className="flex items-center space-x-2 mb-4 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">채택된 답변</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{answer.author}</span>
                      {getAuthorBadge(answer.authorLevel)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{answer.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 whitespace-pre-line">{answer.content}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleVote('answer', answer.id, 'up')}
                      disabled={isVoting[answer.id]}
                      className={`p-1 transition-colors ${
                        userVotes[`answer-${answer.id}`] === 'up'
                          ? 'text-green-500'
                          : 'text-gray-400 hover:text-green-500'
                      } ${isVoting[answer.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-600 font-medium">{answer.votes}</span>
                    <button 
                      onClick={() => handleVote('answer', answer.id, 'down')}
                      disabled={isVoting[answer.id]}
                      className={`p-1 transition-colors ${
                        userVotes[`answer-${answer.id}`] === 'down'
                          ? 'text-red-500'
                          : 'text-gray-400 hover:text-red-500'
                      } ${isVoting[answer.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setReplyingTo(answer.id)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  <span>답글</span>
                </button>
              </div>

              {/* Replies */}
              {answer.replies.length > 0 && (
                <div className="mt-6 pl-6 border-l-2 border-gray-100 space-y-4">
                  {answer.replies.map(reply => (
                    <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-6 w-6 text-gray-400" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                              {getAuthorBadge(reply.authorLevel)}
                            </div>
                            <span className="text-xs text-gray-500">{reply.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{reply.content}</p>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleVote('reply', reply.id, 'up')}
                          disabled={isVoting[reply.id]}
                          className={`p-1 transition-colors ${
                            userVotes[`reply-${reply.id}`] === 'up'
                              ? 'text-green-500'
                              : 'text-gray-400 hover:text-green-500'
                          } ${isVoting[reply.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-gray-600 font-medium">{reply.votes}</span>
                        <button 
                          onClick={() => handleVote('reply', reply.id, 'down')}
                          disabled={isVoting[reply.id]}
                          className={`p-1 transition-colors ${
                            userVotes[`reply-${reply.id}`] === 'down'
                              ? 'text-red-500'
                              : 'text-gray-400 hover:text-red-500'
                          } ${isVoting[reply.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === answer.id && (
                <div className="mt-4 pl-6 border-l-2 border-blue-200">
                  <div className="flex space-x-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="답글을 작성해주세요..."
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleReplySubmit(answer.id)}
                      disabled={!replyContent.trim()}
                      className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      답글 작성
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">답변 작성하기</h3>
          <form onSubmit={handleAnswerSubmit}>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="도움이 되는 답변을 작성해주세요..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!newAnswer.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>답변 등록</span>
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  )
}
