# 브랜드 평가 페이지 구현 프롬프트

## 🎯 개요

Safe Pet Food의 브랜드 평가 시스템은 사용자들이 반려동물 사료 브랜드에 대한 투명성, 품질, 안전성을 평가하고 공유할 수 있는 종합적인 플랫폼입니다. 브랜드 목록, 상세 정보, 평가 작성, SAFI 안전성 점수 등 다양한 기능을 제공합니다.

---

## 📱 페이지 구조

### 1. 브랜드 목록 페이지 (`/brands`)

#### 레이아웃
- **배경**: `bg-white` (흰색 배경)
- **컨테이너**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- **그리드 레이아웃**: `grid lg:grid-cols-4 gap-8`
  - 좌측: 필터 패널 (1열)
  - 우측: 브랜드 카드 그리드 (3열)

#### 헤더 섹션
```tsx
<div className="text-center mb-8">
  <h2 className="text-3xl font-bold text-gray-900 mb-4">
    사료 브랜드 투명성 평가 🏆
  </h2>
  <p className="text-lg text-gray-600 mb-6">
    다양한 브랜드의 투명성과 품질을 비교하고 신뢰할 수 있는 선택을 하세요
  </p>
  
  {/* 액션 버튼 */}
  <div className="flex flex-wrap justify-center gap-4">
    <Link href="/brands/compare" className="...">
      <BarChart3 className="h-4 w-4" />
      <span>브랜드 비교하기</span>
    </Link>
    <Link href="/community/qa-forum" className="...">
      <MessageSquare className="h-4 w-4" />
      <span>Q&A 포럼</span>
    </Link>
  </div>
</div>
```

#### 필터 패널 (좌측 사이드바)
- **스타일**: `bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100 sticky top-24`
- **구성 요소**:
  1. **검색 입력**
     - 아이콘: `Search` (왼쪽)
     - 스타일: `w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500`
     - 플레이스홀더: "브랜드명 또는 제조사"
  
  2. **정렬 옵션**
     - 버튼 스타일: `w-full text-left px-4 py-3 rounded-xl transition-colors`
     - 활성 상태: `bg-yellow-100 text-yellow-800 border border-yellow-200`
     - 비활성 상태: `bg-gray-50 text-gray-700 hover:bg-gray-100`
     - 옵션:
       - 평점 높은 순 (`rating`)
       - 투명성 높은 순 (`transparency`)
       - 이름 순 (`name`)
  
  3. **통계 정보**
     - 등록된 브랜드 수 표시
     - 스타일: `text-2xl font-bold text-yellow-600`

#### 브랜드 카드 그리드
- **그리드**: `grid md:grid-cols-2 gap-6`
- **카드 스타일**: 
  ```
  bg-white rounded-2xl shadow-lg hover:shadow-xl 
  transition-all duration-300 border border-gray-100 group
  ```

##### 브랜드 카드 구성 요소

1. **헤더**
   - 브랜드명: `text-xl font-bold text-gray-900 group-hover:text-yellow-600`
   - 제조사: `text-sm text-gray-600`
   - 투명성 배지 (우측 상단):
     - 투명 (4.5점 이상): `bg-green-100 text-green-800 border border-green-200`
     - 보통 (3.0~4.4점): `bg-yellow-100 text-yellow-800 border border-yellow-200`
     - 불투명 (3.0점 미만): `bg-red-100 text-red-800 border border-red-200`

2. **설명**
   - `text-sm text-gray-700 line-clamp-3 leading-relaxed`

3. **평점**
   - 별점 표시 (5점 만점)
   - 평점 숫자: `text-sm font-medium text-gray-700`
   - 리뷰 수: `text-xs text-gray-500`

4. **정보 그리드** (2x2)
   - 각 항목: `bg-gray-50 rounded-lg p-3`
   - 항목:
     - 설립년도
     - 원산지
     - 제품 라인 수
     - 투명성 점수

