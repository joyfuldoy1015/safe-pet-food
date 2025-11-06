import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Supabase 사용 여부 확인
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// GET - 펫 로그 포스트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const petProfileId = searchParams.get('petProfileId')
    const petName = searchParams.get('petName')
    
    // Supabase 사용 가능하면 Supabase에서 가져오기
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('pet_log_posts')
          .select('*')
        
        // 반려동물 프로필 ID로 필터링
        if (petProfileId) {
          query = query.eq('pet_profile_id', petProfileId)
        }
        
        // 반려동물 이름으로 필터링 (petProfileId가 없을 경우)
        if (petName && !petProfileId) {
          query = query.ilike('pet_name', `%${petName}%`)
        }
        
        const { data: posts, error: postsError } = await query
          .order('created_at', { ascending: false })

        if (!postsError && posts && posts.length > 0) {
          // 각 포스트에 대한 급여 기록 가져오기
          const postsWithRecords = await Promise.all(
            posts.map(async (post) => {
              const { data: records } = await supabase
                .from('pet_log_feeding_records')
                .select('*')
                .eq('post_id', post.id)
                .order('created_at', { ascending: false })

              const { data: comments } = await supabase
                .from('pet_log_comments')
                .select('*')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true })

              return {
                ...post,
                feedingRecords: records || [],
                comments: comments || [],
                totalComments: comments?.length || 0
              }
            })
          )

          return NextResponse.json(postsWithRecords, {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
          })
        }
      } catch (supabaseError) {
        console.warn('Supabase error, returning empty array:', supabaseError)
      }
    }

    // Supabase가 없거나 데이터가 없으면 빈 배열 반환
    // 클라이언트에서 localStorage fallback 사용
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Failed to fetch pet log posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pet log posts' },
      { status: 500 }
    )
  }
}

// POST - 새 펫 로그 포스트 생성
export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { 
          error: 'Supabase not configured',
          message: 'Supabase가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
        },
        { status: 501 }
      )
    }

    const body = await request.json()
    const { post, feedingRecords } = body

    if (!post || !post.id) {
      return NextResponse.json(
        { error: 'Post data with id is required' },
        { status: 400 }
      )
    }

    // 포스트 생성
    const { data: newPost, error: postError } = await supabase
      .from('pet_log_posts')
      .insert([{
        id: post.id,
        user_id: post.ownerId || post.user_id || '',
        pet_name: post.petName,
        pet_breed: post.petBreed,
        pet_age: post.petAge,
        pet_weight: post.petWeight,
        owner_name: post.ownerName,
        owner_avatar: post.ownerAvatar || null,
        pet_avatar: post.petAvatar || null,
        pet_species: post.petSpecies || 'dog',
        pet_profile_id: post.petProfileId || null,
        total_records: feedingRecords?.length || 0,
        views: 0,
        likes: 0,
        comments_count: 0,
        is_liked: false
      }])
      .select()
      .single()

    if (postError) {
      console.error('Failed to create post:', postError)
      return NextResponse.json(
        { error: 'Failed to create post', details: postError.message },
        { status: 500 }
      )
    }

    // 급여 기록 생성
    if (feedingRecords && feedingRecords.length > 0) {
      const recordsToInsert = feedingRecords.map((record: any) => ({
        id: record.id,
        post_id: post.id,
        product_name: record.productName,
        category: record.category,
        brand: record.brand || null,
        start_date: record.startDate,
        end_date: record.endDate || null,
        status: record.status,
        duration: record.duration || '',
        palatability: record.palatability || 0,
        satisfaction: record.satisfaction || 0,
        repurchase_intent: record.repurchaseIntent || false,
        comment: record.comment || null,
        price: record.price || null,
        purchase_location: record.purchaseLocation || null,
        side_effects: record.sideEffects || [],
        benefits: record.benefits || []
      }))

      const { error: recordsError } = await supabase
        .from('pet_log_feeding_records')
        .insert(recordsToInsert)

      if (recordsError) {
        console.error('Failed to create feeding records:', recordsError)
        // 포스트는 생성되었으므로 계속 진행
      }
    }

    return NextResponse.json({ 
      ...newPost,
      feedingRecords: feedingRecords || []
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to create pet log post' },
      { status: 500 }
    )
  }
}

