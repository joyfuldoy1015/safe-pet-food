# Safe Pet Food - 디자인 시스템 재현 프롬프트

## 🎯 프로젝트 개요

**Safe Pet Food**는 반려동물 사료 분석 및 커뮤니티 플랫폼입니다. Next.js 14, TypeScript, Tailwind CSS를 기반으로 구축되었으며, 모바일 최적화와 일관된 디자인 시스템을 갖추고 있습니다.

## 🎨 디자인 시스템

### 1. 컬러 팔레트

#### 배경 그라데이션
- **메인 페이지**: `bg-gradient-to-br from-yellow-50 via-white to-orange-50`
- **일반 페이지**: `bg-gradient-to-br from-blue-50 via-white to-cyan-50`
- **커뮤니티 페이지**: `bg-gradient-to-br from-purple-50 via-white to-pink-50`

#### 주요 그라데이션 조합
- **사료/급여**: `from-orange-500 to-pink-500`
- **건강/케어**: `from-green-500 to-teal-500`
- **커뮤니티**: `from-purple-500 to-pink-500` 또는 `from-blue-500 to-purple-500`
- **액션 버튼**: `from-purple-500 to-pink-500` (호버: `from-purple-600 to-pink-600`)
- **위험/경고**: `from-red-500 to-orange-500`
- **성공**: `from-green-500 to-emerald-500`

#### 메타데이터 태그 컬러
- **강조 정보** (나이, 급여일): `bg-yellow-400 text-black`
- **통계 정보** (조회, 추천, 댓글): `bg-gray-50 border border-gray-200 text-gray-700`
- **헤더 배경**: `bg-yellow-400` 또는 그라데이션

### 2. 타이포그래피

- **폰트**: Inter (Google Fonts)
- **기본 크기**:
  - 제목: `text-2xl sm:text-3xl font-bold`
  - 부제목: `text-xl sm:text-2xl font-bold`
  - 본문: `text-base sm:text-lg`
  - 작은 텍스트: `text-xs sm:text-sm`
- **가중치**: `font-bold`, `font-semibold`, `font-medium`

### 3. 카드 디자인

#### 기본 카드 스타일
```
bg-white rounded-2xl shadow-xl border border-gray-100
p-6 sm:p-8
hover:shadow-2xl transition-all duration-300
```

#### 카드 높이
- **고정 높이**: `min-h-[350px]`
- **반응형**: `h-full flex flex-col`
- **내부 콘텐츠**: `flex-1` (남은 공간 채우기)

#### 카드 내부 요소
- **그라데이션 아이콘 컨테이너**: `w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[color]-500 to-[color]-500 rounded-2xl flex items-center justify-center shadow-lg`
- **섹션 헤더**: 그라데이션 아이콘 + 제목 텍스트
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
- **그리드**: `grid-cols-1 md:grid-cols-2`

#### 모바일 최적화
- 터치 영역: 최소 `44px` 높이
- 버튼 너비: `w-full sm:w-auto`
- 텍스트 줄바꿈: `whitespace-nowrap` 또는 자동 줄바꿈
- 텍스트 클램프: `line-clamp-2`, `line-clamp-3`

### 7. 아이콘 사용

- **라이브러리**: Lucide React
- **크기**:
  - 작은 아이콘: `h-4 w-4 sm:h-5 sm:w-5`
  - 중간 아이콘: `h-5 w-5 sm:h-6 sm:w-6`
  - 큰 아이콘: `h-8 w-8 sm:h-10 sm:w-10`
- **컬러**: 그라데이션 배경의 흰색 아이콘 또는 `text-gray-600`

### 8. 애니메이션 및 인터랙션

- **호버 효과**: `hover:shadow-2xl`, `hover:scale-105`, `transform hover:scale-[1.02]`
- **트랜지션**: `transition-all duration-200` 또는 `duration-300`
- **스크롤**: `scrollIntoView({ behavior: 'smooth', block: 'start' })`

