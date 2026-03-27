'use client'

import React from 'react'

interface BrandOption {
  id: string
  name: string
}

interface ProductOption {
  id: string
  name: string
}

interface BrandProductPickerProps {
  brand: string
  product: string
  onBrandChange: (brand: string) => void
  onProductChange: (product: string) => void
  brandOptions: BrandOption[]
  productOptions: ProductOption[]
  isCustomBrand: boolean
  setIsCustomBrand: (v: boolean) => void
  isCustomProduct: boolean
  setIsCustomProduct: (v: boolean) => void
}

export default function BrandProductPicker({
  brand,
  product,
  onBrandChange,
  onProductChange,
  brandOptions,
  productOptions,
  isCustomBrand,
  setIsCustomBrand,
  isCustomProduct,
  setIsCustomProduct
}: BrandProductPickerProps) {
  return (
    <>
      {/* Brand */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            브랜드 <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setIsCustomBrand(!isCustomBrand)
              if (!isCustomBrand) {
                setIsCustomProduct(true)
              }
            }}
            className="text-xs text-violet-600 hover:text-violet-700"
          >
            {isCustomBrand ? '목록에서 선택' : '직접 입력'}
          </button>
        </div>
        {isCustomBrand ? (
          <input
            id="brand"
            type="text"
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
            placeholder="브랜드명을 입력하세요"
          />
        ) : (
          <select
            id="brand"
            value={brand}
            onChange={(e) => {
              onBrandChange(e.target.value)
              setIsCustomProduct(false)
            }}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
          >
            <option value="">브랜드를 선택하세요</option>
            {brandOptions.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Product */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">
            제품명 <span className="text-red-500">*</span>
          </label>
          {!isCustomBrand && productOptions.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCustomProduct(!isCustomProduct)}
              className="text-xs text-violet-600 hover:text-violet-700"
            >
              {isCustomProduct ? '목록에서 선택' : '직접 입력'}
            </button>
          )}
        </div>
        {isCustomProduct || isCustomBrand || productOptions.length === 0 ? (
          <input
            id="product"
            type="text"
            value={product}
            onChange={(e) => onProductChange(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
            placeholder={brand ? '제품명을 입력하세요' : '먼저 브랜드를 선택하세요'}
          />
        ) : (
          <select
            id="product"
            value={product}
            onChange={(e) => onProductChange(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
          >
            <option value="">제품을 선택하세요</option>
            {productOptions.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        )}
        {!isCustomBrand && !isCustomProduct && productOptions.length === 0 && brand && (
          <p className="text-xs text-gray-400 mt-1">등록된 제품이 없습니다. 직접 입력해 주세요.</p>
        )}
      </div>
    </>
  )
}
