# 카카오 OAuth 로그인 설정 가이드

## 🔍 문제 진단

카카오 로그인 버튼을 클릭했지만 로그인이 되지 않는 경우:

1. ✅ 페이지 전환은 됨 (OAuth 프로세스 시작됨)
2. ❌ 로그인이 완료되지 않음 (세션 생성 실패)

### 가능한 원인:
- Supabase에서 카카오 OAuth 프로바이더 미설정
- 리다이렉트 URL 미등록
- 카카오 개발자 콘솔 설정 누락

---

## 🛠️ 해결 단계

### **Step 1: Supabase 카카오 OAuth 설정 확인**

#### 1️⃣ Supabase 대시보드 접속
```
https://supabase.com/dashboard/project/hkyutzlbcnfdfzlcopxh/auth/providers
```

#### 2️⃣ 카카오 프로바이더 활성화 확인
```
Authentication → Providers → Kakao
```

**확인 사항:**
- ✅ Kakao 토글이 켜져 있는가?
- ✅ Client ID가 입력되어 있는가?
- ✅ Client Secret이 입력되어 있는가?

---

### **Step 2: 카카오 개발자 콘솔 설정**

#### 1️⃣ 카카오 개발자 콘솔 접속
```
https://developers.kakao.com/console/app
```

#### 2️⃣ 앱 선택 (또는 새 앱 생성)

#### 3️⃣ 앱 키 확인
```
내 애플리케이션 → 앱 설정 → 앱 키
```

**필요한 키:**
- **REST API 키** → Supabase Client ID로 사용

#### 4️⃣ 플랫폼 설정
```
내 애플리케이션 → 앱 설정 → 플랫폼
```

**Web 플랫폼 등록:**
- 로컬: `http://localhost:3000`
- 프로덕션: `https://safe-pet-food.vercel.app`

#### 5️⃣ Redirect URI 설정 ⭐ 중요!
```
내 애플리케이션 → 제품 설정 → 카카오 로그인
```

**등록해야 할 Redirect URI:**

**로컬 개발:**
```
http://localhost:3000/auth/callback
```

**프로덕션:**
```
https://safe-pet-food.vercel.app/auth/callback
```

**또는 Supabase 콜백 URL:** (선택사항)
```
https://hkyutzlbcnfdfzlcopxh.supabase.co/auth/v1/callback
```

#### 6️⃣ 동의 항목 설정
```
내 애플리케이션 → 제품 설정 → 카카오 로그인 → 동의 항목
```

**필수 동의 항목:**
- ✅ 닉네임 (필수)
- ✅ 프로필 사진 (선택)
- ✅ 카카오 계정 (이메일) (필수)

---

### **Step 3: Supabase에 카카오 앱 정보 등록**

#### 1️⃣ Supabase 대시보드 → Authentication → Providers → Kakao

#### 2️⃣ 다음 정보 입력:

```
Client ID: [카카오 REST API 키]
(예: 1234567890abcdef1234567890abcdef)

Client Secret: [카카오 Client Secret]
(앱 설정 → 보안 → Client Secret에서 생성)
```

#### 3️⃣ Redirect URL 확인:
```
Supabase에서 자동으로 생성됨:
https://hkyutzlbcnfdfzlcopxh.supabase.co/auth/v1/callback
```

이 URL을 카카오 개발자 콘솔의 Redirect URI에 추가하세요!

---

### **Step 4: 허용된 리다이렉트 URL 등록**

#### Supabase 대시보드에서:
```
Authentication → URL Configuration
```

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (각 줄에 하나씩):**
```
http://localhost:3000/**
http://localhost:3000/auth/callback
https://safe-pet-food.vercel.app/**
https://safe-pet-food.vercel.app/auth/callback
```

---

## 🧪 테스트 방법

### **로컬 테스트:**

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **/login 페이지 접속**
   ```
   http://localhost:3000/login
   ```

3. **카카오 로그인 버튼 클릭**

4. **카카오 로그인 페이지 확인**
   - ✅ 카카오 로그인 페이지로 이동
   - ✅ 앱 이름 표시
   - ✅ 동의 항목 표시

5. **로그인 완료**
   - ✅ 로그인 성공 후 `/` 페이지로 리다이렉트
   - ✅ 우측 상단에 사용자 이름 표시
   - ✅ 개발자 도구 콘솔에 에러 없음

---

## 🐛 문제 해결

### **문제 1: "Invalid redirect_uri" 오류**

