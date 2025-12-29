# OAuth 로그인 후 헤더 세션 동기화 문제 해결 보고서

## 📋 요약

OAuth 로그인 성공 후 헤더에 사용자 정보가 표시되지 않는 문제를 분석하고 해결했습니다.

**문제**: OAuth 로그인 성공 → 헤더가 "로그인" 상태로 안 바뀜  
**원인**: 쿠키-localStorage 세션 동기화 누락  
**해결**: Custom Storage Adapter 구현

---

## 🔍 1. Header 컴포넌트 분석

### ✅ Header는 Client Component

**파일**: `app/components/Header.tsx`

```typescript
'use client'  // ✅ Client Component

export default function Header() {
  const { user, profile } = useAuth()  // ✅ useAuth 훅 사용
  const isLoggedIn = !!user
```

**결론**:
- ✅ Header는 **Client Component**
- ✅ `useAuth` 훅으로 **브라우저 세션** 읽음
- ✅ SSR 패턴 (`cookies()`, `createServerClient`) **사용 안 함**

---

## 🗄️ 2. Supabase 세션 저장 방식 분석

### 하이브리드 방식 (쿠키 + localStorage)

#### **OAuth 콜백** (`app/auth/callback/route.ts`)
```typescript
const supabase = createRouteHandlerClient<Database>({ 
  cookies: () => cookieStore 
})
const { data } = await supabase.auth.exchangeCodeForSession(code)
```
✅ **쿠키에 세션 저장**

#### **브라우저 클라이언트** (`lib/supabase-client.ts` - 수정 전)
```typescript
auth: {
  storage: typeof window !== 'undefined' ? window.localStorage : undefined
}
```
❌ **localStorage만 확인**

#### **서버 클라이언트** (`lib/supabase-server.ts`)
```typescript
auth: {
  persistSession: false,
}
```
❌ **세션 저장 안 함**

---

## 🔄 3. OAuth Flow 분석

### ✅ PKCE Code Flow 사용 중

**현재 Flow** (문제 발생):
```
1. 사용자 "Google 로그인" 클릭
   ↓
2. Google OAuth → /auth/callback?code=xxx&next=/
   ↓
3. exchangeCodeForSession(code)
   → 세션을 쿠키에 저장 ✅
   ↓
4. Redirect to / (깔끔한 URL)
   ↓
5. useAuth 초기화
   → getBrowserClient() 생성
   → localStorage에서 세션 읽기 시도
   → 🔴 쿠키에만 있고 localStorage에는 없음!
   ↓
6. getSession() 호출
   → localStorage 확인 → null 반환
   → 🔴 onAuthStateChange 트리거 안 됨
   ↓
7. Header에서 user = null 상태 유지
   → "로그인" 버튼 계속 표시 ❌
```

**Flow Type**: ✅ **PKCE Code Flow** (`?code=xxx`)
- ❌ Implicit Flow (`#access_token=...`)가 아님
- ✅ `exchangeCodeForSession()` 올바르게 사용 중

---

## 🔴 근본 원인 (Root Cause)

### **케이스 B: 헤더가 Client Component인데 세션 동기화 실패**

**문제의 핵심**:

1. ✅ OAuth 콜백: `createRouteHandlerClient` → **쿠키에 세션 저장**
2. ❌ 브라우저 클라이언트: `createClient` + `localStorage` → **쿠키 인식 불가**
3. ❌ **쿠키 → localStorage 동기화 로직 없음**
4. ❌ `useAuth`의 `onAuthStateChange` 트리거 안 됨
5. ❌ Header가 `user = null` 상태 유지

**근본 원인**:
```
createRouteHandlerClient는 쿠키-localStorage 자동 동기화 지원
일반 createClient는 지정된 storage만 사용 (동기화 없음)
```

---

## ✅ 해결 방법

### Custom Storage Adapter 구현 (권장 ⭐)

**수정 파일**: `lib/supabase-client.ts`

#### **Before** ❌
```typescript
return createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})
```

#### **After** ✅
```typescript
// Custom storage adapter that syncs between cookies and localStorage
const customStorage = typeof window !== 'undefined' ? {
  getItem: (key: string) => {
    // 1. Try localStorage first (fast)
    const localValue = window.localStorage.getItem(key)
    if (localValue) {
      return localValue
    }
    
    // 2. Fallback to cookies (for OAuth callback case)
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=')
      if (cookieName === key) {
        const decoded = decodeURIComponent(cookieValue)
        // 3. Sync to localStorage for future reads
        window.localStorage.setItem(key, decoded)
        return decoded
      }
    }
    
    return null
  },
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key)
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
} : undefined

return createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage  // Use custom storage
  }
})
```

---

## 🎯 해결 효과

