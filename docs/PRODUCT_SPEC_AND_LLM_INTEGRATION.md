# Safe Pet Food - Product Specification & LLM Integration Plan

> 전체 프로젝트 UI/UX 명세 및 Pet Log LLM 분석 기능 구현 방안

**작성일**: 2024-12-26  
**버전**: 1.0.0  
**프로젝트**: Safe Pet Food - 반려동물 사료 안전성 & 커뮤니티 플랫폼

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [디자인 시스템](#2-디자인-시스템)
3. [메뉴 구조 및 주요 기능](#3-메뉴-구조-및-주요-기능)
4. [Pet Log 현재 구조](#4-pet-log-현재-구조)
5. [LLM 분석 기능 구현 방안](#5-llm-분석-기능-구현-방안)
6. [Google AI Studio 프롬프트](#6-google-ai-studio-프롬프트)
7. [Figma 디자인 요청 프롬프트](#7-figma-디자인-요청-프롬프트)

---

## 1. 프로젝트 개요

### 1.1 서비스 목적
**Safe Pet Food**는 반려동물 사료의 안전성과 투명성을 검증하고, 사료 급여 경험을 공유하는 커뮤니티 플랫폼입니다.

### 1.2 핵심 가치
- 🔍 **투명성**: 브랜드별 원재료 공개 정보 제공
- 🛡️ **안전성**: SAFI 안전성 점수 기반 제품 평가
- 📝 **기록**: 반려동물의 사료 급여 이력 체계적 관리
- 👥 **커뮤니티**: 경험 공유 및 Q&A 플랫폼

### 1.3 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 2. 디자인 시스템

### 2.1 컬러 팔레트

#### Primary Colors
```typescript
{
  brand: '#3056F5',           // 브랜드 블루
  brandYellow: '#FCD34D',     // 브랜드 노란색 (헤더)
  primary: {
    50: '#FEF3C7',
    100: '#FDE68A',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  }
}
```

#### Secondary Colors
```typescript
{
  orange: {
    500: '#F97316',
    600: '#EA580C',
  },
  pink: {
    500: '#EC4899',
    600: '#DB2777',
  },
  green: {
    500: '#10B981',
    600: '#059669',
  },
  teal: {
    500: '#14B8A6',
  },
  blue: {
    500: '#3B82F6',
    600: '#2563EB',
  },
  indigo: {
    500: '#6366F1',
  },
  purple: {
    500: '#A855F7',
  }
}
```

#### Neutral Colors
```typescript
{
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
}
```

#### Gradient Presets
```typescript
const gradients = {
  brand: 'from-orange-500 to-pink-500',
  search: 'from-purple-500 to-pink-500',
  petLog: 'from-green-500 to-teal-500',
  qa: 'from-blue-500 to-indigo-500',
  health: 'from-green-500 to-teal-500',
  community: 'from-purple-500 to-indigo-500',
}
```

### 2.2 타이포그래피

#### Font Family
```css
font-family: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif;
```

#### Font Sizes
```typescript
{
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
}
```

#### Font Weights
```typescript
{
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
}
```

### 2.3 Spacing & Layout

#### Border Radius
```typescript
{
  base: '0.5rem',     // 8px
  lg: '0.75rem',      // 12px
  xl: '1rem',         // 16px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
}
```

#### Shadows
```typescript
{
  soft: '0 8px 30px rgba(0,0,0,0.05)',
  card: '0 10px 15px -3px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
  '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
}
```

### 2.4 컴포넌트 패턴

#### Card
```tsx
<div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
  {/* Content */}
</div>
```

#### Button - Primary
```tsx
<button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
  {/* Text */}
</button>
```

#### Button - Secondary
```tsx
<button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
  {/* Text */}
</button>
```

#### Icon Badge
```tsx
<div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
  <Icon className="h-7 w-7 text-white" />
</div>
```

---

## 3. 메뉴 구조 및 주요 기능

### 3.1 전체 메뉴 구조

```
Safe Pet Food
├── 🏠 홈
│   ├── Hero Section
│   ├── Feature Cards (4개)
│   └── Unified Feed (인기/최신/Q&A/후기)
│
├── ☕ 브랜드/제품
│   ├── 브랜드 둘러보기 (/brands)
│   │   ├── 브랜드 목록 (카드 형태)
│   │   └── 브랜드 상세
│   │       ├── 브랜드 프로필
│   │       ├── 투명성 점수
│   │       ├── SAFI 안전성 점수
│   │       ├── 제품 목록 탭
│   │       └── 관련 Q&A 탭
│   │
│   └── 제품 검색하기 (/search?tab=products)
│       ├── 검색 바
│       ├── 필터 (등급, 정렬)
│       └── 제품 상세
│           ├── 제품 정보
│           ├── 영양 성분
│           ├── 추천/비추천
│           ├── 최근 리뷰
│           └── 이 브랜드의 다른 제품
│
├── 💚 건강/케어
│   ├── 사료 칼로리&급여량 계산기
│   ├── 건강검진표 분석기
│   └── 일일 음수량 계산기
│
└── 👥 커뮤니티
    ├── 📖 펫 로그 (/pet-log)
    │   ├── 최근 포스트 피드
    │   ├── 포스트 작성 (/pet-log/posts/write)
    │   ├── 포스트 상세 (/pet-log/posts/[postId])
    │   ├── 내 반려동물 관리 (/owners/[ownerId]/pets/[petId])
    │   └── 반려동물 추가
    │
    ├── ❓ Q&A 포럼 (/community/qa-forum)
    │   ├── 질문 목록
    │   ├── 질문 상세
    │   └── 질문 작성
    │
    └── 🔍 탐색하기 (/explore)
        ├── Q&A 섹션
        └── 급여 후기 섹션
```

### 3.2 주요 페이지별 기능

#### 3.2.1 홈 페이지 (/)
**목적**: 서비스 소개 및 최근 활동 피드

**구성요소**:
- Hero Section: 서비스 소개, CTA 버튼
- Feature Cards: 4개 주요 기능 카드
  - 브랜드 투명성
  - 제품 검색
  - 펫 로그
  - Q&A 포럼
- Unified Feed: 4개 탭
  - 인기글
  - 최신글
  - Q&A
  - 급여 후기

**특징**:
- 애니메이션: Framer Motion (Fade-in, Slide-up)
- 반응형: 모바일/태블릿/데스크톱 대응

---

#### 3.2.2 브랜드 상세 (/brands/[brandName])
**목적**: 브랜드의 투명성 정보 및 제품 목록 제공

**주요 섹션**:
1. **브랜드 프로필**
   - 원산지, 설립연도, 제조 공장
   - 브랜드 설명
   - 제조 및 소싱 정보
   - 리콜 이력

2. **투명성 점수**
   - 0-100점 척도
   - 완전공개/부분공개/미공개 비율

3. **SAFI 안전성 점수**
   - A. 부작용 지수 (35%)
   - B. 변 상태 지수 (25%)
   - C. 식욕 지수 (10%)
   - D. 원재료 안전 지수 (20%)
   - E. 브랜드 신뢰 지수 (10%)

4. **탭 네비게이션**
   - 제품 목록: 해당 브랜드의 모든 제품
   - 관련 Q&A: 브랜드 관련 질문

**데이터 소스**: Supabase `brands`, `products` 테이블

---

#### 3.2.3 제품 상세 (/products/[productId])
**목적**: 제품의 상세 정보 및 사용자 리뷰 제공

**주요 섹션**:
1. **제품 정보**
   - 제품명, 브랜드명
   - 등급 (A/B/C/D/F)
   - 설명

2. **추천/비추천**
   - 추천 아이콘 + 숫자
   - 비추천 아이콘 + 숫자
   - 추천률 (%)

3. **영양 성분**
   - 단백질, 지방, 섬유질, 수분 등
   - 보증 성분 분석

4. **원재료**
   - 원재료 목록 (% 포함)
   - 원산지 정보

5. **장단점**
   - Pros: 체크 아이콘 + 텍스트
   - Cons: 경고 아이콘 + 텍스트

6. **최근 리뷰**
   - 사용자 닉네임
   - 별점 (1-5)
   - 작성일
   - 리뷰 내용

7. **이 브랜드의 다른 제품**
   - 동일 브랜드 제품 카드 (최대 6개)

**데이터 소스**: Supabase `products`, `review_logs` 테이블

---

#### 3.2.4 펫 로그 메인 (/pet-log)
**목적**: 사료/간식 급여 경험 공유 피드

**구성요소**:
- 최근 포스트 피드 (카드 형태)
- "내 경험 공유하기" CTA 버튼
- 필터/정렬 옵션 (예정)

**포스트 카드 구성**:
- 반려동물 정보 (이름, 품종, 나이, 몸무게)
- 급여 제품 목록 (사료/간식/영양제/화장실)
- 작성자 정보
- 작성일
- 댓글 수

---

#### 3.2.5 펫 로그 작성 (/pet-log/posts/write)
**목적**: 급여 경험 상세 기록

**입력 항목**:

**1단계: 반려동물 정보**
- 등록된 반려동물 선택 또는 새로 입력
- 이름, 품종, 나이, 몸무게
- 소유자 이름

**2단계: 급여 기록 추가**
각 제품별로:
- 제품명
- 카테고리 (사료/간식/영양제/화장실)
- 브랜드
- 급여 기간 (시작일-종료일)
- 급여 상태 (급여중/급여완료/급여중지)
- **평가 항목**:
  - 기호성 (별점 1-5)
  - 만족도 (별점 1-5)
  - 재구매 의향 (Y/N)
- 상세 코멘트 (자유 텍스트)
- 구매 정보 (가격, 구매처)
- 장점 (태그)
- 부작용 (태그)

**3단계: 미리보기 & 제출**

**현재 데이터 저장 방식**:
- localStorage에 임시 저장
- Supabase `pet_log_posts`, `pet_log_feeding_records` 테이블에 저장

---

#### 3.2.6 내 반려동물 상세 (/owners/[ownerId]/pets/[petId])
**목적**: 특정 반려동물의 급여 이력 타임라인 관리

**주요 기능**:
- 반려동물 프로필 헤더
- 급여 로그 타임라인
- 카테고리별 필터 (전체/사료/간식/영양제/화장실)
- 로그 상세 Drawer
  - 급여 기간
  - 평가 (기호성, 만족도)
  - 코멘트
  - 댓글 스레드
  - Q&A 스레드
- 실시간 활동 패널

**데이터 소스**: Supabase `review_logs`, `pets`, `profiles` 테이블

---

#### 3.2.7 Q&A 포럼 (/community/qa-forum)
**목적**: 반려동물 사료 관련 질문 & 답변 커뮤니티

**구성요소**:
- 질문 목록 (카드 형태)
- 질문 작성 버튼
- 질문 상세 페이지
  - 질문 내용
  - 답변 목록
  - 답변 작성 폼
  - 추천/비추천
  - 신고 기능

---

## 4. Pet Log 현재 구조

### 4.1 데이터 모델

#### Pet Log Post (포스트)
```typescript
interface PetLogPost {
  id: string
  user_id: string          // 작성자 ID
  pet_id: string           // 반려동물 ID
  title: string            // 포스트 제목 (자동 생성)
  content: string          // 포스트 내용
  pet_name: string
  pet_breed: string
  pet_age: string
  pet_weight: string
  owner_name: string
  owner_avatar: string
  created_at: string
  updated_at: string
  comments_count: number
  likes_count: number
}
```

#### Feeding Record (급여 기록)
```typescript
interface FeedingRecord {
  id: string
  post_id: string          // 포스트 ID (FK)
  product_name: string
  category: 'feed' | 'snack' | 'supplement' | 'toilet'
  brand: string
  start_date: string
  end_date?: string
  status: 'feeding' | 'completed' | 'stopped'
  duration: string
  
  // 평가 항목
  palatability: number     // 기호성 (1-5)
  satisfaction: number     // 만족도 (1-5)
  repurchase_intent: boolean
  
  // 추가 정보
  comment?: string
  image_url?: string
  price?: string
  purchase_location?: string
  side_effects?: string[]
  benefits?: string[]
  
  created_at: string
}
```

### 4.2 현재 입력 방식

**문제점**:
- 사용자가 모든 필드를 수동으로 입력해야 함
- 평가 항목 (기호성, 만족도)을 별점으로 직접 선택
- 장점/부작용을 태그 형태로 수동 입력
- 코멘트를 자유 텍스트로 작성

**개선 필요 사항**:
- 자유 텍스트 입력을 LLM이 분석하여 구조화된 데이터로 변환
- 사용자는 최종 결과만 검토 및 수정
- 더 자연스러운 사용자 경험 제공

---

## 5. LLM 분석 기능 구현 방안

### 5.1 목표

**"사용자가 자유롭게 작성한 급여 후기를 LLM이 분석하여 구조화된 데이터로 변환하고, 사용자가 확인/수정 후 저장"**

### 5.2 구현 흐름

```
[사용자 입력]
    ↓
[자유 텍스트 급여 후기 작성]
    ↓
[LLM 분석 API 호출]
    ↓
[구조화된 데이터 생성]
    ↓
[사용자 확인 UI 표시]
    ↓
[사용자 수정 가능]
    ↓
[최종 확인 & 저장]
```

### 5.3 LLM 입력 데이터

**필수 컨텍스트**:
```typescript
{
  petInfo: {
    name: string,
    species: 'dog' | 'cat',
    breed: string,
    age: number,
    weight: number,
  },
  reviewText: string,  // 사용자의 자유 텍스트 입력
  category: 'feed' | 'snack' | 'supplement' | 'toilet',
}
```

**예시 입력**:
```
petInfo: {
  name: "뽀삐",
  species: "dog",
  breed: "골든 리트리버",
  age: 3,
  weight: 28
}

reviewText: "로얄캐닌 성견용 사료를 3개월째 먹이고 있는데 정말 좋아요! 
처음에는 다른 사료를 먹다가 바꿨는데, 우리 뽀삐가 너무 잘 먹어요. 
변 상태도 좋아지고 털도 윤기가 나요. 근데 가격이 좀 비싸서 
부담스럽긴 해요. 그래도 품질이 좋으니까 계속 살 생각이에요."

category: "feed"
```

### 5.4 LLM 출력 데이터 (JSON)

**예상 출력 형식**:
```json
{
  "extracted_data": {
    "product_name": "로얄캐닌 성견용",
    "brand": "로얄캐닌",
    "feeding_duration": "3개월",
    "palatability_score": 5,
    "digestibility_score": 4,
    "coat_quality_score": 5,
    "stool_quality_score": 4,
    "overall_satisfaction": 5,
    "repurchase_intent": true,
    "benefits": [
      "높은 기호성",
      "소화 잘됨",
      "변 상태 개선",
      "모질 개선"
    ],
    "drawbacks": [
      "가격이 비쌈"
    ],
    "side_effects": [],
    "sentiment": "positive",
    "keywords": [
      "기호성 좋음",
      "소화율 높음",
      "털 윤기",
      "가격 부담"
    ]
  },
  "confidence_scores": {
    "product_extraction": 0.95,
    "sentiment_analysis": 0.92,
    "rating_estimation": 0.88
  },
  "analysis_notes": "전반적으로 긍정적인 리뷰이며, 제품 만족도가 높습니다. 가격에 대한 우려가 있으나 재구매 의향이 명확합니다."
}
```

### 5.5 UI/UX 플로우

#### Step 1: 자유 텍스트 입력 화면

```tsx
<div className="space-y-4">
  <label className="block text-lg font-semibold text-gray-900">
    급여 후기를 자유롭게 작성해주세요 ✍️
  </label>
  <p className="text-sm text-gray-600">
    제품명, 브랜드, 급여 기간, 좋았던 점, 아쉬운 점 등을 편하게 작성해주세요. 
    AI가 분석해서 자동으로 정리해드려요!
  </p>
  <textarea
    className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    placeholder="예시: 
로얄캐닌 성견용 사료를 3개월째 먹이고 있는데 정말 좋아요! 
우리 뽀삐가 너무 잘 먹고 변 상태도 좋아졌어요. 
털도 윤기가 나는 것 같아요. 가격이 좀 비싸긴 하지만 
품질이 좋아서 계속 살 생각이에요."
    value={reviewText}
    onChange={(e) => setReviewText(e.target.value)}
  />
  <button 
    onClick={handleAnalyze}
    disabled={isAnalyzing}
    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
  >
    {isAnalyzing ? (
      <span className="flex items-center justify-center gap-2">
        <LoadingSpinner />
        AI가 분석 중...
      </span>
    ) : (
      <span className="flex items-center justify-center gap-2">
        <Sparkles className="h-5 w-5" />
        AI로 자동 분석하기
      </span>
    )}
  </button>
</div>
```

---

#### Step 2: AI 분석 결과 확인 화면

```tsx
<div className="space-y-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
      <CheckCircle className="h-6 w-6 text-green-500" />
      AI 분석 완료!
    </h3>
    <span className="text-sm text-gray-500">
      신뢰도: {(analysisResult.confidence_scores.overall * 100).toFixed(0)}%
    </span>
  </div>

  {/* 제품 정보 */}
  <div className="bg-blue-50 p-4 rounded-xl">
    <h4 className="font-semibold text-gray-900 mb-2">📦 추출된 제품 정보</h4>
    <div className="space-y-1 text-sm">
      <p><strong>제품명:</strong> {analysisResult.product_name}</p>
      <p><strong>브랜드:</strong> {analysisResult.brand}</p>
      <p><strong>급여 기간:</strong> {analysisResult.feeding_duration}</p>
    </div>
  </div>

  {/* 평가 점수 */}
  <div className="space-y-3">
    <h4 className="font-semibold text-gray-900">⭐ AI가 분석한 평가</h4>
    
    {/* 기호성 */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">기호성</span>
      <div className="flex items-center gap-2">
        <StarRating 
          value={analysisResult.palatability_score} 
          onChange={(v) => updateScore('palatability', v)}
          editable
        />
        <span className="text-sm text-gray-600">
          {analysisResult.palatability_score}/5
        </span>
      </div>
    </div>

    {/* 소화율 */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">소화율</span>
      <div className="flex items-center gap-2">
        <StarRating 
          value={analysisResult.digestibility_score} 
          onChange={(v) => updateScore('digestibility', v)}
          editable
        />
        <span className="text-sm text-gray-600">
          {analysisResult.digestibility_score}/5
        </span>
      </div>
    </div>

    {/* 모질 */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">모질</span>
      <div className="flex items-center gap-2">
        <StarRating 
          value={analysisResult.coat_quality_score} 
          onChange={(v) => updateScore('coat_quality', v)}
          editable
        />
        <span className="text-sm text-gray-600">
          {analysisResult.coat_quality_score}/5
        </span>
      </div>
    </div>

    {/* 변 상태 */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">변 상태</span>
      <div className="flex items-center gap-2">
        <StarRating 
          value={analysisResult.stool_quality_score} 
          onChange={(v) => updateScore('stool_quality', v)}
          editable
        />
        <span className="text-sm text-gray-600">
          {analysisResult.stool_quality_score}/5
        </span>
      </div>
    </div>

    {/* 전체 만족도 */}
    <div className="flex items-center justify-between pt-2 border-t">
      <span className="text-sm font-semibold text-gray-900">전체 만족도</span>
      <div className="flex items-center gap-2">
        <StarRating 
          value={analysisResult.overall_satisfaction} 
          onChange={(v) => updateScore('overall_satisfaction', v)}
          editable
        />
        <span className="text-sm font-semibold text-gray-900">
          {analysisResult.overall_satisfaction}/5
        </span>
      </div>
    </div>
  </div>

  {/* 장점 */}
  <div>
    <h4 className="font-semibold text-gray-900 mb-2">✅ 장점</h4>
    <div className="flex flex-wrap gap-2">
      {analysisResult.benefits.map((benefit, idx) => (
        <span 
          key={idx}
          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
        >
          {benefit}
          <button 
            onClick={() => removeBenefit(idx)}
            className="ml-1 hover:text-green-900"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button 
        onClick={() => setShowAddBenefit(true)}
        className="px-3 py-1 border-2 border-dashed border-green-300 text-green-600 rounded-full text-sm hover:bg-green-50"
      >
        + 추가
      </button>
    </div>
  </div>

  {/* 단점 */}
  <div>
    <h4 className="font-semibold text-gray-900 mb-2">⚠️ 단점</h4>
    <div className="flex flex-wrap gap-2">
      {analysisResult.drawbacks.map((drawback, idx) => (
        <span 
          key={idx}
          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
        >
          {drawback}
          <button 
            onClick={() => removeDrawback(idx)}
            className="ml-1 hover:text-orange-900"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button 
        onClick={() => setShowAddDrawback(true)}
        className="px-3 py-1 border-2 border-dashed border-orange-300 text-orange-600 rounded-full text-sm hover:bg-orange-50"
      >
        + 추가
      </button>
    </div>
  </div>

  {/* 재구매 의향 */}
  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
    <span className="font-semibold text-gray-900">재구매 의향</span>
    <button
      onClick={() => toggleRepurchase()}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        analysisResult.repurchase_intent
          ? 'bg-green-500 text-white'
          : 'bg-gray-300 text-gray-700'
      }`}
    >
      {analysisResult.repurchase_intent ? (
        <>
          <CheckCircle className="h-4 w-4" />
          예
        </>
      ) : (
        <>
          <X className="h-4 w-4" />
          아니오
        </>
      )}
    </button>
  </div>

  {/* 액션 버튼 */}
  <div className="flex gap-3 pt-4 border-t">
    <button
      onClick={handleReanalyze}
      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
    >
      다시 분석하기
    </button>
    <button
      onClick={handleConfirmAndSave}
      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      확인 및 저장
    </button>
  </div>
</div>
```

### 5.6 백엔드 API 엔드포인트

#### POST /api/analyze-review

**Request Body**:
```json
{
  "pet_info": {
    "name": "뽀삐",
    "species": "dog",
    "breed": "골든 리트리버",
    "age": 3,
    "weight": 28
  },
  "review_text": "로얄캐닌 성견용 사료를...",
  "category": "feed"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extracted_data": {
      "product_name": "로얄캐닌 성견용",
      "brand": "로얄캐닌",
      "feeding_duration": "3개월",
      "palatability_score": 5,
      "digestibility_score": 4,
      "coat_quality_score": 5,
      "stool_quality_score": 4,
      "overall_satisfaction": 5,
      "repurchase_intent": true,
      "benefits": ["높은 기호성", "소화 잘됨", ...],
      "drawbacks": ["가격이 비쌈"],
      "side_effects": [],
      "sentiment": "positive",
      "keywords": [...]
    },
    "confidence_scores": {
      "product_extraction": 0.95,
      "sentiment_analysis": 0.92,
      "rating_estimation": 0.88,
      "overall": 0.92
    },
    "analysis_notes": "..."
  },
  "model_used": "gemini-1.5-pro",
  "processing_time_ms": 1523
}
```

### 5.7 기술 스택

#### LLM Provider
**추천**: Google Gemini 1.5 Pro (via AI Studio)

**이유**:
- 무료 티어 제공 (월 50만 요청)
- 한국어 성능 우수
- JSON 출력 포맷 강제 가능
- 빠른 응답 속도
- 긴 컨텍스트 지원

**대안**:
- OpenAI GPT-4o
- Anthropic Claude 3 Sonnet
- OpenRouter (여러 모델 통합)

#### 구현 방식
```typescript
// /app/api/analyze-review/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  const { pet_info, review_text, category } = await request.json()
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    generationConfig: {
      responseMimeType: 'application/json',
    }
  })
  
  const prompt = buildPrompt(pet_info, review_text, category)
  
  const result = await model.generateContent(prompt)
  const analysisData = JSON.parse(result.response.text())
  
  return Response.json({
    success: true,
    data: analysisData
  })
}
```

### 5.8 구현 우선순위

#### Phase 1: MVP (2주)
- ✅ 기본 LLM 분석 API 구현
- ✅ 자유 텍스트 입력 UI
- ✅ 분석 결과 확인 UI (읽기 전용)
- ✅ 수동 수정 기능
- ✅ 저장 기능

#### Phase 2: 개선 (1주)
- ✅ 분석 신뢰도 표시
- ✅ 재분석 기능
- ✅ 로딩 애니메이션 개선
- ✅ 에러 핸들링

#### Phase 3: 고도화 (2주)
- ⬜ 이미지 업로드 시 OCR 분석
- ⬜ 과거 리뷰 기반 개인화 분석
- ⬜ 브랜드/제품 자동 매칭
- ⬜ 다국어 지원

---

## 6. Google AI Studio 프롬프트

### 6.1 시스템 프롬프트

```markdown
# Role
당신은 반려동물 사료 리뷰 분석 전문가입니다. 사용자가 작성한 자유 형식의 급여 후기를 분석하여 구조화된 데이터로 변환하는 것이 당신의 임무입니다.

