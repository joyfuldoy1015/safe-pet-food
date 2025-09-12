'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Plus, 
  Heart, 
  MessageCircle, 
  Eye, 
  Calendar,
  TrendingUp,
  Clock,
  User,
  ArrowLeft,
  BookOpen,
  Star,
  Crown,
  Bookmark,
  Share2,
  ChevronRight
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  thumbnailUrl: string
  authorId: string
  authorName: string
  authorAvatar: string
  authorBio: string
  postType: 'official' | 'tip'
  categories: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  isBookmarked: boolean
  readTime: number
  seriesId?: string
  seriesTitle?: string
  seriesOrder?: number
}

interface BlogSeries {
  id: string
  title: string
  description: string
  authorId: string
  authorName: string
  thumbnailUrl: string
  postCount: number
  totalViews: number
  createdAt: string
}

const CATEGORIES = {
  'all': { label: '전체', color: 'bg-gray-100 text-gray-800' },
  'health': { label: '건강 케어', color: 'bg-red-100 text-red-800' },
  'nutrition': { label: '영양 관리', color: 'bg-green-100 text-green-800' },
  'training': { label: '훈련 & 행동', color: 'bg-blue-100 text-blue-800' },
  'grooming': { label: '미용 & 위생', color: 'bg-purple-100 text-purple-800' },
  'products': { label: '용품 리뷰', color: 'bg-yellow-100 text-yellow-800' },
  'diy': { label: 'DIY & 수제', color: 'bg-pink-100 text-pink-800' },
  'daily': { label: '일상 & 경험담', color: 'bg-indigo-100 text-indigo-800' }
}

const SORT_OPTIONS = [
  { value: 'recommended', label: '추천순' },
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'trending', label: '트렌딩' }
]

