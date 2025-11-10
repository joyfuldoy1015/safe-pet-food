# Google Auth 설정 가이드

## ✅ 현재 상황
- Google Console에서 OAuth 설정 완료
- Supabase에서 Google Provider 설정 완료
- **코드가 Supabase 방식으로 업데이트됨**

## 🚀 Supabase를 통한 Google OAuth (권장 - 현재 적용됨)

### 1. 환경 변수 확인

`.env.local` 파일에 다음이 설정되어 있는지 확인:

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase 설정 확인

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:3000` (개발) / `https://your-domain.com` (프로덕션)
   - **Redirect URLs**에 다음 추가:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.com/auth/callback`

2. **Authentication** → **Providers** → **Google**
   - ✅ **Enabled** 체크
   - **Client ID**: Google Console에서 가져온 값
   - **Client Secret**: Google Console에서 가져온 값

### 3. Google Console 설정 확인

1. **Google Cloud Console** → **API 및 서비스** → **사용자 인증 정보**
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 리디렉션 URI**에 다음 추가:
   - `https://your-project-id.supabase.co/auth/v1/callback` (Supabase가 자동으로 제공하는 URL)
   - ⚠️ **중요**: Supabase Dashboard의 Google Provider 설정에서 이 URL을 확인할 수 있습니다.

### 4. 테스트

1. 개발 서버 재시작:
```bash
npm run dev
```

2. `/login` 페이지에서 "Google로 로그인" 버튼 클릭

3. Google 로그인 후 `/auth/callback`으로 리디렉션되어 자동으로 로그인됨

---

## 📝 코드 변경 사항

### `app/login/page.tsx`
- `handleGoogleLogin` 함수가 Supabase `signInWithOAuth`를 사용하도록 변경됨
- NextAuth `signIn` 대신 Supabase 클라이언트 사용

### `app/auth/callback/route.ts`
- 이미 Supabase를 사용하도록 설정되어 있음
- OAuth 콜백을 처리하여 세션 생성

---

## 🔍 문제 해결

### "redirect_uri_mismatch" 오류
- Google Console의 **승인된 리디렉션 URI**에 Supabase 콜백 URL이 추가되었는지 확인
- Supabase Dashboard의 Google Provider 설정에서 정확한 URL 확인

### "invalid_client" 오류
- Supabase Dashboard의 Google Provider 설정에서 Client ID와 Client Secret 확인
- Google Console의 값과 일치하는지 확인

### 로그인 후 리디렉션 안 됨
- Supabase Dashboard의 **Site URL** 확인
- `app/auth/callback/route.ts`가 올바르게 작동하는지 확인

### 로그인은 되지만 세션이 유지되지 않음
- `hooks/useAuth.ts`가 Supabase 세션을 올바르게 관리하는지 확인
- 브라우저 쿠키 설정 확인

---

## 🌐 프로덕션 환경 설정

⚠️ **중요**: localhost에서 작동하더라도 Vercel 프로덕션 환경(`https://safe-pet-food.vercel.app/`)에서도 작동하려면 추가 설정이 필요합니다.

자세한 내용은 `PRODUCTION_GOOGLE_AUTH_SETUP.md` 파일을 참고하세요.

### 빠른 체크리스트:
1. ✅ Google Console: 승인된 JavaScript 원본에 프로덕션 URL 추가
2. ✅ Supabase Dashboard: Redirect URLs에 프로덕션 콜백 URL 추가
3. ✅ Vercel Dashboard: 환경 변수 설정
4. ✅ 재배포

---

## 📚 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth 가이드](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 설정](https://developers.google.com/identity/protocols/oauth2)
- [프로덕션 설정 가이드](./PRODUCTION_GOOGLE_AUTH_SETUP.md)
