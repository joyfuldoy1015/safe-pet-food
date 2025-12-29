import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

/**
 * Server Supabase client (@supabase/ssr)
 * 
 * ⚠️ RULES:
 * 1. Only @supabase/ssr - NO @supabase/supabase-js
 * 2. Use cookies() from next/headers
 * 3. Read-only in Server Components (set/remove will fail silently)
 * 
 * 📝 Why @supabase/ssr?
 * - Can read session cookies set by OAuth callback
 * - Automatic cookie handling
 * - Server Component compatible
 */
export function getServerClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Server Component: read-only
          // Cookie setting is handled by callback route
        },
      },
    }
  )
}
