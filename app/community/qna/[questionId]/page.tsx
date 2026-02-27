'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Bookmark, 
  Crown, 
  ThumbsUp, 
  MessageCircle, 
  Calendar,
  User,
  Eye,
  AlertTriangle,
  Send
} from 'lucide-react'

interface PetProfile {
  id: string
  name: string
  species: string
  breed: string
  age: number
  weight: number
  allergies?: string[]
}

interface Question {
  id: string
  title: string
  content: string
  category: string[]
  authorId: string
  authorName: string
  authorLevel: string
  authorAvatar: string
  petProfile?: PetProfile
  media?: string[]
  createdAt: string
  viewCount: number
  likeCount: number
  answerCount: number
  bountyPoints?: number
  isResolved: boolean
  hasEmergencyKeywords: boolean
}

interface Answer {
  id: string
  questionId: string
  content: string
  authorId: string
  authorName: string
  authorLevel: string
  authorAvatar: string
  createdAt: string
  likeCount: number
  commentCount: number
  isAccepted: boolean
  comments: Comment[]
}

interface Comment {
  id: string
  answerId: string
  content: string
  authorName: string
  authorAvatar: string
  createdAt: string
}

const CATEGORIES = {
  'health': { label: '건강/질병', color: 'bg-red-100 text-red-800' },
  'food': { label: '사료/영양', color: 'bg-green-100 text-green-800' },
  'behavior': { label: '행동/훈련', color: 'bg-blue-100 text-blue-800' },
  'grooming': { label: '미용/위생', color: 'bg-purple-100 text-purple-800' },
  'products': { label: '용품 추천', color: 'bg-yellow-100 text-yellow-800' },
  'daily': { label: '일상/잡담', color: 'bg-gray-100 text-gray-800' }
}

const EMERGENCY_KEYWORDS = ['초콜릿', '양파', '쓰러졌', '호흡곤란', '경련', '토혈', '혈변', '의식잃음']

interface SimilarQuestion {
  id: string
  title: string
  answerCount: number
  isResolved: boolean
}