**원인:** 카카오 개발자 콘솔에 Redirect URI가 등록되지 않음

**해결:**
```
카카오 개발자 콘솔 → 제품 설정 → 카카오 로그인 → Redirect URI
→ http://localhost:3000/auth/callback 추가
```

---

### **문제 2: "Client authentication failed" 오류**

**원인:** Client ID 또는 Client Secret이 잘못됨

**해결:**
1. 카카오 개발자 콘솔에서 REST API 키 다시 확인
2. Supabase Provider 설정에서 Client ID 다시 입력
3. Client Secret 재생성 후 Supabase에 업데이트

---

### **문제 3: 로그인 후 세션이 생성되지 않음**

**원인:** 
- Supabase 콜백 처리 오류
- 쿠키 설정 문제

**해결:**

**1. 브라우저 개발자 도구 → Console 확인:**
```javascript
// 세션 확인
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

**2. 쿠키 확인:**
```
개발자 도구 → Application → Cookies
→ localhost:3000
→ sb-hkyutzlbcnfdfzlcopxh-auth-token 확인
```

**3. 리다이렉트 URL 확인:**
```
브라우저 주소창에서:
http://localhost:3000/auth/callback?code=...
```

---

### **문제 4: "카카오 로그인에 실패했습니다" alert**

**원인:** Supabase OAuth 호출 실패

**해결:**

**1. 브라우저 콘솔에서 에러 확인:**
```javascript
// 개발 모드에서만 표시됨
console.error('Kakao login error:', error)
```

**2. Supabase 프로바이더 재확인:**
```
Supabase → Authentication → Providers → Kakao
→ Enabled 체크
→ Client ID 확인
→ Client Secret 확인
```

---

## 📊 설정 체크리스트

### **카카오 개발자 콘솔:**
```
✅ 앱 생성 완료
✅ REST API 키 확보
✅ Client Secret 생성
✅ Web 플랫폼 등록 (localhost:3000)
✅ Redirect URI 등록:
   - http://localhost:3000/auth/callback
   - https://hkyutzlbcnfdfzlcopxh.supabase.co/auth/v1/callback
✅ 동의 항목 설정 (닉네임, 이메일 필수)
✅ 카카오 로그인 활성화
```

### **Supabase 대시보드:**
```
✅ Kakao Provider 활성화
✅ Client ID 입력 (REST API 키)
✅ Client Secret 입력
✅ Redirect URLs 등록:
   - http://localhost:3000/**
   - http://localhost:3000/auth/callback
✅ Site URL 설정 (http://localhost:3000)
```

---

## 🎯 빠른 진단

### **현재 상태 확인:**

**1. Supabase 카카오 설정 확인:**
```
https://supabase.com/dashboard/project/hkyutzlbcnfdfzlcopxh/auth/providers
→ Kakao 토글 ON 확인
```

**2. 카카오 개발자 콘솔 확인:**
```
https://developers.kakao.com/console/app
→ 앱 선택
→ 제품 설정 → 카카오 로그인
→ Redirect URI 확인
```

**3. 로컬 테스트:**
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서
http://localhost:3000/login
→ 카카오 로그인 버튼 클릭
→ 개발자 도구 콘솔 확인
```

---

## 🔧 추가 디버깅

### **로그 확인:**

**브라우저 콘솔:**
```javascript
// 로그인 시도 시
[Login] Kakao login initiated

// 오류 발생 시
Kakao login error: { message: "...", ... }
```

**서버 로그:**
```javascript
// /auth/callback 접근 시
[Auth Callback] Code: abc123...
[Auth Callback] Error exchanging code for session: ...
```

---

## 📝 참고 자료

- [카카오 로그인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Supabase OAuth 가이드](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

---

## ❓ FAQ

### Q: 카카오 앱이 없어도 되나요?
A: 네, 카카오 개발자 콘솔에서 무료로 앱을 생성할 수 있습니다.

### Q: Client Secret이 뭔가요?
A: 카카오 앱 설정 → 보안 탭에서 생성할 수 있는 비밀 키입니다.

### Q: Redirect URI를 여러 개 등록해야 하나요?
A: 네, 로컬(localhost)과 프로덕션(vercel.app) 모두 등록해야 합니다.

### Q: 프로덕션에서도 같은 설정인가요?
A: 네, 다만 Redirect URI에 프로덕션 URL도 추가해야 합니다.

---

**설정 후에도 문제가 지속되면, 브라우저 개발자 도구의 Console과 Network 탭을 확인해주세요!** 🔍
