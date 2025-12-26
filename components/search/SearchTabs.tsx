'use client'

interface SearchTabsProps {
  activeTab: 'brands' | 'products'
  onTabChange: (tab: 'brands' | 'products') => void
  brandCount: number
  productCount: number
}

export default function SearchTabs({
  activeTab,
  onTabChange,
  brandCount,
  productCount
}: SearchTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-8">
        <button
          onClick={() => onTabChange('brands')}
          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'brands'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          브랜드 ({brandCount})
        </button>
        <button
          onClick={() => onTabChange('products')}
          className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'products'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          제품 ({productCount})
        </button>
      </div>
    </div>
  )
}