# Task
사용자가 작성한 반려동물 사료/간식/영양제 급여 후기를 분석하여 다음 정보를 추출하고 평가하세요:

1. **제품 정보 추출**
   - 제품명 (정확한 제품명 추출)
   - 브랜드명
   - 급여 기간 (예: "3개월", "1년", "2주" 등)

2. **평가 점수 산정 (1-5점)**
   - palatability_score: 기호성 (반려동물이 얼마나 잘 먹는지)
   - digestibility_score: 소화율 (소화가 잘 되는지, 설사/구토 없는지)
   - coat_quality_score: 모질 (털 상태, 윤기)
   - stool_quality_score: 변 상태 (변의 형태, 냄새)
   - overall_satisfaction: 전체 만족도

3. **장단점 분류**
   - benefits: 좋았던 점 (배열)
   - drawbacks: 아쉬운 점 (배열)
   - side_effects: 부작용 (배열, 없으면 빈 배열)

4. **재구매 의향**
   - repurchase_intent: true/false

5. **감정 분석**
   - sentiment: "positive" | "neutral" | "negative"

6. **키워드 추출**
   - keywords: 주요 키워드 배열 (5-10개)

# Guidelines

## 점수 산정 기준

### Palatability (기호성) - 1-5점
- 5점: "잘 먹어요", "너무 좋아해요", "완전 흡입", "허겁지겁 먹어요"
- 4점: "잘 먹는 편", "대체로 잘 먹어요", "만족스럽게 먹어요"
- 3점: "보통", "먹긴 하는데", "그럭저럭"
- 2점: "잘 안 먹어요", "별로 안 좋아해요", "조금씩만"
- 1점: "전혀 안 먹어요", "거부해요", "입도 안 대요"

