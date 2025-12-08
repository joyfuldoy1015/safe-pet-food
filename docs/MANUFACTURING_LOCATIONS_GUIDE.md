# 제조 공장 위치(manufacturing_locations) 필드 가이드

## 📋 개요

브랜드 상세 페이지(`/brands/[brandName]`)에서 표시되는 '제조 공장' 개수는 `manufacturing_locations` 필드에서 가져옵니다.

## 🗄️ Supabase 데이터베이스

### 테이블: `brands`
### 컬럼: `manufacturing_locations`

**타입**: `TEXT[]` (문자열 배열)

**설명**: 제조 공장 위치 목록을 저장하는 배열 필드

**예시 데이터**:
```sql
manufacturing_locations = ARRAY['프랑스 아이메르그', '한국 김천', '미국 오클라호마']
```

## 📝 데이터 입력 방법

### 방법 1: Supabase Dashboard에서 직접 입력

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Table Editor 열기**
   - 왼쪽 메뉴에서 **Table Editor** 클릭
   - `brands` 테이블 선택

3. **행 편집**
   - 편집할 브랜드 행의 **Edit** 버튼 클릭
   - `manufacturing_locations` 필드 찾기

4. **배열 형식으로 입력**
   - 형식: `["위치1", "위치2", "위치3"]`
   - 예시: `["프랑스 아이메르그", "한국 김천", "미국 오클라호마"]`
   - 각 위치는 쉼표로 구분하고, 전체를 대괄호로 감싸기

### 방법 2: SQL Editor에서 업데이트

```sql
-- 특정 브랜드의 manufacturing_locations 업데이트
UPDATE brands
SET manufacturing_locations = ARRAY['프랑스 아이메르그', '한국 김천', '미국 오클라호마']
WHERE name = '로얄캐닌';

-- 여러 브랜드 일괄 업데이트 예시
UPDATE brands
SET manufacturing_locations = ARRAY['미국 캔자스', '네덜란드 토펜', '체코 프라하']
WHERE name = '힐스';
```

### 방법 3: API를 통한 업데이트

```typescript
// PUT /api/brands 요청
const updateBrand = async () => {
  const response = await fetch('/api/brands', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'brand-id',
      manufacturing_locations: ['프랑스 아이메르그', '한국 김천', '미국 오클라호마']
    })
  })
}
```

## 💻 코드에서 사용

### 브랜드 상세 페이지

```typescript
// app/brands/[brandName]/page.tsx
<p className="font-medium text-gray-900">
  {brand.manufacturing_locations.length}개 지역
</p>
```

### API 응답 형식

```json
{
  "id": "...",
  "name": "로얄캐닌",
  "manufacturing_locations": [
    "프랑스 아이메르그",
    "한국 김천",
    "미국 오클라호마"
  ],
  ...
}
```

## 🔍 현재 상태 확인

### 스키마 확인
```sql
-- manufacturing_locations 컬럼이 있는지 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'brands' 
AND column_name = 'manufacturing_locations';
```

### 데이터 확인
```sql
-- manufacturing_locations가 설정된 브랜드 확인
SELECT name, manufacturing_locations 
FROM brands 
WHERE manufacturing_locations IS NOT NULL 
AND array_length(manufacturing_locations, 1) > 0;
```

## ⚠️ 주의사항

1. **배열 형식**: 반드시 배열(`TEXT[]`) 형식으로 저장해야 합니다
2. **빈 배열**: 공장이 없는 경우 `[]` 또는 `NULL`로 설정 가능
3. **문자열 구분**: 각 위치는 문자열로 저장되며, 쉼표로 구분됩니다

## 📊 예시 데이터

### 로얄캐닌
```json
{
  "manufacturing_locations": [
    "프랑스 아이메르그",
    "한국 김천",
    "미국 오클라호마"
  ]
}
```

### 힐스
```json
{
  "manufacturing_locations": [
    "미국 캔자스",
    "네덜란드 토펜",
    "체코 프라하"
  ]
}
```

## ✅ 체크리스트

- [ ] Supabase 스키마에 `manufacturing_locations` 컬럼 추가 완료
- [ ] 각 브랜드의 제조 공장 위치 데이터 입력 완료
- [ ] API 응답에 `manufacturing_locations` 필드 포함 확인
- [ ] 브랜드 상세 페이지에서 개수 정상 표시 확인

---

**업데이트 날짜**: 2024년 12월

