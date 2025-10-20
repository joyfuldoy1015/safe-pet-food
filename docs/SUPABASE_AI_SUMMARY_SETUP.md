# AI 요약 기능 구현 가이드

## 🎯 개요
사용자 리뷰를 기반으로 AI가 자동으로 브랜드의 "신뢰하는 이유"와 "보완하면 좋은 점"을 요약하고, 관리자가 검토 후 승인하는 하이브리드 시스템

---

## 📊 데이터베이스 구조

### 1. `brands` 테이블에 추가된 필드

```sql
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ai_summary_status TEXT DEFAULT 'pending';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ai_summary_review_count INTEGER DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ai_summary_last_generated TIMESTAMP;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ai_summary_last_approved TIMESTAMP;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ai_summary_draft_pros TEXT[];
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ai_summary_draft_cons TEXT[];
```

**필드 설명:**
- `ai_summary_status`: `'pending'` | `'draft'` | `'approved'`
  - `pending`: AI 요약 미생성
  - `draft`: AI가 초안 생성, 관리자 검토 대기
  - `approved`: 관리자가 승인하여 실제 `brand_pros`/`brand_cons`에 반영됨
- `ai_summary_review_count`: AI 요약 생성 시 참고한 리뷰 개수
- `ai_summary_last_generated`: 마지막 AI 요약 생성 시간
- `ai_summary_last_approved`: 관리자가 승인한 시간
- `ai_summary_draft_pros`: AI가 생성한 "신뢰하는 이유" 초안
- `ai_summary_draft_cons`: AI가 생성한 "보완하면 좋은 점" 초안

### 2. `brand_summary_history` 테이블 (이력 관리)

```sql
CREATE TABLE IF NOT EXISTS brand_summary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  summary_type TEXT NOT NULL, -- 'auto' or 'manual'
  review_count INTEGER NOT NULL,
  pros TEXT[] NOT NULL,
  cons TEXT[] NOT NULL,
  status TEXT NOT NULL, -- 'draft', 'approved', 'rejected'
  created_by TEXT, -- 'system' or admin user id
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_brand_summary_history_brand_id ON brand_summary_history(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_summary_history_status ON brand_summary_history(status);
```

---

## 🔧 API 엔드포인트

### 1. `POST /api/brands/[brandName]/ai-summary/generate`
**기능**: 사용자 리뷰를 분석하여 AI 요약 초안 생성

**요청:**
```json
{
  "brandId": "uuid"
}
```

**응답:**
```json
{
  "status": "success",
  "data": {
    "brand_id": "uuid",
    "pros": ["장점1", "장점2", "장점3"],
    "cons": ["단점1", "단점2", "단점3"],
    "review_count": 45,
    "generated_at": "2024-12-20T10:00:00Z"
  }
}
```

**구현 로직:**
1. 브랜드의 모든 리뷰 조회 (`/api/brands/[brandName]/evaluate` 에서 저장된 데이터)
2. OpenAI/Claude API 호출하여 요약 생성
3. `brands` 테이블에 `ai_summary_draft_pros`, `ai_summary_draft_cons` 업데이트
4. `ai_summary_status`를 `'draft'`로 변경
5. `brand_summary_history`에 이력 저장

---

### 2. `POST /api/brands/[brandName]/ai-summary/approve`
**기능**: 관리자가 AI 요약 초안을 검토하고 승인

**요청:**
```json
{
  "brandId": "uuid",
  "pros": ["수정된 장점1", "장점2"],
  "cons": ["수정된 단점1", "단점2"],
  "action": "approve" // or "reject"
}
```

**응답:**
```json
{
  "status": "success",
  "message": "AI 요약이 승인되어 브랜드 페이지에 반영되었습니다."
}
```

**구현 로직:**
1. `action`이 `'approve'`인 경우:
   - `brand_pros` ← `pros` (관리자가 수정한 내용)
   - `brand_cons` ← `cons`
   - `ai_summary_status` ← `'approved'`
   - `ai_summary_last_approved` ← 현재 시간
2. `action`이 `'reject'`인 경우:
   - `ai_summary_status` ← `'pending'`
   - 초안 데이터 삭제
3. `brand_summary_history` 업데이트

---

## 🤖 AI 프롬프트 템플릿

### OpenAI GPT-4 프롬프트

```typescript
const generatePrompt = (brandName: string, reviews: Review[]) => {
  const reviewTexts = reviews
    .map((r, i) => `${i + 1}. [평점: ${r.rating}/5] ${r.comment}`)
    .join('\n');

  return `
당신은 반려동물 사료 전문 분석가입니다.

다음은 "${brandName}" 브랜드에 대한 실제 사용자 리뷰 ${reviews.length}개입니다:

${reviewTexts}

위 리뷰들을 종합적으로 분석하여 다음을 작성해주세요:

1. **신뢰하는 이유** (Pros): 긍정적인 측면 3-5개
   - 각 항목은 명확하고 구체적으로 작성
   - 객관적 사실 위주로 작성
   - 한 줄로 간결하게 작성

2. **보완하면 좋은 점** (Cons): 개선이 필요한 측면 3-5개
   - 건설적인 비판으로 작성
   - 사용자 피드백을 반영
   - 한 줄로 간결하게 작성

