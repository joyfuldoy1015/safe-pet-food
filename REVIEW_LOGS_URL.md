# Review Logs 실제 데이터 URL

## 방금 작성한 후기를 볼 수 있는 페이지

```
http://localhost:3000/owners/97562a83-669d-4298-9d8e-e866cba61d6f/pets/f84b515e-f952-4197-a4f4-a1307677ef7c
```

## 데이터 정보

- **Owner ID**: `97562a83-669d-4298-9d8e-e866cba61d6f`
- **Pet ID**: `f84b515e-f952-4197-a4f4-a1307677ef7c`

---

## 왜 Mock URL에서는 안 보였나요?

### Mock URL (데이터 없음):
```
http://localhost:3000/owners/owner-1/pets/pet-1
```

- `owner-1`, `pet-1`은 mock 데이터용 ID
- 실제 Supabase에는 이 ID로 저장된 데이터가 없음

### 실제 URL (데이터 있음):
```
http://localhost:3000/owners/97562a83-669d-4298-9d8e-e866cba61d6f/pets/f84b515e-f952-4197-a4f4-a1307677ef7c
```

- 로그인한 사용자의 실제 UUID
- Supabase에 실제로 저장된 ID와 매치됨

---

## 앞으로 후기를 보려면?

### 방법 1: 프로필 페이지에서
```
http://localhost:3000/profile
```
→ 내가 작성한 모든 후기 목록

### 방법 2: Pet Log 메인 페이지에서
```
http://localhost:3000/pet-log
```
→ 전체 후기 피드 (모든 사용자)

### 방법 3: 특정 반려동물 페이지
```
http://localhost:3000/owners/[owner_id]/pets/[pet_id]
```
→ 특정 반려동물의 후기만
