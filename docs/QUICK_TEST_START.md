# 빠른 테스트 시작 가이드

## 🚀 5분 안에 테스트 시작하기

### Step 1: 환경 변수 확인 (1분)

```bash
# .env.local 파일 확인
cat .env.local
```

**필수 항목:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**없다면:**
1. Supabase 대시보드 → Settings → API
2. URL과 anon key 복사
3. `.env.local` 파일 생성

### Step 2: 데이터베이스 마이그레이션 (2분)

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴 → SQL Editor

3. **마이그레이션 실행**
   - `scripts/supabase-safi-fields-migration.sql` 파일 열기
   - 전체 내용 복사
   - SQL Editor에 붙여넣기
   - **Run** 버튼 클릭

4. **확인**
   - Table Editor → `review_logs` 테이블
   - SAFI 관련 컬럼 추가 확인

### Step 3: 테스트 데이터 생성 (2분)

#### 방법 1: Supabase Table Editor에서 직접 입력

**1. 테스트 사용자 생성**
- Authentication → Users → Add User
- Email: `test@example.com`
- Password: `test1234` (임시)
- Auto Confirm: ✅

**2. 프로필 생성**
- Table Editor → `profiles`
- Insert row:
  ```json
  {
    "id": "복사한-user-id",
    "nickname": "테스트집사"
  }
  ```

**3. 펫 생성**
- Table Editor → `pets`
- Insert row:
  ```json
  {
    "owner_id": "복사한-user-id",
    "name": "뽀미",
    "species": "dog",
    "birth_date": "2020-01-01",
    "weight_kg": 28.5
  }
  ```

**4. 리뷰 로그 생성**
- Table Editor → `review_logs`
- Insert row:
  ```json
  {
    "owner_id": "복사한-user-id",
    "pet_id": "복사한-pet-id",
    "brand": "로얄캐닌",
    "product": "골든 리트리버 어덜트",
    "category": "feed",
    "status": "feeding",
    "period_start": "2024-10-01",
    "rating": 5.0,
    "recommend": true,
    "excerpt": "테스트 후기입니다.",
    "likes": 0,
    "comments_count": 0,
    "views": 0
  }
  ```

### Step 4: 앱 실행 및 테스트 (1분)

```bash
# 개발 서버 실행
npm run dev
```

**테스트 체크리스트:**
- [ ] http://localhost:3000 접속
- [ ] 로그인 (`test@example.com` / `test1234`)
- [ ] `/pet-log` 페이지에서 작성한 로그 확인
- [ ] "새 로그 작성" 버튼 클릭 → 폼 열림 확인
- [ ] `/brands` 페이지 접속 → 브랜드 목록 확인

---

## 📝 상세 가이드

더 자세한 내용은 `docs/REAL_DATA_TESTING_GUIDE.md` 참고

---

## ⚠️ 문제 발생 시

### Supabase 연결 오류
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
```

### 데이터 조회 안 됨
- Supabase Table Editor에서 데이터 존재 확인
- RLS 정책 확인 (Settings → Authentication → Policies)

### 로그인 안 됨
- Supabase Authentication → Users에서 사용자 확인
- 이메일 인증 필요 여부 확인

---

**다음 단계**: `docs/REAL_DATA_TESTING_GUIDE.md`의 "4. 테스트 시나리오" 섹션 참고