export default function QnaDetailPage({ params }: { params: { questionId: string } }) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [newAnswer, setNewAnswer] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>([])
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchQuestionData()
    // 임시로 로그인 상태 설정
    setIsLoggedIn(true)
    setCurrentUser('user123')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.questionId])

  const fetchQuestionData = async () => {
    setLoading(true)
    
    // 임시 데이터 - 실제로는 API에서 가져옴
    const mockQuestion: Question = {
      id: params.questionId,
      title: '우리 아이가 갑자기 다리를 절어요 ㅠㅠ 어떻게 해야 할까요?',
      content: `안녕하세요. 3살 푸들 키우고 있는 초보 집사입니다.
      
어제까지 멀쩡했는데 오늘 아침부터 갑자기 앞다리를 절뚝거리면서 걸어요. 
만져보니까 아픈 건지 킁킁거리면서 피하려고 하네요.

병원에 가야 하는 건지, 며칠 더 지켜봐도 되는 건지 궁금합니다.
혹시 비슷한 경험 있으신 분 계시면 조언 부탁드려요 🙏`,
      category: ['health'],
      authorId: 'user456',
      authorName: '푸들맘',
      authorLevel: '새싹 집사 🌱',
      authorAvatar: '/api/placeholder/40/40',
      petProfile: {
        id: 'pet123',
        name: '코코',
        species: '강아지',
        breed: '푸들',
        age: 3,
        weight: 5.2,
        allergies: ['닭고기']
      },
      media: ['/api/placeholder/400/300'],
      createdAt: '2024-12-20T09:30:00Z',
      viewCount: 127,
      likeCount: 8,
      answerCount: 3,
      bountyPoints: 50,
      isResolved: false,
      hasEmergencyKeywords: false
    }

    const mockAnswers: Answer[] = [
      {
        id: 'answer1',
        questionId: params.questionId,
        content: `안녕하세요! 수의사입니다.

다리를 절뚝거리는 증상은 여러 원인이 있을 수 있어요:
1. 근육 염좌나 타박상
2. 관절 문제 
3. 발가락 사이 상처나 이물질
4. 관절염 초기 증상

**즉시 병원 방문을 권합니다.** 특히 통증으로 인해 만지는 것을 피한다면 심각할 수 있어요.
응급처치로는 절대 무리하게 움직이지 말게 하시고, 따뜻한 곳에서 안정을 취하게 해주세요.`,
        authorId: 'vet001',
        authorName: '김수의사',
        authorLevel: '전문가 👨‍⚕️',
        authorAvatar: '/api/placeholder/40/40',
        createdAt: '2024-12-20T10:15:00Z',
        likeCount: 15,
        commentCount: 2,
        isAccepted: true,
        comments: [
          {
            id: 'comment1',
            answerId: 'answer1',
            content: '정말 도움이 되는 답변이에요! 감사합니다',
            authorName: '푸들맘',
            authorAvatar: '/api/placeholder/40/40',
            createdAt: '2024-12-20T10:30:00Z'
          }
        ]
      },
      {
        id: 'answer2',
        questionId: params.questionId,
        content: `저희 아이도 비슷한 경험이 있어요. 
        
산책 중에 발가락 사이에 작은 돌멩이가 끼어서 그랬던 적이 있거든요.
발가락 사이사이, 발톱 주변을 자세히 살펴보세요!

하지만 수의사님 말씀처럼 병원 가는 게 가장 확실해요.`,
        authorId: 'user789',
        authorName: '골든맘',
        authorLevel: '숙련 집사 ⭐',
        authorAvatar: '/api/placeholder/40/40',
        createdAt: '2024-12-20T11:00:00Z',
        likeCount: 7,
        commentCount: 0,
        isAccepted: false,
        comments: []
      }
    ]

    setQuestion(mockQuestion)
    setAnswers(mockAnswers)
    
    // 유사 질문 데이터
    const mockSimilarQuestions: SimilarQuestion[] = [
      {
        id: 'q1',
        title: '강아지가 다리를 들고 걸어요, 병원 가야 하나요?',
        answerCount: 5,
        isResolved: true
      },
      {
        id: 'q2', 
        title: '우리 아이 발톱이 부러졌어요 ㅠㅠ',
        answerCount: 3,
        isResolved: true
      },
      {
        id: 'q3',
        title: '산책 후 다리 절뚝거림, 어떻게 해야 할까요?',
        answerCount: 7,
        isResolved: false
      }
    ]
    
    setSimilarQuestions(mockSimilarQuestions)
    setLoading(false)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    if (question) {
      setQuestion({
        ...question,
        likeCount: isLiked ? question.likeCount - 1 : question.likeCount + 1
      })
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleAnswerLike = (answerId: string) => {
    setAnswers(answers.map(answer => 
      answer.id === answerId 
        ? { ...answer, likeCount: answer.likeCount + 1 }
        : answer
    ))
  }

  const handleAcceptAnswer = (answerId: string) => {
    if (question?.authorId === currentUser) {
      setAnswers(answers.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId
      })))
      
      if (question) {
        setQuestion({ ...question, isResolved: true })
      }
    }
  }

  const handleSubmitAnswer = () => {
    if (!newAnswer.trim() || !isLoggedIn) return

    const newAnswerObj: Answer = {
      id: `answer_${Date.now()}`,
      questionId: params.questionId,
      content: newAnswer,
      authorId: currentUser,
      authorName: '나의닉네임',
      authorLevel: '새싹 집사 🌱',
      authorAvatar: '/api/placeholder/40/40',
      createdAt: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      isAccepted: false,
      comments: []
    }

    setAnswers([...answers, newAnswerObj])
    setNewAnswer('')
    
    if (question) {
      setQuestion({ ...question, answerCount: question.answerCount + 1 })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return '방금 전'
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const checkEmergencyKeywords = (content: string) => {
    return EMERGENCY_KEYWORDS.some(keyword => content.includes(keyword))
  }

  const handleCommentSubmit = (answerId: string) => {
    if (!newComment.trim() || !isLoggedIn) return

    const newCommentObj: Comment = {
      id: `comment_${Date.now()}`,
      answerId: answerId,
      content: newComment,
      authorName: '나의닉네임',
      authorAvatar: '/api/placeholder/40/40',
      createdAt: new Date().toISOString()
    }

    setAnswers(answers.map(answer => 
      answer.id === answerId 
        ? { 
            ...answer, 
            comments: [...answer.comments, newCommentObj],
            commentCount: answer.commentCount + 1
          }
        : answer
    ))

    setNewComment('')
    setShowCommentForm(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">질문을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 질문이 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/community/qna" className="text-orange-600 hover:text-orange-700">
            Q&A 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const acceptedAnswer = answers.find(answer => answer.isAccepted)
  const otherAnswers = answers.filter(answer => !answer.isAccepted).sort((a, b) => b.likeCount - a.likeCount)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Warning */}
        {checkEmergencyKeywords(question.content) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">긴급 상황 경고</h3>
                <p className="text-sm text-red-700">
                  응급 상황일 수 있습니다. 즉시 가까운 동물병원에 연락하세요!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            {/* Question Status & Category */}
            <div className="flex items-center gap-2 mb-4">
              {question.isResolved ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  채택 완료 ✅
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  답변 대기중
                </span>
              )}
              
              {question.category.map(cat => (
                <span key={cat} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORIES[cat as keyof typeof CATEGORIES]?.color || 'bg-gray-100 text-gray-800'}`}>
                  {CATEGORIES[cat as keyof typeof CATEGORIES]?.label || cat}
                </span>
              ))}

              {question.bountyPoints && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  현상금 {question.bountyPoints}P
                </span>
              )}
            </div>

            {/* Question Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Image src={question.authorAvatar} alt={question.authorName} width={40} height={40} className="rounded-full" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{question.authorName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(question.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      조회 {question.viewCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{question.likeCount}</span>
                </button>
                
                <button
                  onClick={handleBookmark}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isBookmarked 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>스크랩</span>
                </button>
                
                <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>공유</span>
                </button>
              </div>
            </div>

            {/* Pet Profile */}
            {question.petProfile && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-orange-900 mb-2">반려동물 정보</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {question.petProfile.name}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {question.petProfile.breed}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {question.petProfile.age}살
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {question.petProfile.weight}kg
                  </span>
                  {question.petProfile.allergies && question.petProfile.allergies.map(allergy => (
                    <span key={allergy} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      알러지: {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Question Content */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {question.content}
              </div>
            </div>

            {/* Question Media */}
            {question.media && question.media.length > 0 && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.media.map((media, index) => (
                    <Image 
                      key={index}
                      src={media} 
                      alt={`첨부 이미지 ${index + 1}`}
                      width={400}
                      height={256}
                      className="rounded-lg border border-gray-200 w-full h-64 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              답변 {question.answerCount}개
            </h2>
            <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
              <option value="recommended">추천순</option>
              <option value="latest">최신순</option>
              <option value="oldest">등록순</option>
            </select>
          </div>

          {/* Accepted Answer */}
          {acceptedAnswer && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Crown className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">채택된 답변</span>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Image src={acceptedAnswer.authorAvatar} alt={acceptedAnswer.authorName} width={40} height={40} className="rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{acceptedAnswer.authorName}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatDate(acceptedAnswer.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="prose max-w-none mb-4">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {acceptedAnswer.content}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleAnswerLike(acceptedAnswer.id)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>도움돼요 {acceptedAnswer.likeCount}</span>
                      </button>
                      
                      <button 
                        onClick={() => setShowCommentForm(showCommentForm === acceptedAnswer.id ? null : acceptedAnswer.id)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>댓글 {acceptedAnswer.commentCount}</span>
                      </button>
                    </div>

                    {/* Comments */}
                    {acceptedAnswer.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {acceptedAnswer.comments.map(comment => (
                          <div key={comment.id} className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex items-start space-x-3">
                              <Image src={comment.authorAvatar} alt={comment.authorName} width={24} height={24} className="rounded-full flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Form */}
                    {showCommentForm === acceptedAnswer.id && isLoggedIn && (
                      <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
                        <div className="space-y-3">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 작성해주세요..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                          />
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setShowCommentForm(null)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleCommentSubmit(acceptedAnswer.id)}
                              disabled={!newComment.trim()}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              댓글 등록
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Answers */}
          {otherAnswers.map(answer => (
            <div key={answer.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <Image src={answer.authorAvatar} alt={answer.authorName} width={40} height={40} className="rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{answer.authorName}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatDate(answer.createdAt)}</span>
                      </div>
                      
                      {question.authorId === currentUser && !question.isResolved && (
                        <button
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          채택하기
                        </button>
                      )}
                    </div>
                    
                    <div className="prose max-w-none mb-4">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {answer.content}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleAnswerLike(answer.id)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>도움돼요 {answer.likeCount}</span>
                      </button>
                      
                      <button 
                        onClick={() => setShowCommentForm(showCommentForm === answer.id ? null : answer.id)}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>댓글 {answer.commentCount}</span>
                      </button>
                    </div>

                    {/* Comments for regular answers */}
                    {answer.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {answer.comments.map(comment => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <Image src={comment.authorAvatar} alt={comment.authorName} width={24} height={24} className="rounded-full flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                                  <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Form for regular answers */}
                    {showCommentForm === answer.id && isLoggedIn && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="space-y-3">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 작성해주세요..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                          />
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setShowCommentForm(null)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleCommentSubmit(answer.id)}
                              disabled={!newComment.trim()}
                              className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              댓글 등록
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {answers.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 답변이 없습니다</h3>
              <p className="text-gray-600">첫 번째 답변을 작성해보세요!</p>
            </div>
          )}
        </div>

        {/* Similar Questions */}
        {similarQuestions.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-orange-600" />
                비슷한 질문들
              </h3>
              <div className="space-y-3">
                {similarQuestions.map(similarQ => (
                  <Link
                    key={similarQ.id}
                    href={`/community/qna/${similarQ.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors">
                          {similarQ.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">답변 {similarQ.answerCount}개</span>
                          {similarQ.isResolved && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              해결됨
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Answer Form */}
        <div className="mt-8">
          {isLoggedIn ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">답변 작성</h3>
              <div className="space-y-4">
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="도움이 되는 답변을 작성해주세요..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    정확하고 도움이 되는 답변을 작성해주세요. 채택될 경우 포인트를 받을 수 있습니다.
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!newAnswer.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>답변 등록</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">답변을 작성하려면 로그인이 필요합니다</h3>
              <p className="text-gray-600 mb-4">로그인하고 다른 집사들을 도와주세요!</p>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                로그인하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}