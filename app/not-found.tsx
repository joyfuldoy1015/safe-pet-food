import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            <span>홈으로 가기</span>
          </Link>
          <Link
            href="/pet-log"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>이전 페이지</span>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            인기 페이지
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/calorie-calculator"
              className="p-3 text-left rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="font-medium text-gray-900">칼로리 계산기</div>
              <div className="text-sm text-gray-600">적정 칼로리와 급여량</div>
            </Link>
            <Link
              href="/brands"
              className="p-3 text-left rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="font-medium text-gray-900">브랜드 평가</div>
              <div className="text-sm text-gray-600">브랜드 투명성 평가</div>
            </Link>
            <Link
              href="/pet-log"
              className="p-3 text-left rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="font-medium text-gray-900">펫 로그</div>
              <div className="text-sm text-gray-600">급여 기록 공유</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

