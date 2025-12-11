'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>
          
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 수집하는 개인정보의 항목 및 수집방법</h2>
              <p className="text-gray-700 leading-relaxed">
                Safe Pet Food는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>필수항목: 이메일 주소, 닉네임</li>
                <li>선택항목: 프로필 사진, 반려동물 정보</li>
                <li>자동 수집 항목: IP 주소, 쿠키, 접속 로그</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 개인정보의 수집 및 이용목적</h2>
              <p className="text-gray-700 leading-relaxed">
                수집한 개인정보는 다음 목적으로 이용됩니다:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>서비스 제공 및 계약의 이행</li>
                <li>회원 관리 및 본인 확인</li>
                <li>서비스 개선 및 신규 서비스 개발</li>
                <li>고객 문의 및 불만 처리</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용기간</h2>
              <p className="text-gray-700 leading-relaxed">
                회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-700 leading-relaxed">
                Safe Pet Food는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 개인정보의 파기</h2>
              <p className="text-gray-700 leading-relaxed">
                개인정보는 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때 지체없이 파기합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 이용자의 권리</h2>
              <p className="text-gray-700 leading-relaxed">
                이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해 개인정보의 수집 및 이용 동의를 철회할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 개인정보 보호책임자</h2>
              <p className="text-gray-700 leading-relaxed">
                개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">개인정보 보호책임자</p>
                <p className="text-sm text-gray-600 mt-1">이메일: privacy@safepetfood.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. 개인정보처리방침의 변경</h2>
              <p className="text-gray-700 leading-relaxed">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
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

