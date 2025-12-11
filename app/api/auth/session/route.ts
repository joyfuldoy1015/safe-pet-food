import { NextRequest, NextResponse } from 'next/server'

/**
 * NextAuth session endpoint - Supabase Auth를 사용하므로 비활성화
 * 클라이언트에서 여전히 호출할 수 있으므로 명시적으로 처리
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'NextAuth is not configured',
      message: 'This project uses Supabase Auth. Please use useAuth hook instead.'
    },
    { status: 501 }
  )
}