### Digestibility (소화율) - 1-5점
- 5점: "소화 아주 잘됨", "설사 없음", "배변 완벽"
- 4점: "소화 잘되는 편", "문제없음"
- 3점: "보통", "가끔 무른 변"
- 2점: "자주 설사", "소화 안 되는 것 같음"
- 1점: "심한 설사", "구토", "소화 장애"

### Coat Quality (모질) - 1-5점
- 5점: "털이 윤기나요", "모질 개선됨", "부드러워졌어요"
- 4점: "털 상태 좋아진 것 같아요"
- 3점: "보통", "변화 없음"
- 2점: "털이 거칠어짐", "빠짐 증가"
- 1점: "털 상태 나빠짐", "심하게 빠짐"

### Stool Quality (변 상태) - 1-5점
- 5점: "변 상태 완벽", "형태 좋음", "냄새 적음"
- 4점: "변 상태 양호"
- 3점: "보통"
- 2점: "무른 변", "냄새 심함"
- 1점: "설사", "혈변", "비정상"

### Overall Satisfaction (전체 만족도) - 1-5점
- 5점: "최고", "완벽", "정말 좋아요", "강추"
- 4점: "만족", "좋아요", "추천"
- 3점: "보통", "그럭저럭", "나쁘지 않아요"
- 2점: "아쉬워요", "별로", "비추"
- 1점: "최악", "절대 비추천", "다시는 안 살래요"

