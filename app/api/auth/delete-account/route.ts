import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerClient } from '@/lib/supabase-server'

export async function DELETE(request: NextRequest) {
  try {
    // 일반 클라이언트로 현재 사용자 확인
    const supabase = getServerClient()

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    // Admin 클라이언트 생성 (서비스 역할 키 사용)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Supabase Admin API를 사용하여 사용자 삭제
    // 참고: RLS의 CASCADE 정책으로 인해 관련 데이터(profiles, pets, posts 등)도 자동 삭제됩니다
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return NextResponse.json(
        { error: '계정 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 세션 삭제
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
