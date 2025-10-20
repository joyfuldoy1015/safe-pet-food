# 🗄️ Supabase 설정 가이드

## 📋 Step 1: Supabase 프로젝트 생성

1. **Supabase 가입**: https://supabase.com 에서 무료 계정 생성
2. **새 프로젝트 생성**:
   - Organization: 새로 만들거나 기존 선택
   - Project Name: `safe-pet-food`
   - Database Password: 안전한 비밀번호 생성 (저장 필수!)
   - Region: `Northeast Asia (Seoul)` 선택 (한국 서비스이므로)
   - Pricing Plan: `Free` (500MB DB, 1GB 파일, 무제한 API)

## 🔑 Step 2: API 키 가져오기

1. 프로젝트 대시보드에서 **Settings** > **API** 클릭
2. 다음 값들을 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📄 Step 3: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI (선택사항)
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

## 🗃️ Step 4: 데이터베이스 테이블 생성

Supabase 대시보드에서 **SQL Editor** 클릭 후 아래 SQL 실행:

### 1. Brands 테이블
```sql
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  manufacturer TEXT NOT NULL,
  country TEXT NOT NULL,
  overall_rating DECIMAL(2,1) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  established_year INTEGER,
  product_lines TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  recall_history JSONB DEFAULT '[]',
  brand_description TEXT,
  manufacturing_info TEXT,
  brand_pros TEXT[] DEFAULT '{}',
  brand_cons TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_country ON brands(country);
CREATE INDEX idx_brands_rating ON brands(overall_rating DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Allow public read access" ON brands
  FOR SELECT USING (true);

-- 인증된 사용자만 생성/수정/삭제 (관리자용)
CREATE POLICY "Allow authenticated users to insert" ON brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON brands
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON brands
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 2. Products 테이블
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'treats', 'supplements', 'litter')),
  image TEXT,
  description TEXT,
  certifications TEXT[] DEFAULT '{}',
  origin_info JSONB,
  ingredients TEXT[] DEFAULT '{}',
  guaranteed_analysis JSONB,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);

-- RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- 인증된 사용자만 생성/수정/삭제
CREATE POLICY "Allow authenticated users to insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 3. Reviews 테이블
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  palatability INTEGER CHECK (palatability >= 1 AND palatability <= 5),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  repurchase_intent BOOLEAN,
  comment TEXT,
  benefits TEXT[] DEFAULT '{}',
  side_effects TEXT[] DEFAULT '{}',
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_brand_id ON reviews(brand_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);

-- RLS 활성화
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Allow public read access" ON reviews
  FOR SELECT USING (true);

-- 사용자는 자신의 리뷰만 생성/수정/삭제
CREATE POLICY "Users can insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Pet Logs 테이블
```sql
CREATE TABLE pet_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('feeding', 'completed', 'stopped')),
  duration TEXT,
  palatability INTEGER CHECK (palatability >= 1 AND palatability <= 5),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  repurchase_intent BOOLEAN,
  comment TEXT,
  price TEXT,
  purchase_location TEXT,
  side_effects TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_pet_logs_user_id ON pet_logs(user_id);
CREATE INDEX idx_pet_logs_product_id ON pet_logs(product_id);
CREATE INDEX idx_pet_logs_status ON pet_logs(status);
CREATE INDEX idx_pet_logs_views ON pet_logs(views DESC);

-- RLS 활성화
ALTER TABLE pet_logs ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Allow public read access" ON pet_logs
  FOR SELECT USING (true);

-- 사용자는 자신의 펫 로그만 생성/수정/삭제
CREATE POLICY "Users can insert their own pet logs" ON pet_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet logs" ON pet_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet logs" ON pet_logs
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. QA Posts 테이블
```sql
CREATE TABLE qa_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_qa_posts_user_id ON qa_posts(user_id);
CREATE INDEX idx_qa_posts_category ON qa_posts(category);
CREATE INDEX idx_qa_posts_views ON qa_posts(views DESC);
CREATE INDEX idx_qa_posts_created_at ON qa_posts(created_at DESC);

-- RLS 활성화
ALTER TABLE qa_posts ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Allow public read access" ON qa_posts
  FOR SELECT USING (true);

-- 인증된 사용자는 게시글 작성 가능
CREATE POLICY "Authenticated users can insert" ON qa_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 사용자는 자신의 게시글만 수정/삭제
CREATE POLICY "Users can update their own posts" ON qa_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON qa_posts
  FOR DELETE USING (auth.uid() = user_id);
```

### 6. Updated At Trigger (자동 업데이트 시간 갱신)
```sql
-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_logs_updated_at BEFORE UPDATE ON pet_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qa_posts_updated_at BEFORE UPDATE ON qa_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📊 Step 5: 초기 데이터 삽입 (선택사항)

```sql
-- 샘플 브랜드 데이터
INSERT INTO brands (name, manufacturer, country, overall_rating, established_year, brand_description)
VALUES 
  ('로얄캐닌', 'Royal Canin SAS', 'France', 4.5, 1968, '프랑스의 프리미엄 반려동물 사료 브랜드'),
  ('힐스', 'Hill''s Pet Nutrition', 'USA', 4.3, 1939, '수의사들이 추천하는 과학적 영양 사료');

-- 샘플 제품 데이터 (브랜드 ID 확인 후 삽입)
-- 먼저 브랜드 ID 조회: SELECT id FROM brands WHERE name = '로얄캐닌';
```

## 🔒 Step 6: 인증 설정 (선택사항)

Supabase 대시보드에서 **Authentication** > **Providers**:
- Email 인증 활성화
- 소셜 로그인 설정 (Google, GitHub 등)

## 🚀 Step 7: Vercel 환경 변수 설정

Vercel 대시보드에서:
1. 프로젝트 선택
2. **Settings** > **Environment Variables**
3. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ✅ 완료!

이제 애플리케이션에서 Supabase를 사용할 수 있습니다!

### 사용 예시

```typescript
import { supabase } from '@/lib/supabase'

// 브랜드 목록 조회
const { data: brands, error } = await supabase
  .from('brands')
  .select('*')
  .order('overall_rating', { ascending: false })

// 브랜드 생성
const { data, error } = await supabase
  .from('brands')
  .insert([{ name: '새 브랜드', manufacturer: '제조사' }])
```

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

