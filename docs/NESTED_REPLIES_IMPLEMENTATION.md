# Q&A 포럼 대댓글 시스템 구현 완료

## 📋 개요

Q&A 포럼의 대댓글 기능이 완전히 구현되었습니다. 이제 대댓글이 데이터베이스에 저장되며, 사용자 닉네임이 올바르게 표시됩니다.

---

## 🔧 구현된 기능

### 1. 데이터베이스 스키마 추가
- `community_answers` 테이블에 `parent_id` 컬럼 추가
- 자기 참조 외래 키로 중첩 구조 지원
- 인덱스 추가로 쿼리 성능 최적화

### 2. 대댓글 저장 기능
- 대댓글 작성 시 Supabase에 저장
- 사용자 프로필 정보(닉네임, 아바타) 자동 적용
- 실시간 UI 업데이트

### 3. 중첩 구조 로딩
- 플랫 구조 데이터를 트리 구조로 변환
- 무한 깊이 대댓글 지원
- 투표 순 + 작성 시간 순 정렬

---

## ⚠️ 필수 작업: SQL 스크립트 실행

배포된 코드가 작동하려면 **반드시** Supabase에서 다음 SQL 스크립트를 실행해야 합니다:

### 실행 방법

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 로그인

2. **SQL Editor 열기**
   - 좌측 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **스크립트 실행**
   ```bash
   # 프로젝트 루트에서
   cat scripts/add-parent-id-to-answers.sql
   ```
   - 위 명령으로 출력된 SQL 내용 전체를 복사
   - Supabase SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

4. **실행 결과 확인**
   - 성공 메시지: `Success. No rows returned`
   - 또는 `ALTER TABLE`, `CREATE INDEX` 등의 성공 메시지

### 실행 내용
```sql
-- parent_id 컬럼 추가
ALTER TABLE community_answers
ADD COLUMN IF NOT EXISTS parent_id UUID 
REFERENCES community_answers(id) ON DELETE CASCADE;

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_community_answers_parent_id 
ON community_answers(parent_id);

CREATE INDEX IF NOT EXISTS idx_community_answers_question_parent 
ON community_answers(question_id, parent_id);
```

---

## 🧪 테스트 방법

### 1. 대댓글 작성 테스트

```
1. http://localhost:3000/community/qa-forum 접속
2. 로그인 (필수)
3. 기존 Q&A 게시글 하나 선택
4. 댓글 작성
5. 작성한 댓글의 "답글" 버튼 클릭
6. 대댓글 작성
7. ✅ 닉네임이 올바르게 표시되는지 확인
```

### 2. 데이터 영속성 테스트

```
1. 대댓글 작성 후
2. 페이지 새로고침 (F5)
3. ✅ 대댓글이 사라지지 않고 남아있는지 확인
```

### 3. 중첩 깊이 테스트

```
1. 댓글 작성
2. 댓글에 답글 작성
3. 답글에 다시 답글 작성 (대대댓글)
4. ✅ @멘션이 올바르게 표시되는지 확인
5. ✅ 들여쓰기가 일정하게 유지되는지 확인
```

---

## 🔍 변경된 파일

### 1. 새로 생성된 파일
- **`scripts/add-parent-id-to-answers.sql`**
  - 데이터베이스 스키마 변경 스크립트
  - 사용자가 Supabase에서 직접 실행 필요

### 2. 수정된 파일

#### `app/community/qa-forum/[questionId]/page.tsx`

**변경 1: `handleReply` 함수 - 비동기로 변경**
```typescript
// Before
const handleReply = (commentId: string, content: string) => {
  const newReply: Comment = {
    author: { name: '사용자', ... }  // ❌ 하드코딩
  }
}

// After
const handleReply = async (commentId: string, content: string) => {
  // Supabase에 저장
  const { data: newAnswer } = await supabase
    .from('community_answers')
    .insert({ parent_id: commentId, ... })
  
  const newReply: Comment = {
    author: { 
      name: profile?.nickname || '사용자',  // ✅ 프로필 사용
      avatar: profile?.avatar_url
    }
  }
}
```

**변경 2: `loadComments` 함수 - 중첩 구조 빌드**
```typescript
// Before
const comments: Comment[] = answersData.map(answer => ({...}))

// After
// 1. 플랫 리스트로 로드
const flatComments = answersData.map(answer => ({
  ...answer,
  parent_id: answer.parent_id
}))

// 2. 트리 구조로 변환
const commentMap = new Map()
const rootComments = []

flatComments.forEach(comment => {
  if (comment.parent_id) {
    parent.replies.push(comment)  // 대댓글
  } else {
    rootComments.push(comment)    // 최상위 댓글
  }
})
```

#### `app/components/qa-forum/CommentThread.tsx`

**변경: Comment 인터페이스에 parent_id 추가**
```typescript
export interface Comment {
  id: string
  content: string
  author: {...}
  parent_id?: string  // ✅ 추가
  replies?: Comment[]
}
```

