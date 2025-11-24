import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, isAdmin } from '@/lib/supa/serverAdmin'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering + disable caching (uses headers & auth)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * Check if current user is admin
 * GET /api/admin/check
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with cookies for server-side auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ isAdmin: false }, { status: 500 })
    }

    // Get Authorization header (Bearer token)
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`
        } : {}
      }
    })

    // Get current user using the access token
    const { data: { user }, error: authError } = accessToken
      ? await supabase.auth.getUser(accessToken)
      : await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    // Check if user is admin
    const admin = await isAdmin(user.id)
    
    return NextResponse.json({ isAdmin: admin })
  } catch (error) {
    console.error('[API /admin/check] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false },
      { status: 500 }
    )
  }
}

