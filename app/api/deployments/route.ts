import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/supa/serverAdmin'
import { createClient } from '@supabase/supabase-js'

const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'safe-pet-food'

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return { authorized: false, response: NextResponse.json({ error: 'Server configuration error' }, { status: 500 }) }
  }

  const authHeader = request.headers.get('Authorization')
  const accessToken = authHeader?.replace('Bearer ', '')
  if (!accessToken) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const admin = await isAdmin(user.id)
  if (!admin) {
    return { authorized: false, response: NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 }) }
  }

  return { authorized: true }
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request)
  if (!auth.authorized) return auth.response!

  try {
    if (!VERCEL_TOKEN) {
      return NextResponse.json({
        deployments: [],
        pagination: { count: 0, next: null, prev: null }
      })
    }

    const baseUrl = 'https://api.vercel.com'
    const endpoint = VERCEL_TEAM_ID 
      ? `/v6/deployments?teamId=${VERCEL_TEAM_ID}&projectId=${VERCEL_PROJECT_ID}&limit=20`
      : `/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=20`

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Deployment fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdmin(request)
  if (!auth.authorized) return auth.response!

  try {
    const { deploymentId, action } = await request.json()

    if (!VERCEL_TOKEN) {
      return NextResponse.json(
        { error: 'VERCEL_TOKEN is not configured' },
        { status: 400 }
      )
    }

    if (action === 'redeploy') {
      const baseUrl = 'https://api.vercel.com'
      const endpoint = VERCEL_TEAM_ID
        ? `/v13/deployments?teamId=${VERCEL_TEAM_ID}`
        : '/v13/deployments'

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: VERCEL_PROJECT_ID,
          gitSource: {
            type: 'github',
            ref: 'main',
            repoId: process.env.GITHUB_REPO_ID
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({ success: true, deployment: data })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Deployment action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform deployment action' },
      { status: 500 }
    )
  }
}

