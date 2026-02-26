"use client";

import { Heart, HelpCircle, ChevronRight } from "lucide-react";
import React from "react";
import Image from "next/image";

type FeedStatus = "in_progress" | "stopped" | "completed";
type PetLogCategory = "feed" | "snack" | "supplement" | "toilet" | string;

export interface PetLogCardProps {
  since: string;                 // "2024.10.02."
  until?: string;                // "2025.10.31." (optional, for completed/stopped)
  status: FeedStatus;            // "in_progress" | "stopped" | "completed"
  brand: string;                 // "로얄캐닌"
  product: string;               // "골든 리트리버 어덜트"
  rating?: number;               // 0~5 (e.g. 5.0) - optional now
  recommended?: boolean;         // 추천 배지 노출 여부
  authorName: string;            // "김집사"
  petName: string;               // "뽀미"
  petAgeYears?: number;          // 4 - optional
  petWeightKg?: number;          // 28 - optional
  review: string;                // 본문
  likes: number;                 // 89
  comments: number;              // 23 (질문 수로 사용)
  views?: number;                // 1247 - optional
  category?: PetLogCategory;     // feed | snack | supplement | toilet
  functionalTag?: string;        // "눈물 자국 개선", "고단백 식단 관리" 등
  daysUsed?: number;             // N일째
  createdAt?: string;            // 작성일 "2026.1.19."
  onAsk?: () => void;
  onDetail?: () => void;
  avatarUrl?: string;
}

const usageCategories: PetLogCategory[] = ["toilet"];

// 사용 일수 계산 함수
function calculateDaysUsed(since: string, until?: string): number {
  try {
    const sinceDate = new Date(since.replace(/\./g, '-').replace(/-$/, ''));
    const endDate = until 
      ? new Date(until.replace(/\./g, '-').replace(/-$/, ''))
      : new Date();
    
    if (isNaN(sinceDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }
    
    const diffTime = endDate.getTime() - sinceDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  } catch {
    return 0;
  }
}

export default function PetLogCard(props: PetLogCardProps) {
  const isUsageCategory = props.category && usageCategories.includes(props.category);
  const actionLabel = isUsageCategory ? "사용" : "사용";
  
  // 사용 일수 계산
  const daysUsed = props.daysUsed || calculateDaysUsed(props.since, props.until);
  
  // 상태에 따른 배지 텍스트
  const getStatusBadge = () => {
    if (props.status === 'completed') {
      return { text: '사용 완료', className: 'bg-gray-100 text-gray-600' };
    } else if (props.status === 'stopped') {
      return { text: '사용 중지', className: 'bg-red-50 text-red-600' };
    } else {
      return { text: `${daysUsed}일째 ${actionLabel} 중`, className: 'bg-green-50 text-green-600' };
    }
  };
  
  const statusBadge = getStatusBadge();

  const handleCardClick = () => {
    props.onDetail?.();
  };

  // 작성일 포맷
  const formatCreatedAt = () => {
    if (props.createdAt) return props.createdAt;
    // since 날짜를 작성일로 사용
    return props.since;
  };

  return (
    <article
      className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      role="article"
      aria-label={`${props.brand} ${props.product} 후기`}
      onClick={handleCardClick}
    >
      {/* 상단: 프로필 + 작성일 + 사용 기간 배지 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <div className="relative flex-shrink-0">
            {props.avatarUrl && (props.avatarUrl.startsWith('http') || props.avatarUrl.startsWith('/')) ? (
              <Image
                src={props.avatarUrl}
                alt={props.authorName}
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {props.authorName.charAt(0)}
                </span>
              </div>
            )}
            {/* 인증 배지 (옵션) */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* 작성자 정보 */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{props.authorName}</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                {props.petName}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{formatCreatedAt()} 작성</p>
          </div>
        </div>
        
        {/* 사용 기간 배지 */}
        <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
          {statusBadge.text}
        </span>
      </div>

      {/* 제품명 + 추천 배지 */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {props.product}
        </h3>
        {props.recommended === true && (
          <span className="flex-shrink-0 px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100">
            👍 추천
          </span>
        )}
        {props.recommended === false && (
          <span className="flex-shrink-0 px-2.5 py-1 bg-red-50 text-red-500 text-xs font-medium rounded-full border border-red-100">
            👎 비추천
          </span>
        )}
      </div>

      {/* 기능 태그 */}
      {props.functionalTag && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" d="M12 8v4m0 4h.01" />
            </svg>
            {props.functionalTag}
          </span>
        </div>
      )}

      {/* 후기 내용 */}
      {props.review && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {props.review}
        </p>
      )}

      {/* 하단: 좋아요 + 질문 + 화살표 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* 좋아요 */}
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 text-red-400" />
            </span>
            <span className="font-medium text-gray-600">{props.likes}</span>
          </span>
          
          {/* 질문 */}
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
            </span>
            <span className="font-medium text-gray-600">{props.comments}</span>
          </span>
        </div>
        
        {/* 화살표 */}
        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </article>
  );
}
