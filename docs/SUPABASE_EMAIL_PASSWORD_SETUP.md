# Supabase 이메일/비밀번호 로그인 설정 가이드

## 문제: 이메일/비밀번호 로그인이 실패하는 경우

### 1. Supabase 설정 확인

**Supabase 대시보드에서 확인:**

1. **Authentication** → **Providers** 접속
2. **Email** 섹션 확인:
   - ✅ **Enable Email provider** 체크되어 있는지 확인
   - ✅ **Confirm email** 설정 확인 (개발 중에는 비활성화 권장)

### 2. 이메일 인증 설정 (개발 환경)

**개발 중에는 이메일 인증을 비활성화하는 것이 편리합니다:**

1. **Authentication** → **Providers** → **Email**
2. **Confirm email** 체크 해제 (개발용)
3. **Save** 클릭

**또는:**

1. **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:3000` 확인
3. **Redirect URLs**에 `http://localhost:3000/auth/callback` 추가

### 3. 테스트 사용자 생성

**Supabase 대시보드에서 직접 생성:**

1. **Authentication** → **Users** → **Add User**
2. **Email**: `test@example.com`
3. **Password**: 안전한 비밀번호 입력
4. **Auto Confirm User**: ✅ 체크 (이메일 인증 없이 바로 사용 가능)
5. **Create User** 클릭

### 4. 환경 변수 확인

`.env.local` 파일 확인:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**확인 방법:**
1. Supabase 대시보드 → **Settings** → **API**
2. **Project URL** 복사 → `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. 브라우저 콘솔 확인

로그인 시도 시 브라우저 개발자 도구 콘솔에서 확인:

1. **F12** 또는 **Cmd+Option+I** (Mac) / **Ctrl+Shift+I** (Windows)
2. **Console** 탭 열기
3. 로그인 시도
4. 에러 메시지 확인:
   - `Invalid login credentials` → 이메일/비밀번호 불일치
   - `Email not confirmed` → 이메일 인증 필요
   - `User not found` → 등록되지 않은 이메일
   - `Failed to fetch` → Supabase 연결 문제

### 6. 회원가입 먼저 진행

**이메일/비밀번호로 로그인하려면 먼저 회원가입이 필요합니다:**

1. `/signup` 페이지 접속
2. 이메일/비밀번호로 회원가입
3. 회원가입 후 로그인 시도

**또는 Supabase 대시보드에서 직접 사용자 생성** (위 3번 참고)

---

## 문제 해결 체크리스트

- [ ] Supabase Email Provider 활성화 확인
- [ ] 이메일 인증 설정 확인 (개발 중에는 비활성화 권장)
- [ ] 테스트 사용자 생성 확인
- [ ] 환경 변수 설정 확인
- [ ] 브라우저 콘솔 에러 메시지 확인
- [ ] 회원가입 먼저 진행했는지 확인

---

## 자주 발생하는 오류

### "Invalid login credentials"
- **원인**: 이메일 또는 비밀번호가 일치하지 않음
- **해결**: 올바른 이메일/비밀번호 입력 또는 회원가입

### "Email not confirmed"
- **원인**: 이메일 인증이 필요한데 인증하지 않음
- **해결**: 
  1. 이메일 확인
  2. 또는 Supabase에서 "Auto Confirm User" 설정

### "User not found"
- **원인**: 등록되지 않은 이메일
- **해결**: 회원가입 먼저 진행

### "Failed to fetch"
- **원인**: Supabase 연결 문제
- **해결**: 
  1. 환경 변수 확인
  2. 네트워크 연결 확인
  3. Supabase 프로젝트 상태 확인

---

**마지막 업데이트**: 2024년 12월