5. **SAFI 안전성 점수** (있는 경우)
   - 배경: `bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100`
   - 점수 표시: `text-2xl font-bold text-gray-900` / 100
   - 레벨 배지: `getSafiLevelColor()` 및 `getSafiLevelLabel()` 사용
   - 진행 바: 점수에 따라 색상 변경
     - SAFE: `bg-green-500`
     - NORMAL: `bg-yellow-500`
     - CAUTION: `bg-red-500`

6. **리콜 이력**
   - 아이콘: `AlertTriangle`
   - 텍스트: "리콜 이력 {count}건"
   - "자세히 보기" 링크: `text-sm font-medium text-yellow-600`

#### 빈 상태 (검색 결과 없음)
```tsx
<div className="text-center py-12">
  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Search className="h-12 w-12 text-gray-400" />
  </div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
  <p className="text-gray-600">다른 검색어를 시도해보세요</p>
</div>
```

#### CTA 섹션 (하단)
- 배경: `bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200`
- 버튼:
  - "성분 분석하기": `bg-gradient-to-r from-yellow-400 to-orange-400`
  - "칼로리 계산하기": `bg-white border border-gray-200`

---

### 2. 브랜드 상세 페이지 (`/brands/[brandName]`)

#### 헤더
- **배경**: `bg-white border-b border-gray-200`
- **구성**:
  - 뒤로가기 버튼: `ArrowLeft` 아이콘
  - 브랜드 로고 (이모지 또는 이미지)
  - 브랜드명: `text-2xl font-bold text-gray-900`
  - 제조사명: `text-gray-600`

#### 브랜드 프로필 카드
- **스타일**: `bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8`

##### 기본 정보 그리드 (3열)
- 각 항목: 아이콘 + 라벨 + 값
- 항목:
  1. **원산지** (`Globe` 아이콘, 파란색)
  2. **설립연도** (`Calendar` 아이콘, 초록색)
  3. **제조 공장** (`Factory` 아이콘, 보라색)

##### 브랜드 설명
- 제목: "📖 {브랜드명}에 대해서"
- 본문: `text-base text-gray-600 leading-relaxed whitespace-pre-line`

##### 제조 및 소싱 정보
- 제목: "🏭 제조 및 소싱에 대해서"
- 본문: `text-base text-gray-600 leading-relaxed whitespace-pre-line`

##### 리콜 이력
- 제목: "⚠️ 리콜 이력"
- 각 리콜 항목:
  - 심각도별 색상:
    - High: `text-red-600 bg-red-50`
    - Medium: `text-yellow-600 bg-yellow-50`
    - Low: `text-green-600 bg-green-50`
  - 해결 완료 표시: `CheckCircle` 아이콘 + "해결 완료"

##### 브랜드 평가 (2열 그리드)
- **신뢰하는 이유** (`ThumbsUp` 아이콘, 초록색)
  - 각 항목: `CheckCircle` 아이콘 + 텍스트
- **보완하면 좋은 점** (`AlertTriangle` 아이콘, 주황색)
  - 각 항목: `AlertTriangle` 아이콘 + 텍스트

#### 투명성 점수 카드
- **스타일**: `bg-white rounded-xl shadow-sm border border-gray-200 p-6`
- **제목**: "🔍 투명성 점수"
- **전체 점수**:
  - 점수: `text-4xl font-bold` (색상: 점수에 따라 변경)
    - 80점 이상: `text-green-600`
    - 60~79점: `text-yellow-600`
    - 60점 미만: `text-red-600`
  - 진행 바: 점수에 따라 색상 변경
- **공개 상태 분포**:
  - 완전 공개 (`Eye` 아이콘, 초록색): `{fully_disclosed}%`
  - 부분 공개 (`Minus` 아이콘, 노란색): `{partially_disclosed}%`
  - 미공개 (`EyeOff` 아이콘, 빨간색): `{not_disclosed}%`

#### 제품 라인업 카드
- **스타일**: `bg-white rounded-xl shadow-sm border border-gray-200 p-6`
- **제목**: "📦 제품 라인업"
- **제품 수**: `text-4xl font-bold text-blue-600`
- **제품 목록**:
  - 각 제품: `bg-gray-50 rounded-lg p-3`
  - 제품명: `font-medium text-gray-900`
  - 설명: `text-xs text-gray-500 line-clamp-1`

