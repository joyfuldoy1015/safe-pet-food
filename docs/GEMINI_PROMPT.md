# Safe Pet Food - Gemini 재현 프롬프트

## 🎯 프로젝트 개요

**Safe Pet Food**는 반려동물 사료 분석 및 커뮤니티 플랫폼입니다. 사용자들이 반려동물 사료의 영양 성분을 분석하고, 급여 후기를 공유하며, Q&A를 통해 정보를 교환할 수 있는 종합 서비스입니다.

**기술 스택**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (인증 및 데이터베이스), Lucide React (아이콘)

---

## 🎨 디자인 시스템

### 1. 컬러 팔레트

#### 헤더
- **배경색**: `bg-yellow-400` (노란색)
- **텍스트**: `text-black` (검정색)
- **호버 효과**: `hover:bg-yellow-300` (연한 노란색)

#### 페이지 배경 그라데이션
- **메인 페이지**: `bg-gradient-to-br from-yellow-50 via-white to-orange-50`
- **일반 페이지**: `bg-gradient-to-br from-blue-50 via-white to-cyan-50`
- **프로필/설정 페이지**: `bg-gradient-to-br from-blue-50 via-white to-cyan-50`
- **커뮤니티 페이지**: `bg-gradient-to-br from-purple-50 via-white to-pink-50`

#### 카테고리별 그라데이션
- **사료/급여**: `from-orange-500 to-pink-500`
- **건강/케어**: `from-green-500 to-teal-500`
- **커뮤니티**: `from-purple-500 to-indigo-500` 또는 `from-blue-500 to-purple-500`
- **액션 버튼**: `from-purple-500 to-pink-500` (호버: `from-purple-600 to-pink-600`)

#### 메타데이터 태그 컬러
- **강조 정보** (나이, 급여일): `bg-yellow-400 text-black`
- **통계 정보** (조회, 추천, 댓글): `bg-gray-50 border border-gray-200 text-gray-700`
- **상태 배지**:
  - 진행 중: `bg-blue-100 text-blue-800`
  - 중단: `bg-gray-100 text-gray-800`
  - 완료: `bg-green-100 text-green-800`

#### 주요 액센트 컬러
- **Primary Blue**: `#3056F5`
- **Primary Button**: `bg-[#3056F5]` (호버: `hover:bg-[#2648e6]`)

### 2. 타이포그래피

- **폰트**: Inter (Google Fonts) - `font-family: 'Inter', system-ui, sans-serif`
- **기본 크기**:
  - 대제목: `text-3xl sm:text-4xl font-bold`
  - 제목: `text-2xl sm:text-3xl font-bold`
  - 부제목: `text-xl sm:text-2xl font-bold`
  - 본문: `text-base sm:text-lg`
  - 작은 텍스트: `text-xs sm:text-sm`
- **가중치**: `font-bold`, `font-semibold`, `font-medium`
- **텍스트 컬러**: 
  - 제목: `text-gray-900`
  - 본문: `text-gray-600` 또는 `text-gray-700`
  - 보조 텍스트: `text-gray-500`

### 3. 카드 디자인

#### 기본 카드 스타일
```
bg-white rounded-2xl shadow-xl border border-gray-100
p-6 sm:p-8
hover:shadow-2xl hover:-translate-y-2 transition-all duration-300
```

#### 카드 높이
- **고정 높이**: `min-h-[350px]`
- **반응형**: `h-full flex flex-col`
- **내부 콘텐츠**: `flex-1` (남은 공간 채우기)

#### 카드 내부 요소
- **그라데이션 아이콘 컨테이너**: 
  ```
  w-10 h-10 sm:w-12 sm:h-12 
  bg-gradient-to-r from-[color]-500 to-[color]-500 
  rounded-2xl flex items-center justify-center shadow-lg
  ```
- **섹션 헤더**: 그라데이션 아이콘 + 제목 텍스트 (flex items-center gap-3)
- **구분선**: `border-l-4 border-[color]` (분석 기준별 고유 색상)

### 4. 버튼 스타일

#### 주요 액션 버튼
```
px-5 sm:px-6 py-3 sm:py-3.5
bg-gradient-to-r from-purple-500 to-pink-500
hover:from-purple-600 hover:to-pink-600
text-white rounded-xl font-semibold
transition-all duration-200
shadow-lg hover:shadow-xl
transform hover:scale-105
```

#### Primary 버튼 (파란색)
```
px-6 py-3
bg-[#3056F5] text-white
rounded-xl font-medium
hover:bg-[#2648e6] transition-colors
shadow-md hover:shadow-lg
```

