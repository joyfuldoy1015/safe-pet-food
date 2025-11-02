'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Star, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  User, 
  MessageSquare, 
  Award, 
  Building, 
  Globe, 
  Package,
  MapPin,
  Factory,
  TestTube,
  Heart,
  TrendingUp,
  Zap,
  Eye,
  EyeOff,
  Minus,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Flag,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface BrandQuestion {
  id: string
  user_name: string
  question: string
  date: string
  answer?: {
    content: string
    answerer: string
    date: string
  }
  likes: number
  is_answered: boolean
}

interface ProductInfo {
  id: string
  name: string
  image: string
  description: string
  certifications: string[]
  origin_info: {
    country_of_origin?: string
    manufacturing_country?: string
    manufacturing_facilities?: string[]
  }
  ingredients: string[]
  guaranteed_analysis: {
    protein: string
    fat: string
    fiber: string
    moisture: string
    ash?: string
    calcium?: string
    phosphorus?: string
  }
  pros: string[]
  cons: string[]
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
  }
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  consumer_reviews: Array<{
    id: string
    user_name: string
    rating: number
    comment: string
    date: string
    helpful_count: number
  }>
}

interface Brand {
  id: string
  name: string
  logo: string
  manufacturer: string
  country_of_origin: string
  manufacturing_locations: string[]
  established_year: number
  certifications: string[]
  brand_description: string
  manufacturing_info: string
  brand_pros: string[]
  brand_cons: string[]
  recall_history: Array<{
    date: string
    reason: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
  }>
  transparency_score: number
  ingredient_disclosure: {
    fully_disclosed: number
    partially_disclosed: number
    not_disclosed: number
  }
  nutrition_analysis: {
    protein: number
    fat: number
    carbohydrates: number
    fiber: number
    moisture: number
    calories_per_100g: number
  }
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
  }
  expert_reviews: Array<{
    expert_name: string
    rating: number
    comment: string
    date: string
  }>
  ingredients: Array<{
    name: string
    percentage?: number
    source?: string
    disclosure_level: 'full' | 'partial' | 'none'
  }>
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  qa_section: BrandQuestion[]
  products: ProductInfo[]
}

