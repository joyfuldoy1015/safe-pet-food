# 실제 데이터 적재 및 테스트 가이드

## 📋 목차
1. [현재 상태 점검](#1-현재-상태-점검)
2. [데이터베이스 준비](#2-데이터베이스-준비)
3. [실제 데이터 적재](#3-실제-데이터-적재)
4. [테스트 시나리오](#4-테스트-시나리오)
5. [주요 기능별 테스트](#5-주요-기능별-테스트)
6. [문제 해결](#6-문제-해결)

---

## 1. 현재 상태 점검

### 1.1 환경 변수 확인

```bash
# .env.local 파일 확인
cat .env.local
```

**필수 환경 변수:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key

**확인 방법:**
1. Supabase 대시보드 → Settings → API
2. Project URL과 anon public 키 복사
3. `.env.local` 파일에 설정

### 1.2 Supabase 연결 테스트

```bash
# 개발 서버 실행
npm run dev
```

브라우저 콘솔에서 확인:
- Supabase 연결 오류가 없는지 확인
- `[Supabase]` 로그 메시지 확인

### 1.3 데이터베이스 테이블 확인

Supabase 대시보드 → Table Editor에서 다음 테이블 존재 확인:

**필수 테이블:**
- ✅ `profiles` - 사용자 프로필
- ✅ `pets` - 반려동물 정보
- ✅ `review_logs` - 급여 후기 로그
- ✅ `brands` - 브랜드 정보
- ✅ `questions` - Q&A 질문 (선택사항)

---

## 2. 데이터베이스 준비

### 2.1 SAFI 필드 마이그레이션 (필수)

**파일**: `scripts/supabase-safi-fields-migration.sql`

Supabase 대시보드 → SQL Editor에서 실행:

```sql
-- SAFI 관련 컬럼 추가
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS stool_score INTEGER CHECK (stool_score >= 1 AND stool_score <= 5),
ADD COLUMN IF NOT EXISTS allergy_symptoms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vomiting BOOLEAN,
ADD COLUMN IF NOT EXISTS appetite_change TEXT CHECK (appetite_change IN ('INCREASED', 'NORMAL', 'DECREASED', 'REFUSED'));

-- SAFI 계산 결과 저장 컬럼
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS safi_score NUMERIC(5,2) CHECK (safi_score >= 0 AND safi_score <= 100),
ADD COLUMN IF NOT EXISTS safi_level TEXT CHECK (safi_level IN ('SAFE', 'NORMAL', 'CAUTION')),
ADD COLUMN IF NOT EXISTS safi_detail JSONB;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_score ON review_logs(safi_score DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_level ON review_logs(safi_level);
CREATE INDEX IF NOT EXISTS idx_review_logs_brand_product ON review_logs(brand, product);
```

**실행 확인:**
```sql
-- 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'review_logs' 
AND column_name LIKE '%safi%' OR column_name IN ('stool_score', 'allergy_symptoms', 'vomiting', 'appetite_change');
```

### 2.2 Products 테이블 생성 (선택사항)

제품 원재료 정보가 필요한 경우:

```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feed', 'snack', 'supplement', 'toilet')),
  image TEXT,
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',  -- SAFI 계산에 필요
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);
```

---

## 3. 실제 데이터 적재

### 3.1 테스트 사용자 생성

**방법 1: Supabase 대시보드에서 생성**
1. Authentication → Users → Add User
2. Email: `test@example.com`
3. Password: 안전한 비밀번호 설정
4. Auto Confirm User: ✅ 체크

**방법 2: 앱에서 회원가입**
1. `/signup` 페이지 접속
2. 이메일/비밀번호로 회원가입
3. 이메일 인증 (필요시)

### 3.2 프로필 및 펫 데이터 생성

**Supabase Table Editor에서 직접 입력:**

**profiles 테이블:**
```json
{
  "id": "user-uuid-here",
  "nickname": "테스트집사",
  "avatar_url": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**pets 테이블:**
```json
{
  "id": "pet-uuid-here",
  "owner_id": "user-uuid-here",
  "name": "뽀미",
  "species": "dog",
  "birth_date": "2020-01-01",
  "weight_kg": 28.5,
  "tags": ["골든리트리버", "대형견"],
  "avatar_url": null
}
```

### 3.3 브랜드 데이터 적재

**방법 1: 마이그레이션 스크립트 사용**

```bash
# brands.json 데이터를 Supabase로 마이그레이션
npx tsx scripts/migrate-brands-to-supabase.ts
```

**방법 2: Supabase Table Editor에서 직접 입력**

`data/brands.json` 파일을 참고하여 수동 입력

### 3.4 리뷰 로그 데이터 생성

**테스트 시나리오별 샘플 데이터:**

#### 시나리오 1: 기본 급여 후기
```sql
INSERT INTO review_logs (
  id,
  owner_id,
  pet_id,
  brand,
  product,
  category,
  status,
  period_start,
  rating,
  recommend,
  excerpt,
  likes,
  comments_count,
  views,
  created_at
) VALUES (
  gen_random_uuid(),
  'owner-uuid-here',
  'pet-uuid-here',
  '로얄캐닌',
  '골든 리트리버 어덜트',
  'feed',
  'feeding',
  '2024-10-01',
  5.0,
  true,
  '3살 골든 리트리버에게 급여 중입니다. 털 윤기가 정말 좋아졌고, 변 상태도 완벽해요.',
  89,
  23,
  1247,
  NOW()
);
```

#### 시나리오 2: SAFI 평가 포함 후기
```sql
INSERT INTO review_logs (
  id,
  owner_id,
  pet_id,
  brand,
  product,
  category,
  status,
  period_start,
  rating,
  recommend,
  excerpt,
  likes,
  comments_count,
  views,
  -- SAFI 필드
  stool_score,
  allergy_symptoms,
  vomiting,
  appetite_change,
  created_at
) VALUES (
  gen_random_uuid(),
  'owner-uuid-here',
  'pet-uuid-here',
  '힐스',
  '어덜트 라지 브리드',
  'feed',
  'completed',
  '2024-06-01',
  4.0,
  true,
  '다이어트용 사료로 3개월간 급여했습니다. 체중 관리에는 효과가 있었습니다.',
  67,
  15,
  892,
  -- SAFI 데이터
  4,  -- stool_score
  ARRAY['없음'],  -- allergy_symptoms
  false,  -- vomiting
  'NORMAL',  -- appetite_change
  NOW()
);
```

### 3.5 Q&A 데이터 생성 (선택사항)

`data/questions.json` 파일을 참고하여 `questions` 테이블에 데이터 입력

---

## 4. 테스트 시나리오

### 4.1 사용자 인증 테스트

**시나리오: 로그인 → 프로필 확인**

1. ✅ `/login` 페이지 접속
2. ✅ 이메일/비밀번호로 로그인
3. ✅ 로그인 성공 후 리다이렉트 확인
4. ✅ 프로필 정보 표시 확인

**체크리스트:**
- [ ] 로그인 성공
- [ ] 세션 유지 (페이지 새로고침 후에도 로그인 상태 유지)
- [ ] 프로필 정보 정상 표시
- [ ] 로그아웃 기능 작동

### 4.2 펫 로그 작성 테스트

**시나리오: 새 급여 후기 작성**

1. ✅ 로그인 상태 확인
2. ✅ `/pet-log` 페이지 접속
3. ✅ "새 로그 작성" 버튼 클릭
4. ✅ 폼 작성:
   - 반려동물 선택
   - 브랜드/제품 선택
   - 급여 기간 입력
   - 별점 및 추천 여부
   - 후기 내용 작성
   - **SAFI 평가 항목 입력** (선택사항)
5. ✅ "작성 완료" 버튼 클릭
6. ✅ 작성된 로그가 목록에 표시되는지 확인

**체크리스트:**
- [ ] 폼이 정상적으로 열림
- [ ] 반려동물 선택 가능
- [ ] 모든 필수 필드 입력 가능
- [ ] SAFI 평가 항목 입력 가능
- [ ] 제출 성공
- [ ] 작성된 로그가 목록에 표시됨
- [ ] 작성된 로그 상세 페이지 접근 가능

### 4.3 브랜드 페이지 테스트

**시나리오: 브랜드 목록 및 상세 확인**

1. ✅ `/brands` 페이지 접속
2. ✅ 브랜드 목록 표시 확인
3. ✅ 각 브랜드 카드에 SAFI 점수 표시 확인
4. ✅ 브랜드 클릭 → 상세 페이지 이동
5. ✅ 브랜드 상세 페이지에서:
   - SAFI 점수 섹션 확인
   - "SAFI 평가하기" 버튼 확인
   - 제품 목록 확인
   - 각 제품의 SAFI 점수 확인

**체크리스트:**
- [ ] 브랜드 목록 정상 표시
- [ ] 브랜드별 SAFI 점수 표시
- [ ] 브랜드 상세 페이지 정상 로드
- [ ] SAFI 평가 섹션 표시
- [ ] 제품 목록 정상 표시

### 4.4 SAFI 평가 테스트

**시나리오: SAFI 평가 제출**

1. ✅ 브랜드 상세 페이지 접속
2. ✅ "SAFI 평가하기" 버튼 클릭
3. ✅ 로그인 상태 확인 (비로그인 시 로그인 페이지로 리다이렉트)
4. ✅ SAFI 평가 폼 작성:
   - 변 상태 점수 (1-5)
   - 식욕 변화 선택
   - 구토 여부 선택
   - 알레르기 증상 입력
5. ✅ "평가 등록하기" 버튼 클릭
6. ✅ 평가 성공 메시지 확인
7. ✅ 브랜드 SAFI 점수 업데이트 확인

**체크리스트:**
- [ ] 평가 폼 정상 표시
- [ ] 모든 필드 입력 가능
- [ ] 제출 성공
- [ ] SAFI 점수 재계산 확인
- [ ] 평가 데이터가 review_logs에 저장됨

### 4.5 커뮤니티 피드 테스트

**시나리오: 홈페이지 피드 확인**

1. ✅ `/` 홈페이지 접속
2. ✅ "커뮤니티 피드" 섹션 확인
3. ✅ 탭 전환 테스트:
   - 인기
   - 최신
   - Q&A
   - 급여 후기
4. ✅ 각 카드 디자인 통일성 확인
5. ✅ 카드 클릭 → 상세 페이지 이동 확인

**체크리스트:**
- [ ] 피드 정상 로드
- [ ] 탭 전환 정상 작동
- [ ] 급여 후기 카드 디자인 통일
- [ ] Q&A 카드 디자인 통일
- [ ] 카드 클릭 시 상세 페이지 이동

---

## 5. 주요 기능별 테스트

### 5.1 데이터 조회 테스트

**API 엔드포인트 확인:**

```bash
# 브랜드 목록
curl http://localhost:3000/api/brands

# 브랜드별 리뷰
curl http://localhost:3000/api/brands/로얄캐닌/reviews

# 펫 로그 목록
curl http://localhost:3000/api/review-logs
```

**브라우저 개발자 도구에서 확인:**
- Network 탭 → API 요청 확인
- Console 탭 → 에러 메시지 확인

### 5.2 데이터 생성/수정 테스트

**Supabase Table Editor에서 직접 확인:**

1. 데이터 작성 후 즉시 Table Editor에서 확인
2. `created_at`, `updated_at` 타임스탬프 확인
3. RLS (Row Level Security) 정책 확인

### 5.3 SAFI 점수 계산 테스트

**테스트 데이터 준비:**

```sql
-- 다양한 SAFI 평가 데이터 생성
-- 1. 안전한 제품 (높은 점수)
-- 2. 보통 제품 (중간 점수)
-- 3. 주의 제품 (낮은 점수)
```

**확인 사항:**
- SAFI 점수가 올바르게 계산되는지
- `safi_level`이 올바르게 설정되는지
- `safi_detail` JSON이 올바르게 저장되는지

### 5.4 성능 테스트

**체크리스트:**
- [ ] 페이지 로딩 속도 (3초 이내)
- [ ] API 응답 시간 (1초 이내)
- [ ] 이미지 로딩 최적화
- [ ] 무한 스크롤/페이지네이션 작동

---

## 6. 문제 해결

### 6.1 Supabase 연결 오류

**증상:** `Failed to fetch` 또는 `ERR_NAME_NOT_RESOLVED`

**해결:**
1. `.env.local` 파일의 URL 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 네트워크 연결 확인

### 6.2 RLS 정책 오류

**증상:** 데이터 조회 불가 또는 권한 오류

**해결:**
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'review_logs';

-- 공개 읽기 정책 추가 (필요시)
CREATE POLICY "Allow public read access" ON review_logs
  FOR SELECT USING (true);
```

### 6.3 데이터 타입 오류

**증상:** 데이터 입력 시 타입 오류

**해결:**
1. Supabase Table Editor에서 컬럼 타입 확인
2. 입력 데이터 타입 확인
3. JSON 필드의 경우 올바른 형식 확인

### 6.4 SAFI 점수 계산 오류

**증상:** SAFI 점수가 계산되지 않거나 잘못된 값

**해결:**
1. `lib/safi-calculator.ts` 로직 확인
2. 입력 데이터 유효성 확인
3. 브라우저 콘솔에서 계산 과정 로그 확인

---

## 7. 테스트 체크리스트 요약

### 필수 테스트 항목

**인증:**
- [ ] 회원가입
- [ ] 로그인
- [ ] 로그아웃
- [ ] 세션 유지

**데이터 CRUD:**
- [ ] 펫 로그 작성
- [ ] 펫 로그 수정
- [ ] 펫 로그 삭제
- [ ] 펫 로그 조회

**SAFI 기능:**
- [ ] SAFI 평가 제출
- [ ] SAFI 점수 계산
- [ ] SAFI 점수 표시
- [ ] SAFI 레벨 표시

**UI/UX:**
- [ ] 카드 디자인 통일성
- [ ] 반응형 디자인
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 표시

---

## 8. 다음 단계

테스트 완료 후:

1. **프로덕션 배포 확인**
   - Vercel 배포 상태 확인
   - 프로덕션 환경 변수 확인

2. **모니터링 설정**
   - 에러 로깅 설정
   - 성능 모니터링 설정

3. **사용자 피드백 수집**
   - 실제 사용자 테스트
   - 피드백 반영

---

**마지막 업데이트**: 2024년 12월
**작성자**: Safe Pet Food 개발팀