#### 보조 버튼
```
px-4 sm:px-5 py-2.5 sm:py-3
bg-gray-100 hover:bg-gray-200
text-gray-700 rounded-xl
transition-all duration-200
```

#### 아이콘 버튼
- 아이콘 크기: `h-4 w-4 sm:h-5 sm:w-5`
- 패딩: `p-2` 또는 `px-3 py-2`
- 둥근 모서리: `rounded-lg` 또는 `rounded-xl`

### 5. 입력 필드 스타일

#### 기본 입력 필드
```
px-4 py-3 sm:py-3.5
border-2 border-gray-200 rounded-xl
focus:ring-2 focus:ring-purple-500 focus:border-transparent
transition-all duration-200
bg-white
```

#### 에러 상태
```
border-red-300 bg-red-50
```

#### 검색 입력 필드
- 왼쪽 아이콘: `absolute left-4 top-1/2 transform -translate-y-1/2`
- 패딩: `pl-12 pr-20` (아이콘 + 버튼 공간)

### 6. 모바일 반응형 디자인

#### Breakpoints
- `sm:` 640px 이상
- `md:` 768px 이상
- `lg:` 1024px 이상

#### 반응형 패턴
- **텍스트 크기**: `text-base sm:text-lg`
- **패딩**: `p-4 sm:p-6 lg:p-8`
- **간격**: `gap-3 sm:gap-4`
- **레이아웃**: `flex-col sm:flex-row`
- **그리드**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

#### 모바일 최적화
- 터치 영역: 최소 `44px` 높이
- 버튼 너비: `w-full sm:w-auto`
- 텍스트 줄바꿈: `whitespace-nowrap` 또는 자동 줄바꿈
- 텍스트 클램프: `line-clamp-2`, `line-clamp-3`

### 7. 아이콘 사용

- **라이브러리**: Lucide React
- **크기**:
  - 작은 아이콘: `h-4 w-4 sm:h-5 sm:w-5`
  - 중간 아이콘: `h-5 w-5 sm:h-6 sm:h-6`
  - 큰 아이콘: `h-8 w-8 sm:h-10 sm:w-10`
- **컬러**: 그라데이션 배경의 흰색 아이콘 또는 `text-gray-600`

### 8. 애니메이션 및 인터랙션

- **호버 효과**: 
  - 카드: `hover:shadow-2xl hover:-translate-y-2`
  - 버튼: `hover:scale-105`
  - 링크: `hover:text-gray-700`
- **트랜지션**: `transition-all duration-200` 또는 `duration-300`
- **스크롤**: `scrollIntoView({ behavior: 'smooth', block: 'start' })`
- **로딩 애니메이션**: `animate-spin` (회전), `animate-pulse` (펄스)

### 9. 그림자 및 테두리

#### 그림자
- **Soft**: `shadow-[0_8px_30px_rgba(0,0,0,0.05)]`
- **Medium**: `shadow-xl`
- **Strong**: `shadow-2xl`

#### 테두리
- **기본**: `border border-gray-100`
- **강조**: `border-2 border-gray-200`
- **색상 구분**: `border-l-4 border-[color]` (좌측 테두리)

---

## 📱 주요 페이지 및 기능

### 1. 홈 페이지 (`/`)

#### 구조
1. **Hero 섹션** (상단 20-30%)
   - 노란색 그라데이션 배경
   - 메인 타이틀: "Safe Pet Food"
   - 서브 타이틀 및 설명
   - CTA 버튼

2. **Feature Cards 섹션** (중간)
   - 3개 카테고리 섹션:
     - **사료/급여** (오렌지-핑크 그라데이션)
       - 사료 성분 계산기
       - 사료 칼로리&급여량 계산기
       - 브랜드 평가
       - 사료 등급 분석
     - **건강/케어** (그린-틸 그라데이션)
       - 건강검진표 분석기
       - 일일 음수량 계산기
     - **커뮤니티** (퍼플-인디고 그라데이션)
       - 펫 로그
       - Q&A 포럼
       - 탐색하기
   - 각 카테고리마다 4개의 서비스 카드
   - 카드 호버 효과: 그림자 증가 + 위로 이동

3. **UGC Feed Preview 섹션** (하단 70-80%)
   - 탭 네비게이션: 인기순, 최신순, Q&A, 후기
   - 피드 그리드: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
   - 각 탭별 6개 아이템 미리보기
   - "전체 보기" 버튼 (파란색 Primary 버튼)

