# Mock Data → 실제 데이터 마이그레이션 가이드

## 📋 현재 상황

- ✅ Supabase 클라이언트 이미 설정됨 (`lib/supabase.ts`)
- ✅ JSON 파일 데이터 존재 (`data/` 폴더)
- ⚠️ 현재 localStorage 사용 (pet-log 등)
- ⚠️ Mock data를 하드코딩으로 사용 중

## 🎯 목표

모든 mock data를 실제 데이터베이스(Supabase)에서 관리하도록 전환

## 🚀 단계별 마이그레이션 계획

### 1단계: Supabase 프로젝트 설정 (10분)

#### 1.1 Supabase 프로젝트 생성

1. https://supabase.com 접속 및 가입
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `safe-pet-food`
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: `Free` 선택

#### 1.2 API 키 가져오기

1. 프로젝트 대시보드 → **Settings** → **API**
2. 다음 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 1.3 환경 변수 설정

**로컬 개발 환경 (`.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Vercel 프로덕션 환경:**
1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 위 두 변수 추가

### 2단계: 데이터베이스 스키마 생성 (15분)

Supabase 대시보드 → **SQL Editor** 클릭 후 아래 SQL 실행:

#### 2.1 Brands 테이블
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
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_country ON brands(country);
CREATE INDEX idx_brands_rating ON brands(overall_rating DESC);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage" ON brands
  FOR ALL USING (auth.role() = 'authenticated');
```

#### 2.2 Pet Logs 테이블
```sql
CREATE TABLE pet_log_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  pet_breed TEXT NOT NULL,
  pet_age TEXT NOT NULL,
  pet_weight TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_records INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT false
);

CREATE TABLE pet_log_feeding_records (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES pet_log_posts(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('사료', '간식', '영양제', '화장실')),
  brand TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('급여중', '급여완료', '급여중지')),
  duration TEXT,
  palatability INTEGER CHECK (palatability >= 1 AND palatability <= 5),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  repurchase_intent BOOLEAN,
  comment TEXT,
  price TEXT,
  purchase_location TEXT,
  side_effects TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pet_log_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES pet_log_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT false,
  replies JSONB DEFAULT '[]'
);

CREATE INDEX idx_pet_log_posts_user_id ON pet_log_posts(user_id);
CREATE INDEX idx_pet_log_posts_created_at ON pet_log_posts(created_at DESC);
CREATE INDEX idx_feeding_records_post_id ON pet_log_feeding_records(post_id);
CREATE INDEX idx_comments_post_id ON pet_log_comments(post_id);

ALTER TABLE pet_log_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_log_feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_log_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON pet_log_posts
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON pet_log_feeding_records
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON pet_log_comments
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert" ON pet_log_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON pet_log_feeding_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON pet_log_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### 2.3 Feed Grade Analysis 테이블
```sql
CREATE TABLE feed_grade_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  feed_name TEXT NOT NULL,
  brand_name TEXT,
  category TEXT,
  raw_material_quality INTEGER CHECK (raw_material_quality >= 0 AND raw_material_quality <= 20),
  detailed_labeling INTEGER CHECK (detailed_labeling >= 0 AND detailed_labeling <= 20),
  safety INTEGER CHECK (safety >= 0 AND safety <= 20),
  nutritional_standard INTEGER CHECK (nutritional_standard >= 0 AND nutritional_standard <= 20),
  preservative_type INTEGER CHECK (preservative_type >= 0 AND preservative_type <= 20),
  total_score INTEGER,
  grade TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feed_grade_analyses_user_id ON feed_grade_analyses(user_id);
CREATE INDEX idx_feed_grade_analyses_created_at ON feed_grade_analyses(created_at DESC);

ALTER TABLE feed_grade_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON feed_grade_analyses
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert" ON feed_grade_analyses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### 2.4 Updated At 트리거
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_log_posts_updated_at BEFORE UPDATE ON pet_log_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_grade_analyses_updated_at BEFORE UPDATE ON feed_grade_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3단계: 기존 JSON 데이터 마이그레이션 (10분)

**`scripts/migrate-to-supabase.ts` 파일 생성:**

```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateBrands() {
  const brandsData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data/brands.json'), 'utf-8')
  )

  for (const brand of brandsData) {
    const { error } = await supabase.from('brands').insert({
      name: brand.name,
      manufacturer: brand.manufacturer || brand.manufacturer,
      country: brand.country,
      overall_rating: brand.overall_rating,
      established_year: brand.established_year,
      product_lines: brand.product_lines || [],
      certifications: brand.certifications || [],
      recall_history: brand.recall_history || [],
      brand_description: brand.description,
      image: brand.image
    })

    if (error) {
      console.error(`Failed to migrate ${brand.name}:`, error)
    } else {
      console.log(`✓ Migrated: ${brand.name}`)
    }
  }
}

async function main() {
  console.log('Starting data migration...')
  await migrateBrands()
  console.log('Migration completed!')
}

main()
```

**실행:**
```bash
npx tsx scripts/migrate-to-supabase.ts
```

### 4단계: API 라우트 업데이트 (각 기능별로 진행)

#### 4.1 Brands API 업데이트

**`app/api/brands/route.ts` 수정:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - 브랜드 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('overall_rating', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Failed to fetch brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST - 새 브랜드 추가
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const { data: brand, error } = await supabase
      .from('brands')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Failed to create brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
```

#### 4.2 Pet Log API 생성

**`app/api/pet-log/posts/route.ts` 생성:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - 펫 로그 포스트 목록
export async function GET(request: NextRequest) {
  try {
    const { data: posts, error: postsError } = await supabase
      .from('pet_log_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (postsError) throw postsError

    // 각 포스트에 대한 급여 기록 가져오기
    const postsWithRecords = await Promise.all(
      posts.map(async (post) => {
        const { data: records } = await supabase
          .from('pet_log_feeding_records')
          .select('*')
          .eq('post_id', post.id)

        const { data: comments } = await supabase
          .from('pet_log_comments')
          .select('*')
          .eq('post_id', post.id)

        return {
          ...post,
          feedingRecords: records || [],
          comments: comments || [],
          totalComments: comments?.length || 0
        }
      })
    )

    return NextResponse.json(postsWithRecords)
  } catch (error) {
    console.error('Failed to fetch pet log posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - 새 펫 로그 포스트 생성
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { posts, feedingRecords } = data

    // 포스트 생성
    const { data: newPost, error: postError } = await supabase
      .from('pet_log_posts')
      .insert([posts])
      .select()
      .single()

    if (postError) throw postError

    // 급여 기록 생성
    if (feedingRecords && feedingRecords.length > 0) {
      const recordsToInsert = feedingRecords.map((record: any) => ({
        ...record,
        post_id: newPost.id
      }))

      const { error: recordsError } = await supabase
        .from('pet_log_feeding_records')
        .insert(recordsToInsert)

      if (recordsError) throw recordsError
    }

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Failed to create pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
```

#### 4.3 Pet Log 상세 API

**`app/api/pet-log/posts/[postId]/route.ts` 생성:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId

    // 포스트 가져오기
    const { data: post, error: postError } = await supabase
      .from('pet_log_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError) throw postError

    // 급여 기록 가져오기
    const { data: records } = await supabase
      .from('pet_log_feeding_records')
      .select('*')
      .eq('post_id', postId)

    // 댓글 가져오기
    const { data: comments } = await supabase
      .from('pet_log_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      ...post,
      feedingRecords: records || [],
      comments: comments || [],
      totalComments: comments?.length || 0
    })
  } catch (error) {
    console.error('Failed to fetch pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
```

### 5단계: 클라이언트 컴포넌트 업데이트

#### 5.1 Pet Log 페이지 업데이트

**`app/pet-log/page.tsx` 수정:**

```typescript
// localStorage 대신 API 호출로 변경
useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/pet-log/posts')
      const data = await response.json()
      setAllPosts(data)
    } catch (error) {
      console.error('포스트 로드 중 오류:', error)
      // Fallback to mock data
      setAllPosts(detailedPosts)
    }
  }
  
  fetchPosts()
}, [])
```

#### 5.2 Pet Log 작성 페이지 업데이트

**`app/pet-log/posts/write/page.tsx` 수정:**

```typescript
const submitPost = async () => {
  // ... validation code ...

  try {
    const response = await fetch('/api/pet-log/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        posts: {
          id: postId,
          ...petInfo,
          ownerId: currentUser?.id,
          totalRecords: feedingRecords.length
        },
        feedingRecords: feedingRecords
      })
    })

    if (!response.ok) throw new Error('Failed to create post')

    router.push(`/pet-log/posts/${postId}`)
  } catch (error) {
    console.error('포스트 저장 중 오류:', error)
    alert('포스트 저장에 실패했습니다.')
  }
}
```

### 6단계: 마이그레이션 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료 (로컬 & Vercel)
- [ ] 데이터베이스 테이블 생성 완료
- [ ] 기존 JSON 데이터 마이그레이션 완료
- [ ] Brands API 업데이트 완료
- [ ] Pet Log API 생성 완료
- [ ] Feed Grade Analysis API 생성 완료
- [ ] 클라이언트 컴포넌트 업데이트 완료
- [ ] 로컬 테스트 완료
- [ ] 프로덕션 배포 및 테스트 완료

### 7단계: 점진적 마이그레이션 전략

1. **Phase 1**: Brands 데이터만 마이그레이션
2. **Phase 2**: Pet Log 데이터 마이그레이션
3. **Phase 3**: Feed Grade Analysis 마이그레이션
4. **Phase 4**: 나머지 기능 마이그레이션

각 Phase마다 충분히 테스트 후 다음 단계 진행!

## ⚠️ 주의사항

1. **백업 필수**: 마이그레이션 전 기존 데이터 백업
2. **점진적 전환**: 한 번에 모두 전환하지 말고 단계별로 진행
3. **Fallback 전략**: API 실패 시 기존 mock data로 fallback
4. **에러 핸들링**: 모든 API 호출에 try-catch 및 에러 처리 필수

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)

