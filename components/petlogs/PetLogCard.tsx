"use client";

import { Star, Heart, MessageSquare, Eye } from "lucide-react";
import React, { useState } from "react";

type FeedStatus = "in_progress" | "stopped" | "completed";
type PetLogCategory = "feed" | "snack" | "supplement" | "toilet" | string;

export interface PetLogCardProps {
  since: string;                 // "2024.10.02."
  until?: string;                // "2025.10.31." (optional, for completed/stopped)
  status: FeedStatus;            // "in_progress" | "stopped" | "completed"
  brand: string;                 // "로얄캐닌"
  product: string;               // "골든 리트리버 어덜트"
  rating: number;                // 0~5 (e.g. 5.0)
  recommended?: boolean;         // 추천 배지 노출 여부
  authorName: string;            // "김집사"
  petName: string;               // "뽀미"
  petAgeYears: number;           // 4
  petWeightKg: number;           // 28
  review: string;                // 본문 (첫 문장 강조)
  likes: number;                 // 89
  comments: number;              // 23
  views: number;                 // 1247
  category?: PetLogCategory;     // feed | snack | supplement | toilet
  onAsk?: () => void;
  onDetail?: () => void;
  avatarUrl?: string;
}

const feedingStatusMap: Record<
  FeedStatus,
  { label: string; className: string }
> = {
  in_progress: {
    label: "급여 중",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  stopped: {
    label: "급여 중지",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  completed: {
    label: "급여 완료",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

const usageStatusMap: Record<
  FeedStatus,
  { label: string; className: string }
> = {
  in_progress: {
    label: "사용 중",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  stopped: {
    label: "사용 중지",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  completed: {
    label: "사용 완료",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

const usageCategories: PetLogCategory[] = ["toilet"];

// 기간 계산 함수 (년/개월)
function calculateDuration(since: string, until?: string): string | null {
  if (!until) return null;
  
  try {
    // "2024.06.01." 형식에서 날짜 추출
    const sinceDate = new Date(since.replace(/\./g, '-').slice(0, -1));
    const untilDate = new Date(until.replace(/\./g, '-').slice(0, -1));
    
    if (isNaN(sinceDate.getTime()) || isNaN(untilDate.getTime())) {
      return null;
    }
    
    const years = untilDate.getFullYear() - sinceDate.getFullYear();
    const months = untilDate.getMonth() - sinceDate.getMonth();
    
    let totalMonths = years * 12 + months;
    if (untilDate.getDate() < sinceDate.getDate()) {
      totalMonths -= 1;
    }
    
    const calculatedYears = Math.floor(totalMonths / 12);
    const calculatedMonths = totalMonths % 12;
    
    if (calculatedYears > 0 && calculatedMonths > 0) {
      return `(${calculatedYears}년 ${calculatedMonths}개월)`;
    } else if (calculatedYears > 0) {
      return `(${calculatedYears}년)`;
    } else if (calculatedMonths > 0) {
      return `(${calculatedMonths}개월)`;
    }
    
    return null;
  } catch {
    return null;
  }
}

export default function PetLogCard(props: PetLogCardProps) {
  const isUsageCategory = props.category && usageCategories.includes(props.category);
  const statusMap = isUsageCategory ? usageStatusMap : feedingStatusMap;
  const s = statusMap[props.status] || statusMap.in_progress;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 본문 텍스트
  const reviewText = props.review || '';
  
  // 본문이 긴지 확인 (대략 150자 이상)
  const isLongText = reviewText.length > 150;
  const shouldTruncate = isLongText && !isExpanded;
  
  // 기간 계산
  const duration = calculateDuration(props.since, props.until);

  const handleCardClick = () => {
    props.onDetail?.()
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <article
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col h-full group cursor-pointer overflow-hidden"
      style={{ aspectRatio: '5 / 4' }}
      role="article"
      aria-label={`${props.brand} ${props.product} 후기`}
      onClick={handleCardClick}
    >
      {/* 카테고리 배지 - 급여 후기 */}
      <div className="mb-2 flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span>📝</span>
          <span>{isUsageCategory ? "사용 후기" : "급여 후기"}</span>
        </span>
      </div>

      {/* 상단: 날짜 좌측 / 상태 우측 */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span aria-label="급여 기간">
          since {props.since}
          {props.until && ` - ${props.until}`}
          {duration && ` ${duration}`}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${s.className}`}
          aria-label={`상태: ${s.label}`}
        >
          {s.label}
        </span>
      </div>

      {/* 제품명 */}
      <h3 className="mt-1 text-lg font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
        {props.brand} · {props.product}
      </h3>

      {/* 별점 + 추천 */}
      <div className="mt-1.5 flex items-center gap-2">
        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" aria-hidden />
        <span className="text-base font-semibold text-gray-900">
          {props.rating.toFixed(1)}
        </span>
        {props.recommended && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-300 text-yellow-700 bg-yellow-50"
          >
            추천
          </span>
        )}
      </div>

      {/* 작성자 & 반려동물 정보 */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
        <span className="font-semibold text-gray-900">{props.authorName}</span>
        <span>· {props.petName} ({props.petAgeYears}세 · {props.petWeightKg}kg)</span>
      </div>

      {/* 본문 (말줄임 처리) */}
      {reviewText && (
        <div className="mt-2 flex-1 min-h-0">
          {!isExpanded ? (
            <>
              <p className={`text-sm leading-relaxed text-gray-600 ${shouldTruncate ? 'line-clamp-2' : ''}`}>
                {reviewText}
              </p>
              {shouldTruncate && (
                <button
                  onClick={(e) => {
                    handleButtonClick(e)
                    setIsExpanded(true)
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  aria-label="전체 내용 보기"
                >
                  ... 더보기
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-gray-600">
                {reviewText}
              </p>
              <button
                onClick={(e) => {
                  handleButtonClick(e)
                  setIsExpanded(false)
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                aria-label="내용 접기"
              >
                접기
              </button>
            </>
          )}
        </div>
      )}

      {/* 하단 메트릭 */}
      <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1" aria-label="좋아요">
            <Heart className="h-3.5 w-3.5 text-red-500" />
            <span>{props.likes.toLocaleString()}</span>
          </span>
          <span className="inline-flex items-center gap-1" aria-label="댓글">
            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
            <span>{props.comments.toLocaleString()}</span>
          </span>
          <span className="inline-flex items-center gap-1" aria-label="조회수">
            <Eye className="h-3.5 w-3.5 text-gray-500" />
            <span>{props.views.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