#### 제품군별 상세 분석 섹션
- **스타일**: `bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8`
- **제목**: "🧪 제품군별 상세 분석"

##### 각 제품 카드
- **헤더**:
  - 제품 이미지 (이모지)
  - 제품명: `text-xl font-semibold text-gray-900`
  - 인증 배지: `bg-green-100 text-green-700` (각 인증마다)
  - 설명: `text-gray-600 leading-relaxed`

##### 드롭다운 섹션들
각 섹션은 접기/펼치기 가능:

1. **원산지 & 제조 정보** (`Globe` 아이콘, 파란색)
   - 원산지
   - 제조국
   - 제조 공장 목록

2. **원료명칭** (`Package` 아이콘, 초록색)
   - 원료 태그: `bg-green-50 text-green-700 rounded-full`
   - 그리드: `grid-cols-2 md:grid-cols-3 gap-2`

3. **등록성분량** (`TestTube` 아이콘, 보라색)
   - 각 성분: `bg-purple-50 rounded-lg p-3`
   - 라벨: `text-sm font-medium text-purple-700`
   - 값: `text-lg font-bold text-purple-900`
   - 성분:
     - 조단백질 (protein)
     - 조지방 (fat)
     - 조섬유 (fiber)
     - 수분 (moisture)
     - 조회분 (ash)
     - 칼슘 (calcium)
     - 인 (phosphorus)

4. **추천 이유** (`ThumbsUp` 아이콘, 초록색)
   - 각 항목: `CheckCircle` 아이콘 + 텍스트

5. **비추천 이유** (`ThumbsDown` 아이콘, 빨간색)
   - 각 항목: `AlertTriangle` 아이콘 + 텍스트

##### 소비자 평가
- **평가 점수** (2열 그리드):
  - 기호성 (palatability)
  - 소화력 (digestibility)
  - 모질 개선 (coat_quality)
  - 변 상태 (stool_quality)
  - 전체 만족도 (overall_satisfaction)
  - 각 항목: 별점 (5점) + 숫자

- **커뮤니티 추천**:
  - 추천률: `text-2xl font-bold text-green-600`
  - 추천/비추천 수: `ThumbsUp` / `ThumbsDown` 아이콘

- **소비자 리뷰**:
  - 각 리뷰: `bg-gray-50 rounded-lg p-4`
  - 작성자명, 별점, 날짜
  - 리뷰 내용: `text-sm text-gray-700 leading-relaxed`
  - "도움됨" 버튼: `ThumbsUp` 아이콘 + 카운트

#### SAFI 안전성 점수 섹션
- **스타일**: `bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8`
- **헤더**:
  - 아이콘: `Shield` (파란색)
  - 제목: "🛡️ SAFI 안전성 점수"
  - 설명: "Safety & Fit Index - 제품 안전성 종합 평가"

##### 종합 점수 카드
- 배경: `bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6`
- 점수: `text-4xl font-bold text-gray-900` / 100
- 레벨 배지: `getSafiLevelColor()` 및 `getSafiLevelLabel()` 사용
- 진행 바: 레벨에 따라 색상 변경
- 안내 문구:
  - SAFE: "✅ 안전한 제품으로 평가됩니다"
  - NORMAL: "⚠️ 보통 수준의 안전성을 가진 제품입니다"
  - CAUTION: "⚠️ 주의가 필요한 제품입니다"

##### 세부 지수 (5개, 그리드)
각 지수 카드: `bg-gray-50 rounded-lg p-4 border border-gray-200`

1. **A. 부작용 지수** (35%, 파란색)
   - 알레르기·구토 발생률

2. **B. 변 상태 지수** (25%, 초록색)
   - 평균 변 상태 점수

3. **C. 식욕 지수** (10%, 노란색)
   - 식욕 변화 평가

