'use client'

import { Calendar, Award, Edit, Trash2 } from 'lucide-react'
import { DetailedPetLogPost } from './types'

interface PostHeaderCardProps {
  post: DetailedPetLogPost
  isAuthor: boolean
  isLoggedIn: boolean
  onEdit: () => void
  onDelete: () => void
  onLogin: () => void
}

export default function PostHeaderCard({ post, isAuthor, isLoggedIn, onEdit, onDelete, onLogin }: PostHeaderCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 hover:shadow-2xl transition-all duration-300">
      {/* Desktop: 한 줄 레이아웃 */}
      <div className="hidden md:flex items-center justify-between gap-6">
        {/* Left Section: Pet Icon & Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-2xl">🐕</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {post.petName}의 급여 기록
            </h1>
            <div className="flex items-center gap-2 text-base text-gray-600">
              <span>{post.petBreed}</span>
              <span>•</span>
              <span>{post.petAge}</span>
              <span>•</span>
              <span>{post.petWeight}</span>
              <span>•</span>
              <span className="font-semibold">{post.ownerName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.updatedAt} 업데이트</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Section: Stats & Action Buttons */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{post.totalRecords}</div>
            <div className="text-sm font-semibold text-blue-600">총 기록</div>
          </div>
          
          {isAuthor && (
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                title="수정"
              >
                <Edit className="h-4 w-4" />
                <span className="text-sm font-semibold">수정</span>
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                title="삭제"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-semibold">삭제</span>
              </button>
            </div>
          )}
          
          <button
            onClick={() => {
              if (isLoggedIn) {
                window.location.href = '/pet-log/posts/write'
              } else {
                onLogin()
              }
            }}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
          >
            <Award className="h-5 w-5" />
            <span className="text-base font-semibold whitespace-nowrap">내 경험 공유하기</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet: 세로 레이아웃 */}
      <div className="flex md:hidden flex-col gap-3 sm:gap-4">
        {/* Top: Pet Icon & Info with Total Records */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-lg sm:text-xl">🐕</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2 leading-tight">
                {post.petName}의 급여 기록
              </h1>
              <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="whitespace-nowrap">{post.petBreed}</span>
                  <span className="text-gray-400">•</span>
                  <span className="whitespace-nowrap">{post.petAge}</span>
                  <span className="text-gray-400">•</span>
                  <span className="whitespace-nowrap">{post.petWeight}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="font-semibold whitespace-nowrap">{post.ownerName}</span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                    <span>{post.updatedAt} 업데이트</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* 총 기록 박스 - 상단 오른쪽 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-2.5 sm:p-3 border border-blue-200 text-center w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center flex-shrink-0">
            <div className="text-lg sm:text-xl font-bold text-blue-600 mb-0.5">{post.totalRecords}</div>
            <div className="text-xs font-semibold text-blue-600">총 기록</div>
          </div>
        </div>
        
        {/* Bottom: Action Button */}
        <button
          onClick={() => {
            if (isLoggedIn) {
              window.location.href = '/pet-log/posts/write'
            } else {
              onLogin()
            }
          }}
          className="flex-1 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold justify-center"
        >
          <Award className="h-4 w-4" />
          <span className="whitespace-nowrap">내 경험 공유하기</span>
        </button>
      </div>
      
      {/* 작성자만 볼 수 있는 수정/삭제 버튼 (모바일) */}
      {isAuthor && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md text-sm font-semibold"
          >
            <Edit className="h-4 w-4" />
            수정
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md text-sm font-semibold"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </button>
        </div>
      )}
    </div>
  )
}
