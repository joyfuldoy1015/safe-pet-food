#!/bin/bash

# 🚨 Safe Pet Food 긴급 복구 스크립트
# 사용법: ./scripts/emergency-reset.sh

echo "🚨 Safe Pet Food 긴급 복구 시작..."

# 1. 모든 Next.js 프로세스 종료
echo "1️⃣ Next.js 프로세스 종료 중..."
pkill -f "next dev" 2>/dev/null || echo "   - 실행 중인 Next.js 프로세스 없음"

# 2. 빌드 캐시 삭제
echo "2️⃣ 빌드 캐시 삭제 중..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "   - .next 폴더 삭제 완료"
else
    echo "   - .next 폴더 없음"
fi

# 3. 노드 모듈 캐시 삭제
echo "3️⃣ 노드 모듈 캐시 삭제 중..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "   - node_modules/.cache 삭제 완료"
else
    echo "   - node_modules/.cache 없음"
fi

# 4. Git 상태 확인
echo "4️⃣ Git 상태 확인..."
git status --porcelain | head -5

# 5. 마지막 작동 상태로 롤백 (선택사항)
echo "5️⃣ 롤백이 필요한가요? (y/N)"
read -t 10 -r rollback_choice
if [[ $rollback_choice =~ ^[Yy]$ ]]; then
    echo "   - 변경사항 롤백 중..."
    git checkout -- .
    echo "   - 롤백 완료"
else
    echo "   - 롤백 건너뜀"
fi

# 6. 개발 서버 재시작
echo "6️⃣ 개발 서버 재시작 중..."
npm run dev &
SERVER_PID=$!

# 7. 서버 상태 확인
echo "7️⃣ 서버 상태 확인 중..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ 서버 복구 완료! http://localhost:3000"
else
    echo "❌ 서버 복구 실패. 수동 확인 필요"
    echo "   - 터미널에서 'npm run dev' 실행"
    echo "   - 에러 메시지 확인"
fi

echo ""
echo "🔍 추가 도움이 필요하면:"
echo "   - docs/ERROR_HANDLING_GUIDE.md 참고"
echo "   - .cursorrules 파일 확인"
echo ""
echo "�� 복구 완료 시간: $(date)" 

# 🚨 Safe Pet Food 긴급 복구 스크립트
# 사용법: ./scripts/emergency-reset.sh

echo "🚨 Safe Pet Food 긴급 복구 시작..."

# 1. 모든 Next.js 프로세스 종료
echo "1️⃣ Next.js 프로세스 종료 중..."
pkill -f "next dev" 2>/dev/null || echo "   - 실행 중인 Next.js 프로세스 없음"

# 2. 빌드 캐시 삭제
echo "2️⃣ 빌드 캐시 삭제 중..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "   - .next 폴더 삭제 완료"
else
    echo "   - .next 폴더 없음"
fi

# 3. 노드 모듈 캐시 삭제
echo "3️⃣ 노드 모듈 캐시 삭제 중..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "   - node_modules/.cache 삭제 완료"
else
    echo "   - node_modules/.cache 없음"
fi

# 4. Git 상태 확인
echo "4️⃣ Git 상태 확인..."
git status --porcelain | head -5

# 5. 마지막 작동 상태로 롤백 (선택사항)
echo "5️⃣ 롤백이 필요한가요? (y/N)"
read -t 10 -r rollback_choice
if [[ $rollback_choice =~ ^[Yy]$ ]]; then
    echo "   - 변경사항 롤백 중..."
    git checkout -- .
    echo "   - 롤백 완료"
else
    echo "   - 롤백 건너뜀"
fi

# 6. 개발 서버 재시작
echo "6️⃣ 개발 서버 재시작 중..."
npm run dev &
SERVER_PID=$!

# 7. 서버 상태 확인
echo "7️⃣ 서버 상태 확인 중..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ 서버 복구 완료! http://localhost:3000"
else
    echo "❌ 서버 복구 실패. 수동 확인 필요"
    echo "   - 터미널에서 'npm run dev' 실행"
    echo "   - 에러 메시지 확인"
fi

echo ""
echo "🔍 추가 도움이 필요하면:"
echo "   - docs/ERROR_HANDLING_GUIDE.md 참고"
echo "   - .cursorrules 파일 확인"
echo ""
echo "�� 복구 완료 시간: $(date)" 