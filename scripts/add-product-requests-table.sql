-- 사용자 제품 등록 요청 테이블
-- Safe Pet Food - 옵션 C: 사용자 요청 → 운영자 승인

-- ============================================
-- product_requests 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS product_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 요청자 정보
  requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name TEXT,
  
  -- 제품 정보
  brand_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT DEFAULT 'feed', -- feed, treat, supplement
  description TEXT,
  
  -- 요청 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- 운영자 처리 정보
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- 승인 시 생성된 제품 ID
  approved_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_requester_id ON product_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_created_at ON product_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_requests_brand_name ON product_requests(brand_name);

-- RLS (Row Level Security) 활성화
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;

-- 정책 생성
-- 1. 사용자는 자신의 요청만 조회 가능
DROP POLICY IF EXISTS "Users can view own requests" ON product_requests;
CREATE POLICY "Users can view own requests" ON product_requests
  FOR SELECT USING (auth.uid() = requester_id);

-- 2. 인증된 사용자는 요청 생성 가능
DROP POLICY IF EXISTS "Authenticated users can create requests" ON product_requests;
CREATE POLICY "Authenticated users can create requests" ON product_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. 인증된 사용자는 모든 요청 조회 가능 (실제 관리자 권한 체크는 애플리케이션 레벨에서 수행)
DROP POLICY IF EXISTS "Authenticated users can view all requests" ON product_requests;
CREATE POLICY "Authenticated users can view all requests" ON product_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. 인증된 사용자는 요청 수정 가능 (실제 관리자 권한 체크는 애플리케이션 레벨에서 수행)
DROP POLICY IF EXISTS "Authenticated users can update requests" ON product_requests;
CREATE POLICY "Authenticated users can update requests" ON product_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 컬럼 설명 추가
COMMENT ON TABLE product_requests IS '사용자 제품 등록 요청 테이블. 운영자가 검토 후 승인/거절합니다.';
COMMENT ON COLUMN product_requests.status IS '요청 상태: pending(대기), approved(승인), rejected(거절)';
COMMENT ON COLUMN product_requests.approved_product_id IS '승인 시 생성된 products 테이블의 제품 ID';

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_product_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_requests_updated_at ON product_requests;
CREATE TRIGGER trigger_update_product_requests_updated_at
  BEFORE UPDATE ON product_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_product_requests_updated_at();
