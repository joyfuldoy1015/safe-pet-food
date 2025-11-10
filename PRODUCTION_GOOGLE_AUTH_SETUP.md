# 프로덕션 Google Auth 설정 가이드

## ⚠️ 중요: localhost 설정만으로는 프로덕션에서 작동하지 않습니다!

localhost에서 Google Auth가 작동하더라도, Vercel 프로덕션 환경(`https://safe-pet-food.vercel.app/`)에서도 작동하려면 **추가 설정이 필요**합니다.

---

## 🚀 프로덕션 설정 단계

### 1. Google Console 설정 (프로덕션 URL 추가)

1. **Google Cloud Console** → **API 및 서비스** → **사용자 인증 정보**
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 리디렉션 URI**에 다음 추가:
   - ✅ `https://your-project-id.supabase.co/auth/v1/callback` (이미 추가되어 있을 것)
   - ⚠️ **중요**: Supabase 콜백 URL은 localhost와 프로덕션에서 동일하므로 이미 설정되어 있어야 합니다.

4. **승인된 JavaScript 원본**에 다음 추가:
   - `http://localhost:3000` (개발 - 이미 있을 것)
   - `https://safe-pet-food.vercel.app` (프로덕션 - **추가 필요**)

### 2. Supabase Dashboard 설정 (프로덕션 URL 추가)

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
   
2. **Site URL** 설정:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://safe-pet-food.vercel.app`
   - ⚠️ **참고**: Site URL은 하나만 설정할 수 있으므로, 프로덕션 URL로 설정하거나 가장 자주 사용하는 환경으로 설정

3. **Redirect URLs**에 다음 추가:
   - ✅ `http://localhost:3000/auth/callback` (개발 - 이미 있을 것)
   - ✅ `https://safe-pet-food.vercel.app/auth/callback` (프로덕션 - **추가 필요**)

### 3. Vercel 환경 변수 설정

자세한 내용은 `VERCEL_ENV_VARIABLES_GUIDE.md` 파일을 참고하세요.

#### 빠른 가이드:

1. **Vercel Dashboard** → 프로젝트 선택 → **Settings** → **Environment Variables**

2. 다음 환경 변수 추가/확인:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Environment** 선택:
   - ✅ **Production** (프로덕션 - 필수)
   - ✅ **Preview** (프리뷰 환경 - 선택사항)
   - ✅ **Development** (개발 - 선택사항)

4. **저장** 후 **재배포** 필요:
   - 환경 변수 추가/수정 후에는 자동으로 재배포되지 않습니다
   - 수동으로 재배포하거나 새 커밋을 푸시해야 합니다

#### 환경 변수 값 찾기:

1. **Supabase Dashboard** → **Settings** → **API**
2. **Project URL** 복사 → `NEXT_PUBLIC_SUPABASE_URL` 값
3. **anon public** 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값

### 4. 재배포

환경 변수를 추가한 후:

1. **Vercel Dashboard**에서 수동 재배포:
   - **Deployments** 탭 → 최신 배포의 **"..."** 메뉴 → **Redeploy**

2. 또는 새 커밋 푸시:
   ```bash
   git commit --allow-empty -m "Trigger redeploy for production auth"
   git push
   ```

---

## ✅ 설정 확인 체크리스트

### Google Console
- [ ] 승인된 리디렉션 URI에 Supabase 콜백 URL 추가됨
- [ ] 승인된 JavaScript 원본에 `https://safe-pet-food.vercel.app` 추가됨

### Supabase Dashboard
- [ ] Site URL이 프로덕션 URL로 설정됨 (또는 개발/프로덕션 모두 사용 가능하도록)
- [ ] Redirect URLs에 `https://safe-pet-food.vercel.app/auth/callback` 추가됨
- [ ] Google Provider가 Enabled 상태
- [ ] Client ID와 Client Secret이 올바르게 설정됨

### Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 환경 변수 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수 설정됨
- [ ] 환경 변수가 **Production** 환경에 적용됨
- [ ] 재배포 완료

---

## 🧪 테스트

### 1. 프로덕션 환경 테스트

1. `https://safe-pet-food.vercel.app/login` 접속
2. "Google로 로그인" 버튼 클릭
3. Google 로그인 진행
4. `/auth/callback`으로 리디렉션되어 로그인 완료 확인

### 2. 문제 발생 시 확인 사항

#### "redirect_uri_mismatch" 오류
- Google Console의 승인된 리디렉션 URI 확인
- Supabase 콜백 URL이 정확히 입력되었는지 확인

#### "invalid_client" 오류
- Supabase Dashboard의 Google Provider 설정 확인
- Client ID와 Client Secret이 올바른지 확인

#### 로그인 후 리디렉션 안 됨
- Supabase Dashboard의 Site URL 확인
- Vercel 환경 변수가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 에러 확인

---

## 📝 참고 사항

### Supabase 콜백 URL은 동일합니다
- Supabase의 OAuth 콜백 URL은 localhost와 프로덕션에서 동일합니다
- `https://your-project-id.supabase.co/auth/v1/callback`
- 이 URL은 Google Console에 한 번만 추가하면 됩니다

### Site URL vs Redirect URLs
- **Site URL**: 기본 리디렉션 대상 (하나만 설정 가능)
- **Redirect URLs**: 허용된 리디렉션 URL 목록 (여러 개 추가 가능)
- 프로덕션과 개발 환경을 모두 지원하려면 Redirect URLs에 모두 추가

### 환경 변수는 환경별로 설정 가능
- Vercel에서는 Production, Preview, Development 환경별로 환경 변수를 다르게 설정할 수 있습니다
- 프로덕션과 개발 환경의 Supabase 프로젝트가 다르다면 각각 다른 값 설정 가능

---

## 🎯 빠른 설정 요약

1. **Google Console**: 승인된 JavaScript 원본에 `https://safe-pet-food.vercel.app` 추가
2. **Supabase Dashboard**: Redirect URLs에 `https://safe-pet-food.vercel.app/auth/callback` 추가
3. **Vercel Dashboard**: 환경 변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. **재배포**: 환경 변수 추가 후 재배포

---

**작성일**: 2024년 12월  
**최종 수정**: 2024년 12월