4. **D. 원재료 안전 지수** (20%, 보라색)
   - 원재료 안전성 평가

5. **E. 브랜드 신뢰 지수** (10%, 인디고색)
   - 리콜 이력 기반 평가

##### 평가 기준 안내
- 아이콘: `BarChart3`
- 기준:
  - 80점 이상: 안전 (SAFE)
  - 60~79점: 보통 (NORMAL)
  - 60점 미만: 주의 (CAUTION)

##### 평가하기 버튼
- 스타일: `bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl`
- 아이콘: `Shield`
- 텍스트: "SAFI 평가하기"
- 안내: "로그인한 회원만 평가할 수 있습니다"

#### 브랜드 질문하기 섹션
- **스타일**: `bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8`
- **헤더**:
  - 제목: "💬 브랜드 질문하기"
  - "질문 등록" 버튼: `bg-blue-500 text-white`

##### 질문 목록
- 빈 상태:
  - 아이콘: `MessageSquare` (회색)
  - 메시지: "아직 등록된 질문이 없습니다."

- 질문 카드:
  - 질문 헤더:
    - 작성자명: `User` 아이콘
    - 날짜
    - 좋아요 수: `Heart` 아이콘
    - 답변완료 배지: `bg-green-100 text-green-700`
  - 질문 내용: `bg-gray-50 p-3 rounded-lg`
  - 답변 (있는 경우):
    - 왼쪽 테두리: `border-l-2 border-blue-200`
    - 답변자: `Building` 아이콘 + 이름
    - 답변 내용: `bg-blue-50 p-3 rounded-lg`
  - 답변 대기 중:
    - "브랜드 담당자 답변 대기 중..."

##### 액션 버튼 (3개, 그리드)
1. **이 브랜드 평가하기** (`Star` 아이콘, 초록색)
   - 링크: `/brands/${brandName}/evaluate`
   - 스타일: `border-2 border-green-200 hover:border-green-300 hover:bg-green-50`

2. **문제 신고하기** (`Flag` 아이콘, 빨간색)
   - 스타일: `border-2 border-red-200 hover:border-red-300 hover:bg-red-50`

3. **투표 위젯**
   - 추천 버튼: `bg-green-500 text-white` (활성: `bg-green-600`)
   - 비추천 버튼: `bg-gray-300 text-gray-600` (활성: `bg-red-600 text-white`)

#### 모달들

##### Q&A 질문 등록 모달
- 배경: `bg-black bg-opacity-50`
- 모달: `bg-white rounded-xl max-w-md w-full p-6`
- 입력 필드:
  - 텍스트에어리어: `w-full p-3 border border-gray-300 rounded-lg`
  - 글자 수: `{length}/500자`
- 버튼:
  - 취소: `border border-gray-300`
  - 등록: `bg-blue-500 text-white` (비활성: `opacity-50`)

##### 문제 신고 모달
- 셀렉트 박스: 신고 유형 선택
- 텍스트에어리어: 상세 내용
- 버튼:
  - 취소: `border border-gray-300`
  - 신고하기: `bg-red-500 text-white`

##### 평가 성공 모달
- 아이콘: `CheckCircle` (초록색, 원형 배경)
- 제목: "평가 완료!"
- 메시지: 감사 메시지
- 확인 버튼: `bg-green-500 text-white`

---

### 3. 브랜드 평가 작성 페이지 (`/brands/[brandName]/evaluate`)

