'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back()
            } else {
              router.push('/')
            }
          }}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>돌아가기</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">이용약관</h1>
          
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제1조 (목적)</h2>
              <p className="text-gray-700 leading-relaxed">
                이 약관은 Safe Pet Food(이하 &ldquo;회사&rdquo;)가 제공하는 온라인 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제2조 (정의)</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>&ldquo;서비스&rdquo;란 회사가 제공하는 반려동물 사료 영양 분석 및 관련 온라인 서비스를 의미합니다.</li>
                <li>&ldquo;이용자&rdquo;란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li>&ldquo;회원&rdquo;이란 회사에 회원등록을 하고 서비스를 이용하는 자를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제3조 (약관의 게시와 개정)</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제4조 (회원가입)</h2>
              <p className="text-gray-700 leading-relaxed">
                이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다. 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제5조 (서비스의 제공 및 변경)</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>반려동물 사료 영양성분 분석 서비스</li>
                <li>급여 후기 및 커뮤니티 서비스</li>
                <li>브랜드 평가 및 제품 정보 제공</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 일체의 서비스</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제6조 (서비스의 중단)</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제7조 (회원의 의무)</h2>
              <p className="text-gray-700 leading-relaxed">
                회원은 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제8조 (면책조항)</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                시행일자: 2024년 1월 1일
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