## 📱 주요 페이지 및 기능

### 1. 홈 페이지 (`/`)
- Hero 섹션 (노란색 그라데이션 배경)
- 3개 카테고리 섹션:
  - 사료/급여 (오렌지-핑크 그라데이션)
  - 건강/케어 (그린-틸 그라데이션)
  - 커뮤니티 (퍼플-핑크 그라데이션)
- 각 카테고리에 4개의 서비스 카드
- CTA 섹션

### 2. 펫 로그 메인 페이지 (`/pet-log`)
- **헤더 섹션**:
  - 그라데이션 아이콘 컨테이너 (퍼플-핑크)
  - 제목: "펫 로그 커뮤니티"
  - 설명 텍스트
- **검색 및 필터 섹션**:
  - 흰색 카드 (`rounded-2xl shadow-xl`)
  - 검색 입력 + 검색 버튼 (한 줄 배치)
  - 필터 드롭다운: 카테고리, 반려동물 종류, 정렬 방식
  - 액션 버튼: "나의 반려동물 등록하기" + "급여 기록 공유하기"
- **포스트 리스트**:
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
- **로그인 모달**: 그라데이션 배경, 중앙 정렬

### 3. 펫 로그 상세 페이지 (`/pet-log/posts/[postId]`)
- **헤더 섹션**:
  - 반려동물 이름
  - 반려동물 정보 (견종/나이/체중, 작성자/업데이트 날짜)
  - 모바일: 2줄로 분리
  - "총 기록" 박스 (모바일: 우측 상단)
  - "내 경험 공유하기" 버튼
- **급여 기록 카테고리별 섹션**:
  - 각 카테고리마다 카드
  - 제품 카드:
    - 제품명, 브랜드, 가격
    - 급여 기간, 상태
    - 정보 그리드 (2열): 급여 기간, 재구매 의향, 기호성, 만족도
    - 장점/단점 (2열 그리드)
    - 급여 후기 텍스트
- **댓글 섹션**:
  - 댓글 입력 필드 (로그인 체크)
  - 댓글 리스트 (대댓글 지원)
  - 로그인 모달

### 4. 사료 등급 분석기 (`/feed-grade-analyzer`)
- **헤더 섹션**: 그라데이션 배경, 제목, 설명
- **탭 네비게이션**:
  - 검색 탭 (하이브리드 접근)
  - 입력 탭
  - 결과 탭
  - 활성 탭: 그라데이션 배경
- **검색 섹션**:
  - 검색 입력 + 결과 리스트
  - "수동 입력" 옵션
- **입력 섹션**:
  - 학습 동기 선택 (카드 형태)
  - 5가지 분석 기준:
    - 원료 생육 (초록 그라데이션)
    - 상세성분표기 여부 (파랑 그라데이션)
    - 안전성 (빨강 그라데이션)
    - 영양협회 기준 만족 (보라 그라데이션)
    - 방부제 유형 (노랑 그라데이션)
  - 각 기준별 고유 색상 및 아이콘
  - 좌측 테두리 (`border-l-4`)
- **결과 섹션**:
  - 전체 등급 (큰 텍스트, 그라데이션 아이콘)
  - 상세 분석 (카드 형태)
  - 강점/약점
  - 권장사항
  - 하단 액션 버튼: "다시 분석하기", "공유하기"
- **공유 모달**: SNS 공유 옵션, 미리보기 카드

### 5. 칼로리 계산기 (`/calorie-calculator`)
- 반려동물 정보 입력 카드
- 사료 1kg당 칼로리 입력 필드 (참고 안내 포함)
- 계산 결과 카드 (3개 지표: 기초 대사량, 권장 칼로리, 일일 사료량)

