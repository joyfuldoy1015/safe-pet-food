# Supabase 마이그레이션 문제 해결 가이드

## 🔍 현재 문제

마이그레이션 스크립트 실행 시 `TypeError: fetch failed` 오류 발생

## 🛠️ 해결 방법

### 방법 1: Supabase Dashboard에서 직접 데이터 입력 (가장 빠름)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Table Editor 열기**
   - 왼쪽 메뉴에서 **Table Editor** 클릭
   - `brands` 테이블 선택

3. **데이터 입력**
   - **Insert row** 버튼 클릭
   - `data/brands.json` 파일의 데이터를 하나씩 입력
   - 또는 아래 SQL을 사용하여 일괄 입력

### 방법 2: SQL Editor에서 직접 INSERT (권장)

1. **Supabase Dashboard → SQL Editor** 접속

2. **아래 SQL 실행** (brands.json의 데이터를 기반으로 작성)

```sql
-- Brands 데이터 일괄 삽입
INSERT INTO brands (name, manufacturer, country, overall_rating, established_year, product_lines, certifications, recall_history, brand_description, brand_pros, brand_cons)
VALUES
  ('로얄캐닌', '마스 펫케어 코리아', '프랑스', 4.2, 1968, 
   ARRAY['성견용', '퍼피', '소형견', '대형견', '처방식'], 
   ARRAY['AAFCO', 'ISO 9001'],
   '[{"date": "2019-03-15", "reason": "비타민D 과다 함유", "severity": "medium", "resolved": true}]'::jsonb,
   '프랑스의 프리미엄 펫푸드 브랜드로, 50년 이상의 연구와 개발을 통해 반려동물의 건강과 영양에 특화된 사료를 제공합니다.',
   ARRAY[]::text[],
   ARRAY[]::text[]
  ),
  ('힐스', '힐스 펫 뉴트리션', '미국', 4.0, 1939,
   ARRAY['사이언스 다이어트', '프리스크립션 다이어트'],
   ARRAY['AAFCO', 'FDA'],
   '[{"date": "2019-01-31", "reason": "비타민D 독성 수준", "severity": "high", "resolved": true}]'::jsonb,
   '1939년 설립된 미국의 수의학 전문 브랜드로, 수의사와 함께 개발한 처방식 사료로 유명합니다.',
   ARRAY[]::text[],
   ARRAY[]::text[]
  );
-- 나머지 브랜드도 동일한 형식으로 추가
```

### 방법 3: CSV Import 사용

1. **brands.json을 CSV로 변환**
   ```bash
   # JSON을 CSV로 변환하는 스크립트 필요
   ```

2. **Supabase Dashboard → Table Editor → Import CSV**

### 방법 4: 네트워크 문제 해결 후 재시도

#### 확인 사항:
1. **인터넷 연결 확인**
   ```bash
   ping supabase.com
   ```

2. **환경 변수 확인**
   ```bash
   cat .env.local | grep SUPABASE
   ```

3. **Supabase 프로젝트 상태 확인**
   - Dashboard에서 프로젝트가 정상 작동하는지 확인
   - API 키가 유효한지 확인

4. **방화벽/프록시 확인**
   - 회사 네트워크나 VPN 사용 시 차단될 수 있음
   - 개인 네트워크에서 재시도

## 📋 수동 입력 가이드

### brands.json의 각 브랜드 데이터를 Supabase에 입력하는 방법:

1. **Table Editor에서 Insert Row 클릭**

2. **필드 입력:**
   - `name`: 브랜드명 (예: "로얄캐닌")
   - `manufacturer`: 제조사 (예: "마스 펫케어 코리아")
   - `country`: 국가 (예: "프랑스")
   - `overall_rating`: 평점 (예: 4.2)
   - `established_year`: 설립년도 (예: 1968)
   - `product_lines`: 제품 라인 (배열 형식: ["성견용", "퍼피"])
   - `certifications`: 인증 (배열 형식: ["AAFCO", "ISO 9001"])
   - `recall_history`: 리콜 이력 (JSON 형식)
   - `brand_description`: 브랜드 설명
   - `brand_pros`: 장점 (배열)
   - `brand_cons`: 단점 (배열)

3. **Save 클릭**

## ✅ 확인 방법

마이그레이션 완료 후:

1. **Table Editor에서 확인**
   - `brands` 테이블에 13개의 데이터가 있는지 확인

2. **API 테스트**
   ```bash
   curl http://localhost:3000/api/brands
   ```

3. **브라우저에서 확인**
   - `http://localhost:3000/brands` 접속
   - 브랜드 목록이 표시되는지 확인

## 🚨 주의사항

- 중복 데이터 방지: 이미 데이터가 있으면 `name` 필드가 UNIQUE 제약 때문에 오류 발생
- 데이터 형식: 배열과 JSON 필드는 올바른 형식으로 입력해야 함
- RLS 정책: 공개 읽기 정책이 설정되어 있어야 API에서 접근 가능

