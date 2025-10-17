# Safe Pet Food - 배포 가이드 🚀

## 📋 배포 준비 체크리스트

### ✅ 완료된 항목
- [x] 프로덕션 빌드 테스트 성공
- [x] 모든 페이지 정상 작동 확인
- [x] TypeScript 컴파일 오류 없음
- [x] ESLint 검사 통과
- [x] 투명성 점수 기능 업데이트 완료
- [x] 브랜드 상세 페이지 리뉴얼 완료

### 🔧 배포 환경 설정

#### 1. Vercel 배포 (권장)

**사전 준비:**
```bash
npm install -g vercel
```

**배포 명령:**
```bash
# 프로젝트 루트에서 실행
vercel

# 또는 GitHub 연동 후 자동 배포
```

**환경 변수 설정 (Vercel Dashboard):**
- `OPENAI_API_KEY`: OpenAI API 키 (건강검진표 분석 기능용) - 선택사항
- `NODE_ENV`: production (자동 설정됨)
- `NEXT_PUBLIC_APP_URL`: 배포된 도메인 URL (선택사항)

**참고:** 현재 모든 기능이 환경 변수 없이도 정상 작동합니다. OpenAI API 키는 건강검진표 분석 기능에만 필요합니다.

#### 2. 기타 플랫폼 배포

**Netlify:**
```bash
# Build Command
npm run build

# Publish Directory
.next
```

**Railway/Render:**
```bash
# Start Command
npm start

# Build Command  
npm run build
```

### 🌐 도메인 및 DNS 설정

#### 커스텀 도메인 연결
1. Vercel Dashboard → Project Settings → Domains
2. 도메인 추가 및 DNS 레코드 설정
3. SSL 인증서 자동 발급 확인

#### 권장 도메인 구조
- 메인: `safepetfood.com`
- API: `api.safepetfood.com` (선택사항)
- 관리자: `admin.safepetfood.com` (선택사항)

### 📊 성능 최적화

#### 이미지 최적화
- Next.js Image 컴포넌트 사용 중
- Unsplash 이미지 도메인 허용 설정 완료

#### 번들 크기 최적화
- 현재 First Load JS: ~82-102kB (양호)
- 동적 임포트 적용 가능한 컴포넌트 검토 필요

#### 캐싱 전략
- API 라우트: no-cache 설정 완료
- 정적 에셋: Vercel 자동 CDN 적용

### 🔒 보안 설정

#### API 키 보안
- OpenAI API 키는 서버 사이드에서만 사용
- 클라이언트에 노출되지 않도록 설정 완료

#### CORS 설정
```javascript
// next.config.js에서 필요시 추가
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' }
      ]
    }
  ]
}
```

### 📈 모니터링 및 분석

#### Vercel Analytics 설정
```bash
npm install @vercel/analytics
```

#### 에러 모니터링
- Vercel 내장 에러 로깅 활용
- 필요시 Sentry 연동 고려

### 🚀 배포 프로세스

#### 1단계: 최종 테스트
```bash
# 로컬 프로덕션 빌드 테스트
npm run build
npm start

# 주요 기능 테스트
# - 메인 페이지 로딩
# - 브랜드 목록 및 상세 페이지
# - 계산기 기능들
# - 관리자 페이지
```

#### 2단계: Git 정리
```bash
# 변경사항 커밋
git add .
git commit -m "feat: 배포 준비 완료 - 투명성 점수 기능 추가"
git push origin main
```

#### 3단계: Vercel 배포
```bash
# Vercel CLI 사용
vercel --prod

# 또는 GitHub 연동 후 자동 배포
```

#### 4단계: 배포 후 검증
- [ ] 모든 페이지 정상 로딩 확인
- [ ] API 엔드포인트 정상 작동 확인
- [ ] 모바일 반응형 확인
- [ ] 성능 점수 확인 (Lighthouse)

### 🔄 CI/CD 설정 (선택사항)

#### GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### 📱 PWA 설정 (향후 계획)

#### Service Worker 추가
```bash
npm install next-pwa
```

#### Manifest 파일 생성
```json
{
  "name": "Safe Pet Food",
  "short_name": "SafePetFood",
  "description": "반려동물 건강 관리 플랫폼",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f59e0b"
}
```

### 🎯 배포 후 할 일

#### 1. SEO 최적화
- [ ] Google Search Console 등록
- [ ] 사이트맵 생성 및 제출
- [ ] 메타 태그 최적화

#### 2. 사용자 피드백 수집
- [ ] Google Analytics 설정
- [ ] 사용자 피드백 폼 추가
- [ ] A/B 테스트 계획

#### 3. 성능 모니터링
- [ ] Core Web Vitals 모니터링
- [ ] 에러 로그 모니터링
- [ ] 사용자 행동 분석

### 🆘 문제 해결

#### 배포 실패 시
1. 빌드 로그 확인
2. 환경 변수 설정 재확인
3. 의존성 버전 충돌 확인
4. 긴급 롤백: `vercel --prod --force`

#### 성능 이슈 시
1. Lighthouse 점수 확인
2. 번들 분석: `npm run analyze`
3. 이미지 최적화 재검토
4. API 응답 시간 최적화

---

## 🎉 배포 완료!

축하합니다! Safe Pet Food 플랫폼이 성공적으로 배포되었습니다.

**주요 기능:**
- ✅ 사료 브랜드 투명성 평가
- ✅ 영양 성분 계산기
- ✅ 건강검진표 AI 분석
- ✅ 반려동물 커뮤니티
- ✅ 관리자 시스템

**접속 URL:** https://your-domain.vercel.app

배포 후 이슈가 발생하면 GitHub Issues 또는 Vercel 대시보드를 통해 확인하세요.
