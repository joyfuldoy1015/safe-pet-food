import { render, screen } from '@testing-library/react'
import ProductsListSection from '@/components/brand/ProductsListSection'

describe('ProductsListSection - 브랜드 상세 제품 링크 테스트', () => {
  test('브랜드 상세 제품 리스트의 링크가 /products/[id]를 가리키는지', () => {
    const mockProducts = [
      {
        id: 'product-royal-canin-adult',
        name: '로얄캐닌 어덜트',
        description: '성견용 사료',
        grade: 'A' as const,
        grade_text: '매우 우수',
        certifications: ['AAFCO 승인'],
        consumer_ratings: {
          palatability: 4.5,
          digestibility: 4.3,
          coat_quality: 4.2,
          stool_quality: 4.4,
          overall_satisfaction: 4.4
        },
        community_feedback: {
          recommend_yes: 120,
          recommend_no: 10,
          total_votes: 130
        }
      },
      {
        id: 'product-royal-canin-puppy',
        name: '로얄캐닌 퍼피',
        description: '자견용 사료',
        grade: 'A' as const,
        grade_text: '매우 우수',
        certifications: ['AAFCO 승인'],
        consumer_ratings: {
          palatability: 4.7,
          digestibility: 4.5,
          coat_quality: 4.3,
          stool_quality: 4.6,
          overall_satisfaction: 4.6
        },
        community_feedback: {
          recommend_yes: 95,
          recommend_no: 5,
          total_votes: 100
        }
      }
    ]

    render(<ProductsListSection products={mockProducts} />)

    // 제품 링크가 존재하는지 확인
    const adultLink = screen.getByRole('link', { name: /로얄캐닌 어덜트/i })
    const puppyLink = screen.getByRole('link', { name: /로얄캐닌 퍼피/i })

    // 링크가 올바른 경로를 가리키는지 확인
    expect((adultLink as HTMLAnchorElement).href).toContain('/products/product-royal-canin-adult')
    expect((puppyLink as HTMLAnchorElement).href).toContain('/products/product-royal-canin-puppy')
  })

  test('제품이 없을 때 빈 상태 UI가 표시되는지', () => {
    render(<ProductsListSection products={[]} />)

    expect(screen.getByText(/등록된 제품이 없습니다/i)).toBeTruthy()
    expect(screen.getByText(/곧 제품 정보가 업데이트될 예정입니다/i)).toBeTruthy()
  })
})
