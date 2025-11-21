# 환경 변수 설정 빠른 해결 가이드

## ❌ "Failed to fetch" 에러 해결

이 에러는 Supabase 환경 변수가 설정되지 않았거나 잘못되었을 때 발생합니다.

### 1단계: .env.local 파일 확인

프로젝트 루트에 `.env.local` 파일이 있는지 확인:

```bash
ls -la .env.local
```

### 2단계: Supabase 키 가져오기

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Settings → API 클릭**
   - **Project URL** 복사 (예: `https://xxxxx.supabase.co`)
   - **anon public** 키 복사

### 3단계: .env.local 파일 생성/수정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**예시:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hkyutzlbcnfdfzlcophxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4단계: 서버 재시작

환경 변수는 서버 시작 시 로드되므로 **반드시 재시작** 필요:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

### 5단계: 확인

브라우저 콘솔에서 확인:
- `[Supabase]` 경고 메시지가 없어야 함
- 로그인 시도 시 "Failed to fetch" 에러가 사라져야 함

---

## ⚠️ 주의사항

1. **.env.local 파일은 Git에 커밋하지 마세요**
   - `.gitignore`에 이미 포함되어 있음
   - 각 개발자/환경마다 별도로 설정 필요

2. **환경 변수 이름 확인**
   - `NEXT_PUBLIC_` 접두사 필수
   - 대소문자 정확히 일치

3. **서버 재시작 필수**
   - 환경 변수 변경 후 반드시 서버 재시작
   - 브라우저 새로고침만으로는 적용 안 됨

---

## 🔍 문제 해결

### 여전히 "Failed to fetch" 에러가 발생하는 경우

1. **환경 변수 형식 확인**
   ```bash
   # 올바른 형식
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   
   # 잘못된 형식
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"  # 따옴표 제거
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co  # 공백 제거
   ```

2. **Supabase URL 확인**
   - URL이 `https://[project-id].supabase.co` 형식인지 확인
   - 프로젝트 ID가 올바른지 확인

3. **네트워크 확인**
   - Supabase 프로젝트가 활성화되어 있는지 확인
   - 방화벽/프록시 설정 확인

4. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - `[Supabase]` 관련 메시지 확인

---

**마지막 업데이트**: 2024년 12월

