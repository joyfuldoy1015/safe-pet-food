'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Plus,
  X,
  Star,
  Shield,
  Eye,
  TrendingUp,
  Heart,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface Brand {
  id: string
  name: string
  logo: string
  manufacturer: string
  country_of_origin: string
  transparency_score: number
  trust_score: number
  palatability_score: number
  overall_rating: number
  nutrition_analysis: {
    protein: number
    fat: number
    carbohydrates: number
    fiber: number
    moisture: number
    calories_per_100g: number
  }
  certifications: string[]
  recall_history: Array<{
    date: string
    reason: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
  }>
  price_range: string
  ingredient_disclosure: {
    fully_disclosed: number
    partially_disclosed: number
    not_disclosed: number
  }
}

const availableBrands: Brand[] = [
  {
    id: 'royal-canin',
    name: '로얄캐닌',
    logo: '👑',
    manufacturer: 'Mars Petcare',
    country_of_origin: '프랑스',
    transparency_score: 78,
    trust_score: 82,
    palatability_score: 85,
    overall_rating: 4.1,
    nutrition_analysis: {
      protein: 32,
      fat: 14,
      carbohydrates: 28,
      fiber: 8,
      moisture: 10,
      calories_per_100g: 385
    },
    certifications: ['HACCP', 'AAFCO', 'ISO 22000', 'FEDIAF'],
    recall_history: [
      { date: '2023-03-15', reason: '비타민 D 과다 검출', severity: 'medium', resolved: true },
      { date: '2022-08-10', reason: '살모넬라균 오염 가능성', severity: 'high', resolved: true }
    ],
    price_range: '중상급',
    ingredient_disclosure: { fully_disclosed: 65, partially_disclosed: 25, not_disclosed: 10 }
  },
  {
    id: 'hills',
    name: '힐스',
    logo: '🏔️',
    manufacturer: "Hill's Pet Nutrition",
    country_of_origin: '미국',
    transparency_score: 85,
    trust_score: 88,
    palatability_score: 79,
    overall_rating: 4.2,
    nutrition_analysis: {
      protein: 30,
      fat: 16,
      carbohydrates: 25,
      fiber: 7,
      moisture: 9,
      calories_per_100g: 392
    },
    certifications: ['AAFCO', 'FDA', 'ISO 9001'],
    recall_history: [
      { date: '2023-07-22', reason: '금속 이물질 검출', severity: 'high', resolved: true }
    ],
    price_range: '고급',
    ingredient_disclosure: { fully_disclosed: 78, partially_disclosed: 18, not_disclosed: 4 }
  },
  {
    id: 'orijen',
    name: '오리젠',
    logo: '🌿',
    manufacturer: 'Champion Petfoods',
    country_of_origin: '캐나다',
    transparency_score: 92,
    trust_score: 90,
    palatability_score: 88,
    overall_rating: 4.5,
    nutrition_analysis: {
      protein: 38,
      fat: 18,
      carbohydrates: 20,
      fiber: 6,
      moisture: 12,
      calories_per_100g: 410
    },
    certifications: ['AAFCO', 'CFIA', 'NSF'],
    recall_history: [],
    price_range: '프리미엄',
    ingredient_disclosure: { fully_disclosed: 85, partially_disclosed: 12, not_disclosed: 3 }
  },
  {
    id: 'acana',
    name: '아카나',
    logo: '🍃',
    manufacturer: 'Champion Petfoods',
    country_of_origin: '캐나다',
    transparency_score: 89,
    trust_score: 87,
    palatability_score: 84,
    overall_rating: 4.3,
    nutrition_analysis: {
      protein: 35,
      fat: 17,
      carbohydrates: 23,
      fiber: 7,
      moisture: 11,
      calories_per_100g: 398
    },
    certifications: ['AAFCO', 'CFIA'],
    recall_history: [],
    price_range: '중상급',
    ingredient_disclosure: { fully_disclosed: 82, partially_disclosed: 15, not_disclosed: 3 }
  }
]