### 6. 영양성분 분석기 (`/nutrition-calculator`)
- 반려동물 정보 및 생애주기 선택
  - 생애주기별 연령대 표기:
    - 성장기 (1세 미만)
    - 성견/성묘 (1-7세)
    - 노령견/노령묘 (7세 이상)
- 영양성분 입력 (건조물질 기준)
- 분석 결과 (점수, 등급, 상세 분석)

### 7. 반려동물 관리 페이지 (`/pet-log/pets`)
- 헤더: 제목 + "새 반려동물 등록" 버튼
- 반려동물 카드 그리드 (3열)
- 각 카드: 정보 + 액션 버튼 (급여 기록 작성, 수정, 삭제)
- 빈 상태: 안내 메시지 + 등록 버튼

### 8. 반려동물 등록/수정 페이지
- 기본 정보 섹션 (카드)
- 건강 정보 섹션 (카드)
- 체크박스 그룹 (카드 스타일, `border border-gray-100 rounded-xl`)
- 저장 버튼 (그라데이션)

## 🔧 기술 스택 요구사항

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **아이콘**: Lucide React
- **인증**: NextAuth.js (Google + Credentials Provider)
- **상태 관리**: React Hooks (useState, useEffect)
- **데이터 저장**: LocalStorage (클라이언트 사이드)
- **폰트**: Inter (Google Fonts)

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

## 🎯 주요 기능 요구사항

### 1. 검색 및 필터
- 실시간 검색 (제품명, 집사명)
- 카테고리 필터 (사료, 간식, 영양제, 화장실)
- 반려동물 종류 필터 (강아지, 고양이)
- 정렬 옵션 (추천순, 최신 등록 순, 신규 등록 순)

### 2. 무한 스크롤 / 더보기
- 초기 4개 표시
- "더보기" 버튼 클릭 시 10개씩 추가
- 필터 변경 시 카운트 리셋

### 3. 텍스트 클램프
- 긴 텍스트는 3줄로 제한 (`line-clamp-3`)
- "더보기/접기" 토글 기능

### 4. 로그인/인증
- NextAuth.js 사용
- 로그인 모달 (그라데이션 배경, 중앙 정렬)
- 세션 기반 인증 상태 관리
- Credentials Provider (테스트 계정 지원)

### 5. 로컬 스토리지 연동
- 반려동물 프로필 저장
- 급여 기록 저장
- 댓글 저장

## 🚨 주의사항 및 에러 방지

1. **JSX 문법 검증**: 파일 편집 후 반드시 문법 확인
2. **닫는 태그**: 모든 태그가 올바르게 닫혀있는지 확인
3. **데이터 구조**: 객체를 직접 렌더링하지 않도록 주의
4. **타입 안전성**: TypeScript 인터페이스와 실제 데이터 구조 일치 확인
5. **모바일 최적화**: 모든 페이지에서 모바일 반응형 테스트
6. **이미지 최적화**: Next.js Image 컴포넌트 사용
7. **의존성 배열**: useEffect 훅의 의존성 배열 확인

## 📝 구현 시 체크리스트

- [ ] 페이지 배경 그라데이션 적용
- [ ] 카드 스타일 일관성 (`rounded-2xl shadow-xl`)
- [ ] 버튼 그라데이션 및 호버 효과
- [ ] 모바일 반응형 레이아웃 (`sm:`, `md:` breakpoints)
- [ ] 아이콘 크기 반응형 (`h-4 w-4 sm:h-5 sm:w-5`)
- [ ] 텍스트 크기 반응형 (`text-base sm:text-lg`)
- [ ] 패딩 및 간격 일관성
- [ ] 메타데이터 태그 색상 (노란색/회색)
- [ ] 로그인 모달 스타일
- [ ] 데이터 타입 검증 (배열/객체)
- [ ] 에러 핸들링
- [ ] 로딩 상태 표시

---

이 프롬프트를 사용하여 동일한 디자인 시스템과 기능을 가진 애플리케이션을 재현할 수 있습니다.