## 추출 규칙

1. **명시되지 않은 항목**은 중립값(3점) 또는 null 처리
2. **제품명/브랜드**가 명확하지 않으면 "확인 필요" 표시
3. **급여 기간**이 없으면 "기간 미상" 또는 null
4. **긍정/부정 표현**을 정확히 분류하여 benefits/drawbacks에 할당
5. **재구매 의향**은 다음 키워드 기반 판단:
   - 긍정: "계속 살게요", "재구매", "다시 살게요", "추천" → true
   - 부정: "안 살래요", "바꿀 거예요", "다른 거 찾아볼게요" → false
   - 모호: 판단 불가 시 null

# Output Format

반드시 다음 JSON 형식으로 출력하세요:

```json
{
  "extracted_data": {
    "product_name": string | null,
    "brand": string | null,
    "feeding_duration": string | null,
    "palatability_score": number (1-5) | null,
    "digestibility_score": number (1-5) | null,
    "coat_quality_score": number (1-5) | null,
    "stool_quality_score": number (1-5) | null,
    "overall_satisfaction": number (1-5),
    "repurchase_intent": boolean | null,
    "benefits": string[],
    "drawbacks": string[],
    "side_effects": string[],
    "sentiment": "positive" | "neutral" | "negative",
    "keywords": string[]
  },
  "confidence_scores": {
    "product_extraction": number (0-1),
    "sentiment_analysis": number (0-1),
    "rating_estimation": number (0-1),
    "overall": number (0-1)
  },
  "analysis_notes": string
}
```