### **새로운 Flow** (정상 작동):
```
1. 사용자 "Google 로그인" 클릭
   ↓
2. Google OAuth → /auth/callback?code=xxx
   ↓
3. exchangeCodeForSession(code)
   → 세션을 쿠키에 저장 ✅
   ↓
4. Redirect to /
   ↓
5. useAuth 초기화
   → getBrowserClient() (custom storage)
   → getSession() 호출
   ↓
6. Custom Storage Adapter:
   → localStorage 확인 → null
   → 쿠키 확인 → 세션 발견! ✅
   → localStorage로 동기화 ✅
   → 세션 반환 ✅
   ↓
7. onAuthStateChange 트리거 ✅
   → user, profile 상태 업데이트 ✅
   ↓
8. Header 리렌더링
   → 사용자 아이콘/닉네임 즉시 표시! 🎉
```

---

## 📊 변경 사항

### 수정된 파일

#### 1. `lib/supabase-client.ts`
- Custom Storage Adapter 추가
- 쿠키-localStorage 동기화 구현
- **+30줄**

#### 2. `app/components/Header.tsx`
- 불필요한 `auth=success` 처리 제거
- 불필요한 imports 제거
- **-18줄**

**총 변경**: +12줄 (간소화!)

---

## 🧪 테스트 결과

### ✅ 테스트 시나리오

#### **시나리오 1: Google OAuth 로그인**
1. `http://localhost:3000` 접속
2. "로그인" 클릭 → "Google로 로그인" 클릭
3. Google 인증 완료
4. **결과**: 홈으로 돌아오자마자 즉시 우측 상단에 사용자 아이콘 표시 ✅

#### **시나리오 2: Kakao OAuth 로그인**
1. `http://localhost:3000` 접속
2. "로그인" 클릭 → "카카오로 로그인" 클릭
3. Kakao 인증 완료
4. **결과**: 즉시 사용자 닉네임 표시 ✅

#### **시나리오 3: 페이지 새로고침**
1. 로그인 상태에서 `F5` 새로고침
2. **결과**: 로그인 상태 유지 ✅

#### **시나리오 4: localStorage 삭제 후 새로고침**
1. DevTools → Application → Local Storage → 세션 키 삭제
2. 페이지 새로고침
3. **결과**: 쿠키에서 세션 복원 → localStorage 동기화 ✅

---

## 📝 기술적 세부사항

### Custom Storage Adapter 동작 원리

```typescript
getItem(key):
  1. localStorage 확인 (O(1), 빠름)
     ├─ 있으면 → 즉시 반환
     └─ 없으면 → 2단계
  
  2. 쿠키 확인 (O(n), 느림)
     ├─ 있으면 → localStorage로 동기화 → 반환
     └─ 없으면 → null

setItem(key, value):
  - localStorage에만 저장 (쿠키는 서버가 설정)

removeItem(key):
  - localStorage 삭제
  - 쿠키도 삭제 (만료 날짜 과거로 설정)
```

### 성능 최적화

- ✅ **First Read**: localStorage → 없으면 → 쿠키 → 동기화
- ✅ **Subsequent Reads**: localStorage만 확인 (O(1))
- ✅ **캐시 효과**: 쿠키 읽기는 1회만 발생

---

## 🚀 대안 솔루션 비교

### Option 1: Custom Storage Adapter (채택 ⭐)

**장점**:
- ✅ 최소 코드 변경
- ✅ 기존 아키텍처 유지
- ✅ 쿠키-localStorage 자동 동기화
- ✅ 성능 최적화 가능

**단점**:
- 쿠키 파싱 오버헤드 (1회만)

### Option 2: createRouteHandlerClient 사용

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const getBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
```

**장점**:
- ✅ Supabase 공식 방법
- ✅ 쿠키-localStorage 자동 동기화

**단점**:
- ❌ `@supabase/ssr` 패키지 추가 필요
- ❌ 기존 코드 대규모 리팩토링
- ❌ 싱글톤 패턴 재구현 필요

### Option 3: Header를 Server Component로 변경

**장점**:
- ✅ SSR 시 쿠키에서 세션 직접 읽기

**단점**:
- ❌ `useAuth` 훅 사용 불가
- ❌ 인터랙티브 UI (드롭다운) 구현 복잡
- ❌ Client Component 래퍼 필요
- ❌ 아키텍처 대규모 변경

---

## ✅ 결론

**선택한 솔루션**: **Option 1 - Custom Storage Adapter**

**이유**:
1. ✅ 최소한의 코드 변경 (12줄)
2. ✅ 기존 아키텍처 유지
3. ✅ 성능 최적화 가능
4. ✅ 추가 의존성 없음
5. ✅ 테스트 완료 및 동작 확인

**결과**:
- ✅ OAuth 로그인 후 **즉시** 헤더 업데이트
- ✅ 쿠키-localStorage 완벽 동기화
- ✅ 코드 간소화 및 유지보수성 향상

---

## 📚 참고 자료

- [Supabase Auth Helpers - SSR](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js 14 Server/Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Supabase OAuth with PKCE](https://supabase.com/docs/guides/auth/social-login)

---

**작성일**: 2024-12-29  
**작성자**: Safe Pet Food 개발팀  
**상태**: ✅ 해결 완료 및 배포
