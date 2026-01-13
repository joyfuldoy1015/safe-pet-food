import Link from 'next/link'
import { Shield, MapPin, Factory, Award, ThumbsUp, ThumbsDown } from 'lucide-react'
import BackButton from '@/components/common/BackButton'
import { 
  getProductById, 
  getBrandById, 
  getProductsByBrandId,
  getProductReviews,
  aggregateProductRatings,
  aggregateCommunityFeedback,
  formatReviewsForDisplay
} from '@/lib/services/products'
import GradeCredibility from '@/components/product/GradeCredibility'

interface PageProps {
  params: {
    productId: string
  }
}

// 등급 배지 색상
const getGradeColor = (grade?: string) => {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-300'
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'F': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = params
  
  // 데이터 조회 (Server Component에서 직접 조회)
  const product = await getProductById(productId)
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">제품을 찾을 수 없습니다</h1>
          <Link href="/brands" className="text-blue-600 hover:text-blue-700">
            브랜드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const brand = await getBrandById(product.brand_id)
  const relatedProducts = await getProductsByBrandId(product.brand_id, 6)
  const otherProducts = relatedProducts.filter(p => p.id !== product.id).slice(0, 5)

  // 🆕 실시간 급여 후기 데이터 가져오기
  const feedingReviews = await getProductReviews(productId)
  const realRatings = aggregateProductRatings(feedingReviews)
  const realFeedback = aggregateCommunityFeedback(feedingReviews)
  const formattedReviews = formatReviewsForDisplay(feedingReviews)

  // 실시간 데이터 우선, 없으면 mock 사용
  const consumer_ratings = realRatings || product.consumer_ratings
  const community_feedback = realFeedback.total_votes > 0 ? realFeedback : product.community_feedback
  const consumer_reviews = formattedReviews.length > 0 ? formattedReviews : product.consumer_reviews

  // 추천률 계산
  const recommendRate = community_feedback
    ? Math.round((community_feedback.recommend_yes / community_feedback.total_votes) * 100)
    : 0

  // Mock 등급 신뢰도 데이터
  const gradeCredibility = {
    ingredient_disclosure: 85,
    standard_compliance: 92,
    consumer_rating: 88,
    recall_response: 95,
    research_backing: 78
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <BackButton fallbackHref="/search?tab=products" />
            <div className="flex items-center space-x-3">
              {brand && (
                <>
                  <div className="text-3xl">{brand.image || '🏢'}</div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
                    <p className="text-sm text-gray-600">{brand.name}</p>
                  </div>
                </>
              )}
              {!brand && (
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          {/* Product Info */}
          <div>
              {/* Product Name */}
              <h1 className="text-[29px] sm:text-[35px] font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-[17px] text-gray-600 mb-4 leading-relaxed">
                {product.description || '반려동물을 위한 프리미엄 사료입니다.'}
              </p>

              {/* Recommendation Summary */}
              {community_feedback && community_feedback.total_votes > 0 && (
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6">
                  {/* 추천 */}
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <span className="text-[22px] font-bold text-green-600">
                      {community_feedback.recommend_yes.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* 비추천 */}
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <span className="text-[22px] font-bold text-red-600">
                      {community_feedback.recommend_no.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* 추천률 */}
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="text-[13px] text-gray-600">추천률</div>
                    <div className="text-[22px] font-bold text-blue-600">{recommendRate}%</div>
                  </div>
                </div>
              )}

              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.certifications.slice(0, 3).map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      <Award className="h-3 w-3" />
                      {cert}
                    </div>
                  ))}
                </div>
              )}

              {/* 구분선 + 등급 배지 */}
              {product.grade && (
                <>
                  <div className="border-t border-gray-200 my-6"></div>
                  <div className="flex justify-center">
                    <div className={`w-2/3 py-3 rounded-full font-bold text-lg text-center ${getGradeColor(product.grade)}`}>
                      {product.grade} {product.grade_text}
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>

        {/* Summary Section */}
        <section id="summary" className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">핵심 요약</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 추천 이유 */}
              {product.pros && product.pros.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                    </div>
                    추천 이유
                  </h3>
                  <ul className="space-y-2">
                    {product.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 비추천 포인트 */}
              {product.cons && product.cons.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ThumbsDown className="h-4 w-4 text-orange-600" />
                    </div>
                    고려할 점
                  </h3>
                  <ul className="space-y-2">
                    {product.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-orange-500 mt-1">⚠</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Origin Section */}
        <section id="origin" className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">원산지 & 제조</h2>
            
            {product.origin_info ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {product.origin_info.origin_country && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">원료 원산지</div>
                      <div className="font-semibold text-gray-900">{product.origin_info.origin_country}</div>
                    </div>
                  </div>
                )}
                
                {product.origin_info.manufacturing_country && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Factory className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">제조 국가</div>
                      <div className="font-semibold text-gray-900">{product.origin_info.manufacturing_country}</div>
                    </div>
                  </div>
                )}
                
                {product.origin_info.factory_location && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">제조 공장</div>
                      <div className="font-semibold text-gray-900">{product.origin_info.factory_location}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">원산지 정보가 제공되지 않습니다.</p>
            )}
          </div>
        </section>

        {/* Ingredients Section */}
        <section id="ingredients" className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">원료 리스트</h2>
            
            {product.ingredients && product.ingredients.length > 0 ? (
              <div className="space-y-3">
                {Array.isArray(product.ingredients) && typeof product.ingredients[0] === 'object' ? (
                  // 상세 원료 정보
                  (product.ingredients as Array<{ name: string; percentage?: number; source?: string }>).map((ingredient, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-700">{idx + 1}</span>
                        <div>
                          <div className="font-medium text-gray-900">{ingredient.name}</div>
                          {ingredient.source && (
                            <div className="text-sm text-gray-600">원산지: {ingredient.source}</div>
                          )}
                        </div>
                      </div>
                      {ingredient.percentage && (
                        <div className="text-lg font-bold text-blue-600">{ingredient.percentage}%</div>
                      )}
                    </div>
                  ))
                ) : (
                  // 간단한 원료 리스트
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(product.ingredients as string[]).map((ingredient, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-semibold text-gray-600">{idx + 1}.</span>
                        <span className="text-gray-900">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">원료 정보가 제공되지 않습니다.</p>
            )}
          </div>
        </section>

        {/* Guaranteed Analysis Section */}
        <section id="analysis" className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">등록성분량</h2>
            
            {product.guaranteed_analysis ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">성분</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">함량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(product.guaranteed_analysis).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700 capitalize">
                          {key === 'protein' ? '조단백질' :
                           key === 'fat' ? '조지방' :
                           key === 'fiber' ? '조섬유' :
                           key === 'moisture' ? '수분' :
                           key === 'ash' ? '조회분' :
                           key === 'calcium' ? '칼슘' :
                           key === 'phosphorus' ? '인' : key}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {value}% 이상
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">성분 정보가 제공되지 않습니다.</p>
            )}
          </div>
        </section>

          {/* Ratings Section */}
          <section id="ratings" className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">소비자 평가</h2>
                {feedingReviews.length > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    💚 실시간 급여 후기 기반
                  </span>
                )}
              </div>
              
              {consumer_ratings ? (
                <div className="space-y-4">
                  {Object.entries(consumer_ratings).map(([key, value]) => {
                  const percentage = (value / 5) * 100
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">
                          {key === 'palatability' ? '기호성' :
                           key === 'digestibility' ? '소화율' :
                           key === 'coat_quality' ? '털 상태' :
                           key === 'stool_quality' ? '변 상태' :
                           key === 'overall_satisfaction' ? '전반적 만족도' : key}
                        </span>
                        <span className="font-bold text-gray-900">{value.toFixed(1)} / 5.0</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-600">아직 평가가 없습니다.</p>
            )}

            {/* Reviews Preview */}
            {consumer_reviews && consumer_reviews.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">최근 리뷰</h3>
                  <span className="text-sm text-gray-600">
                    총 {consumer_reviews.length}개 리뷰
                  </span>
                </div>
                <div className="space-y-4">
                  {consumer_reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                      {/* 1행: 닉네임(좌) - 날짜(우) */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{review.user_name}</span>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                      {/* 2행: 별표 */}
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        도움됨 {review.helpful_count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Grade Credibility Section */}
        <section className="mb-8">
          <GradeCredibility credibility={gradeCredibility} />
        </section>


        {/* Related Products Section */}
        {otherProducts.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                이 브랜드의 다른 제품
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.id}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 flex-1">{relatedProduct.name}</h3>
                      {relatedProduct.grade && (
                        <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${getGradeColor(relatedProduct.grade)}`}>
                          {relatedProduct.grade} {relatedProduct.grade_text}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedProduct.description || '자세히 보기'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