# Example

## Input
```
반려동물: 뽀삐 (골든 리트리버, 3세, 28kg)
카테고리: 사료

리뷰:
"로얄캐닌 성견용 사료를 3개월째 먹이고 있는데 정말 좋아요! 
처음에는 다른 사료를 먹다가 바꿨는데, 우리 뽀삐가 너무 잘 먹어요. 
변 상태도 좋아지고 털도 윤기가 나요. 근데 가격이 좀 비싸서 
부담스럽긴 해요. 그래도 품질이 좋으니까 계속 살 생각이에요."
```

## Output
```json
{
  "extracted_data": {
    "product_name": "로얄캐닌 성견용",
    "brand": "로얄캐닌",
    "feeding_duration": "3개월",
    "palatability_score": 5,
    "digestibility_score": 4,
    "coat_quality_score": 5,
    "stool_quality_score": 4,
    "overall_satisfaction": 5,
    "repurchase_intent": true,
    "benefits": [
      "높은 기호성",
      "변 상태 개선",
      "모질 개선",
      "품질 우수"
    ],
    "drawbacks": [
      "가격이 비쌈"
    ],
    "side_effects": [],
    "sentiment": "positive",
    "keywords": [
      "로얄캐닌",
      "성견용",
      "기호성",
      "변 상태",
      "모질",
      "윤기",
      "가격",
      "재구매"
    ]
  },
  "confidence_scores": {
    "product_extraction": 0.95,
    "sentiment_analysis": 0.92,
    "rating_estimation": 0.88,
    "overall": 0.92
  },
  "analysis_notes": "전반적으로 매우 긍정적인 리뷰입니다. 기호성, 소화율, 모질 모두에서 개선 효과를 경험했으며, 가격에 대한 부담에도 불구하고 재구매 의향이 명확합니다."
}
```

# Important Notes

1. **정확성**: 사용자의 표현을 과장하거나 축소하지 말고 있는 그대로 해석
2. **중립성**: 명시되지 않은 항목은 추측하지 말 것
3. **일관성**: 동일한 표현에 대해 항상 동일한 점수 부여
4. **한국어**: 모든 텍스트 출력은 한국어로 (JSON 키는 영어)
```

### 6.2 사용자 프롬프트 템플릿

```markdown
다음 반려동물의 급여 후기를 분석해주세요:

## 반려동물 정보
- 이름: {pet_name}
- 종: {pet_species}
- 품종: {pet_breed}
- 나이: {pet_age}세
- 몸무게: {pet_weight}kg

## 제품 카테고리
{category} (사료/간식/영양제/화장실)

## 급여 후기
{review_text}

위 정보를 바탕으로 구조화된 JSON 데이터를 생성해주세요.
```

### 6.3 API 호출 예시 (TypeScript)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function analyzeReview(
  petInfo: PetInfo,
  reviewText: string,
  category: string
) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  })

  const systemPrompt = `
  [위의 System Prompt 전체 내용]
  `

  const userPrompt = `
  다음 반려동물의 급여 후기를 분석해주세요:

  ## 반려동물 정보
  - 이름: ${petInfo.name}
  - 종: ${petInfo.species}
  - 품종: ${petInfo.breed}
  - 나이: ${petInfo.age}세
  - 몸무게: ${petInfo.weight}kg

  ## 제품 카테고리
  ${category}

  ## 급여 후기
  ${reviewText}
  `

  const result = await model.generateContent([
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'JSON 형식으로 분석 결과를 제공하겠습니다.' }] },
    { role: 'user', parts: [{ text: userPrompt }] },
  ])

  const response = result.response.text()
  const analysisData = JSON.parse(response)

  return analysisData
}
```

---

## 7. Figma 디자인 요청 프롬프트

### 7.1 전체 디자인 시스템 요청

```markdown
# Safe Pet Food - Design System Request

## Project Overview
Safe Pet Food는 반려동물 사료의 안전성 정보를 제공하고 급여 경험을 공유하는 커뮤니티 플랫폼입니다.

## Design Requirements

### 1. Brand Identity
- **서비스 이름**: Safe Pet Food
- **타겟**: 반려동물(강아지/고양이) 보호자
- **키워드**: 안전, 신뢰, 투명성, 커뮤니티, 따뜻함
- **톤앤매너**: 친근하고 신뢰감 있는, 전문적이지만 딱딱하지 않은

### 2. Color Palette
**Primary Colors**:
- Brand Blue: #3056F5
- Brand Yellow: #FCD34D (Header background)
- Gradient: from-orange-500 (#F97316) to-pink-500 (#EC4899)

**Secondary Colors**:
- Green: #10B981 (Pet Log, Health)
- Blue: #3B82F6 (Q&A)
- Purple: #A855F7 (Search, Community)

**Neutral Colors**:
- White: #FFFFFF
- Gray 50: #F9FAFB
- Gray 900: #111827

### 3. Typography
- **Font Family**: Geist Sans (또는 Inter, Pretendard)
- **Headings**: 
  - H1: 2.25rem (36px), Font-weight: 800
  - H2: 1.5rem (24px), Font-weight: 700
  - H3: 1.25rem (20px), Font-weight: 600
- **Body**: 
  - Large: 1rem (16px)
  - Regular: 0.875rem (14px)
  - Small: 0.75rem (12px)

### 4. Components to Design

#### 4.1 Cards
- Feature Card: 
  - Size: 280px × 320px
  - Border-radius: 16px
  - Shadow: 0 10px 15px rgba(0,0,0,0.1)
  - Hover: Shadow 증가, Y축 -8px 이동
  
- Product Card:
  - Size: 300px × 400px
  - Border-radius: 16px
  - 제품명, 브랜드, 등급 배지, 추천/비추천 정보 포함

- Review Card:
  - Width: 100% (flexible)
  - Border-radius: 12px
  - 사용자 정보, 별점, 리뷰 내용, 좋아요 포함

#### 4.2 Buttons
- Primary Button:
  - Gradient: from-orange-500 to-pink-500
  - Text: White, Font-weight: 600
  - Border-radius: 12px
  - Padding: 12px 24px
  - Hover: Gradient 진해짐, Shadow 증가

- Secondary Button:
  - Border: 2px solid gray-300
  - Text: Gray-700
  - Border-radius: 12px
  - Padding: 10px 20px
  - Hover: Background gray-50

#### 4.3 Icons
- Style: Lucide React 스타일
- Size: 
  - Small: 16px
  - Medium: 20px
  - Large: 24px
- Badge Icons:
  - Gradient background
  - Border-radius: 12px
  - Padding: 12px

### 5. Specific Screens to Design

#### 5.1 Pet Log LLM Analysis Screens

**Screen 1: 자유 텍스트 입력**
- Title: "급여 후기를 자유롭게 작성해주세요 ✍️"
- Subtitle: "제품명, 브랜드, 급여 기간, 좋았던 점, 아쉬운 점 등을 편하게 작성해주세요. AI가 분석해서 자동으로 정리해드려요!"
- Components:
  - Large textarea (height: 160px)
  - Placeholder with example text
  - Primary button "AI로 자동 분석하기" with Sparkles icon
  - Loading state: Button shows spinner + "AI가 분석 중..."

**Screen 2: AI 분석 결과 확인**
- Header:
  - Title with CheckCircle icon: "AI 분석 완료!"
  - Confidence score badge
  
- Sections:
  1. 제품 정보 (Blue background card)
     - Product name, Brand, Feeding duration
  
  2. 평가 점수 (Interactive star ratings)
     - 기호성, 소화율, 모질, 변 상태, 전체 만족도
     - Each with editable 5-star rating
  
  3. 장점 (Green tags)
     - Benefit tags with X button to remove
     - "+ 추가" button with dashed border
  
  4. 단점 (Orange tags)
     - Drawback tags with X button
     - "+ 추가" button
  
  5. 재구매 의향 (Toggle button)
     - "예" (Green) / "아니오" (Gray)
  
  6. Action buttons
     - Secondary: "다시 분석하기"
     - Primary: "확인 및 저장"

**Design Guidelines for LLM Screens**:
- Use soft shadows and rounded corners (16px)
- Maintain visual hierarchy with clear sections
- Interactive elements should have clear hover/active states
- Use color-coded sections (Blue: Info, Green: Positive, Orange: Caution)
- Include loading states with smooth animations
- Mobile-responsive: Stack sections vertically on small screens

### 6. Layout Specs

#### Desktop (1280px+)
- Max content width: 1280px
- Padding: 64px horizontal
- Grid: 12 columns

#### Tablet (768px - 1279px)
- Padding: 48px horizontal
- Grid: 8 columns

#### Mobile (< 768px)
- Padding: 16px horizontal
- Single column layout
- Stack cards vertically

### 7. Spacing System
- xs: 4px
- sm: 8px
- base: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### 8. Animation Guidelines
- Transition duration: 200-300ms
- Easing: ease-in-out
- Hover effects: Scale 1.05, Translate-Y -8px, Shadow increase
- Loading: Spinner with 1s rotation

## Deliverables

1. **Design System Components** (Figma file)
   - Color styles
   - Text styles
   - Component library (Cards, Buttons, Icons, Forms)

2. **Key Screens** (High-fidelity mockups)
   - Home page
   - Brand detail page
   - Product detail page
   - Pet Log write page (with LLM analysis screens)
   - Pet Log detail page
   - Q&A forum page

3. **Mobile Versions** of all key screens

4. **Prototype** (Optional)
   - Interactive prototype showing user flow for LLM analysis

## References
- **Style**: Modern, Clean, Trustworthy
- **Similar services**: 당근마켓 (friendly), 오늘의집 (community), 네이버 블로그 (content-focused)
- **Color inspiration**: Warm gradients (Orange to Pink), Trust colors (Blue)
```

