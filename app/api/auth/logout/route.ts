import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )

  // Sign out from Supabase (this clears the session)
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('[Logout API] Sign out error:', error)
  }

  // Get all cookies and delete Supabase-related ones
  const allCookies = cookieStore.getAll()
  
  // Create response
  const response = NextResponse.json({ success: true })
  
  // Delete all Supabase auth cookies
  allCookies.forEach((cookie) => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.delete(cookie.name)
      // Also try to delete with different paths
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        path: '/',
      })
    }
  })

  console.log('[Logout API] Logout successful, cookies cleared')
  
  return response
}
