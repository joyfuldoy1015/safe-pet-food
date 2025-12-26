import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SearchPage from '@/app/search/page'

// Mock fetch
global.fetch = jest.fn()

describe('SearchPage - 검색 허브 통합 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('1. /search 탭 전환 시 브랜드/제품 리스트가 각각 렌더되는지', async () => {
    // Mock API responses
    const mockBrands = [
      {
        id: 'brand-1',
        name: '로얄캐닌',
        manufacturer: 'Royal Canin',
        description: '프리미엄 사료',
        country: '프랑스',
        established_year: 1968,
        certifications: ['AAFCO'],
        transparency_score: 85,
        products_count: 5
      }
    ]

    const mockProducts = [
      {
        id: 'product-1',
        brand_id: 'brand-1',
        name: '로얄캐닌 어덜트',
        description: '성견용 사료',
        grade: 'A' as const,
        grade_text: '매우 우수',
        certifications: ['AAFCO 승인']
      }
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBrands
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

    render(<SearchPage />)

    // 브랜드 탭이 기본으로 활성화되어 있는지 확인
    await waitFor(() => {
      expect(screen.getByText('로얄캐닌')).toBeTruthy()
    })

    // 제품 탭으로 전환
    const productTab = screen.getByRole('button', { name: /제품 \(\d+\)/ })
    fireEvent.click(productTab)

    // 제품 리스트가 렌더되는지 확인
    await waitFor(() => {
      expect(screen.getByText('로얄캐닌 어덜트')).toBeTruthy()
    })

    // 브랜드 탭으로 다시 전환
    const brandTab = screen.getByRole('button', { name: /브랜드 \(\d+\)/ })
    fireEvent.click(brandTab)

    // 브랜드 리스트가 다시 렌더되는지 확인
    await waitFor(() => {
      expect(screen.getByText('로얄캐닌')).toBeTruthy()
    })
  })

  test('2. 검색 필터링이 브랜드/제품 카운트에 반영되는지', async () => {
    const mockBrands = [
      {
        id: 'brand-1',
        name: '로얄캐닌',
        manufacturer: 'Royal Canin',
        country: '프랑스',
        established_year: 1968,
        certifications: []
      },
      {
        id: 'brand-2',
        name: '오리젠',
        manufacturer: 'Champion Petfoods',
        country: '캐나다',
        established_year: 1985,
        certifications: []
      }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrands
    })

    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText(/브랜드 \(2\)/)).toBeTruthy()
    })

    // 검색어 입력
    const searchInput = screen.getByPlaceholderText(/브랜드명 또는 제품명을 검색하세요/)
    fireEvent.change(searchInput, { target: { value: '로얄캐닌' } })

    // 필터링된 카운트 확인
    await waitFor(() => {
      expect(screen.getByText(/브랜드 \(1\)/)).toBeTruthy()
    })

    // 로얄캐닌만 표시되는지 확인
    expect(screen.getByText('로얄캐닌')).toBeTruthy()
    expect(screen.queryByText('오리젠')).toBeNull()
  })
})