4. **트렌딩 질문 섹션**
   - 상위 5개 질문 표시
   - 순위 번호 (주황색 배경)
   - 추천 수, 댓글 수 표시

5. **뉴스레터 구독 섹션**
   - 노란색 그라데이션 배경 카드
   - 중앙 정렬

6. **CTA 섹션**
   - 3개의 주요 액션 버튼 (그라데이션)
   - 중앙 정렬

### 2. Header 컴포넌트

#### 구조
- **로고**: 왼쪽에 "Safe Pet Food" (검정색, 볼드)
- **네비게이션**: 중앙에 3개 카테고리 드롭다운
  - 호버 시 드롭다운 메뉴 표시
  - 각 메뉴 아이템: 아이콘 + 제목 + 설명
- **인증 버튼**: 오른쪽
  - 로그인 전: "로그인", "회원가입" 버튼
  - 로그인 후: 사용자 닉네임/이메일 (마이 페이지 링크), "로그아웃" 버튼

#### 모바일
- 햄버거 메뉴 아이콘
- 모바일 메뉴 드로어 (전체 화면)

### 3. 펫 로그 메인 페이지 (`/pet-log`)

#### 헤더 섹션
- 그라데이션 아이콘 컨테이너 (퍼플-핑크)
- 제목: "펫 로그 커뮤니티"
- 설명 텍스트

#### 검색 및 필터 섹션
- 흰색 카드 (`rounded-2xl shadow-xl`)
- 검색 입력 + 검색 버튼 (한 줄 배치)
- 필터 드롭다운: 카테고리, 반려동물 종류, 정렬 방식
- 액션 버튼: "나의 반려동물 등록하기" + "급여 기록 공유하기"

#### 포스트 리스트
- 2열 그리드 (`grid-cols-1 md:grid-cols-2`)
- 각 포스트 카드:
  - 고정 높이 (`min-h-[350px]`)
  - 제품명 (title)
  - 만족도 별점 (5점 만점)
  - 급여 후기 텍스트 (클램프 + 더보기/접기)
  - 메타데이터 태그 (나이, 급여일 - 노란색)
  - 참여 지표 (조회, 추천, 댓글 - 회색)
  - "자세히 보기" 버튼
- "더보기" 버튼 (10개씩 추가 로드)

### 4. 펫 로그 상세 페이지 (`/owners/[ownerId]/pets/[petId]`)

#### 헤더 섹션
- 반려동물 이름
- 반려동물 정보 (견종/나이/체중, 작성자/업데이트 날짜)
- 모바일: 2줄로 분리
- "총 기록" 박스 (모바일: 우측 상단)
- "내 경험 공유하기" 버튼

#### 급여 기록 카테고리별 섹션
- 각 카테고리마다 카드
- 제품 카드:
  - 제품명, 브랜드, 가격
  - 급여 기간, 상태 배지
  - 정보 그리드 (2열): 급여 기간, 재구매 의향, 기호성, 만족도
  - 장점/단점 (2열 그리드)
  - 급여 후기 텍스트
  - "상세" 버튼 (클릭 시 드로어 열림)

#### 상세 드로어 (Drawer)
- 오른쪽에서 슬라이드 인
- 탭: 상세 정보, 댓글
- 댓글 섹션: 로그인 필요 시 로그인 버튼 표시

### 5. 사료 등급 분석기 (`/feed-grade-analyzer`)

#### 헤더 섹션
- 그라데이션 배경, 제목, 설명

#### 탭 네비게이션
- 검색 탭 (하이브리드 접근)
- 입력 탭
- 결과 탭
- 활성 탭: 그라데이션 배경

#### 검색 섹션
- 검색 입력 + 결과 리스트
- "수동 입력" 옵션

#### 입력 섹션
- 학습 동기 선택 (카드 형태)
- 5가지 분석 기준:
  - 원료 생육 (초록 그라데이션)
  - 상세성분표기 여부 (파랑 그라데이션)
  - 안전성 (빨강 그라데이션)
  - 영양협회 기준 만족 (보라 그라데이션)
  - 방부제 유형 (노랑 그라데이션)
- 각 기준별 고유 색상 및 아이콘
- 좌측 테두리 (`border-l-4`)

#### 결과 섹션
- 전체 등급 (큰 텍스트, 그라데이션 아이콘)
- 상세 분석 (카드 형태)
- 강점/약점
- 권장사항
- 하단 액션 버튼: "다시 분석하기", "공유하기"

#### 공유 모달
- SNS 공유 옵션, 미리보기 카드

### 6. 칼로리 계산기 (`/calorie-calculator`)