### 7.2 LLM 분석 UI 전용 요청

```markdown
# Pet Log LLM Analysis UI - Figma Design Request

## Context
Safe Pet Food의 Pet Log 기능에서 사용자가 자유 텍스트로 작성한 급여 후기를 LLM이 분석하여 구조화된 데이터로 변환하는 기능을 추가합니다.

## User Flow
1. 사용자: 자유 텍스트로 급여 후기 작성
2. 버튼 클릭: "AI로 자동 분석하기"
3. 로딩 상태: "AI가 분석 중..." (2-3초)
4. 결과 화면: 분석된 데이터를 구조화된 UI로 표시
5. 사용자: 결과 검토 및 수정
6. 최종 확인: "확인 및 저장" 버튼 클릭

## Screen 1: 텍스트 입력 화면

### Layout
- Width: 800px (Desktop), 100% (Mobile)
- Background: White card with shadow
- Border-radius: 24px
- Padding: 32px

### Components

**Header**
- Title: "급여 후기를 자유롭게 작성해주세요 ✍️"
  - Font-size: 24px
  - Font-weight: 700
  - Color: Gray-900

- Subtitle: "제품명, 브랜드, 급여 기간, 좋았던 점, 아쉬운 점 등을 편하게 작성해주세요. AI가 분석해서 자동으로 정리해드려요!"
  - Font-size: 14px
  - Color: Gray-600
  - Margin-top: 8px

**Textarea**
- Width: 100%
- Height: 160px
- Border: 2px solid Gray-300
- Border-radius: 12px
- Padding: 16px
- Font-size: 16px
- Placeholder: 예시 텍스트 (Gray-400)
- Focus state: Border-color: Blue-500, Box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

**Button - "AI로 자동 분석하기"**
- Width: 100%
- Height: 48px
- Background: Gradient (from-blue-500 to-indigo-600)
- Color: White
- Border-radius: 12px
- Font-size: 16px
- Font-weight: 600
- Icon: Sparkles (20px, left side)
- Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
- Hover: Gradient 진해짐, Shadow 증가

**Loading State**
- Button text: "AI가 분석 중..."
- Spinner animation (left side, 20px)
- Disabled state: Opacity 0.5, Cursor: not-allowed

## Screen 2: 분석 결과 확인 화면

### Layout
- Width: 800px (Desktop), 100% (Mobile)
- Background: White card with shadow
- Border: 1px solid Gray-200
- Border-radius: 24px
- Padding: 32px

### Header Section
- Display: Flex, Justify-between
- Margin-bottom: 24px

**Title**
- Text: "AI 분석 완료!" with CheckCircle icon (Green-500, 24px)
- Font-size: 24px
- Font-weight: 700
- Color: Gray-900

**Confidence Badge**
- Text: "신뢰도: 92%"
- Background: Gray-100
- Color: Gray-700
- Font-size: 14px
- Padding: 6px 12px
- Border-radius: 999px

### Section 1: 제품 정보
- Background: Blue-50
- Padding: 16px
- Border-radius: 12px
- Margin-bottom: 24px

**Title**: "📦 추출된 제품 정보"
- Font-size: 16px
- Font-weight: 600
- Margin-bottom: 12px

**Content**:
- Line items (Font-size: 14px, Color: Gray-700)
- Bold labels: Font-weight: 600

### Section 2: 평가 점수
- Margin-bottom: 24px

**Title**: "⭐ AI가 분석한 평가"
- Font-size: 16px
- Font-weight: 600
- Margin-bottom: 16px

**Rating Rows**:
- Display: Flex, Justify-between, Align-center
- Margin-bottom: 12px

**Star Rating Component**:
- 5 stars (20px each)
- Filled: Yellow-400
- Empty: Gray-300
- Interactive: Hover shows fill preview
- Cursor: pointer

**Score Text**:
- Font-size: 14px
- Color: Gray-600
- Example: "4/5"

### Section 3: 장점 (Benefits)
- Margin-bottom: 24px

**Title**: "✅ 장점"
- Font-size: 16px
- Font-weight: 600
- Margin-bottom: 12px

**Tag Container**:
- Display: Flex, Flex-wrap
- Gap: 8px

**Benefit Tag**:
- Background: Green-100
- Color: Green-700
- Font-size: 14px
- Padding: 6px 12px
- Border-radius: 999px
- Display: Inline-flex, Align-center
- Gap: 4px

**Remove Button (X)**:
- Icon: X (12px)
- Color: Green-700
- Hover: Green-900
- Cursor: pointer

**Add Button**:
- Border: 2px dashed Green-300
- Color: Green-600
- Background: Transparent
- Padding: 6px 12px
- Border-radius: 999px
- Font-size: 14px
- Hover: Background Green-50

### Section 4: 단점 (Drawbacks)
- Same as Section 3, but with Orange colors
- Background: Orange-100
- Text: Orange-700
- Border: Orange-300

### Section 5: 재구매 의향
- Background: Gray-50
- Padding: 16px
- Border-radius: 12px
- Display: Flex, Justify-between, Align-center

**Label**:
- Font-size: 16px
- Font-weight: 600
- Color: Gray-900

**Toggle Button**:
- Width: 120px
- Height: 40px
- Border-radius: 8px
- Font-size: 14px
- Font-weight: 600
- Transition: 200ms

**State - Yes (Active)**:
- Background: Green-500
- Color: White
- Icon: CheckCircle (16px, left)

**State - No (Active)**:
- Background: Gray-300
- Color: Gray-700
- Icon: X (16px, left)

### Action Buttons Section
- Display: Flex, Gap: 12px
- Padding-top: 24px
- Border-top: 1px solid Gray-200

**Secondary Button - "다시 분석하기"**:
- Flex: 1
- Height: 48px
- Border: 2px solid Gray-300
- Background: White
- Color: Gray-700
- Border-radius: 12px
- Font-size: 16px
- Font-weight: 600
- Hover: Background Gray-50

**Primary Button - "확인 및 저장"**:
- Flex: 1
- Height: 48px
- Background: Gradient (from-blue-500 to-indigo-600)
- Color: White
- Border-radius: 12px
- Font-size: 16px
- Font-weight: 600
- Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
- Hover: Gradient 진해짐, Shadow 증가

## Mobile Responsive (< 768px)

### Adjustments
- Card padding: 16px
- Title font-size: 20px
- Sections stack vertically
- Buttons: Width 100%, Stack vertically with 12px gap
- Star ratings: Scale down to 16px
- Tags: Font-size 12px

## Animations

### Loading State
- Spinner: Rotate 360deg, Duration: 1s, Infinite

### Card Entrance
- Fade in + Slide up
- Duration: 300ms
- Easing: ease-out

### Interactive Elements
- Hover: Scale 1.02
- Active: Scale 0.98
- Duration: 150ms
- Easing: ease-in-out

## Accessibility

- All interactive elements: Min height 44px (touch target)
- Focus states: 2px solid Blue-500 outline
- Color contrast: Minimum WCAG AA compliance
- Screen reader labels for icons

## Export Requirements

1. **Figma Components**
   - Reusable star rating component
   - Tag component (with variants: Green/Orange)
   - Toggle button component
   - Analysis result card component

2. **Mockups**
   - Screen 1: Desktop & Mobile
   - Screen 2: Desktop & Mobile
   - Loading states
   - Error states

3. **Prototype**
   - User flow: Input → Loading → Result → Edit → Save
   - Interactive star ratings
   - Add/Remove tags
   - Toggle repurchase intent

4. **Assets**
   - SVG icons (Sparkles, CheckCircle, X)
   - Spinner animation
   - All screens in PNG (2x resolution)
```

