"use client";

import { Star } from "lucide-react";
import React, { useState } from "react";

type FeedStatus = "in_progress" | "stopped" | "completed";

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
  onAsk?: () => void;
  onDetail?: () => void;
  avatarUrl?: string;
}

const statusMap: Record<
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
  const s = statusMap[props.status] || statusMap.in_progress;
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 첫 문장 Bold 처리
  const reviewText = props.review || '';
  const [first, ...rest] = reviewText.split(/(?<=\.)\s/);
  const restText = rest.join(" ").trim();
  
  // 본문이 긴지 확인 (대략 150자 이상)
  const isLongText = reviewText.length > 150;
  const displayText = isExpanded ? reviewText : (first ? `${first.trim()}${restText ? ' ' + restText : ''}` : reviewText);
  const shouldTruncate = isLongText && !isExpanded;
  
  // 기간 계산
  const duration = calculateDuration(props.since, props.until);

  return (
    <article
      className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full min-h-[400px]"
      role="article"
      aria-label={`${props.brand} ${props.product} 후기`}
    >
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
      <h3 className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
        <button
          className="hover:underline"
          type="button"
          onClick={() => props.onDetail?.()}
          aria-label={`${props.brand} · ${props.product} 제품 상세로 이동`}
        >
          {props.brand} · {props.product}
        </button>
      </h3>

      {/* 별점 + 추천 */}
      <div className="mt-2 flex items-center gap-2">
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
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{props.authorName}</span>
        <span>· {props.petName} ({props.petAgeYears}세 · {props.petWeightKg}kg)</span>
      </div>

      {/* 본문 (첫 문장 Bold + 말줄임 처리) */}
      {reviewText && (
        <div className="mt-4 flex-1">
          {!isExpanded ? (
            <>
              {first ? (
                <p className="text-[15px] leading-7 text-gray-900">
                  <span className="font-semibold">{first.trim()}</span>
                  {restText && (
                    <span className={`text-gray-600 ${shouldTruncate ? 'line-clamp-2' : ''}`}>
                      {' '}{restText}
                    </span>
                  )}
                </p>
              ) : (
                <p className={`text-[15px] leading-7 text-gray-600 ${shouldTruncate ? 'line-clamp-3' : ''}`}>
                  {reviewText}
                </p>
              )}
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  aria-label="전체 내용 보기"
                >
                  ... 더보기
                </button>
              )}
            </>
          ) : (
            <>
              {first ? (
                <p className="text-[15px] leading-7 text-gray-900">
                  <span className="font-semibold">{first.trim()}</span>
                  {restText && <span className="text-gray-600"> {restText}</span>}
                </p>
              ) : (
                <p className="text-[15px] leading-7 text-gray-600">
                  {reviewText}
                </p>
              )}
              <button
                onClick={() => setIsExpanded(false)}
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
      <div className="mt-4 flex items-center gap-5 text-sm text-gray-500">
        <span aria-label="좋아요">❤️ {props.likes.toLocaleString()}</span>
        <span aria-label="댓글">💬 {props.comments.toLocaleString()}</span>
        <span aria-label="조회수">👀 {props.views.toLocaleString()}</span>
      </div>

      {/* 버튼 */}
      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          onClick={() => props.onAsk?.()}
          aria-label="질문하기"
        >
          질문하기
        </button>
        <button
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#3056F5] text-white text-sm font-medium hover:bg-[#2648e6] transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => props.onDetail?.()}
          aria-label="자세히 보기"
        >
          자세히 보기
        </button>
      </div>
    </article>
  );
}

