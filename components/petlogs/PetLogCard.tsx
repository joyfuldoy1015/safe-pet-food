"use client";

import { Star } from "lucide-react";
import React from "react";

type FeedStatus = "in_progress" | "stopped" | "completed";

export interface PetLogCardProps {
  since: string;                 // "2024.10.02."
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
    label: "중지",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  completed: {
    label: "완료",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

export default function PetLogCard(props: PetLogCardProps) {
  const s = statusMap[props.status] || statusMap.in_progress;
  
  // 첫 문장 Bold 처리
  const reviewText = props.review || '';
  const [first, ...rest] = reviewText.split(/(?<=\.)\s/);
  const restText = rest.join(" ").trim();

  return (
    <article
      className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-all"
      role="article"
      aria-label={`${props.brand} ${props.product} 후기`}
    >
      {/* 상단: 날짜 좌측 / 상태 우측 */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span aria-label="급여 시작일">📅 since {props.since}</span>
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
        {props.avatarUrl ? (
          <img
            src={props.avatarUrl}
            alt={props.authorName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            🐾
          </div>
        )}
        <span className="font-semibold text-gray-900">{props.authorName}</span>
        <span>· {props.petName} ({props.petAgeYears}세 · {props.petWeightKg}kg)</span>
      </div>

      {/* 본문 (첫 문장 Bold + 2~3줄 클램프) */}
      {reviewText && (
        <p className="mt-4 text-[15px] leading-7 text-gray-900">
          {first ? (
            <>
              <span className="font-semibold">{first.trim()}</span>
              {restText && <span className="text-gray-600 line-clamp-3"> {restText}</span>}
            </>
          ) : (
            <span className="text-gray-600 line-clamp-3">{reviewText}</span>
          )}
        </p>
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

