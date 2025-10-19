# Vercel 배포 관리 설정 가이드

## 📋 개요

관리자 패널에서 Vercel 배포를 관리하기 위한 설정 가이드입니다.

## 🔑 필수 환경 변수

### 1. VERCEL_TOKEN 발급받기

1. **Vercel 대시보드 접속**
   - https://vercel.com/account/tokens 방문

2. **새 토큰 생성**
   - "Create Token" 클릭
   - Token Name: `safe-pet-food-admin` (원하는 이름)
   - Scope: Full Account 또는 특정 프로젝트만 선택
   - Expiration: 원하는 만료 기간 설정

3. **토큰 복사**
   - 생성된 토큰을 안전한 곳에 복사 (다시 볼 수 없습니다!)

### 2. 환경 변수 설정

#### 로컬 개발 환경

`.env.local` 파일을 생성하고 다음 내용 추가:

```bash
# Vercel API 토큰 (필수)
VERCEL_TOKEN=your_vercel_token_here

# Vercel 팀 ID (팀 계정 사용 시 필수)
VERCEL_TEAM_ID=team_xxxxx

# Vercel 프로젝트 ID (선택사항, 기본값: safe-pet-food)
VERCEL_PROJECT_ID=safe-pet-food

# GitHub 저장소 ID (재배포 기능에 필요)
GITHUB_REPO_ID=your_github_repo_id
```

#### Vercel 프로덕션 환경

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Environment Variables
3. 위의 환경 변수들을 추가

## 🔍 환경 변수 값 찾기

### VERCEL_TEAM_ID 찾기

팀 계정을 사용하는 경우:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.vercel.com/v2/teams
```

응답에서 `id` 필드 확인

### VERCEL_PROJECT_ID 찾기

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.vercel.com/v9/projects
```

프로젝트 목록에서 `id` 또는 `name` 확인

### GITHUB_REPO_ID 찾기

GitHub API 사용:

```bash
curl https://api.github.com/repos/username/safe-pet-food
```

응답에서 `id` 필드 확인

## 🚀 기능 설명

### 1. 배포 히스토리 조회

- 최근 20개의 배포 내역 표시
- 상태: 성공, 빌드 중, 실패, 대기 중
- 커밋 정보, 작성자, 배포 시간 표시

### 2. 재배포

- 이전 버전을 다시 배포
- 같은 커밋으로 새로운 배포 생성

### 3. 롤백

- 이전 버전으로 즉시 되돌리기
- 프로덕션 URL에 바로 반영

### 4. 미리보기

- 각 배포의 미리보기 URL 열기
- 프로덕션 배포 전 테스트 가능

## 📊 API 엔드포인트

### GET /api/deployments

배포 목록 조회

**응답 예시:**
```json
{
  "deployments": [
    {
      "uid": "dpl_xxx",
      "name": "safe-pet-food",
      "url": "safe-pet-food.vercel.app",
      "created": 1234567890000,
      "state": "READY",
      "meta": {
        "githubCommitMessage": "fix: bug fix",
        "githubCommitSha": "abc123",
        "githubCommitAuthorName": "username",
        "githubCommitRef": "main"
      },
      "target": "production"
    }
  ]
}
```

### POST /api/deployments

배포 액션 실행

**요청 예시:**
```json
{
  "deploymentId": "dpl_xxx",
  "action": "redeploy"
}
```

## 🔒 보안 고려사항

1. **토큰 보안**
   - `.env.local` 파일은 절대 Git에 커밋하지 마세요
   - `.gitignore`에 `.env.local` 포함 확인

2. **접근 제한**
   - 관리자 페이지에 인증 구현 필요
   - 실제 프로덕션에서는 관리자 권한 체크 필수

3. **토큰 권한 최소화**
   - 필요한 최소한의 권한만 부여
   - 정기적으로 토큰 재발급

## 🐛 문제 해결

### "VERCEL_TOKEN is not configured" 오류

- 환경 변수가 올바르게 설정되었는지 확인
- Vercel 배포 후 환경 변수 추가 시 재배포 필요

### "Failed to fetch deployments" 오류

- 토큰이 만료되었는지 확인
- 토큰 권한이 충분한지 확인
- 팀 계정 사용 시 VERCEL_TEAM_ID 설정 확인

### 배포 목록이 비어있음

- VERCEL_PROJECT_ID가 올바른지 확인
- 프로젝트에 배포 히스토리가 있는지 확인

## 📚 참고 자료

- [Vercel API 문서](https://vercel.com/docs/rest-api)
- [Vercel 배포 API](https://vercel.com/docs/rest-api#endpoints/deployments)
- [환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎯 다음 단계

1. 환경 변수 설정 완료
2. 로컬에서 테스트
3. Vercel에 환경 변수 추가
4. 프로덕션 배포 및 테스트
5. 관리자 인증 구현 (선택사항)

---

**작성일**: 2024년 10월  
**최종 수정**: 2024년 10월