#### 레이아웃
- **배경**: `bg-gradient-to-br from-blue-50 via-white to-cyan-50`
- **컨테이너**: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8`

#### 헤더
- 뒤로가기 버튼: `ArrowLeft` 아이콘
- 제목: "브랜드 평가하기"
- 브랜드명 표시

#### 단계별 진행 (4단계)

##### Step 1: 기본 평가
- **전체 평점** (별점 5점)
- **카테고리별 평가** (10개 항목):
  1. 기호성 (`Heart` 아이콘, 핑크색)
  2. 소화력 (`Zap` 아이콘, 노란색)
  3. 모질 개선 (`Star` 아이콘, 앰버색)
  4. 변 상태 (`CheckCircle` 아이콘, 초록색)
  5. 가성비 (`DollarSign` 아이콘, 파란색)
  6. 포장 품질 (`Shield` 아이콘, 보라색)
  7. 구매 편의성 (`Truck` 아이콘, 인디고색)
  8. 브랜드 신뢰도 (`Shield` 아이콘, 회색)
  9. 성분 투명성 (`Eye` 아이콘, 틸색)
  10. 고객 서비스 (`MessageCircle` 아이콘, 주황색)

- 각 카테고리:
  - 아이콘 + 라벨 + 설명
  - 별점 선택 (1~5점)
  - 색상별 스타일링

##### Step 2: 반려동물 정보
- 종류: 강아지 / 고양이
- 나이
- 품종
- 체중
- 건강 상태 (체크박스)

##### Step 3: 구매 정보
- 제품 라인
- 급여 기간
- 구매 빈도
- 가격대

##### Step 4: 상세 리뷰
- 텍스트에어리어: `w-full p-4 border-2 border-gray-200 rounded-xl`
- 추천 여부: 라디오 버튼 (추천 / 비추천)

#### 진행 표시
- 단계 인디케이터: 현재 단계 강조
- 이전/다음 버튼
- 제출 버튼 (마지막 단계)

---

## 🎨 디자인 시스템

### 컬러 팔레트

#### 투명성 배지
- 투명 (4.5점 이상): `bg-green-100 text-green-800 border border-green-200`
- 보통 (3.0~4.4점): `bg-yellow-100 text-yellow-800 border border-yellow-200`
- 불투명 (3.0점 미만): `bg-red-100 text-red-800 border border-red-200`

#### 투명성 점수
- 80점 이상: `text-green-600`, `bg-green-500`
- 60~79점: `text-yellow-600`, `bg-yellow-500`
- 60점 미만: `text-red-600`, `bg-red-500`

#### SAFI 레벨
- SAFE: `bg-green-500`
- NORMAL: `bg-yellow-500`
- CAUTION: `bg-red-500`

#### 리콜 심각도
- High: `text-red-600 bg-red-50`
- Medium: `text-yellow-600 bg-yellow-50`
- Low: `text-green-600 bg-green-50`

### 아이콘 사용
- `Star`: 평점, 모질 개선
- `Shield`: 안전성, 브랜드 신뢰도, 포장 품질
- `Heart`: 기호성, 좋아요
- `AlertTriangle`: 경고, 리콜, 비추천 이유
- `CheckCircle`: 변 상태, 추천 이유, 완료
- `Globe`: 원산지, 제조 정보
- `Factory`: 제조 공장
- `Package`: 원료
- `TestTube`: 성분 분석
- `ThumbsUp` / `ThumbsDown`: 추천/비추천
- `MessageSquare`: 질문, 리뷰
- `BarChart3`: 통계, 비교

---

## 📊 데이터 구조

### Brand 인터페이스
```typescript
interface Brand {
  id: string
  name: string
  logo: string
  manufacturer: string
  country_of_origin: string
  manufacturing_locations: string[]
  established_year: number
  certifications: string[]
  brand_description: string
  manufacturing_info: string
  brand_pros: string[]
  brand_cons: string[]
  product_lines?: string[]
  recall_history: Array<{
    date: string
    reason: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
  }>
  transparency_score: number
  ingredient_disclosure: {
    fully_disclosed: number
    partially_disclosed: number
    not_disclosed: number
  }
  nutrition_analysis: {
    protein: number
    fat: number
    carbohydrates: number
    fiber: number
    moisture: number
    calories_per_100g: number
  }
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
  }
  expert_reviews: Array<{
    expert_name: string
    rating: number
    comment: string
    date: string
  }>
  ingredients: Array<{
    name: string
    percentage?: number
    source?: string
    disclosure_level: 'full' | 'partial' | 'none'
  }>
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  qa_section: BrandQuestion[]
  products: ProductInfo[]
}
```

### ProductInfo 인터페이스
```typescript
interface ProductInfo {
  id: string
  name: string
  image: string
  description: string
  certifications: string[]
  origin_info: {
    country_of_origin?: string
    manufacturing_country?: string
    manufacturing_facilities?: string[]
  }
  ingredients: string[]
  guaranteed_analysis: {
    protein: string
    fat: string
    fiber: string
    moisture: string
    ash?: string
    calcium?: string
    phosphorus?: string
  }
  pros: string[]
  cons: string[]
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
  }
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  consumer_reviews: Array<{
    id: string
    user_name: string
    rating: number
    comment: string
    date: string
    helpful_count: number
  }>
}
```

### SafiResult 인터페이스
```typescript
interface SafiResult {
  overallScore: number
  level: 'SAFE' | 'NORMAL' | 'CAUTION'
  detail: {
    A: number  // 부작용 지수 (35%)
    B: number  // 변 상태 지수 (25%)
    C: number  // 식욕 지수 (10%)
    D: number  // 원재료 안전 지수 (20%)
    E: number  // 브랜드 신뢰 지수 (10%)
  }
}
```

---

## 🔧 주요 기능

### 1. 검색 및 필터
- 실시간 검색 (브랜드명, 제조사)
- 정렬 옵션:
  - 평점 높은 순
  - 투명성 높은 순
  - 이름 순

### 2. 투명성 점수 계산
```typescript
const getTransparencyScore = (brand: Brand) => {
  const recallCount = brand.recall_history.length
  const highSeverityCount = brand.recall_history.filter(r => r.severity === 'high').length
  const unresolvedCount = brand.recall_history.filter(r => !r.resolved).length
  
  let score = 5
  score -= recallCount * 0.5
  score -= highSeverityCount * 1
  score -= unresolvedCount * 2
  
  return Math.max(0, Math.min(5, score))
}
```

### 3. SAFI 점수 계산
- `calculateSafiScore()` 함수 사용
- 리뷰 데이터, 리콜 이력, 원재료 정보 기반 계산
- 5가지 지수 종합 평가

### 4. 투표 시스템
- 추천/비추천 버튼
- 실시간 투표 수 업데이트
- 사용자별 투표 상태 저장

### 5. 질문 및 답변
- 질문 등록
- 브랜드 담당자 답변
- 좋아요 기능

### 6. 평가 작성
- 4단계 프로세스
- 카테고리별 상세 평가
- 반려동물 정보 입력
- 구매 정보 입력
- 상세 리뷰 작성

---

## 📝 구현 체크리스트

### 디자인
- [ ] 브랜드 목록 페이지 레이아웃
- [ ] 필터 패널 (검색, 정렬)
- [ ] 브랜드 카드 디자인
- [ ] 투명성 배지 색상 구분
- [ ] SAFI 점수 표시
- [ ] 브랜드 상세 페이지 레이아웃
- [ ] 제품 상세 정보 드롭다운
- [ ] 모달 디자인
- [ ] 평가 작성 페이지 단계별 UI

### 기능
- [ ] 브랜드 목록 API 연동
- [ ] 검색 및 필터 기능
- [ ] 정렬 기능
- [ ] 투명성 점수 계산
- [ ] SAFI 점수 계산 및 표시
- [ ] 투표 시스템
- [ ] 질문 등록 및 답변
- [ ] 평가 작성 및 제출
- [ ] 리콜 이력 표시
- [ ] 제품 정보 표시

### 데이터
- [ ] Brand 인터페이스 정의
- [ ] ProductInfo 인터페이스 정의
- [ ] SafiResult 인터페이스 정의
- [ ] API 응답 데이터 변환
- [ ] 로컬 상태 관리

### 사용자 경험
- [ ] 로딩 상태 표시
- [ ] 빈 상태 처리
- [ ] 에러 핸들링
- [ ] 모바일 반응형
- [ ] 접근성 개선

---

이 프롬프트를 사용하여 브랜드 평가 페이지를 완전히 재현할 수 있습니다.

