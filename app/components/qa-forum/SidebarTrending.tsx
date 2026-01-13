'use client'

import React from 'react'
import Link from 'next/link'
import { TrendingUp, ArrowUp, MessageCircle } from 'lucide-react'
import { Question } from './QuestionCard'

interface SidebarTrendingProps {
  trendingQuestions: Question[]
  formatTimeAgo: (date: string) => string
}

export default function SidebarTrending({
  trendingQuestions,
  formatTimeAgo
}: SidebarTrendingProps) {
  return (
    <div className="space-y-6">
      {/* Trending Questions */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-gray-900">트렌딩 질문</h3>
        </div>
        <div className="space-y-4">
          {trendingQuestions.length > 0 ? (
            trendingQuestions.map((question, index) => (
              <Link
                key={question.id}
                href={`/community/qa-forum/${question.id}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {question.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>{question.votes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{question.answerCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              트렌딩 질문이 없습니다
            </p>
          )}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <h3 className="font-bold text-gray-900 mb-2">뉴스레터 구독</h3>
        <p className="text-sm text-gray-700 mb-4">
          반려동물 건강 정보와 최신 소식을 받아보세요
        </p>
        <button className="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium">
          구독하기
        </button>
      </div>
    </div>
  )
}