---

## 📊 데이터베이스 구조

### Before (이전)
```
community_answers
├── id (UUID)
├── question_id (UUID)
├── author_id (UUID)
├── content (TEXT)
├── votes (INTEGER)
└── created_at (TIMESTAMP)
```

### After (변경 후)
```
community_answers
├── id (UUID)
├── question_id (UUID)
├── author_id (UUID)
├── content (TEXT)
├── votes (INTEGER)
├── parent_id (UUID) ← ✨ 새로 추가
└── created_at (TIMESTAMP)
```

### 관계도
```
community_answers (댓글)
  ├── parent_id = NULL (최상위 댓글)
  └── parent_id = UUID (대댓글)
       └── parent_id = UUID (대대댓글)
            └── ... (무한 중첩 가능)
```

---

## 🎯 작동 원리

### 1. 댓글 작성 시
```typescript
// 최상위 댓글
INSERT INTO community_answers (
  question_id = 'q-123',
  author_id = 'user-1',
  content = '댓글 내용',
  parent_id = NULL  ← 최상위
)
```

### 2. 대댓글 작성 시
```typescript
// 대댓글
INSERT INTO community_answers (
  question_id = 'q-123',
  author_id = 'user-2',
  content = '대댓글 내용',
  parent_id = 'comment-1'  ← 부모 댓글 ID
)
```

### 3. 댓글 로딩 시
```typescript
// 1. 모든 댓글 로드 (플랫)
SELECT * FROM community_answers 
WHERE question_id = 'q-123'
ORDER BY created_at ASC

// 2. JavaScript에서 트리 구조로 변환
[
  {
    id: 'c1',
    parent_id: null,
    replies: [
      {
        id: 'c2',
        parent_id: 'c1',
        replies: [
          { id: 'c3', parent_id: 'c2' }
        ]
      }
    ]
  }
]
```

---

## ✅ 해결된 문제

### 1. 닉네임 표시 문제 ✅
- **Before**: 대댓글에서 '사용자'로 고정 표시
- **After**: 실제 사용자 닉네임 표시

### 2. 데이터 영속성 문제 ✅
- **Before**: 대댓글이 새로고침하면 사라짐
- **After**: 데이터베이스에 저장되어 영구 보존

### 3. 프로필 정보 누락 ✅
- **Before**: 대댓글에 아바타 이미지 없음
- **After**: 프로필 아바타 자동 적용

---

## 🚀 배포 상태

- ✅ 코드 변경 완료
- ✅ 빌드 성공
- ✅ Git 커밋 완료 (cfa6ba93)
- ✅ GitHub 푸시 완료
- ✅ Vercel 자동 배포 진행 중
- ⚠️ **SQL 스크립트 실행 필요** (사용자 작업)

---

## 📝 후속 작업 (선택 사항)

### 1. 대댓글 수정/삭제 기능
현재는 최상위 댓글만 수정/삭제 가능합니다. 대댓글 수정/삭제는 이미 UI에 구현되어 있으며, 동일한 로직이 적용됩니다.

### 2. 대댓글 알림 기능
대댓글이 달렸을 때 원작성자에게 알림을 보내는 기능을 추가할 수 있습니다.

### 3. 대댓글 개수 표시
댓글에 대댓글이 몇 개 있는지 숫자로 표시하는 기능을 추가할 수 있습니다.

---

## 🐛 트러블슈팅

### 문제: SQL 스크립트 실행 시 오류
```
ERROR: column "parent_id" of relation "community_answers" already exists
```

**해결**: 이미 컬럼이 존재합니다. 무시하고 진행하세요.

---

### 문제: 대댓글 작성 후 화면에 안 보임
```
Failed to create reply: {...}
```

**원인**: SQL 스크립트를 실행하지 않았거나 RLS 정책 문제

**해결**:
1. `scripts/add-parent-id-to-answers.sql` 실행 확인
2. 브라우저 개발자도구 콘솔에서 에러 메시지 확인
3. Supabase Dashboard에서 RLS 정책 확인

---

### 문제: 닉네임이 여전히 '사용자'로 표시
```
author: { name: '사용자' }
```

**원인**: 프로필 정보가 없거나 로그인 세션 문제

**해결**:
1. 로그아웃 후 재로그인
2. `/profile` 페이지에서 닉네임 설정 확인
3. `profiles` 테이블에 `nickname` 컬럼 존재 확인

---

## 📞 지원

문제가 발생하면 다음 정보를 포함하여 문의하세요:
1. 브라우저 개발자도구 콘솔 스크린샷
2. Supabase SQL 실행 결과
3. 어떤 작업 중 문제가 발생했는지 설명

---

**작성일**: 2024-01-05  
**작성자**: Safe Pet Food 개발팀  
**버전**: 1.0.0
