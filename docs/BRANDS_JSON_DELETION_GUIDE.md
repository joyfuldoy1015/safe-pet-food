# brands.json 파일 삭제 가이드

## 📋 현재 상황

`data/brands.json` 파일은 현재 **fallback 데이터**로 사용되고 있습니다.

### 사용 위치
1. `app/api/brands/route.ts` - 브랜드 목록 API (fallback)
2. `app/api/brands/[brandName]/route.ts` - 브랜드 상세 API (fallback)

### 작동 방식
```
Supabase에서 데이터 조회
    ↓
성공 + 데이터 있음 → Supabase 데이터 반환 ✅
    ↓
실패 또는 데이터 없음 → brands.json fallback ⚠️
```

## ✅ 삭제 전 확인 사항

### 1단계: Supabase 데이터 마이그레이션 완료 확인
- [ ] Brands 데이터가 Supabase에 정상적으로 마이그레이션되었는지 확인
- [ ] Supabase Dashboard → Table Editor → `brands` 테이블에서 데이터 확인
- [ ] 데이터 개수가 JSON 파일과 일치하는지 확인

### 2단계: API 테스트
- [ ] 로컬에서 `/api/brands` API 호출 테스트
- [ ] Supabase에서 데이터가 정상적으로 반환되는지 확인
- [ ] 브라우저에서 `/brands` 페이지가 정상 작동하는지 확인

### 3단계: Fallback 제거 (선택사항)
마이그레이션이 완료되고 Supabase가 안정적으로 작동한다면, fallback 로직을 제거할 수 있습니다.

## 🚨 삭제 방법

### 방법 1: 안전한 삭제 (권장)

1. **백업 생성**
   ```bash
   cp data/brands.json data/brands.json.backup
   ```

2. **마이그레이션 실행**
   ```bash
   npx tsx scripts/migrate-brands-to-supabase.ts
   ```

3. **테스트**
   - 로컬에서 API 테스트
   - 프로덕션에서 API 테스트
   - 모든 기능이 정상 작동하는지 확인

4. **Fallback 로직 제거 (선택)**
   - `app/api/brands/route.ts`에서 fallback 코드 제거
   - `app/api/brands/[brandName]/route.ts`에서 fallback 코드 제거

5. **JSON 파일 삭제**
   ```bash
   rm data/brands.json
   ```

### 방법 2: 즉시 삭제 (위험)

⚠️ **주의**: 이 방법은 Supabase가 완벽하게 작동할 때만 사용하세요.

1. 마이그레이션 완료 확인
2. JSON 파일 삭제
3. Fallback 로직 제거

## 💡 권장 사항

### 옵션 A: 백업 후 삭제 (가장 안전)
```bash
# 1. 백업 생성
cp data/brands.json data/brands.json.backup

# 2. 마이그레이션 실행
npx tsx scripts/migrate-brands-to-supabase.ts

# 3. 테스트 완료 후 삭제
rm data/brands.json
```

### 옵션 B: Fallback 유지 (안전)
- JSON 파일을 백업 폴더로 이동
- Fallback 로직은 유지 (Supabase 장애 시 대비)
- 프로덕션에서는 Supabase만 사용하도록 보장

### 옵션 C: 점진적 제거
1. 마이그레이션 완료
2. Fallback 로직에 로깅 추가 (사용 여부 모니터링)
3. 일정 기간 모니터링 후 삭제

## 🔍 Fallback 로직 제거 방법

### `app/api/brands/route.ts` 수정

**Before:**
```typescript
// Fallback: JSON 파일에서 브랜드 데이터 가져오기
let brands = brandsData as any[]
// ... fallback 로직
```

**After:**
```typescript
// Supabase에서 데이터를 가져오지 못한 경우 에러 반환
if (!data || data.length === 0) {
  return NextResponse.json(
    { error: 'No brands found' },
    { status: 404 }
  )
}
```

## ✅ 체크리스트

삭제 전 확인:
- [ ] Supabase에 데이터 마이그레이션 완료
- [ ] 로컬 API 테스트 성공
- [ ] 프로덕션 API 테스트 성공
- [ ] 브라우저에서 페이지 정상 작동 확인
- [ ] 백업 파일 생성 완료
- [ ] Fallback 로직 제거 (선택)

## 📝 참고

- JSON 파일은 Git에 커밋되어 있으므로 필요 시 복구 가능
- 삭제 후에도 Git 히스토리에서 복구 가능
- 하지만 안전을 위해 백업을 권장합니다

