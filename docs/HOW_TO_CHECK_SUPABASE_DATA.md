# Supabase 데이터 반영 여부 확인 가이드

## 📋 브랜드 description 확인 방법

### 방법 1: 브라우저에서 직접 확인 (가장 빠름)

1. **브랜드 목록 페이지 접속**
   - http://localhost:3000/brands
   - 브라우저 개발자 도구 열기 (F12)

2. **Network 탭 확인**
   - Network 탭 열기
   - 페이지 새로고침 (F5)
   - `/api/brands` 요청 찾기
   - Response 탭에서 데이터 확인
   - `description` 필드 확인

3. **브랜드 상세 페이지 확인**
   - 브랜드 클릭 → 상세 페이지 이동
   - "브랜드 프로필" 섹션의 "📖 {브랜드명}에 대해서" 부분 확인
   - 입력한 description이 표시되는지 확인

### 방법 2: API 직접 호출 (터미널)

```bash
# 브랜드 목록 조회
curl http://localhost:3000/api/brands

# 특정 브랜드 검색
curl "http://localhost:3000/api/brands?search=로얄캐닌"
```

**출력 예시:**
```json
[
  {
    "id": "...",
    "name": "로얄캐닌",
    "description": "입력한 description 내용이 여기 표시됩니다",
    ...
  }
]
```

### 방법 3: 브라우저 콘솔에서 확인

1. 브랜드 목록 페이지 접속
2. F12 → Console 탭
3. 다음 코드 실행:

```javascript
fetch('/api/brands')
  .then(res => res.json())
  .then(data => {
    console.log('브랜드 데이터:', data)
    // description이 있는 브랜드 찾기
    data.forEach(brand => {
      if (brand.description) {
        console.log(`${brand.name}:`, brand.description)
      }
    })
  })
```

### 방법 4: Supabase Table Editor에서 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Table Editor → brands 테이블**
   - `brand_description` 컬럼 확인
   - 입력한 내용이 있는지 확인

3. **데이터 확인**
   - 각 브랜드의 `brand_description` 필드 확인
   - NULL이 아닌 값이 있는지 확인

---

## 🔍 데이터가 반영되지 않는 경우

### 1. 캐시 문제

**해결:**
- 브라우저 강력 새로고침: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
- 또는 개발자 도구 → Network 탭 → "Disable cache" 체크

### 2. API가 JSON fallback 사용 중

**확인 방법:**
- 브라우저 콘솔에서 확인:
  ```javascript
  fetch('/api/brands').then(r => r.json()).then(d => console.log('데이터 소스:', d))
  ```
- Supabase 데이터가 있으면 Supabase에서 가져옴
- 없으면 `data/brands.json` 파일에서 가져옴

**해결:**
- Supabase 테이블에 데이터가 있는지 확인
- 환경 변수가 올바르게 설정되어 있는지 확인

### 3. 컬럼명 불일치

**확인:**
- Supabase 테이블: `brand_description` 컬럼 사용
- API 변환: `brand_description` → `description`으로 변환
- 프론트엔드: `brand_description` 사용

**해결:**
- Supabase에서 `brand_description` 컬럼에 데이터 입력 확인
- API가 올바르게 변환하는지 확인

---

## ✅ 빠른 확인 체크리스트

- [ ] Supabase Table Editor에서 `brand_description` 값 확인
- [ ] 브라우저에서 `/brands` 페이지 접속
- [ ] 브랜드 상세 페이지에서 "📖 {브랜드명}에 대해서" 섹션 확인
- [ ] 브라우저 개발자 도구 → Network → `/api/brands` Response 확인
- [ ] 브라우저 강력 새로고침 (캐시 클리어)

---

## 🐛 문제 해결

### description이 표시되지 않는 경우

1. **Supabase 데이터 확인**
   ```sql
   SELECT name, brand_description FROM brands WHERE brand_description IS NOT NULL;
   ```

2. **API 응답 확인**
   - Network 탭에서 `/api/brands` 응답 확인
   - `description` 필드 확인

3. **프론트엔드 코드 확인**
   - `app/brands/[brandName]/page.tsx` 1047번째 줄
   - `{brand.brand_description}` 표시 확인

---

**마지막 업데이트**: 2024년 12월
