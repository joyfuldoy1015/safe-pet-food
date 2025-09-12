'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Tag,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  author: {
    name: string
    avatar?: string
    bio?: string
  }
  publishedAt: string
  updatedAt?: string
  category: string
  tags: string[]
  featuredImage?: string
  viewCount: number
  likeCount: number
  commentCount: number
  readingTime: number
  relatedPosts?: BlogPost[]
}

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
  likes: number
  replies?: Comment[]
}

export default function BlogPostPage({ params }: { params: { postId: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        
        // 임시 데이터 (실제로는 API에서 가져와야 함)
        const mockPost: BlogPost = {
          id: params.postId,
          title: "반려동물 영양 관리의 기초: 건강한 식단 만들기",
          content: `
# 반려동물 영양 관리의 기초

반려동물의 건강한 삶을 위해서는 적절한 영양 관리가 필수입니다. 오늘은 반려동물 영양 관리의 기본 원칙과 실천 방법에 대해 알아보겠습니다.

## 1. 기본 영양소의 이해

### 단백질
- 근육과 조직 발달에 필수
- 고품질 동물성 단백질 권장
- 성장기, 임신기에는 더 많은 단백질 필요

### 지방
- 에너지 공급원
- 필수 지방산 제공
- 털과 피부 건강에 중요

### 탄수화물
- 에너지 공급
- 소화 가능한 형태로 제공
- 과도한 섭취 주의

### 비타민과 미네랄
- 신체 기능 조절
- 면역력 강화
- 균형 잡힌 섭취 중요

## 2. 연령별 영양 관리

### 성장기 (생후 12개월까지)
- 높은 칼로리와 단백질 필요
- 하루 3-4회 소량씩 급여
- 성장용 사료 선택

### 성체기 (1-7세)
- 적정 체중 유지가 목표
- 하루 2회 정시 급여
- 활동량에 따른 칼로리 조절

### 노령기 (7세 이상)
- 소화하기 쉬운 사료
- 관절 건강 고려
- 정기적인 건강 검진

## 3. 올바른 급여 방법

### 정량 급여
- 체중에 맞는 적정량 계산
- 사료 포장지의 가이드 참고
- 개체별 차이 고려

### 급여 시간
- 일정한 시간에 급여
- 식사 후 충분한 휴식
- 운동 전후 급여 시간 조절

### 물 공급
- 신선한 물 항상 제공
- 하루 체중 1kg당 50-60ml
- 여름철에는 더 많은 수분 필요

## 4. 피해야 할 음식들

반려동물에게 해로운 음식들을 반드시 피해야 합니다:

- 초콜릿, 카페인
- 양파, 마늘
- 포도, 건포도
- 아보카도
- 자일리톨 함유 제품

## 5. 건강한 간식 선택

### 자연 간식
- 삶은 닭가슴살
- 당근, 사과 (소량)
- 플레인 요거트

### 시판 간식
- 첨가물이 적은 제품
- 원재료 확인
- 하루 칼로리의 10% 이내

## 결론

반려동물의 영양 관리는 사랑의 표현입니다. 올바른 지식을 바탕으로 우리 반려동물이 건강하고 행복한 삶을 살 수 있도록 도와주세요.

정기적인 수의사 상담을 통해 개별 맞춤형 영양 계획을 세우는 것도 중요합니다.
          `,
          excerpt: "반려동물의 건강한 삶을 위한 영양 관리 기본 원칙과 실천 방법을 알아봅니다.",
          author: {
            name: "김수의사",
            bio: "10년 경력의 소동물 전문 수의사"
          },
          publishedAt: "2024-01-15T10:00:00Z",
          category: "영양/사료",
          tags: ["영양관리", "사료", "건강", "급여방법"],
          viewCount: 1250,
          likeCount: 89,
          commentCount: 23,
          readingTime: 8
        }

        setPost(mockPost)
        
        // 임시 댓글 데이터
        const mockComments: Comment[] = [
          {
            id: "1",
            author: "반려인A",
            content: "정말 유용한 정보네요! 우리 강아지 급여량을 다시 계산해봐야겠어요.",
            createdAt: "2024-01-16T09:00:00Z",
            likes: 12
          },
          {
            id: "2", 
            author: "고양이집사",
            content: "고양이도 같은 원칙이 적용되나요? 고양이 전용 정보도 궁금합니다.",
            createdAt: "2024-01-16T14:30:00Z",
            likes: 8
          }
        ]
        
        setComments(mockComments)
      } catch (error) {
        console.error('블로그 포스트 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.postId])

  const handleLike = () => {
    setIsLiked(!isLiked)
    // API 호출하여 좋아요 상태 업데이트
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // API 호출하여 북마크 상태 업데이트
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      // API 호출하여 댓글 추가
      const comment: Comment = {
        id: Date.now().toString(),
        author: "현재 사용자", // 실제로는 로그인된 사용자 정보
        content: newComment,
        createdAt: new Date().toISOString(),
        likes: 0
      }
      setComments([comment, ...comments])
      setNewComment('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">포스트를 찾을 수 없습니다</h1>
          <Link href="/community/blog" className="text-orange-600 hover:text-orange-700">
            블로그 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/community/blog" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">블로그 목록</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full ${isBookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center mb-4">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{post.readingTime}분 읽기</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{post.viewCount.toLocaleString()}회</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
          />
        </div>

        {/* Article Footer */}
        <footer className="border-t border-gray-200 pt-8">
          {/* Author Info */}
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
              <User className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              {post.author.bio && (
                <p className="text-gray-600">{post.author.bio}</p>
              )}
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-600">
                <Heart className="h-5 w-5 mr-1" />
                <span>{post.likeCount}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MessageCircle className="h-5 w-5 mr-1" />
                <span>{post.commentCount}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Eye className="h-5 w-5 mr-1" />
                <span>{post.viewCount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  isLiked 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                좋아요
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Share2 className="h-4 w-4 mr-1" />
                공유
              </button>
            </div>
          </div>
        </footer>

        {/* Comments Section */}
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            댓글 ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                댓글 작성
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-gray-900">{comment.author}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {comment.likes}
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        답글
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}
        </section>
      </article>
    </div>
  )
} 