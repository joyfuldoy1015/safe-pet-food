# 인증 및 작성 기능 구현 가이드

## 📋 구현 완료 사항

### 1. 인증 시스템
- ✅ `lib/supabase-client.ts`: 브라우저용 Supabase 클라이언트
- ✅ `hooks/useAuth.ts`: 인증 훅 (user, profile, signIn, signOut)
- ✅ `app/components/auth/AuthDialog.tsx`: 로그인 모달
- ✅ `app/components/auth/AuthButton.tsx`: 로그인/프로필 버튼
- ✅ `app/auth/callback/route.ts`: OAuth 콜백 핸들러

### 2. 데이터베이스 스키마
- ✅ `scripts/supabase-review-logs-schema.sql`: RLS 포함 전체 스키마
  - profiles 테이블
  - pets 테이블
  - review_logs 테이블
  - comments 테이블
  - RLS 정책 (읽기: 전체, 쓰기/수정/삭제: 소유자만)

### 3. 컴포넌트
- ✅ `app/components/pet-log/PetAddModal.tsx`: 반려동물 추가 모달
- ✅ `app/components/pet-log/ReviewLogForm.tsx`: 후기 작성/수정 폼
- ✅ `lib/types/database.ts`: TypeScript 타입 정의

## 🚀 설정 방법

### 1. Supabase 프로젝트 설정

1. Supabase 대시보드에서 새 프로젝트 생성
2. Settings → API에서 다음 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. 환경 변수 설정

`.env.local` 파일 생성:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 데이터베이스 스키마 생성

Supabase 대시보드 → SQL Editor에서 `scripts/supabase-review-logs-schema.sql` 실행

### 4. Auth 설정 (Supabase 대시보드)

1. Authentication → URL Configuration
2. Site URL: `http://localhost:3000` (개발) / `https://your-domain.com` (프로덕션)
3. Redirect URLs 추가:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 📝 사용 방법

### 1. Header에 AuthButton 추가

`app/components/Header.tsx` 수정:
```tsx
import AuthButton from '@/app/components/auth/AuthButton'

// 기존 로그인 버튼 대신
<AuthButton />
```

### 2. pet-log 페이지에 인증 가드 및 FAB 추가

`app/pet-log/page.tsx`에 다음 추가:

```tsx
import { useAuth } from '@/hooks/useAuth'
import AuthDialog from '@/app/components/auth/AuthDialog'
import PetAddModal from '@/app/components/pet-log/PetAddModal'
import ReviewLogForm from '@/app/components/pet-log/ReviewLogForm'
import { getBrowserClient } from '@/lib/supabase-client'
import { Plus } from 'lucide-react'

// 컴포넌트 내부
const { user, isLoading: authLoading } = useAuth()
const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
const [isPetAddModalOpen, setIsPetAddModalOpen] = useState(false)
const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
const [pets, setPets] = useState<Pet[]>([])
const [editingReview, setEditingReview] = useState<ReviewLog | null>(null)

// Supabase에서 데이터 로드
useEffect(() => {
  if (user) {
    loadPets()
    loadReviews()
  } else {
    // Mock 데이터 사용 (비로그인)
    setReviews(mockReviewLogs)
  }
}, [user])

// FAB 버튼 클릭 핸들러
const handleWriteClick = () => {
  if (!user) {
    setIsAuthDialogOpen(true)
    return
  }
  
  if (pets.length === 0) {
    setIsPetAddModalOpen(true)
    return
  }
  
  setIsReviewFormOpen(true)
}

// FAB 버튼 추가 (페이지 하단)
{!authLoading && (
  <motion.button
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={handleWriteClick}
    className="fixed bottom-6 right-6 w-14 h-14 bg-[#3056F5] text-white rounded-full shadow-lg hover:bg-[#2648e6] transition-colors flex items-center justify-center z-40"
  >
    <Plus className="h-6 w-6" />
  </motion.button>
)}

// 모달들 추가
<AuthDialog
  isOpen={isAuthDialogOpen}
  onClose={() => setIsAuthDialogOpen(false)}
  onSuccess={() => {
    setIsAuthDialogOpen(false)
    // 로그인 성공 후 폼 열기
    if (pets.length === 0) {
      setIsPetAddModalOpen(true)
    } else {
      setIsReviewFormOpen(true)
    }
  }}
/>

<PetAddModal
  isOpen={isPetAddModalOpen}
  onClose={() => setIsPetAddModalOpen(false)}
  onSuccess={() => {
    loadPets()
    setIsPetAddModalOpen(false)
    setIsReviewFormOpen(true)
  }}
/>

<ReviewLogForm
  isOpen={isReviewFormOpen}
  onClose={() => {
    setIsReviewFormOpen(false)
    setEditingReview(null)
  }}
  onSuccess={() => {
    loadReviews()
    setIsReviewFormOpen(false)
    setEditingReview(null)
  }}
  editData={editingReview}
  pets={pets}
/>
```

### 3. 수정/삭제 버튼 추가

`CommunityReviewCard` 또는 `LogDrawer`에 소유자 확인 후 버튼 표시:

```tsx
const { user } = useAuth()
const isOwner = user?.id === review.owner_id

{isOwner && (
  <div className="flex gap-2">
    <button onClick={() => handleEdit(review)}>수정</button>
    <button onClick={() => handleDelete(review.id)}>삭제</button>
  </div>
)}
```

## 🔒 RLS 정책

모든 테이블에 RLS가 활성화되어 있습니다:

- **읽기**: 모든 사용자 가능
- **쓰기**: 인증된 사용자만 (자신의 데이터만)
- **수정/삭제**: 소유자만 가능

## 📦 다음 단계

1. `app/pet-log/page.tsx`를 Supabase와 연동
2. Header에 AuthButton 추가
3. 수정/삭제 기능 구현
4. 댓글 작성 시 인증 확인 추가

## 🐛 문제 해결

### "Missing Supabase environment variables" 오류
- `.env.local` 파일 확인
- 환경 변수 이름 확인 (`NEXT_PUBLIC_` 접두사 필수)

### RLS 정책 오류
- Supabase 대시보드에서 RLS 정책 확인
- `auth.uid()` 함수가 올바르게 작동하는지 확인

### 인증 콜백 오류
- Redirect URL이 Supabase 설정과 일치하는지 확인
- `app/auth/callback/route.ts` 경로 확인

