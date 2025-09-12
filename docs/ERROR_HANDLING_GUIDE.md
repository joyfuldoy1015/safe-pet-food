# 🚨 Safe Pet Food 에러 핸들링 가이드

## 목차
1. [발생했던 주요 오류들](#발생했던-주요-오류들)
2. [오류 예방 체크리스트](#오류-예방-체크리스트)
3. [긴급 복구 절차](#긴급-복구-절차)
4. [타입 안전성 가이드](#타입-안전성-가이드)

---

## 발생했던 주요 오류들

### 1. 데이터 구조 불일치 오류 (Runtime Error)

#### 🔴 오류 상황
```
TypeError: review.pros.map is not a function
```

#### 📋 원인 분석
- JSON 데이터에서 `pros`와 `cons`가 `string` 타입으로 저장됨
- TypeScript 인터페이스에서는 `string[]` 타입으로 정의됨
- `.map()` 메서드를 문자열에 호출하여 런타임 에러 발생

#### ✅ 해결 방법
```typescript
// 잘못된 인터페이스 정의
interface Review {
  pros: string[];  // ❌ 실제 데이터는 string
  cons: string[];  // ❌ 실제 데이터는 string
}

// 올바른 인터페이스 정의
interface Review {
  pros: string;    // ✅ 실제 데이터 구조와 일치
  cons: string;    // ✅ 실제 데이터 구조와 일치
}

// 안전한 렌더링
{review.pros && (
  <p className="text-green-700">{review.pros}</p>
)}
```

#### 🛡️ 예방 방법
1. 새 인터페이스 정의 전 실제 JSON 데이터 확인
2. API 응답 구조를 콘솔에 출력하여 검증
3. 옵셔널 체이닝 사용: `review.pros?.map(...)`

### 2. 모듈 임포트 오류 (Build Error)

#### 🔴 오류 상황
```
Error: Cannot find module './vendor-chunks/lucide-react.js'
Failed to generate static paths for /reviews/cat-treats/[productId]
```

#### 📋 원인 분석
- Next.js 서버 사이드 렌더링 시 lucide-react 모듈 해석 실패
- 동적 임포트나 잘못된 번들링으로 인한 모듈 경로 문제
- 빌드 캐시와 실제 모듈 구조 불일치

#### ✅ 해결 방법
```typescript
// 안전한 아이콘 임포트 방식
import { 
  ThumbsUp, 
  ThumbsDown, 
  ShoppingCart,
  Star 
} from 'lucide-react';

// 조건부 렌더링으로 SSR 문제 방지
const IconComponent = dynamic(() => import('lucide-react').then(mod => ({ default: mod.ThumbsUp })), {
  ssr: false,
  loading: () => <div className="w-5 h-5 bg-gray-200 rounded" />
});
```

#### 🛡️ 예방 방법
1. 필요한 아이콘만 개별적으로 임포트
2. 서버 컴포넌트에서는 아이콘 사용 최소화
3. 클라이언트 컴포넌트로 분리하여 'use client' 지시어 사용

### 3. JSX 문법 오류 (Syntax Error)

#### 🔴 오류 상황
```
Unexpected token `div`. Expected jsx identifier
```

#### 📋 원인 분석
- 컴포넌트 함수 정의 문제
- JSX 반환 구문 오류
- 조건부 렌더링 문법 실수

#### ✅ 해결 방법
```typescript
// 잘못된 컴포넌트 정의
function myComponent() {  // ❌ camelCase
  return <div>...</div>
}

// 올바른 컴포넌트 정의
function MyComponent() {  // ✅ PascalCase
  return (
    <div>...</div>  // ✅ 명시적 반환
  );
}

// 안전한 조건부 렌더링
{isLoading ? (
  <LoadingSpinner />
) : (
  <ContentComponent />
)}
```

### 4. PetProfile 구조 불일치

#### 🔴 오류 상황
```
Property 'catName' does not exist on type 'PetProfile'
```

#### 📋 원인 분석
- 예상한 구조: `{catName, age, breed, weight}`
- 실제 구조: `{age, taste, allergies}`

#### ✅ 해결 방법
```typescript
// 실제 데이터 구조에 맞는 인터페이스
interface PetProfile {
  age: string;
  taste: string;
  allergies: string;
}

// 안전한 접근
{review.petProfile && (
  <div>
    <span>나이: {review.petProfile.age}</span>
    <span>기호: {review.petProfile.taste}</span>
    <span>알레르기: {review.petProfile.allergies}</span>
  </div>
)}
```

---

## 오류 예방 체크리스트

### 🔍 개발 시작 전
- [ ] 실제 JSON 데이터 구조 확인
- [ ] 기존 유사 컴포넌트 패턴 참고
- [ ] TypeScript 설정 확인
- [ ] 필요한 패키지 설치 상태 점검

### 📝 코딩 중
- [ ] 인터페이스 정의 시 실제 데이터와 비교
- [ ] 배열 메서드 사용 전 타입 검증
- [ ] 옵셔널 체이닝 적극 활용
- [ ] 컴포넌트명 PascalCase 준수

### 🧪 테스트 전
- [ ] TypeScript 컴파일 에러 확인
- [ ] 브라우저 콘솔 에러 점검
- [ ] 다양한 데이터 케이스 테스트
- [ ] 모바일 반응형 확인

### 🚀 배포 전
- [ ] 빌드 에러 없음 확인
- [ ] 모든 라우트 접근 가능 확인
- [ ] 성능 최적화 점검
- [ ] SEO 메타데이터 확인

---

## 긴급 복구 절차

### 1단계: 즉시 중단
```bash
# 개발 서버 중지
Ctrl + C

# 모든 Next.js 프로세스 종료
pkill -f "next dev"
```

### 2단계: 상태 확인
```bash
# Git 상태 확인
git status

# 최근 변경사항 확인
git diff

# 최근 커밋 확인
git log --oneline -5
```

### 3단계: 롤백 실행
```bash
# 변경사항 취소 (아직 커밋하지 않은 경우)
git checkout -- .

# 특정 파일만 롤백
git checkout -- app/reviews/cat-treats/[productId]/page.tsx

# 이전 커밋으로 롤백 (커밋한 경우)
git reset --hard HEAD~1
```

### 4단계: 환경 정리
```bash
# 빌드 캐시 삭제
rm -rf .next

# 노드 모듈 캐시 삭제 (필요시)
rm -rf node_modules/.cache

# 의존성 재설치 (심각한 경우)
rm -rf node_modules && npm install
```

### 5단계: 재시작
```bash
# 개발 서버 재시작
npm run dev

# 홈페이지 접근 테스트
curl http://localhost:3000
```

---

## 타입 안전성 가이드

### 안전한 데이터 접근 패턴

```typescript
// 1. 옵셔널 체이닝 사용
const userName = user?.profile?.name ?? '익명';

// 2. 타입 가드 함수
function isValidReview(review: any): review is Review {
  return review && 
         typeof review.rating === 'number' &&
         typeof review.content === 'string';
}

// 3. 기본값 제공
const reviews = data?.reviews ?? [];
const rating = review?.rating ?? 0;

// 4. 조건부 렌더링
{reviews.length > 0 && (
  <ReviewList reviews={reviews} />
)}

// 5. 에러 바운더리
try {
  const processedData = processReviewData(rawData);
  return <ReviewComponent data={processedData} />;
} catch (error) {
  console.error('Review processing failed:', error);
  return <ErrorFallback />;
}
```

### 권장 인터페이스 패턴

```typescript
// 기본 구조
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// 확장 가능한 구조
interface Review extends BaseEntity {
  productId: string;
  userId: string;
  rating: number;
  content: string;
  pros?: string;  // 옵셔널로 안전하게
  cons?: string;
  petProfile?: PetProfile;
  media?: MediaFile[];
}

// 유니온 타입으로 안전성 확보
type ReviewFilter = 'all' | 'recommended' | 'not-recommended' | 'photos' | 'high-rating';
type SortOption = 'latest' | 'rating' | 'helpful' | 'recommendation-rate';
```

---

## 📞 에러 발생 시 보고 양식

문제가 발생했을 때는 다음 정보를 포함하여 보고해주세요:

```markdown
## 🐛 버그 리포트

### 환경 정보
- Node.js 버전: 
- Next.js 버전: 
- 브라우저: 
- 운영체제: 

### 오류 상황
- 발생 시점: 
- 수행한 작업: 
- 예상 결과: 
- 실제 결과: 

### 에러 메시지
```
[여기에 전체 에러 메시지 붙여넣기]
```

### 관련 코드
```typescript
[문제가 발생한 코드 스니펫]
```

### 재현 단계
1. 
2. 
3. 

### 시도한 해결 방법
- [ ] 서버 재시작
- [ ] 캐시 삭제
- [ ] 타입 확인
- [ ] 기타: 
```

---

**마지막 업데이트**: 2024년 12월  
**문서 관리자**: Safe Pet Food 개발팀 

## 목차
1. [발생했던 주요 오류들](#발생했던-주요-오류들)
2. [오류 예방 체크리스트](#오류-예방-체크리스트)
3. [긴급 복구 절차](#긴급-복구-절차)
4. [타입 안전성 가이드](#타입-안전성-가이드)

---

## 발생했던 주요 오류들

### 1. 데이터 구조 불일치 오류 (Runtime Error)

#### 🔴 오류 상황
```
TypeError: review.pros.map is not a function
```

#### 📋 원인 분석
- JSON 데이터에서 `pros`와 `cons`가 `string` 타입으로 저장됨
- TypeScript 인터페이스에서는 `string[]` 타입으로 정의됨
- `.map()` 메서드를 문자열에 호출하여 런타임 에러 발생

#### ✅ 해결 방법
```typescript
// 잘못된 인터페이스 정의
interface Review {
  pros: string[];  // ❌ 실제 데이터는 string
  cons: string[];  // ❌ 실제 데이터는 string
}

// 올바른 인터페이스 정의
interface Review {
  pros: string;    // ✅ 실제 데이터 구조와 일치
  cons: string;    // ✅ 실제 데이터 구조와 일치
}

// 안전한 렌더링
{review.pros && (
  <p className="text-green-700">{review.pros}</p>
)}
```

#### 🛡️ 예방 방법
1. 새 인터페이스 정의 전 실제 JSON 데이터 확인
2. API 응답 구조를 콘솔에 출력하여 검증
3. 옵셔널 체이닝 사용: `review.pros?.map(...)`

### 2. 모듈 임포트 오류 (Build Error)

#### 🔴 오류 상황
```
Error: Cannot find module './vendor-chunks/lucide-react.js'
Failed to generate static paths for /reviews/cat-treats/[productId]
```

#### 📋 원인 분석
- Next.js 서버 사이드 렌더링 시 lucide-react 모듈 해석 실패
- 동적 임포트나 잘못된 번들링으로 인한 모듈 경로 문제
- 빌드 캐시와 실제 모듈 구조 불일치

#### ✅ 해결 방법
```typescript
// 안전한 아이콘 임포트 방식
import { 
  ThumbsUp, 
  ThumbsDown, 
  ShoppingCart,
  Star 
} from 'lucide-react';

// 조건부 렌더링으로 SSR 문제 방지
const IconComponent = dynamic(() => import('lucide-react').then(mod => ({ default: mod.ThumbsUp })), {
  ssr: false,
  loading: () => <div className="w-5 h-5 bg-gray-200 rounded" />
});
```

#### 🛡️ 예방 방법
1. 필요한 아이콘만 개별적으로 임포트
2. 서버 컴포넌트에서는 아이콘 사용 최소화
3. 클라이언트 컴포넌트로 분리하여 'use client' 지시어 사용

### 3. JSX 문법 오류 (Syntax Error)

#### 🔴 오류 상황
```
Unexpected token `div`. Expected jsx identifier
```

#### 📋 원인 분석
- 컴포넌트 함수 정의 문제
- JSX 반환 구문 오류
- 조건부 렌더링 문법 실수

#### ✅ 해결 방법
```typescript
// 잘못된 컴포넌트 정의
function myComponent() {  // ❌ camelCase
  return <div>...</div>
}

// 올바른 컴포넌트 정의
function MyComponent() {  // ✅ PascalCase
  return (
    <div>...</div>  // ✅ 명시적 반환
  );
}

// 안전한 조건부 렌더링
{isLoading ? (
  <LoadingSpinner />
) : (
  <ContentComponent />
)}
```

### 4. PetProfile 구조 불일치

#### 🔴 오류 상황
```
Property 'catName' does not exist on type 'PetProfile'
```

#### 📋 원인 분석
- 예상한 구조: `{catName, age, breed, weight}`
- 실제 구조: `{age, taste, allergies}`

#### ✅ 해결 방법
```typescript
// 실제 데이터 구조에 맞는 인터페이스
interface PetProfile {
  age: string;
  taste: string;
  allergies: string;
}

// 안전한 접근
{review.petProfile && (
  <div>
    <span>나이: {review.petProfile.age}</span>
    <span>기호: {review.petProfile.taste}</span>
    <span>알레르기: {review.petProfile.allergies}</span>
  </div>
)}
```

---

## 오류 예방 체크리스트

### 🔍 개발 시작 전
- [ ] 실제 JSON 데이터 구조 확인
- [ ] 기존 유사 컴포넌트 패턴 참고
- [ ] TypeScript 설정 확인
- [ ] 필요한 패키지 설치 상태 점검

### 📝 코딩 중
- [ ] 인터페이스 정의 시 실제 데이터와 비교
- [ ] 배열 메서드 사용 전 타입 검증
- [ ] 옵셔널 체이닝 적극 활용
- [ ] 컴포넌트명 PascalCase 준수

### 🧪 테스트 전
- [ ] TypeScript 컴파일 에러 확인
- [ ] 브라우저 콘솔 에러 점검
- [ ] 다양한 데이터 케이스 테스트
- [ ] 모바일 반응형 확인

### 🚀 배포 전
- [ ] 빌드 에러 없음 확인
- [ ] 모든 라우트 접근 가능 확인
- [ ] 성능 최적화 점검
- [ ] SEO 메타데이터 확인

---

## 긴급 복구 절차

### 1단계: 즉시 중단
```bash
# 개발 서버 중지
Ctrl + C

# 모든 Next.js 프로세스 종료
pkill -f "next dev"
```

### 2단계: 상태 확인
```bash
# Git 상태 확인
git status

# 최근 변경사항 확인
git diff

# 최근 커밋 확인
git log --oneline -5
```

### 3단계: 롤백 실행
```bash
# 변경사항 취소 (아직 커밋하지 않은 경우)
git checkout -- .

# 특정 파일만 롤백
git checkout -- app/reviews/cat-treats/[productId]/page.tsx

# 이전 커밋으로 롤백 (커밋한 경우)
git reset --hard HEAD~1
```

### 4단계: 환경 정리
```bash
# 빌드 캐시 삭제
rm -rf .next

# 노드 모듈 캐시 삭제 (필요시)
rm -rf node_modules/.cache

# 의존성 재설치 (심각한 경우)
rm -rf node_modules && npm install
```

### 5단계: 재시작
```bash
# 개발 서버 재시작
npm run dev

# 홈페이지 접근 테스트
curl http://localhost:3000
```

---

## 타입 안전성 가이드

### 안전한 데이터 접근 패턴

```typescript
// 1. 옵셔널 체이닝 사용
const userName = user?.profile?.name ?? '익명';

// 2. 타입 가드 함수
function isValidReview(review: any): review is Review {
  return review && 
         typeof review.rating === 'number' &&
         typeof review.content === 'string';
}

// 3. 기본값 제공
const reviews = data?.reviews ?? [];
const rating = review?.rating ?? 0;

// 4. 조건부 렌더링
{reviews.length > 0 && (
  <ReviewList reviews={reviews} />
)}

// 5. 에러 바운더리
try {
  const processedData = processReviewData(rawData);
  return <ReviewComponent data={processedData} />;
} catch (error) {
  console.error('Review processing failed:', error);
  return <ErrorFallback />;
}
```

### 권장 인터페이스 패턴

```typescript
// 기본 구조
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// 확장 가능한 구조
interface Review extends BaseEntity {
  productId: string;
  userId: string;
  rating: number;
  content: string;
  pros?: string;  // 옵셔널로 안전하게
  cons?: string;
  petProfile?: PetProfile;
  media?: MediaFile[];
}

// 유니온 타입으로 안전성 확보
type ReviewFilter = 'all' | 'recommended' | 'not-recommended' | 'photos' | 'high-rating';
type SortOption = 'latest' | 'rating' | 'helpful' | 'recommendation-rate';
```

---

## 📞 에러 발생 시 보고 양식

문제가 발생했을 때는 다음 정보를 포함하여 보고해주세요:

```markdown
## 🐛 버그 리포트

### 환경 정보
- Node.js 버전: 
- Next.js 버전: 
- 브라우저: 
- 운영체제: 

### 오류 상황
- 발생 시점: 
- 수행한 작업: 
- 예상 결과: 
- 실제 결과: 

### 에러 메시지
```
[여기에 전체 에러 메시지 붙여넣기]
```

### 관련 코드
```typescript
[문제가 발생한 코드 스니펫]
```

### 재현 단계
1. 
2. 
3. 

### 시도한 해결 방법
- [ ] 서버 재시작
- [ ] 캐시 삭제
- [ ] 타입 확인
- [ ] 기타: 
```

---

**마지막 업데이트**: 2024년 12월  
**문서 관리자**: Safe Pet Food 개발팀 