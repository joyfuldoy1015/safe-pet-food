'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-client'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface ProductRequest {
  id: string
  requester_id: string
  requester_name: string
  brand_name: string
  product_name: string
  category: string
  description: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
}

export default function ProductRequestsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<ProductRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})

  // 요청 목록 불러오기
  const loadRequests = async () => {
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=/admin/product-requests')
        return
      }

      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/product-requests?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setRequests(result.data || [])
      } else {
        console.error('요청 목록 조회 실패:', response.status)
      }
    } catch (error) {
      console.error('요청 목록 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 요청 처리 (승인/거절)
  const handleProcessRequest = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingId(requestId)
    try {
      const supabase = getBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`/api/product-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          status: action,
          review_notes: reviewNotes[requestId] || null
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message)
        // 목록 새로고침
        loadRequests()
      } else {
        alert(result.error || '처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('요청 처리 오류:', error)
      alert('처리 중 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/login?redirect=/admin/product-requests')
      return
    }

    loadRequests()
  }, [user, authLoading, statusFilter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusConfig = {
    pending: { label: '대기 중', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: '승인됨', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: '거절됨', color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const categoryLabels: Record<string, string> = {
    feed: '사료',
    treat: '간식',
    supplement: '영양제'
  }

  if (loading && requests.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">제품 등록 요청</h1>
            <p className="text-gray-600 mt-1">사용자들이 요청한 제품을 검토하고 승인/거절하세요</p>
          </div>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[#3056F5] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? '전체' : statusConfig[status].label}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {statusFilter === 'pending' ? '대기 중인 요청이 없습니다.' : '요청이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const StatusIcon = statusConfig[request.status].icon
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Product Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.brand_name}</h3>
                          <p className="text-sm text-gray-600">{request.product_name}</p>
                        </div>
                        <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[request.status].color}`}>
                          {statusConfig[request.status].label}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {categoryLabels[request.category] || request.category}
                        </span>
                      </div>

                      {/* Description */}
                      {request.description && (
                        <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                          {request.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{request.requester_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                      </div>

                      {/* Review Notes (for processed requests) */}
                      {request.status !== 'pending' && request.review_notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                          <span className="font-medium text-gray-700">검토 메모:</span>{' '}
                          <span className="text-gray-600">{request.review_notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <textarea
                          placeholder="검토 메모 (선택사항)"
                          value={reviewNotes[request.id] || ''}
                          onChange={(e) => setReviewNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProcessRequest(request.id, 'rejected')}
                            disabled={processingId === request.id}
                            className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                거절
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleProcessRequest(request.id, 'approved')}
                            disabled={processingId === request.id}
                            className="flex-1 px-3 py-2 bg-[#3056F5] text-white rounded-lg text-sm font-medium hover:bg-[#2648e6] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {processingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                승인
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
