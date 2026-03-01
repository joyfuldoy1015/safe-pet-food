import Link from 'next/link'
import { Shield, MapPin, Factory, Award, ThumbsUp, ThumbsDown, ArrowLeft, ChevronRight } from 'lucide-react'
import { 
  getProductById, 
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
    case 'A': return 'bg-green-100 text-green-700 border-green-200'
    case 'B': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'D': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'F': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-base font-bold text-gray-900 mb-2">제품을 찾을 수 없습니다</h1>
          <Link href="/search?tab=products" className="text-sm text-violet-600 hover:text-violet-700">
            제품 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 브랜드 정보는 제품과 함께 가져온 데이터 사용
  const brand = (product as any).brand || null
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
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/search?tab=products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-gray-900">{product.name}</h1>
            {brand && <p className="text-xs text-gray-500">{brand.name}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          {/* 등급 배지 + 제품명 */}
          <div className="flex items-start gap-4 mb-4">
            {product.grade && (
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl border ${getGradeColor(product.grade)}`}>
                {product.grade}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 mb-1">
                {product.name}
              </h1>
              {product.grade_text && (
                <p className="text-xs text-gray-500">{product.grade_text}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed whitespace-pre-line">
            {product.description || '반려동물을 위한 프리미엄 사료입니다.'}
          </p>

          {/* Recommendation Summary */}
          {community_feedback && community_feedback.total_votes > 0 && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                  <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-sm font-bold text-green-600">
                  {community_feedback.recommend_yes.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                  <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                </div>
                <span className="text-sm font-bold text-red-600">
                  {community_feedback.recommend_no.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-gray-500">추천률</span>
                <span className="text-lg font-bold text-violet-600">{recommendRate}%</span>
              </div>
            </div>
          )}

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.certifications.slice(0, 3).map((cert, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-600 rounded-full text-xs font-medium">
                  <Award className="h-3 w-3" />
                  {cert}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <section id="summary" className="mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-gray-600" />
              </span>
              핵심 요약
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 추천 이유 */}
              {product.pros && product.pros.length > 0 && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <h3 className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    추천 이유
                  </h3>
                  <ul className="space-y-1.5">
                    {product.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-green-800">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 비추천 포인트 */}
              {product.cons && product.cons.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-xl">
                  <h3 className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    고려할 점
                  </h3>
                  <ul className="space-y-1.5">
                    {product.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-orange-800">
                        <span className="text-orange-500 mt-0.5">⚠</span>
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
        <section id="origin" className="mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-gray-600" />
              </span>
              원산지 & 제조
            </h2>
            
            {product.origin_info ? (
              <div className="grid grid-cols-3 gap-3">
                {product.origin_info.origin_country && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-[10px] text-gray-500 mb-0.5">원료 원산지</div>
                    <div className="text-xs font-semibold text-gray-900">{product.origin_info.origin_country}</div>
                  </div>
                )}
                
                {product.origin_info.manufacturing_country && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Factory className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-[10px] text-gray-500 mb-0.5">제조 국가</div>
                    <div className="text-xs font-semibold text-gray-900">{product.origin_info.manufacturing_country}</div>
                  </div>
                )}
                
                {product.origin_info.factory_location && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="text-[10px] text-gray-500 mb-0.5">제조 공장</div>
                    <div className="text-xs font-semibold text-gray-900">{product.origin_info.factory_location}</div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">원산지 정보가 제공되지 않습니다.</p>
            )}
          </div>
        </section>

        {/* Ingredients Section */}
        <section id="ingredients" className="mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <Award className="h-3.5 w-3.5 text-gray-600" />
              </span>
              원료 리스트
            </h2>
            
            {product.ingredients && product.ingredients.length > 0 ? (
              <div className="space-y-2">
                {Array.isArray(product.ingredients) && typeof product.ingredients[0] === 'object' ? (
                  // 상세 원료 정보
                  (product.ingredients as Array<{ name: string; percentage?: number; source?: string }>).map((ingredient, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-semibold text-gray-500 border border-gray-200">{idx + 1}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                          {ingredient.source && (
                            <div className="text-[10px] text-gray-500">원산지: {ingredient.source}</div>
                          )}
                        </div>
                      </div>
                      {ingredient.percentage && (
                        <div className="text-sm font-bold text-violet-600">{ingredient.percentage}%</div>
                      )}
                    </div>
                  ))
                ) : (
                  // 간단한 원료 리스트
                  <div className="flex flex-wrap gap-2">
                    {(product.ingredients as string[]).map((ingredient, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs">
                        <span className="font-medium text-gray-400">{idx + 1}.</span>
                        {ingredient}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">원료 정보가 제공되지 않습니다.</p>
            )}
          </div>
        </section>

        {/* Guaranteed Analysis Section */}
        <section id="analysis" className="mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <Factory className="h-3.5 w-3.5 text-gray-600" />
              </span>
              등록성분량
            </h2>
            
            {product.guaranteed_analysis ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(product.guaranteed_analysis).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-[10px] text-gray-500 mb-0.5">
                      {key === 'protein' ? '조단백질' :
                       key === 'fat' ? '조지방' :
                       key === 'fiber' ? '조섬유' :
                       key === 'moisture' ? '수분' :
                       key === 'ash' ? '조회분' :
                       key === 'calcium' ? '칼슘' :
                       key === 'phosphorus' ? '인' : key}
                    </div>
                    <div className="text-sm font-bold text-gray-900">{value}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">성분 정보가 제공되지 않습니다.</p>
            )}
          </div>
        </section>

        {/* Ratings Section */}
        <section id="ratings" className="mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <ThumbsUp className="h-3.5 w-3.5 text-gray-600" />
                </span>
                소비자 평가
              </h2>
              {feedingReviews.length > 0 && (
                <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  실시간 급여 후기 기반
                </span>
              )}
            </div>
            
            {consumer_ratings ? (
              <div className="space-y-3">
                {Object.entries(consumer_ratings).map(([key, value]) => {
                  const percentage = (value / 5) * 100
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          {key === 'palatability' ? '기호성' :
                           key === 'digestibility' ? '소화율' :
                           key === 'coat_quality' ? '털 상태' :
                           key === 'stool_quality' ? '변 상태' :
                           key === 'overall_satisfaction' ? '전반적 만족도' : key}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{value.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">아직 평가가 없습니다.</p>
            )}

            {/* Reviews Preview */}
            {consumer_reviews && consumer_reviews.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-900">최근 리뷰</h3>
                  <span className="text-[10px] text-gray-500">
                    총 {consumer_reviews.length}개
                  </span>
                </div>
                <div className="space-y-2">
                  {consumer_reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-900">{review.user_name}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-[10px] ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Grade Credibility Section */}
        <section className="mb-4">
          <GradeCredibility credibility={gradeCredibility} />
        </section>


        {/* Related Products Section */}
        {otherProducts.length > 0 && (
          <section className="mb-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                </span>
                이 브랜드의 다른 제품
              </h2>
              
              <div className="space-y-2">
                {otherProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${getGradeColor(relatedProduct.grade)}`}>
                      {relatedProduct.grade || '-'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      {relatedProduct.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {relatedProduct.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-violet-400 transition-colors flex-shrink-0" />
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
