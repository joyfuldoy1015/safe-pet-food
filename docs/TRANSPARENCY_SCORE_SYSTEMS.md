# 투명성 점수 시스템 분석

## 🔍 현재 상황

### 1. 브랜드 목록 페이지 (`/brands`)

**구현 방식:**
- 함수: `getTransparencyScore(brand)` 
- 계산 방식: 리콜 이력 기반 자동 계산
- 점수 체계: **5점 만점**
- 표시 형식: `{score.toFixed(1)}/5.0`

**계산 로직:**
```typescript
const getTransparencyScore = (brand: Brand) => {
  const recallCount = brand.recall_history.length
  const highSeverityCount = brand.recall_history.filter(r => r.severity === 'high').length
  const unresolvedCount = brand.recall_history.filter(r => !r.resolved).length
  
  let score = 5  // 기본 5점
  score -= recallCount * 0.5      // 리콜 1개당 -0.5점
  score -= highSeverityCount * 1   // 고심각도 리콜 1개당 -1점
  score -= unresolvedCount * 2     // 미해결 리콜 1개당 -2점
  
  return Math.max(0, Math.min(5, score))  // 0-5점 범위
}
```

**표시 위치:**
- 브랜드 카드에 "투명성 점수: X.X/5.0" 표시
- 정렬 옵션: "투명성 높은 순"
- 배지: "투명" / "보통" / "불투명"

### 2. 브랜드 상세 페이지 (`/brands/[brandName]`)

**구현 방식:**
- 데이터 소스: `brand.transparency_score` (Supabase에서 가져온 값)
- 점수 체계: **100점 만점**
- 표시 형식: `{brand.transparency_score}점` (예: 78점)

**표시 위치:**
- 투명성 점수 카드에 큰 숫자로 표시
- 진행 바: 점수에 따른 색상 표시
- 등급: "매우 투명" (≥80) / "보통 투명" (≥60) / "투명성 부족" (<60)

## ⚠️ 문제점

1. **점수 체계 불일치**
   - 목록 페이지: 5점 만점
   - 상세 페이지: 100점 만점
   - 사용자 혼란 가능성

2. **데이터 소스 불일치**
   - 목록 페이지: 리콜 이력 기반 자동 계산
   - 상세 페이지: Supabase에 저장된 값 사용

3. **정렬 기준 불일치**
   - 목록 페이지: 리콜 기반 5점 만점으로 정렬
   - 상세 페이지: Supabase의 100점 만점 값 표시

## 💡 해결 방안

### 옵션 1: 목록 페이지도 100점 만점 사용 (권장)

**장점:**
- 일관된 점수 체계
- Supabase 데이터 활용
- 사용자 혼란 최소화

**수정 사항:**
- `getTransparencyScore()` 함수 제거 또는 수정
- `brand.transparency_score` 직접 사용
- 표시 형식: `{brand.transparency_score}/100` 또는 `{brand.transparency_score}점`

### 옵션 2: 상세 페이지도 5점 만점 사용

**장점:**
- 리콜 기반 자동 계산 유지
- 추가 데이터 입력 불필요

**단점:**
- Supabase의 `transparency_score` 컬럼 미사용
- 더 세밀한 평가 어려움

### 옵션 3: 두 점수 모두 표시

**장점:**
- 각각의 장점 활용
- 더 많은 정보 제공

**단점:**
- 사용자 혼란 가능성
- UI 복잡도 증가

## ✅ 권장 사항

**옵션 1을 권장합니다:**
- 목록 페이지에서도 Supabase의 `transparency_score` (100점 만점) 사용
- 일관된 점수 체계로 사용자 경험 개선
- Supabase 데이터 활용

---

**분석 날짜**: 2024년 12월

