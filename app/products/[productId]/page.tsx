import Link from 'next/link'
import { Shield, MapPin, Factory, Award, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react'
import BackButton from '@/components/common/BackButton'
import { 
  getProductById, 
  getProductsByBrandId,
  getProductReviews,
  aggregateProductRatings,
  aggregateCommunityFeedback,
  formatReviewsForDisplay,
  getBrandGradeData,
  cacheProductGrade
} from '@/lib/services/products'
import GradeCredibility from '@/components/product/GradeCredibility'
import { calculateAutoGrade, type AutoGradeResult } from '@/lib/auto-grade-calculator'
import { getGradeColor } from '@/lib/grade-style'

interface PageProps {
  params: {
    productId: string
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

  const brand = (product as any).brand || null
  const [relatedProducts, feedingReviews, brandGradeData] = await Promise.all([
    getProductsByBrandId(product.brand_id, 6),
    getProductReviews(productId),
    getBrandGradeData(product.brand_id),
  ])
  const otherProducts = relatedProducts.filter(p => p.id !== product.id).slice(0, 5)

  const realRatings = aggregateProductRatings(feedingReviews)
  const realFeedback = aggregateCommunityFeedback(feedingReviews)
  const formattedReviews = formatReviewsForDisplay(feedingReviews)

  const productIngredients = product.ingredients && Array.isArray(product.ingredients) && product.ingredients.length > 0
    ? product.ingredients
    : brandGradeData?.ingredients

  const autoGrade = calculateAutoGrade({
    recallHistory: brandGradeData?.recallHistory,
    ingredients: productIngredients,
    ratings: realRatings,
    reviewCount: feedingReviews.length,
    guaranteedAnalysis: product.guaranteed_analysis,
    targetSpecies: product.target_species,
  })

  if (autoGrade.evaluatedCount >= 2) {
    cacheProductGrade(productId, autoGrade.grade, autoGrade.gradeText, autoGrade.totalScore)
  }

  const consumer_ratings = realRatings
  const community_feedback = realFeedback.total_votes > 0 ? realFeedback : null
  const consumer_reviews = formattedReviews.length > 0 ? formattedReviews : null

  const recommendRate = community_feedback && community_feedback.total_votes > 0
    ? Math.round((community_feedback.recommend_yes / community_feedback.total_votes) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <BackButton />
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
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl border ${autoGrade.evaluatedCount >= 2 ? getGradeColor(autoGrade.grade) : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
              {autoGrade.evaluatedCount >= 2 ? autoGrade.grade : '-'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 mb-1">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                {autoGrade.evaluatedCount >= 2 ? (
                  <span className="text-xs text-gray-500">{autoGrade.gradeText} ({autoGrade.totalScore}점)</span>
                ) : (
                  <span className="text-xs text-gray-400">평가 데이터 부족</span>
                )}
                {product.target_species && product.target_species !== 'all' && (
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    product.target_species === 'cat'
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {product.target_species === 'cat' ? '🐱 고양이용' : '🐶 강아지용'}
                  </span>
                )}
              </div>
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
                {(() => {
                  const labelMap: Record<string, string> = {
                    protein: '조단백질', fat: '조지방', fiber: '조섬유',
                    moisture: '수분', ash: '조회분', calcium: '칼슘', phosphorus: '인',
                    '조단백': '조단백질'
                  }
                  const displayOrder = [
                    '조단백질', '조단백', '조지방', '조섬유', '수분', '조회분', '칼슘', '인',
                    'EPA+DHA', '나트륨', '오메가3', '오메가6', '칼로리(kcal/kg)',
                    'protein', 'fat', 'fiber', 'moisture', 'ash', 'calcium', 'phosphorus'
                  ]
                  const entries = Object.entries(product.guaranteed_analysis)
                  const sorted = entries.sort(([a], [b]) => {
                    const idxA = displayOrder.indexOf(a)
                    const idxB = displayOrder.indexOf(b)
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB
                    if (idxA !== -1) return -1
                    if (idxB !== -1) return 1
                    return 0
                  })
                  return sorted.map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-[10px] text-gray-500 mb-0.5">
                        {labelMap[key] || key}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {String(value).includes('%') || String(value).includes('kcal') ? String(value) : `${value}%`}
                      </div>
                    </div>
                  ))
                })()}
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
                    <Link key={review.id} href={`/pet-log/${review.id}`} className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
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
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Grade Credibility Section */}
        <section className="mb-4">
          <GradeCredibility autoGrade={autoGrade} />
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