// 이 함수는 더 이상 사용되지 않습니다 - API에서 데이터를 가져옵니다
const getBrandDataLegacy = (brandName: string): Brand => {
  const brands: Record<string, Brand> = {
    'royal-canin': {
      id: 'royal-canin',
      name: '로얄캐닌',
      logo: '👑',
      manufacturer: 'Mars Petcare',
      country_of_origin: '프랑스',
      manufacturing_locations: ['프랑스 아이메르그', '한국 김천', '미국 오클라호마'],
      established_year: 1968,
      certifications: ['HACCP', 'AAFCO', 'ISO 22000', 'FEDIAF'],
      brand_description: '로얄캐닌은 1968년 프랑스에서 설립된 반려동물 영양학 전문 브랜드입니다. 수의사들이 가장 신뢰하는 브랜드 중 하나로, 과학적 연구를 바탕으로 반려동물의 품종, 크기, 연령, 건강 상태에 맞는 맞춤형 영양 솔루션을 제공합니다. 전 세계 100여 개국에서 판매되며, 지속적인 연구개발을 통해 반려동물의 건강한 삶을 지원하고 있습니다.',
      manufacturing_info: '로얄캐닌은 전 세계 15개국에 16개의 제조 공장을 운영하고 있습니다. 한국에는 2011년 김천공장을 설립하여 아시아 태평양 지역에 제품을 공급하고 있으며, 모든 공장은 HACCP, ISO 22000 등의 국제 품질 인증을 받아 엄격한 품질 관리 시스템을 운영합니다. 원료 조달부터 완제품 출고까지 전 과정에서 추적 가능한 시스템을 구축하여 안전성을 보장합니다.',
      brand_pros: [
        '수의사들이 가장 많이 추천하는 브랜드',
        '임상 연구를 통해 검증된 영양 균형',
        '천연 항산화제로 면역력 강화',
        '소화가 잘되는 고품질 단백질 사용'
      ],
      brand_cons: [
        '옥수수 글루텐 함량이 높음',
        '일부 개체에서 알레르기 반응 가능',
        '상대적으로 높은 가격'
      ],
      recall_history: [
        {
          date: '2023-03-15',
          reason: '비타민 D 과다 검출',
          severity: 'medium',
          resolved: true
        },
        {
          date: '2022-08-10',
          reason: '살모넬라균 오염 가능성',
          severity: 'high',
          resolved: true
        }
      ],
      transparency_score: 78,
      ingredient_disclosure: {
        fully_disclosed: 65,
        partially_disclosed: 25,
        not_disclosed: 10
      },
      nutrition_analysis: {
        protein: 32,
        fat: 14,
        carbohydrates: 28,
        fiber: 8,
        moisture: 10,
        calories_per_100g: 385
      },
      consumer_ratings: {
        palatability: 4.2,
        digestibility: 4.0,
        coat_quality: 4.3,
        stool_quality: 3.8,
        overall_satisfaction: 4.1
      },
      expert_reviews: [
        {
          expert_name: '김수의 수의사',
          rating: 4.5,
          comment: '영양학적 균형이 잘 잡혀있고, 특히 처방식의 경우 임상 데이터가 풍부합니다.',
          date: '2024-12-10'
        },
        {
          expert_name: '박영양 박사',
          rating: 4.0,
          comment: '품질 관리는 우수하나 원재료 출처 공개가 더 투명해질 필요가 있습니다.',
          date: '2024-11-28'
        }
      ],
      ingredients: [
        { name: '닭고기', percentage: 18, source: '프랑스산', disclosure_level: 'full' },
        { name: '쌀', percentage: 15, source: '미국산', disclosure_level: 'full' },
        { name: '옥수수', percentage: 12, disclosure_level: 'partial' },
        { name: '동물성 지방', percentage: 8, disclosure_level: 'partial' },
        { name: '식물성 단백질', percentage: 6, disclosure_level: 'none' },
        { name: '비트펄프', percentage: 5, source: '유럽산', disclosure_level: 'full' }
      ],
      community_feedback: {
        recommend_yes: 1247,
        recommend_no: 358,
        total_votes: 1605
      },
      qa_section: [
        {
          id: 'q1',
          user_name: '멍멍이맘',
          question: '로얄캐닌 소화기 처방식을 먹이고 있는데, 장기간 급여해도 괜찮을까요?',
          date: '2024-12-10',
          answer: {
            content: '소화기 처방식은 수의사의 지속적인 모니터링 하에 장기간 급여가 가능합니다. 다만 정기적인 건강검진을 통해 상태를 확인하시는 것을 권장드립니다.',
            answerer: '로얄캐닌 고객지원팀',
            date: '2024-12-11'
          },
          likes: 23,
          is_answered: true
        },
        {
          id: 'q2',
          user_name: '고양이집사',
          question: '실내 고양이용과 일반 성묘용의 차이점이 무엇인가요?',
          date: '2024-12-08',
          answer: {
            content: '실내 고양이용은 활동량이 적은 실내 환경을 고려하여 칼로리를 조절하고, 헤어볼 케어 성분을 강화했습니다. 또한 소화율을 높여 배변 냄새를 줄이는 데 도움을 줍니다.',
            answerer: '로얄캐닌 영양팀',
            date: '2024-12-09'
          },
          likes: 18,
          is_answered: true
        },
        {
          id: 'q3',
          user_name: '새집사',
          question: '다른 사료에서 로얄캐닌으로 바꿀 때 주의사항이 있나요?',
          date: '2024-12-07',
          likes: 12,
          is_answered: false
        }
      ],
      products: [
        {
          id: 'royal-canin-indoor',
          name: '로얄캐닌 인도어 성묘용',
          image: '🏠',
          description: '실내에서 생활하는 성묘를 위한 전용 사료로, 헤어볼 케어와 체중 관리에 도움을 줍니다.',
          certifications: ['AAFCO', 'FEDIAF', 'HACCP'],
          origin_info: {
            country_of_origin: '프랑스',
            manufacturing_country: '한국',
            manufacturing_facilities: ['김천공장']
          },
          ingredients: [
            '닭고기분', '쌀', '옥수수', '동물성지방', '식물성단백질', '비트펄프', 
            '어유', '대두유', '프락토올리고당', '차전자피', '루테인'
          ],
          guaranteed_analysis: {
            protein: '27% 이상',
            fat: '13% 이상',
            fiber: '5% 이하',
            moisture: '10% 이하',
            ash: '8.1% 이하'
          },
          pros: [
            '헤어볼 배출에 효과적인 섬유질 함량',
            '실내 고양이의 활동량을 고려한 적절한 칼로리',
            '소화율이 높아 배변 냄새 감소',
            '오메가-3 지방산으로 모질 개선'
          ],
          cons: [
            '옥수수 함량이 높아 알레르기 유발 가능성',
            '인공 보존료 사용',
            '상대적으로 높은 가격'
          ],
          consumer_ratings: {
            palatability: 4.2,
            digestibility: 4.0,
            coat_quality: 4.3,
            stool_quality: 3.8,
            overall_satisfaction: 4.1
          },
          community_feedback: {
            recommend_yes: 847,
            recommend_no: 203,
            total_votes: 1050
          },
          consumer_reviews: [
            {
              id: 'r1',
              user_name: '고양이맘123',
              rating: 4,
              comment: '우리 고양이가 정말 잘 먹어요. 헤어볼도 확실히 줄어든 것 같고, 변 냄새도 많이 개선되었습니다. 다만 가격이 조금 부담스럽긴 해요.',
              date: '2024-12-15',
              helpful_count: 12
            },
            {
              id: 'r2',
              user_name: '냥이아빠',
              rating: 5,
              comment: '수의사 선생님이 추천해주셔서 바꿨는데 정말 좋네요. 털도 윤기가 나고 소화도 잘 되는 것 같아요.',
              date: '2024-12-12',
              helpful_count: 8
            },
            {
              id: 'r3',
              user_name: '집사생활5년차',
              rating: 3,
              comment: '품질은 좋은데 우리 고양이가 처음엔 잘 안 먹더라고요. 지금은 적응해서 잘 먹고 있습니다.',
              date: '2024-12-10',
              helpful_count: 5
            }
          ]
        },
        {
          id: 'royal-canin-digestive',
          name: '로얄캐닌 다이제스티브 케어',
          image: '💊',
          description: '소화기가 민감한 고양이를 위한 특별 처방식으로, 소화율을 높이고 장 건강을 개선합니다.',
          certifications: ['AAFCO', 'FEDIAF', 'FDA'],
          origin_info: {
            country_of_origin: '프랑스',
            manufacturing_country: '프랑스',
            manufacturing_facilities: ['아이메르그 공장']
          },
          ingredients: [
            '쌀', '탈수닭고기', '동물성지방', '옥수수글루텐', '비트펄프',
            '어유', '대두유', '프락토올리고당', '마리골드추출물'
          ],
          guaranteed_analysis: {
            protein: '32% 이상',
            fat: '15% 이상',
            fiber: '1.4% 이하',
            moisture: '10% 이하'
          },
          pros: [
            '높은 소화율(90% 이상)',
            '프리바이오틱스로 장내 유익균 증식',
            '저섬유질로 소화기 부담 최소화',
            '수의사 처방식으로 신뢰성 높음'
          ],
          cons: [
            '처방식으로 일반 구매 어려움',
            '장기 급여 시 수의사 상담 필요',
            '높은 가격'
          ],
          consumer_ratings: {
            palatability: 3.8,
            digestibility: 4.6,
            coat_quality: 4.1,
            stool_quality: 4.4,
            overall_satisfaction: 4.2
          },
          community_feedback: {
            recommend_yes: 312,
            recommend_no: 88,
            total_votes: 400
          },
          consumer_reviews: [
            {
              id: 'r4',
              user_name: '소화불량냥이맘',
              rating: 5,
              comment: '소화기가 약한 우리 고양이에게 정말 좋아요. 설사도 멈추고 변 상태가 많이 좋아졌어요. 수의사님 처방 받아서 먹이고 있습니다.',
              date: '2024-12-14',
              helpful_count: 15
            },
            {
              id: 'r5',
              user_name: '처방식전문가',
              rating: 4,
              comment: '효과는 확실한데 기호성이 조금 떨어져요. 그래도 건강을 위해서 계속 먹이고 있습니다.',
              date: '2024-12-11',
              helpful_count: 7
            }
          ]
        }
      ]
    },
    'hills': {
      id: 'hills',
      name: '힐스',
      logo: '🏔️',
      manufacturer: "Hill's Pet Nutrition",
      country_of_origin: '미국',
      manufacturing_locations: ['미국 캔자스', '네덜란드 토펜', '체코 프라하'],
      established_year: 1948,
      certifications: ['AAFCO', 'FDA', 'ISO 9001'],
      brand_description: '힐스는 1948년 미국에서 설립된 반려동물 영양학의 선구자입니다. 수의사와 영양학자들이 개발한 과학적 영양 솔루션으로 전 세계 수의사들이 가장 많이 추천하는 브랜드입니다. 220여 명의 수의사, 영양학자, 식품과학자들이 지속적인 연구를 통해 반려동물의 건강한 삶을 위한 혁신적인 제품을 개발하고 있습니다.',
      manufacturing_info: '힐스는 미국, 네덜란드, 체코 등 전 세계 주요 거점에 최첨단 제조 시설을 운영합니다. 모든 제조 공장은 FDA, AAFCO 등의 엄격한 기준을 준수하며, 원료 입고부터 완제품 출하까지 700여 가지 품질 검사를 실시합니다. 지속가능한 소싱을 위해 책임감 있는 공급업체와 파트너십을 구축하고 있습니다.',
      brand_pros: [
        '수의사들이 가장 많이 추천하는 브랜드',
        '임상 연구를 통해 검증된 영양 균형',
        '천연 항산화제로 면역력 강화',
        '소화가 잘되는 고품질 단백질 사용'
      ],
      brand_cons: [
        '옥수수 글루텐 함량이 높음',
        '일부 개체에서 알레르기 반응 가능',
        '상대적으로 높은 가격'
      ],
      recall_history: [
        {
          date: '2023-07-22',
          reason: '금속 이물질 검출',
          severity: 'high',
          resolved: true
        }
      ],
      transparency_score: 85,
      ingredient_disclosure: {
        fully_disclosed: 78,
        partially_disclosed: 18,
        not_disclosed: 4
      },
      nutrition_analysis: {
        protein: 30,
        fat: 16,
        carbohydrates: 25,
        fiber: 7,
        moisture: 9,
        calories_per_100g: 392
      },
      consumer_ratings: {
        palatability: 3.9,
        digestibility: 4.4,
        coat_quality: 4.1,
        stool_quality: 4.2,
        overall_satisfaction: 4.2
      },
      expert_reviews: [
        {
          expert_name: '이건강 수의사',
          rating: 4.8,
          comment: '임상 연구 기반의 과학적 접근이 돋보이며, 처방식의 효과가 뛰어납니다.',
          date: '2024-12-05'
        }
      ],
      ingredients: [
        { name: '닭고기분', percentage: 22, source: '미국산', disclosure_level: 'full' },
        { name: '현미', percentage: 16, source: '미국산', disclosure_level: 'full' },
        { name: '보리', percentage: 10, source: '캐나다산', disclosure_level: 'full' },
        { name: '닭지방', percentage: 9, disclosure_level: 'partial' },
        { name: '천연향료', percentage: 3, disclosure_level: 'none' }
      ],
      community_feedback: {
        recommend_yes: 892,
        recommend_no: 201,
        total_votes: 1093
      },
      qa_section: [
        {
          id: 'h1',
          user_name: '강아지아빠',
          question: '힐스 처방식 i/d는 어떤 경우에 급여하나요?',
          date: '2024-12-09',
          answer: {
            content: 'i/d는 소화기 질환이 있는 반려동물을 위한 처방식입니다. 설사, 구토, 염증성 장질환 등의 증상이 있을 때 수의사 처방 하에 급여하시면 됩니다.',
            answerer: '힐스 수의영양팀',
            date: '2024-12-10'
          },
          likes: 31,
          is_answered: true
        },
        {
          id: 'h2',
          user_name: '냥이엄마',
          question: '힐스 사료의 원산지가 궁금합니다.',
          date: '2024-12-06',
          likes: 15,
          is_answered: false
        }
      ],
      products: [
        {
          id: 'hills-science-diet',
          name: '힐스 사이언스 다이어트 어덜트',
          image: '🥘',
          description: '성견을 위한 균형잡힌 영양식으로, 과학적으로 검증된 레시피로 전반적인 건강을 지원합니다.',
          certifications: ['AAFCO', 'FDA', 'ISO 9001'],
          origin_info: {
            country_of_origin: '미국',
            manufacturing_country: '미국',
            manufacturing_facilities: ['캔자스 공장', '노스캐롤라이나 공장']
          },
          ingredients: [
            '닭고기분', '현미', '보리', '닭지방', '옥수수글루텐분',
            '천연향료', '아마씨', '당근', '시금치', '토마토'
          ],
          guaranteed_analysis: {
            protein: '21% 이상',
            fat: '13% 이상',
            fiber: '4% 이하',
            moisture: '10% 이하',
            calcium: '0.7% 이상',
            phosphorus: '0.6% 이상'
          },
          pros: [
            '수의사들이 가장 많이 추천하는 브랜드',
            '임상 연구를 통해 검증된 영양 균형',
            '천연 항산화제로 면역력 강화',
            '소화가 잘되는 고품질 단백질 사용'
          ],
          cons: [
            '옥수수 글루텐 함량이 높음',
            '일부 개체에서 알레르기 반응 가능',
            '상대적으로 높은 가격'
          ],
          consumer_ratings: {
            palatability: 3.9,
            digestibility: 4.4,
            coat_quality: 4.1,
            stool_quality: 4.2,
            overall_satisfaction: 4.2
          },
          community_feedback: {
            recommend_yes: 623,
            recommend_no: 177,
            total_votes: 800
          },
          consumer_reviews: [
            {
              id: 'h1',
              user_name: '강아지사랑',
              rating: 4,
              comment: '수의사들이 추천하는 이유가 있네요. 우리 강아지 소화도 잘 되고 털도 좋아졌어요. 다만 옥수수 성분이 좀 아쉬워요.',
              date: '2024-12-13',
              helpful_count: 18
            },
            {
              id: 'h2',
              user_name: '건강한반려생활',
              rating: 5,
              comment: '과학적으로 검증된 영양 균형이 정말 좋은 것 같아요. 가격은 비싸지만 그만한 가치가 있다고 생각합니다.',
              date: '2024-12-11',
              helpful_count: 22
            },
            {
              id: 'h3',
              user_name: '멍멍이집사',
              rating: 3,
              comment: '품질은 좋은데 우리 강아지가 알레르기 반응을 보여서 중단했어요. 개체차가 있는 것 같습니다.',
              date: '2024-12-09',
              helpful_count: 9
            }
          ]
        },
        {
          id: 'hills-prescription-id',
          name: '힐스 처방식 i/d',
          image: '🏥',
          description: '소화기 질환이 있는 반려동물을 위한 특별 처방식으로, 소화기 건강 회복을 돕습니다.',
          certifications: ['AAFCO', 'FDA', 'FEDIAF'],
          origin_info: {
            country_of_origin: '미국',
            manufacturing_country: '네덜란드',
            manufacturing_facilities: ['토펜 공장']
          },
          ingredients: [
            '쌀', '닭고기분', '옥수수전분', '닭지방', '계란분',
            '셀룰로오스', '어유', '비트펄프', '프락토올리고당'
          ],
          guaranteed_analysis: {
            protein: '22.6% 이상',
            fat: '14.9% 이상',
            fiber: '1.4% 이하',
            moisture: '10% 이하'
          },
          pros: [
            '높은 소화율로 위장 부담 최소화',
            '전해질 균형 유지로 설사 개선',
            '프리바이오틱스로 장내 환경 개선',
            '수의사 처방으로 안전성 보장'
          ],
          cons: [
            '수의사 처방 없이 구매 불가',
            '장기 사용 시 영양 불균형 우려',
            '매우 높은 가격',
            '기호성이 떨어질 수 있음'
          ],
          consumer_ratings: {
            palatability: 3.5,
            digestibility: 4.7,
            coat_quality: 3.9,
            stool_quality: 4.6,
            overall_satisfaction: 4.1
          },
          community_feedback: {
            recommend_yes: 269,
            recommend_no: 131,
            total_votes: 400
          },
          consumer_reviews: [
            {
              id: 'h4',
              user_name: '소화기전문집사',
              rating: 5,
              comment: '설사로 고생하던 우리 강아지가 이 사료로 완전히 좋아졌어요. 처방식이라 비싸지만 효과는 확실합니다.',
              date: '2024-12-12',
              helpful_count: 25
            },
            {
              id: 'h5',
              user_name: '수의사추천',
              rating: 4,
              comment: '수의사님이 추천해주신 사료입니다. 소화율이 정말 높고 변 상태가 많이 개선되었어요.',
              date: '2024-12-08',
              helpful_count: 13
            },
            {
              id: 'h6',
              user_name: '처방식사용자',
              rating: 3,
              comment: '효과는 좋은데 기호성이 떨어져서 먹이기가 힘들어요. 그래도 건강을 위해 계속 사용 중입니다.',
              date: '2024-12-05',
              helpful_count: 8
            }
          ]
        }
      ]
    }
  }
  
  return brands[brandName] || brands['royal-canin']
}

const getTransparencyColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getTransparencyBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

const getDisclosureIcon = (level: string) => {
  switch (level) {
    case 'full': return <Eye className="h-4 w-4 text-green-500" />
    case 'partial': return <Minus className="h-4 w-4 text-yellow-500" />
    case 'none': return <EyeOff className="h-4 w-4 text-red-500" />
    default: return <Minus className="h-4 w-4 text-gray-400" />
  }
}

export default function BrandDetailPage() {
  const params = useParams()
  const brandName = decodeURIComponent(params.brandName as string)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showQAForm, setShowQAForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showEvaluationSuccess, setShowEvaluationSuccess] = useState(false)
  const [voteData, setVoteData] = useState<{
    recommend_yes: number
    recommend_no: number
    total_votes: number
    recommendation_percentage: number
    user_vote?: 'yes' | 'no' | null
  } | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [evaluationData, setEvaluationData] = useState<{
    totalEvaluations: number
    averageRatings: any
    recommendationRate: number
    recentEvaluations: any[]
  } | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Record<string, Record<string, boolean>>>({})
  const [defaultVote, setDefaultVote] = useState<'yes' | 'no'>('yes')

  useEffect(() => {
    // API에서 브랜드 데이터 가져오기
    const fetchBrandData = async () => {
      try {
        const response = await fetch(`/api/brands?search=${encodeURIComponent(brandName)}`)
        if (response.ok) {
          const brands = await response.json()
          if (brands && brands.length > 0) {
            // Supabase에서 가져온 데이터를 Brand 형식으로 변환
            const apiData = brands[0]
            const brandData: Brand = {
              id: apiData.id || brandName.toLowerCase().replace(/\s+/g, '-'),
              name: apiData.name,
              logo: '🐾', // 기본 로고
              manufacturer: apiData.manufacturer,
              country_of_origin: apiData.country,
              manufacturing_locations: [], // TODO: 추후 추가
              established_year: apiData.established_year,
              certifications: apiData.certifications || [],
              brand_description: apiData.brand_description || '',
              manufacturing_info: apiData.manufacturing_info || '',
              brand_pros: apiData.brand_pros || [],
              brand_cons: apiData.brand_cons || [],
              transparency_score: 75, // 기본 점수
              recall_history: apiData.recall_history || [],
              ingredient_disclosure: {
                fully_disclosed: 0,
                partially_disclosed: 0,
                not_disclosed: 0
              },
              nutrition_analysis: {
                protein: 0,
                fat: 0,
                carbohydrates: 0,
                fiber: 0,
                moisture: 0,
                calories_per_100g: 0
              },
              consumer_ratings: {
                palatability: 0,
                digestibility: 0,
                coat_quality: 0,
                stool_quality: 0,
                overall_satisfaction: 0
              },
              expert_reviews: [],
              ingredients: [],
              community_feedback: {
                recommend_yes: 0,
                recommend_no: 0,
                total_votes: 0
              },
              qa_section: [], // TODO: 추후 추가
              products: [] // TODO: 추후 추가
            }
    setBrand(brandData)
          } else {
            // API에 데이터가 없으면 레거시 데이터 사용
            const legacyData = getBrandDataLegacy(brandName)
            setBrand(legacyData)
          }
        } else {
          // API 오류 시 레거시 데이터 사용
          const legacyData = getBrandDataLegacy(brandName)
          setBrand(legacyData)
        }
      } catch (error) {
        console.error('브랜드 데이터 로딩 오류:', error)
        // 에러 시 레거시 데이터 사용
        const legacyData = getBrandDataLegacy(brandName)
        setBrand(legacyData)
      }
    }

    fetchBrandData()
    
    // 투표 데이터 가져오기
    fetchVoteData()
    
    // 평가 데이터 가져오기
    fetchEvaluationData()
    
    // URL 파라미터 확인 (평가 성공 시)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('evaluation') === 'success') {
      setShowEvaluationSuccess(true)
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', `/brands/${brandName}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandName])

  const fetchVoteData = async () => {
    try {
      const response = await fetch(`/api/brands/${brandName}/vote`)
      if (response.ok) {
        const data = await response.json()
        setVoteData(data)
      }
    } catch (error) {
      console.error('투표 데이터 로딩 오류:', error)
    }
  }

  const fetchEvaluationData = async () => {
    try {
      const response = await fetch(`/api/brands/${brandName}/evaluate`)
      if (response.ok) {
        const data = await response.json()
        setEvaluationData(data)
      }
    } catch (error) {
      console.error('평가 데이터 가져오기 실패:', error)
    }
  }

  const handleVote = async (vote: 'yes' | 'no') => {
    if (isVoting) return

    setIsVoting(true)
    try {
      // 임시 사용자 ID (실제로는 로그인 시스템에서 가져옴)
      const userId = `user-${Date.now()}`
      
      const response = await fetch(`/api/brands/${brandName}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote, userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setVoteData(data)
        // 투표 후 기본값 상태 업데이트
        setDefaultVote(vote)
      } else {
        console.error('투표 실패')
      }
    } catch (error) {
      console.error('투표 오류:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || isSubmittingQuestion) return

    setIsSubmittingQuestion(true)
    try {
      // 실제로는 API 호출로 질문을 저장
      // 여기서는 임시로 로컬 상태만 업데이트
      const newQ: BrandQuestion = {
        id: `q-${Date.now()}`,
        user_name: '익명사용자',
        question: newQuestion.trim(),
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        is_answered: false
      }

      if (brand) {
        const updatedBrand = {
          ...brand,
          qa_section: [newQ, ...brand.qa_section]
        }
        setBrand(updatedBrand)
      }

      setNewQuestion('')
      setShowQAForm(false)
      
      // 성공 메시지 표시 (실제로는 토스트 등 사용)
      alert('질문이 등록되었습니다. 브랜드 담당자가 확인 후 답변드릴 예정입니다.')
    } catch (error) {
      console.error('질문 등록 오류:', error)
      alert('질문 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmittingQuestion(false)
    }
  }

  const toggleProductSection = (productId: string, section: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [section]: !prev[productId]?.[section]
      }
    }))
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">브랜드 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const recommendationPercentage = voteData ? voteData.recommendation_percentage : 
    Math.round((brand.community_feedback.recommend_yes / brand.community_feedback.total_votes) * 100)

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center space-x-4">
            <Link href="/brands" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{brand.logo}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
                <p className="text-gray-600">{brand.manufacturer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브랜드 프로필 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">브랜드 프로필</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 제조국 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">원산지</p>
                <p className="font-medium text-gray-900">{brand.country_of_origin}</p>
              </div>
            </div>

            {/* 설립연도 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">설립연도</p>
                <p className="font-medium text-gray-900">{brand.established_year}년</p>
              </div>
            </div>

            {/* 제조 공장 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Factory className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">제조 공장</p>
                <p className="font-medium text-gray-900">{brand.manufacturing_locations.length}개 지역</p>
              </div>
            </div>

          </div>

          {/* 브랜드 정보 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">📖 {brand.name}에 대해서</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{brand.brand_description}</p>
      </div>

          {/* 제조 및 소싱 정보 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">🏭 제조 및 소싱에 대해서</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{brand.manufacturing_info}</p>
          </div>


          {/* 리콜 이력 */}
          {brand.recall_history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">⚠️ 리콜 이력</h3>
              <div className="space-y-3">
                {brand.recall_history.map((recall, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getSeverityColor(recall.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{recall.reason}</span>
                      </div>
                      <span className="text-xs text-gray-600">{recall.date}</span>
                    </div>
                    {recall.resolved && (
                      <div className="mt-1 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">해결 완료</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 브랜드 평가 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 신뢰하는 이유 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
                  신뢰하는 이유
                </h3>
                <div className="space-y-2">
                  {brand.brand_pros.map((pro, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{pro}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 보완하면 좋은 점 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  보완하면 좋은 점
                </h3>
                <div className="space-y-2">
                  {brand.brand_cons.map((con, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{con}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 투명성 점수 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🔍 투명성 점수</h2>
            
            {/* 전체 점수 */}
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold ${getTransparencyColor(brand.transparency_score)} mb-2`}>
                {brand.transparency_score}점
                </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full ${getTransparencyBgColor(brand.transparency_score)}`}
                  style={{ width: `${brand.transparency_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {brand.transparency_score >= 80 ? '매우 투명' : 
                 brand.transparency_score >= 60 ? '보통 투명' : '투명성 부족'}
              </p>
            </div>

            {/* 공개 상태 분포 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">완전 공개</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {brand.ingredient_disclosure.fully_disclosed}%
                </span>
                </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Minus className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">부분 공개</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">
                  {brand.ingredient_disclosure.partially_disclosed}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EyeOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-700">미공개</span>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {brand.ingredient_disclosure.not_disclosed}%
                </span>
              </div>
            </div>
          </div>

          {/* 제품 개수 요약 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📦 제품 라인업</h2>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {brand.products.length}개
                    </div>
              <p className="text-sm text-gray-600">등록된 제품</p>
                  </div>

            <div className="space-y-3">
              {brand.products.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{product.image}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                </div>
                    </div>
              ))}
                  </div>
                    </div>
                    </div>
                      
        {/* 제품군별 상세 정보 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🧪 제품군별 상세 분석</h2>
          
          <div className="space-y-8">
            {brand.products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-6">
                {/* 제품 헤더 */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-4xl">{product.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        {product.certifications.map((cert, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                            <Shield className="h-3 w-3 mr-1" />
                            {cert}
                          </span>
                        ))}
                  </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                </div>

                {/* 드롭다운 섹션들 */}
                <div className="space-y-4">
                  {/* 1. 원산지, 제조국, 제조 공장 정보 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'origin')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                  <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900">원산지 & 제조 정보</span>
                    </div>
                      {expandedProducts[product.id]?.origin ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.origin && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {product.origin_info.country_of_origin && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">원산지</p>
                              <p className="text-sm text-gray-600">{product.origin_info.country_of_origin}</p>
                  </div>
                          )}
                          {product.origin_info.manufacturing_country && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">제조국</p>
                              <p className="text-sm text-gray-600">{product.origin_info.manufacturing_country}</p>
                </div>
                          )}
                          {product.origin_info.manufacturing_facilities && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">제조 공장</p>
                              <div className="space-y-1">
                                {product.origin_info.manufacturing_facilities.map((facility, idx) => (
                                  <p key={idx} className="text-sm text-gray-600">{facility}</p>
                                ))}
              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                      </div>
                      
                  {/* 2. 원료명칭 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'ingredients')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-gray-900">원료명칭</span>
                      </div>
                      {expandedProducts[product.id]?.ingredients ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.ingredients && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                          {product.ingredients.map((ingredient, idx) => (
                            <span key={idx} className="inline-block px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                              {ingredient}
                </span>
                          ))}
                        </div>
                        </div>
                    )}
                      </div>
                      
                  {/* 3. 등록성분량 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'analysis')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <TestTube className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-gray-900">등록성분량</span>
                </div>
                      {expandedProducts[product.id]?.analysis ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.analysis && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {Object.entries(product.guaranteed_analysis).map(([key, value]) => {
                            const labels: Record<string, string> = {
                              protein: '조단백질',
                              fat: '조지방',
                              fiber: '조섬유',
                              moisture: '수분',
                              ash: '조회분',
                              calcium: '칼슘',
                              phosphorus: '인'
                            }
                            return (
                              <div key={key} className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">{labels[key]}</p>
                                <p className="text-lg font-bold text-purple-900">{value}</p>
                </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. 추천 이유 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'pros')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-gray-900">추천 이유</span>
                      </div>
                      {expandedProducts[product.id]?.pros ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.pros && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="space-y-2 mt-4">
                          {product.pros.map((pro, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{pro}</p>
            </div>
            ))}
                        </div>
                      </div>
                    )}
          </div>

                  {/* 5. 비추천 이유 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'cons')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <ThumbsDown className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-gray-900">비추천 이유</span>
                </div>
                      {expandedProducts[product.id]?.cons ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.cons && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="space-y-2 mt-4">
                          {product.cons.map((con, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{con}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

          {/* 소비자 평가 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    소비자 평가
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 평가 점수 */}
                    <div>
                      <div className="space-y-3">
                        {Object.entries(product.consumer_ratings).map(([key, rating]) => {
                const labels: Record<string, string> = {
                  palatability: '기호성',
                  digestibility: '소화력', 
                  coat_quality: '모질 개선',
                  stool_quality: '변 상태',
                  overall_satisfaction: '전체 만족도'
                }
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{labels[key]}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
                    </div>
                  </div>
                )
              })}
                      </div>
                </div>

            {/* 커뮤니티 추천 */}
                    <div className="flex flex-col justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                          {Math.round((product.community_feedback.recommend_yes / product.community_feedback.total_votes) * 100)}%
                </div>
                <p className="text-sm text-gray-600 mb-3">
                          {product.community_feedback.total_votes}명이 평가
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                              {product.community_feedback.recommend_yes}
                    </span>
            </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">
                              {product.community_feedback.recommend_no}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

                  {/* 소비자 리뷰 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h5 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />
                      소비자 리뷰 ({product.consumer_reviews.length})
                    </h5>
            
            <div className="space-y-4">
                      {product.consumer_reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">{review.user_name}</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                    </div>
                    </div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                          <p className="text-sm text-gray-700 mb-2 leading-relaxed">{review.comment}</p>
                          <div className="flex items-center justify-between">
                            <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                              <ThumbsUp className="h-3 w-3" />
                              <span>도움됨 {review.helpful_count}</span>
                            </button>
                          </div>
              </div>
              ))}
            </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* 브랜드 질문하기 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">💬 브랜드 질문하기</h2>
            <button 
              onClick={() => setShowQAForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>질문 등록</span>
            </button>
          </div>

          {/* 질문 목록 */}
          <div className="space-y-6">
            {brand.qa_section.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>아직 등록된 질문이 없습니다.</p>
                <p className="text-sm">첫 번째 질문을 남겨보세요!</p>
              </div>
            ) : (
              brand.qa_section.map((qa) => (
                <div key={qa.id} className="border border-gray-200 rounded-lg p-4">
                  {/* 질문 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{qa.user_name}</span>
                        <span className="text-xs text-gray-500">{qa.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{qa.likes}</span>
                        </button>
                        {qa.is_answered && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            답변완료
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{qa.question}</p>
                  </div>

                  {/* 답변 */}
                  {qa.answer && (
                    <div className="ml-6 pl-4 border-l-2 border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-700">{qa.answer.answerer}</span>
                        <span className="text-xs text-gray-500">{qa.answer.date}</span>
                      </div>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{qa.answer.content}</p>
                    </div>
                  )}

                  {/* 답변 대기 중 */}
                  {!qa.is_answered && (
                    <div className="ml-6 pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="text-sm">브랜드 담당자 답변 대기 중...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
            <Link 
              href={`/brands/${brandName}/evaluate`}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Star className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">이 브랜드 평가하기</span>
            </Link>
            
            <button 
              onClick={() => setShowReportForm(true)}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Flag className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-600">문제 신고하기</span>
            </button>

          {/* 투표 위젯 */}
            <div className="flex items-center justify-center space-x-2">
              <button 
                onClick={() => handleVote('yes')}
                disabled={isVoting}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                  voteData?.user_vote === 'yes' || (!voteData?.user_vote && defaultVote === 'yes')
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="text-sm">추천</span>
              </button>
              <button 
                onClick={() => handleVote('no')}
                disabled={isVoting}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                  voteData?.user_vote === 'no' 
                    ? 'bg-red-600 text-white' 
                    : voteData?.user_vote || defaultVote === 'no'
                      ? 'bg-gray-300 text-gray-600 hover:bg-red-500 hover:text-white'
                      : 'bg-gray-300 text-gray-600 hover:bg-red-500 hover:text-white'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="text-sm">비추천</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Q&A 모달 */}
      {showQAForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">브랜드에 질문하기</h3>
            <p className="text-sm text-gray-600 mb-4">
              브랜드 담당자가 직접 답변해드립니다. 궁금한 점을 자세히 적어주세요.
            </p>
            <textarea 
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none" 
              rows={4} 
              placeholder="예: 알레르기가 있는 강아지도 안전하게 먹을 수 있나요?"
              maxLength={500}
            />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">
                {newQuestion.length}/500자
              </span>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowQAForm(false)
                  setNewQuestion('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmittingQuestion}
              >
                취소
              </button>
              <button 
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || isSubmittingQuestion}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingQuestion ? '등록 중...' : '질문 등록'}
              </button>
                </div>
                </div>
              </div>
      )}

      {/* 신고 모달 */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">문제 신고하기</h3>
            <select className="w-full p-3 border border-gray-300 rounded-lg mb-4">
              <option>허위 정보</option>
              <option>품질 문제</option>
              <option>안전 문제</option>
              <option>기타</option>
                </select>
                <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4" 
                  rows={4}
              placeholder="상세 내용을 입력해주세요..."
            ></textarea>
            <div className="flex space-x-3">
                <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                신고하기
                </button>
              </div>
          </div>
        </div>
      )}

      {/* 평가 성공 모달 */}
      {showEvaluationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">평가 완료!</h3>
            <p className="text-gray-600 mb-6">
              소중한 평가를 남겨주셔서 감사합니다.<br />
              다른 반려인들에게 큰 도움이 될 것입니다.
            </p>
            <button 
              onClick={() => setShowEvaluationSuccess(false)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 