export default function BlogMainPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [trendingSeries, setTrendingSeries] = useState<BlogSeries[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetchBlogData()
    setIsLoggedIn(true) // 임시 로그인 상태
  }, [])

  useEffect(() => {
    filterAndSortPosts()
  }, [posts, searchQuery, selectedCategory, sortBy])

  const fetchBlogData = async () => {
    setLoading(true)
    
    // 임시 데이터 - 실제로는 API에서 가져옴
    const mockFeaturedPosts: BlogPost[] = [
      {
        id: 'featured1',
        title: '노묘 케어 완전 정복: 15년 경험 수의사가 알려주는 시니어 케어 가이드',
        excerpt: '우리 아이가 나이가 들면서 어떤 변화가 생기는지, 어떻게 케어해야 하는지 상세하게 알려드립니다.',
        content: '',
        thumbnailUrl: '/api/placeholder/800/400',
        authorId: 'vet001',
        authorName: '김수의사',
        authorAvatar: '/api/placeholder/40/40',
        authorBio: '15년차 수의사, 반려동물 건강 전문가',
        postType: 'official',
        categories: ['health'],
        tags: ['노묘', '시니어케어', '건강관리'],
        createdAt: '2024-12-20T10:00:00Z',
        updatedAt: '2024-12-20T10:00:00Z',
        viewCount: 2847,
        likeCount: 156,
        commentCount: 23,
        isBookmarked: false,
        readTime: 8,
        seriesId: 'series1',
        seriesTitle: '생애주기별 반려동물 케어',
        seriesOrder: 3
      },
      {
        id: 'featured2',
        title: '고양이 정수기 6개월 사용 후기: 실제로 물을 더 마실까?',
        excerpt: '정수기 도입 전후 우리 아이의 음수량 변화를 데이터로 비교해봤습니다.',
        content: '',
        thumbnailUrl: '/api/placeholder/800/400',
        authorId: 'user123',
        authorName: '삼색이엄마',
        authorAvatar: '/api/placeholder/40/40',
        authorBio: '3마리 고양이와 함께 살고 있는 5년차 집사',
        postType: 'tip',
        categories: ['products'],
        tags: ['정수기', '음수량', '제품리뷰'],
        createdAt: '2024-12-19T14:30:00Z',
        updatedAt: '2024-12-19T14:30:00Z',
        viewCount: 1923,
        likeCount: 89,
        commentCount: 31,
        isBookmarked: true,
        readTime: 5
      }
    ]

    const mockPosts: BlogPost[] = [
      {
        id: 'post1',
        title: '강아지 산책 시간, 정말 하루 2시간이 필요할까?',
        excerpt: '수의사와 행동 전문가들의 의견을 종합해서 우리 아이에게 맞는 산책 시간을 찾아보세요.',
        content: '',
        thumbnailUrl: '/api/placeholder/400/250',
        authorId: 'user456',
        authorName: '골든리트리버아빠',
        authorAvatar: '/api/placeholder/40/40',
        authorBio: '대형견과 함께하는 일상을 기록합니다',
        postType: 'tip',
        categories: ['training'],
        tags: ['산책', '운동량', '행동'],
        createdAt: '2024-12-18T16:20:00Z',
        updatedAt: '2024-12-18T16:20:00Z',
        viewCount: 1456,
        likeCount: 67,
        commentCount: 18,
        isBookmarked: false,
        readTime: 4
      },
      {
        id: 'post2',
        title: '수제 간식 레시피: 알레르기 있는 아이도 안심하고 먹을 수 있는 닭가슴살 쿠키',
        excerpt: '첨가물 없이 집에서 만드는 건강한 간식 레시피를 공유합니다.',
        content: '',
        thumbnailUrl: '/api/placeholder/400/250',
        authorId: 'user789',
        authorName: '수제간식연구소',
        authorAvatar: '/api/placeholder/40/40',
        authorBio: '반려동물 영양사, 수제간식 전문가',
        postType: 'tip',
        categories: ['diy', 'nutrition'],
        tags: ['수제간식', '레시피', '알레르기'],
        createdAt: '2024-12-17T11:15:00Z',
        updatedAt: '2024-12-17T11:15:00Z',
        viewCount: 2134,
        likeCount: 145,
        commentCount: 42,
        isBookmarked: false,
        readTime: 6
      },
      {
        id: 'post3',
        title: '고양이 털갈이 시즌 완벽 대비: 브러싱부터 영양제까지',
        excerpt: '털갈이 시즌을 맞아 우리 아이와 집사 모두 편안하게 보낼 수 있는 방법들을 정리했습니다.',
        content: '',
        thumbnailUrl: '/api/placeholder/400/250',
        authorId: 'groomer001',
        authorName: '펫그루머민지',
        authorAvatar: '/api/placeholder/40/40',
        authorBio: '10년차 펫그루머, 반려동물 미용 전문가',
        postType: 'official',
        categories: ['grooming'],
        tags: ['털갈이', '브러싱', '그루밍'],
        createdAt: '2024-12-16T09:45:00Z',
        updatedAt: '2024-12-16T09:45:00Z',
        viewCount: 3421,
        likeCount: 198,
        commentCount: 56,
        isBookmarked: true,
        readTime: 7
      }
    ]

    const mockSeries: BlogSeries[] = [
      {
        id: 'series1',
        title: '생애주기별 반려동물 케어',
        description: '퍼피부터 시니어까지, 우리 아이의 생애주기에 맞는 케어 방법을 알아보세요.',
        authorId: 'vet001',
        authorName: '김수의사',
        thumbnailUrl: '/api/placeholder/300/200',
        postCount: 5,
        totalViews: 12847,
        createdAt: '2024-12-15T00:00:00Z'
      },
      {
        id: 'series2',
        title: '우리집 고양이 행동 분석',
        description: '고양이의 이상한 행동들, 과연 무슨 의미일까요?',
        authorId: 'user999',
        authorName: '고양이행동연구가',
        thumbnailUrl: '/api/placeholder/300/200',
        postCount: 8,
        totalViews: 8934,
        createdAt: '2024-12-10T00:00:00Z'
      }
    ]

    setFeaturedPosts(mockFeaturedPosts)
    setPosts(mockPosts)
    setTrendingSeries(mockSeries)
    setLoading(false)
  }

  const filterAndSortPosts = () => {
    let filtered = [...posts]

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.categories.includes(selectedCategory))
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 정렬
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount))
        break
      case 'trending':
        filtered.sort((a, b) => b.viewCount - a.viewCount)
        break
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'recommended':
      default:
        // 추천순: 최신성 + 인기도 조합
        filtered.sort((a, b) => {
          const scoreA = a.likeCount + (a.commentCount * 2) + (a.viewCount * 0.01)
          const scoreB = b.likeCount + (b.commentCount * 2) + (b.viewCount * 0.01)
          return scoreB - scoreA
        })
        break
    }

    return filtered
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

  const filteredPosts = filterAndSortPosts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            집사 정보 마당 📚
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            전문가의 깊이 있는 정보부터 집사들의 생생한 경험담까지,<br />
            반려동물과 함께하는 삶의 모든 지혜를 나누는 공간입니다.
          </p>
        </div>

        {/* Featured Posts Slider */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Crown className="h-6 w-6 text-yellow-500 mr-2" />
            이번 주 추천 글
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Link key={post.id} href={`/community/blog/${post.id}`} className="group">
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[16/10] bg-gray-200">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl">
                      📖
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.postType === 'official' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {post.postType === 'official' ? '공식' : '집사꿀팁'}
                      </span>
                      <span className="text-sm opacity-90">{post.readTime}분 읽기</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm opacity-90 line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={post.authorAvatar} alt={post.authorName} className="h-8 w-8 rounded-full" />
                        <div>
                          <div className="font-medium text-sm">{post.authorName}</div>
                          <div className="text-xs opacity-75">{formatDate(post.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likeCount}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Series */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
              인기 시리즈
            </h2>
            <Link href="/community/blog/series" className="text-orange-600 hover:text-orange-700 flex items-center">
              더보기 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {trendingSeries.map((series) => (
              <Link key={series.id} href={`/community/blog/series/${series.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="aspect-[16/9] bg-gray-100">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl">
                      📚
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {series.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {series.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{series.postCount}편</span>
                        <span>{series.totalViews.toLocaleString()} 조회</span>
                      </div>
                      <span className="font-medium text-gray-700">{series.authorName}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="제목, 내용, 태그로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === key
                        ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              최신 글 ({filteredPosts.length})
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600">다른 키워드로 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/community/blog/${post.id}`} className="group">
                  <article className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="aspect-[16/10] bg-gray-100">
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl">
                        📝
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.postType === 'official' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {post.postType === 'official' ? '공식' : '집사꿀팁'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{post.readTime}분</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={post.authorAvatar} alt={post.authorName} className="h-8 w-8 rounded-full" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">{post.authorName}</div>
                            <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likeCount}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>

                      {post.seriesId && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Link 
                            href={`/community/blog/series/${post.seriesId}`}
                            className="flex items-center text-sm text-orange-600 hover:text-orange-700"
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            {post.seriesTitle} #{post.seriesOrder}
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Load More Button */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors">
              더 많은 글 보기
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 