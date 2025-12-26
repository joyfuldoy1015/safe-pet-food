import { render, screen, waitFor } from '@testing-library/react'
import ProductDetailPage from '@/app/products/[productId]/page'

// Mock the services
jest.mock('@/lib/services/products', () => ({
  getProductById: jest.fn(),
  getBrandById: jest.fn(),
  getProductsByBrandId: jest.fn()
}))

import { getProductById, getBrandById, getProductsByBrandId } from '@/lib/services/products'

describe('ProductDetailPage - 제품 상세 브랜드 링크 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('제품 상세에 브랜드 링크가 존재하는지', async () => {
    const mockProduct = {
      id: 'product-1',
      brand_id: 'brand-royal-canin',
      name: '로얄캐닌 어덜트',
      description: '성견용 사료',
      grade: 'A' as const,
      grade_text: '매우 우수',
      image: '🍖',
      certifications: ['AAFCO 승인'],
      origin_info: {
        origin_country: '프랑스',
        manufacturing_country: '한국',
        factory_location: '경기도 평택시'
      },
      ingredients: [
        { name: '닭고기', percentage: 28, source: '프랑스산' }
      ],
      guaranteed_analysis: {
        protein: 25.0,
        fat: 14.0,
        fiber: 3.5,
        moisture: 10.0
      },
      consumer_ratings: {
        palatability: 4.5,
        digestibility: 4.2,
        coat_quality: 4.3,
        stool_quality: 4.1,
        overall_satisfaction: 4.4
      },
      community_feedback: {
        recommend_yes: 842,
        recommend_no: 158,
        total_votes: 1000
      },
      consumer_reviews: [],
      pros: ['높은 기호성'],
      cons: ['상대적으로 높은 가격']
    }

    const mockBrand = {
      id: 'brand-royal-canin',
      name: '로얄캐닌',
      manufacturer: 'Royal Canin SAS',
      country: '프랑스',
      image: '🏰'
    }

    const mockRelatedProducts: any[] = []

    ;(getProductById as jest.Mock).mockResolvedValue(mockProduct)
    ;(getBrandById as jest.Mock).mockResolvedValue(mockBrand)
    ;(getProductsByBrandId as jest.Mock).mockResolvedValue(mockRelatedProducts)

    render(
      await ProductDetailPage({
        params: { productId: 'product-1' }
      })
    )

    // 브랜드 링크가 존재하는지 확인
    await waitFor(() => {
      const brandLink = screen.getByRole('link', { name: /로얄캐닌/i })
      expect(brandLink).toBeTruthy()
      expect((brandLink as HTMLAnchorElement).href).toContain('/brands/로얄캐닌')
    })

    // 제품 정보가 표시되는지 확인
    expect(screen.getByText('로얄캐닌 어덜트')).toBeTruthy()
    expect(screen.getByText('A 매우 우수')).toBeTruthy()
  })

  test('브랜드 정보가 없을 때에도 제품 상세가 정상 렌더되는지', async () => {
    const mockProduct = {
      id: 'product-1',
      brand_id: 'brand-unknown',
      name: '테스트 제품',
      description: '테스트 설명',
      grade: 'B' as const,
      grade_text: '우수'
    }

    ;(getProductById as jest.Mock).mockResolvedValue(mockProduct)
    ;(getBrandById as jest.Mock).mockResolvedValue(null)
    ;(getProductsByBrandId as jest.Mock).mockResolvedValue([])

    render(
      await ProductDetailPage({
        params: { productId: 'product-1' }
      })
    )

    await waitFor(() => {
      expect(screen.getByText('테스트 제품')).toBeTruthy()
    })

    // 브랜드 링크가 없어도 에러 없이 렌더됨
    expect(screen.queryByText('브랜드 링크')).toBeNull()
  })
})
