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
    <div className="flex gap-1">
      <button
        onClick={() => onTabChange('products')}
        className={`py-3 px-4 text-sm font-medium rounded-t-xl transition-colors ${
          activeTab === 'products'
            ? 'bg-white text-violet-600 border-t border-l border-r border-gray-100'
            : 'text-gray-500 hover:text-gray-700 bg-gray-50'
        }`}
      >
        제품 <span className="text-xs text-gray-400 ml-1">{productCount}</span>
      </button>
      <button
        onClick={() => onTabChange('brands')}
        className={`py-3 px-4 text-sm font-medium rounded-t-xl transition-colors ${
          activeTab === 'brands'
            ? 'bg-white text-violet-600 border-t border-l border-r border-gray-100'
            : 'text-gray-500 hover:text-gray-700 bg-gray-50'
        }`}
      >
        브랜드 <span className="text-xs text-gray-400 ml-1">{brandCount}</span>
      </button>
    </div>
  )
}