---

## 8. 구현 체크리스트

### Frontend (2주)

#### Week 1
- [ ] 자유 텍스트 입력 UI 구현
- [ ] LLM 분석 API 호출 함수 작성
- [ ] 로딩 상태 UI 구현
- [ ] 분석 결과 표시 UI 구현 (읽기 전용)

#### Week 2
- [ ] 별점 수정 기능 구현
- [ ] 태그 추가/삭제 기능 구현
- [ ] 재구매 의향 토글 구현
- [ ] 재분석 기능 구현
- [ ] 최종 저장 API 연동
- [ ] 에러 핸들링 및 fallback UI
- [ ] 모바일 반응형 최적화

### Backend (1주)

#### API Development
- [ ] `/api/analyze-review` 엔드포인트 구현
- [ ] Google Gemini API 연동
- [ ] 프롬프트 최적화
- [ ] 응답 파싱 및 검증
- [ ] Rate limiting 설정
- [ ] 에러 핸들링

#### Database
- [ ] `review_logs` 테이블 컬럼 추가/수정
- [ ] LLM 분석 결과 저장 스키마 설계
- [ ] 마이그레이션 스크립트 작성

### Testing & QA (1주)

- [ ] 다양한 리뷰 텍스트로 테스트
- [ ] 긍정/부정/중립 리뷰 모두 테스트
- [ ] 짧은 텍스트 / 긴 텍스트 테스트
- [ ] 제품명/브랜드 추출 정확도 검증
- [ ] 점수 산정 일관성 검증
- [ ] UI/UX 사용성 테스트
- [ ] 모바일 테스트
- [ ] 성능 최적화 (API 응답 시간 < 3초)

---

## 9. 예상 비용 및 리소스

### LLM API 비용 (Google Gemini 1.5 Pro)

**무료 티어**:
- 월 50만 요청
- 1분당 15 요청

**예상 사용량** (월 1만 리뷰 분석):
- 월 1만 요청
- **비용: $0** (무료 티어 내)

**유료 전환 시**:
- $0.00125 per 1K characters (input)
- $0.005 per 1K characters (output)
- 평균 리뷰 500자 + 프롬프트 2000자 = 2500자
- 평균 출력 1000자
- **월 1만 리뷰**: ($0.00125 × 25 + $0.005 × 10) × 10,000 = **$812.5**

### 개발 인력

- Frontend 개발자: 2주 (80시간)
- Backend 개발자: 1주 (40시간)
- QA: 1주 (40시간)
- **총 160시간**

---

## 10. 성공 지표 (KPI)

### 기술적 지표
- LLM 분석 성공률: > 95%
- 평균 응답 시간: < 3초
- 사용자 수정률: < 30% (분석 정확도 지표)

### 사용자 경험 지표
- 기능 사용률: 신규 리뷰 작성 중 LLM 사용 > 60%
- 사용자 만족도: 4.5/5 이상
- 작성 시간 단축: 기존 대비 50% 감소

### 비즈니스 지표
- 리뷰 작성 증가율: 월 30% 이상
- 사용자 활성화율 증가: 20% 이상

---

## 부록 A: 기술 스택 상세

### Frontend
```json
{
  "framework": "Next.js 14",
  "language": "TypeScript",
  "styling": "TailwindCSS",
  "animation": "Framer Motion",
  "icons": "Lucide React",
  "forms": "React Hook Form",
  "validation": "Zod"
}
```

### Backend
```json
{
  "runtime": "Node.js 20",
  "framework": "Next.js API Routes",
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage",
  "llm": "Google Gemini 1.5 Pro"
}
```

### DevOps
```json
{
  "hosting": "Vercel",
  "ci_cd": "GitHub Actions",
  "monitoring": "Vercel Analytics",
  "logging": "Vercel Log Drains"
}
```

---

## 부록 B: 참고 링크

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Figma Best Practices](https://www.figma.com/best-practices/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

**문서 끝**

이 문서는 Safe Pet Food 프로젝트의 전체 UI/UX 명세와 Pet Log LLM 분석 기능 구현을 위한 포괄적인 가이드입니다. 
Google AI Studio 또는 Figma에 이 문서의 해당 섹션을 복사하여 사용하시면 됩니다.
