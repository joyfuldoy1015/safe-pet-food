'use client'

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminExplorePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">탐색 QA</h1>
          <p className="text-gray-600 mt-1">공개 탐색 페이지의 데이터 일관성을 확인하세요</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-green-900">데이터 일관성 확인</div>
                <div className="text-sm text-green-700">필터별 카운트 일치</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <div className="font-medium text-yellow-900">링크 확인 필요</div>
                <div className="text-sm text-yellow-700">일부 상세 페이지 링크 확인 필요</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/explore"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                탐색 페이지 열기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}