응답은 반드시 다음 JSON 형식으로 작성해주세요:
{
  "brand_pros": ["항목1", "항목2", "항목3"],
  "brand_cons": ["항목1", "항목2", "항목3"]
}

중요:
- 리뷰 내용이 부족하거나 불명확한 경우, 일반적인 내용이 아닌 리뷰에서 언급된 구체적인 내용만 포함
- 리뷰가 10개 미만인 경우, 각 카테고리당 2-3개 항목만 작성
- 중복되는 내용은 하나로 통합
- 사용자가 실제로 언급한 내용만 포함 (추측 금지)
`;
};
```

---

## 💻 프론트엔드 구현

### 1. 관리자 페이지 - AI 요약 검토 모달

**위치**: `app/admin/brands/page.tsx`

**기능:**
- AI가 생성한 초안을 보여줌
- 관리자가 각 항목을 수정할 수 있음
- "승인" 또는 "거부" 버튼

**UI 예시:**
```tsx
{showAIReviewModal && selectedBrandForAI && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">
          AI 요약 검토 - {selectedBrandForAI.name}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {selectedBrandForAI.ai_summary_review_count}개의 리뷰를 기반으로 생성됨
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* 신뢰하는 이유 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            신뢰하는 이유 (한 줄에 하나씩)
          </label>
          <textarea
            value={aiDraftPros}
            onChange={(e) => setAiDraftPros(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="각 항목을 줄바꿈으로 구분하세요"
          />
        </div>
        
        {/* 보완하면 좋은 점 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            보완하면 좋은 점 (한 줄에 하나씩)
          </label>
          <textarea
            value={aiDraftCons}
            onChange={(e) => setAiDraftCons(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="각 항목을 줄바꿈으로 구분하세요"
          />
        </div>
      </div>
      
      <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
        <button
          onClick={() => handleAIApprove('reject')}
          className="px-4 py-2 text-gray-700 bg-white border rounded-lg"
        >
          거부
        </button>
        <button
          onClick={() => handleAIApprove('approve')}
          className="px-4 py-2 text-white bg-green-600 rounded-lg"
        >
          승인 및 반영
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 🔄 워크플로우

### 자동 생성 트리거 (나중에 구현)
```typescript
// 새 리뷰가 10개 추가될 때마다 자동 생성
if (reviewCount % 10 === 0) {
  await fetch(`/api/brands/${brandName}/ai-summary/generate`, {
    method: 'POST',
    body: JSON.stringify({ brandId })
  });
}
```

### 관리자 수동 트리거 (현재 구현됨)
1. 관리자가 브랜드 목록에서 "생성" 버튼 클릭
2. API 호출하여 AI 요약 생성
3. 생성 완료 후 상태가 "검토 대기"로 변경
4. 관리자가 "검토" 버튼 클릭하여 모달 열기
5. 초안 확인 및 수정
6. "승인" 클릭하여 브랜드 페이지에 반영

---

## 🚀 구현 순서

### ✅ Phase 1: 데이터베이스 및 UI (완료)
- [x] Supabase 테이블 구조 설계
- [x] `brands` 테이블에 AI 요약 필드 추가
- [x] `brand_summary_history` 테이블 생성
- [x] 관리자 페이지에 AI 요약 상태 표시
- [x] "AI 요약 생성" 버튼 추가

### 🔄 Phase 2: API 엔드포인트 (다음 단계)
- [ ] `POST /api/brands/[brandName]/ai-summary/generate` 구현
- [ ] `POST /api/brands/[brandName]/ai-summary/approve` 구현
- [ ] OpenAI API 연동 (환경변수: `OPENAI_API_KEY`)
- [ ] 에러 핸들링 및 로깅

### 🔄 Phase 3: 프론트엔드 완성 (다음 단계)
- [ ] AI 요약 검토 모달 구현
- [ ] 로딩 상태 및 에러 처리
- [ ] 승인/거부 액션 연결

### 🔄 Phase 4: 자동화 (선택 사항)
- [ ] 리뷰 개수 기반 자동 트리거
- [ ] 주기적 배치 작업 (Vercel Cron Jobs)
- [ ] 이메일 알림 (관리자에게 검토 요청)

---

## 🔐 환경 변수

`.env.local`에 추가:
```bash
# OpenAI API (나중에 추가)
OPENAI_API_KEY=sk-...

# 또는 Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# 또는 Google Gemini
GOOGLE_AI_API_KEY=AIza...
```

---

## 📝 주의사항

1. **리뷰 데이터 수집**: `/brands/[brandName]/evaluate` 페이지의 리뷰 데이터가 Supabase에 저장되어야 함
2. **비용 관리**: OpenAI API 호출 비용을 고려하여 자동 생성 빈도 조절
3. **품질 관리**: 관리자가 반드시 검토 후 승인하도록 강제
4. **버전 관리**: `brand_summary_history`에 모든 변경 이력 저장

---

## 🎉 완성 후 기대 효과

1. **관리자 부담 감소**: 수동으로 작성하던 장단점을 AI가 초안 생성
2. **객관성 향상**: 실제 사용자 리뷰 기반으로 요약
3. **최신성 유지**: 새 리뷰가 쌓일 때마다 자동 업데이트 가능
4. **품질 보장**: 관리자의 최종 검토로 정확성 확보

---

**작성일**: 2024년 12월
**담당**: Safe Pet Food 개발팀