- 반려동물 정보 입력 카드
- 사료 1kg당 칼로리 입력 필드 (참고 안내 포함)
- 계산 결과 카드 (3개 지표: 기초 대사량, 권장 칼로리, 일일 사료량)

### 7. 영양성분 분석기 (`/nutrition-calculator`)

- 반려동물 정보 및 생애주기 선택
  - 생애주기별 연령대 표기:
    - 성장기 (1세 미만)
    - 성견/성묘 (1-7세)
    - 노령견/노령묘 (7세 이상)
- 영양성분 입력 (건조물질 기준)
- 분석 결과 (점수, 등급, 상세 분석)

### 8. 브랜드 평가 페이지 (`/brands`)

- 브랜드 목록 그리드
- 각 브랜드 카드:
  - 브랜드 로고/이미지
  - 브랜드명
  - 간단한 설명
  - 평균 평점
  - 리뷰 수
- 검색 및 필터 기능

### 9. Q&A 포럼 (`/community/qa-forum`)

- 질문 목록
- 각 질문 카드:
  - 제목
  - 본문 미리보기
  - 작성자 정보
  - 추천 수, 댓글 수
  - 카테고리 태그
- 질문 작성 버튼
- 필터 및 정렬 옵션

### 10. 탐색하기 (`/explore`)

- 통합 피드 (Q&A + 후기)
- 탭 네비게이션
- 필터 및 검색 기능

### 11. 마이 페이지 (`/profile`)

- 프로필 정보 카드
  - 아바타 (그라데이션 배경 또는 이미지)
  - 닉네임 (수정 가능)
  - 이메일
  - 가입일
- 빠른 링크: 반려동물 관리, 설정
- 저장 버튼

### 12. 반려동물 관리 페이지 (`/pets`)

- 헤더: 제목 + "새 반려동물 등록" 버튼
- 반려동물 카드 그리드 (3열)
- 각 카드: 정보 + 액션 버튼 (급여 기록 작성, 수정, 삭제)
- 빈 상태: 안내 메시지 + 등록 버튼

### 13. 설정 페이지 (`/settings`)

- 알림 설정 섹션
- 계정 설정 섹션
- 위험 구역 (로그아웃, 계정 삭제)

### 14. 로그인/회원가입 페이지

#### 로그인 (`/login`)
- 제목: "로그인"
- 환영 메시지
- 소셜 로그인 버튼:
  - Google 로그인 (흰색 배경)
  - Kakao 로그인 (노란색 배경)
- 구분선: "또는"
- 이메일/비밀번호 입력 필드
- 로그인 버튼 (갈색 배경)
- 회원가입 링크

#### 회원가입 (`/signup`)
- 유사한 레이아웃
- 이름, 닉네임, 이메일, 비밀번호 입력
- 회원가입 후 자동으로 반려동물 프로필 생성 페이지로 이동

---

## 🔧 기술 스택 요구사항

### 필수 기술
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **아이콘**: Lucide React
- **인증**: Supabase Auth (Google, Kakao, Email/Password)
- **데이터베이스**: Supabase (PostgreSQL)
- **상태 관리**: React Hooks (useState, useEffect, useMemo)
- **폰트**: Inter (Google Fonts)
- **애니메이션**: Framer Motion (선택사항)

### 선택 기술
- **에디터**: React Quill (리치 텍스트 에디터)
- **이미지**: Next.js Image 컴포넌트

---

## 📐 레이아웃 패턴

### 페이지 컨테이너
```
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
  <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* 페이지 내용 */}
  </main>
</div>
```

### 섹션 간격
- 섹션 사이: `mb-8` 또는 `space-y-8`
- 카드 그리드: `gap-6`
- 카드 내부: `space-y-6`

### 텍스트 정렬
- 헤더: `text-center` 또는 `flex items-center gap-3`
- 메타데이터: `flex items-center gap-2`
- 날짜: 우측 정렬 (`text-right` 또는 `ml-auto`)

---

## 🎯 주요 기능 요구사항

### 1. 인증 시스템
- **소셜 로그인**: Google, Kakao
- **이메일/비밀번호**: 회원가입 및 로그인
- **세션 관리**: Supabase 세션 기반
- **프로필 자동 생성**: 로그인 시 프로필 자동 생성
- **로그인 필요 기능**: 댓글 작성, 급여 기록 작성 등

### 2. 검색 및 필터
- 실시간 검색 (제품명, 집사명)
- 카테고리 필터 (사료, 간식, 영양제, 화장실)
- 반려동물 종류 필터 (강아지, 고양이)
- 정렬 옵션 (추천순, 최신 등록 순, 신규 등록 순)