// 레이다 차트 컴포넌트 (SVG로 구현)
const RadarChart = ({ brands }: { brands: Brand[] }) => {
  const size = 300
  const center = size / 2
  const radius = 100
  const angles = [0, 72, 144, 216, 288] // 5각형 (72도씩)
  
  const categories = [
    { key: 'protein', label: '단백질', max: 50 },
    { key: 'transparency_score', label: '투명성', max: 100 },
    { key: 'trust_score', label: '신뢰도', max: 100 },
    { key: 'palatability_score', label: '기호성', max: 100 },
    { key: 'fat', label: '지방', max: 30 }
  ]

  const getPointPosition = (angle: number, value: number, maxValue: number) => {
    const normalizedValue = (value / maxValue) * radius
    const radian = (angle - 90) * Math.PI / 180
    return {
      x: center + normalizedValue * Math.cos(radian),
      y: center + normalizedValue * Math.sin(radian)
    }
  }

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="mb-4">
        {/* 배경 원들 */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}
        
        {/* 축 선들 */}
        {angles.map((angle, index) => {
          const endPoint = getPointPosition(angle, 100, 100)
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          )
        })}

        {/* 브랜드별 데이터 */}
        {brands.map((brand, brandIndex) => {
          const points = categories.map((category, index) => {
            const value = category.key === 'protein' ? brand.nutrition_analysis.protein :
                         category.key === 'fat' ? brand.nutrition_analysis.fat :
                         brand[category.key as keyof Brand] as number
            return getPointPosition(angles[index], value, category.max)
          })

          const pathData = points.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
          ).join(' ') + ' Z'

          return (
            <g key={brandIndex}>
              <path
                d={pathData}
                fill={colors[brandIndex]}
                fillOpacity="0.1"
                stroke={colors[brandIndex]}
                strokeWidth="2"
              />
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={colors[brandIndex]}
                />
              ))}
            </g>
          )
        })}

        {/* 카테고리 라벨 */}
        {categories.map((category, index) => {
          const labelPoint = getPointPosition(angles[index], 110, 100)
          return (
            <text
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium fill-gray-700"
            >
              {category.label}
            </text>
          )
        })}
      </svg>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 justify-center">
        {brands.map((brand, index) => (
          <div key={brand.id} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: colors[index] }}
            ></div>
            <span className="text-sm font-medium">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BrandComparePage() {
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([])
  const [showBrandSelector, setShowBrandSelector] = useState(false)

  const addBrand = (brand: Brand) => {
    if (selectedBrands.length < 3 && !selectedBrands.find(b => b.id === brand.id)) {
      setSelectedBrands([...selectedBrands, brand])
      setShowBrandSelector(false)
    }
  }

  const removeBrand = (brandId: string) => {
    setSelectedBrands(selectedBrands.filter(b => b.id !== brandId))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/brands" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">브랜드 비교</h1>
              <p className="text-gray-600">최대 3개 브랜드를 선택하여 비교해보세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브랜드 선택 영역 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">비교할 브랜드 선택</h2>
            <span className="text-sm text-gray-500">{selectedBrands.length}/3</span>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            {selectedBrands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-lg">{brand.logo}</span>
                <span className="font-medium text-blue-900">{brand.name}</span>
                <button
                  onClick={() => removeBrand(brand.id)}
                  className="p-1 hover:bg-blue-200 rounded"
                >
                  <X className="h-4 w-4 text-blue-600" />
                </button>
              </div>
            ))}
            
            {selectedBrands.length < 3 && (
              <button
                onClick={() => setShowBrandSelector(true)}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">브랜드 추가</span>
              </button>
            )}
          </div>

          {/* 브랜드 선택 드롭다운 */}
          {showBrandSelector && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableBrands
                  .filter(brand => !selectedBrands.find(b => b.id === brand.id))
                  .map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => addBrand(brand)}
                      className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <span className="text-lg">{brand.logo}</span>
                      <span className="font-medium text-gray-900">{brand.name}</span>
                    </button>
                  ))}
              </div>
              <button
                onClick={() => setShowBrandSelector(false)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                취소
              </button>
            </div>
          )}
        </div>

        {selectedBrands.length >= 2 && (
          <>
            {/* 레이다 차트 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">종합 비교 차트</h2>
              <RadarChart brands={selectedBrands} />
            </div>

            {/* 상세 비교 표 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">상세 비교</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">항목</th>
                      {selectedBrands.map((brand) => (
                        <th key={brand.id} className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg">{brand.logo}</span>
                            <span>{brand.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* 기본 정보 */}
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">제조사</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-sm text-gray-600 text-center">
                          {brand.manufacturer}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">원산지</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-sm text-gray-600 text-center">
                          {brand.country_of_origin}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">가격대</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-sm text-gray-600 text-center">
                          {brand.price_range}
                        </td>
                      ))}
                    </tr>

                    {/* 점수 */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">투명성 점수</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-center">
                          <span className={`text-sm font-semibold ${getScoreColor(brand.transparency_score)}`}>
                            {brand.transparency_score}점
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">신뢰도 점수</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-center">
                          <span className={`text-sm font-semibold ${getScoreColor(brand.trust_score)}`}>
                            {brand.trust_score}점
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">기호성 점수</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-center">
                          <span className={`text-sm font-semibold ${getScoreColor(brand.palatability_score)}`}>
                            {brand.palatability_score}점
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* 영양 성분 */}
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">단백질</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                          {brand.nutrition_analysis.protein}%
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">지방</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                          {brand.nutrition_analysis.fat}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">칼로리</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                          {brand.nutrition_analysis.calories_per_100g} kcal
                        </td>
                      ))}
                    </tr>

                    {/* 인증 */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">인증</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {brand.certifications.map((cert, index) => (
                              <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* 리콜 이력 */}
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">리콜 이력</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-center">
                          {brand.recall_history.length === 0 ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              없음
                            </span>
                          ) : (
                            <span className="text-sm text-red-600 font-medium">
                              {brand.recall_history.length}건
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* 전체 평점 */}
                    <tr className="bg-yellow-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">전체 평점</td>
                      {selectedBrands.map((brand) => (
                        <td key={brand.id} className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-semibold text-gray-900">
                              {brand.overall_rating.toFixed(1)}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {selectedBrands.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">브랜드를 선택해주세요</h3>
            <p className="text-gray-600">최소 2개 브랜드를 선택하면 비교 분석을 시작할 수 있습니다.</p>
          </div>
        )}

        {selectedBrands.length === 1 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">하나 더 선택해주세요</h3>
            <p className="text-gray-600">비교를 위해 최소 2개 브랜드가 필요합니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
