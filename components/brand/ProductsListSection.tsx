'use client'

import ProductListItem from './ProductListItem'

interface ProductsListSectionProps {
  products: Array<{
    id: string
    name: string
    description?: string
    grade?: string
    grade_text?: string
    certifications?: string[]
    consumer_ratings?: {
      palatability?: number
      digestibility?: number
      coat_quality?: number
      stool_quality?: number
      overall_satisfaction?: number
    }
    community_feedback?: {
      recommend_yes: number
      recommend_no: number
      total_votes: number
    }
  }>
}

export default function ProductsListSection({ products }: ProductsListSectionProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-lg font-medium mb-2">등록된 제품이 없습니다</p>
          <p className="text-sm">곧 제품 정보가 업데이트될 예정입니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          전체 제품 ({products.length})
        </h2>
        <div className="text-sm text-gray-600">
          제품을 클릭하면 상세 정보를 확인할 수 있습니다
        </div>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <ProductListItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