### 3. 무한 스크롤 / 더보기
- 초기 4개 표시
- "더보기" 버튼 클릭 시 10개씩 추가
- 필터 변경 시 카운트 리셋

### 4. 텍스트 클램프
- 긴 텍스트는 3줄로 제한 (`line-clamp-3`)
- "더보기/접기" 토글 기능

### 5. 드로어 (Drawer)
- 오른쪽에서 슬라이드 인
- 배경 오버레이 (클릭 시 닫기)
- 탭 네비게이션 지원

### 6. 모달
- 중앙 정렬
- 배경 오버레이 (클릭 시 닫기)
- 그라데이션 배경 지원

### 7. 댓글 시스템
- 댓글 작성 (로그인 필요)
- 대댓글 지원
- 댓글 수정/삭제

### 8. 별점 평가
- 5점 만점 별점 표시
- 반별 표시 (0.5점 단위)

### 9. 상태 배지
- 진행 중: 파란색
- 중단: 회색
- 완료: 초록색

---

## 🚨 주의사항 및 구현 가이드

### 1. 디자인 일관성
- 모든 카드는 `rounded-2xl shadow-xl border border-gray-100` 사용
- 모든 버튼은 `rounded-xl` 사용
- 그라데이션은 카테고리별로 일관되게 적용
- 모바일 반응형은 필수 (`sm:`, `md:`, `lg:` breakpoints)

### 2. 데이터 구조
- 객체를 직접 렌더링하지 않도록 주의
- 배열 메서드 사용 전 타입 검증
- 옵셔널 체이닝 (`?.`) 적극 활용

### 3. 에러 핸들링
- 로딩 상태 표시
- 에러 메시지 사용자 친화적으로 표시
- 빈 상태 (Empty State) 처리

### 4. 접근성
- 시맨틱 HTML 사용
- 키보드 네비게이션 지원
- ARIA 레이블 추가

### 5. 성능 최적화
- 이미지 최적화 (Next.js Image 컴포넌트)
- 코드 스플리팅
- 메모이제이션 (useMemo, useCallback)

---

## 📝 구현 체크리스트

### 디자인
- [ ] 페이지 배경 그라데이션 적용
- [ ] 카드 스타일 일관성 (`rounded-2xl shadow-xl`)
- [ ] 버튼 그라데이션 및 호버 효과
- [ ] 모바일 반응형 레이아웃 (`sm:`, `md:` breakpoints)
- [ ] 아이콘 크기 반응형 (`h-4 w-4 sm:h-5 sm:w-5`)
- [ ] 텍스트 크기 반응형 (`text-base sm:text-lg`)
- [ ] 패딩 및 간격 일관성
- [ ] 메타데이터 태그 색상 (노란색/회색)
- [ ] 헤더 노란색 배경 (`bg-yellow-400`)

### 기능
- [ ] 인증 시스템 (Google, Kakao, Email/Password)
- [ ] 검색 및 필터 기능
- [ ] 무한 스크롤 / 더보기
- [ ] 텍스트 클램프 및 더보기/접기
- [ ] 드로어 (상세 정보)
- [ ] 모달 (로그인, 작성 등)
- [ ] 댓글 시스템
- [ ] 별점 평가
- [ ] 상태 배지

### 기술
- [ ] TypeScript 타입 안전성
- [ ] 에러 핸들링
- [ ] 로딩 상태 표시
- [ ] 빈 상태 처리
- [ ] 이미지 최적화
- [ ] 접근성 개선

---

## 🎬 구현 예시 코드

### 기본 카드 컴포넌트
```tsx
<div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
  {/* 카드 내용 */}
</div>
```

### 그라데이션 버튼
```tsx
<button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
  버튼 텍스트
</button>
```

### Primary 버튼
```tsx
<button className="px-6 py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors shadow-md hover:shadow-lg">
  버튼 텍스트
</button>
```

### 메타데이터 태그
```tsx
{/* 강조 정보 */}
<span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium">
  {text}
</span>

{/* 통계 정보 */}
<span className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm">
  {text}
</span>
```

### 상태 배지
```tsx
{/* 진행 중 */}
<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
  진행 중
</span>

{/* 중단 */}
<span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
  중단
</span>

{/* 완료 */}
<span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
  완료
</span>
```

---

이 프롬프트를 사용하여 동일한 디자인 시스템과 기능을 가진 애플리케이션을 재현할 수 있습니다. 모든 디자인 요소, 색상, 레이아웃, 기능이 상세히 문서화되어 있습니다.

