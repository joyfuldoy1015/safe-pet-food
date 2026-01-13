'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import ProductListItem from './ProductListItem'
import { Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

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
  brandName?: string
}

export default function ProductsListSection({ products, brandName: propBrandName }: ProductsListSectionProps) {
  const params = useParams()
  const { user } = useAuth()
  const brandName = propBrandName || decodeURIComponent(params?.brandName as string || '')
  
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  const handleSubmitRequest = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!productName.trim()) {
      alert('제품명을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/product-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          product_name: productName.trim(),
          category: 'feed',
          description: description.trim() || undefined
        })
      })

      const result = await response.json()

      if (response.ok) {
        setRequestSubmitted(true)
        setShowRequestForm(false)
        setProductName('')
        setDescription('')
        alert(result.message || '제품 등록 요청이 접수되었습니다.')
      } else {
        alert(result.error || '요청 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('제품 등록 요청 오류:', error)
      alert('요청 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">아직 제품 목록에 등록되어 있지 않아요</p>
          <p className="text-sm text-gray-500 mb-6">이 브랜드의 제품 정보를 요청해주시면 운영자가 검토 후 등록해드립니다.</p>
          
          {requestSubmitted ? (
            <div className="py-3 px-4 bg-green-50 text-green-700 rounded-xl text-sm">
              ✅ 제품 등록 요청이 접수되었습니다. 운영자 검토 후 등록됩니다.
            </div>
          ) : showRequestForm ? (
            <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-3">
              <div className="text-sm font-medium text-gray-900">
                제품 등록 요청
              </div>
              <div className="text-xs text-gray-600">
                브랜드: <span className="font-medium">{brandName}</span>
              </div>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="제품명을 입력해주세요 *"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="추가 정보가 있다면 입력해주세요 (선택사항)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowRequestForm(false)
                    setProductName('')
                    setDescription('')
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting || !productName.trim()}
                  className="flex-1 px-3 py-2 bg-[#3056F5] text-white rounded-lg text-sm font-medium hover:bg-[#2648e6] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      요청 중...
                    </>
                  ) : (
                    '요청하기'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!user) {
                  alert('로그인이 필요합니다.')
                  window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
                  return
                }
                setShowRequestForm(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
              제품 등록 요청하기
            </button>
          )}
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
