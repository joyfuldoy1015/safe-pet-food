import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/**
 * Browser Supabase client (@supabase/ssr)
 * 
 * ⚠️ RULES:
 * 1. Only @supabase/ssr - NO @supabase/supabase-js
 * 2. No custom storage adapter
 * 3. Let @supabase/ssr handle everything (cookies, PKCE, session)
 * 
 * 📝 Why @supabase/ssr?
 * - Automatic cookie-based PKCE verifier storage
 * - Seamless browser/server session sync
 * - Built-in Next.js App Router support
 */
export function getBrowserClient() {
  // Server-side check
  if (typeof window === 'undefined') {
    console.warn('[Supabase] getBrowserClient() called on server-side')
    return null as any
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Missing environment variables')
    throw new Error('Missing Supabase environment variables')
  }

  // Validate URL format
  if (!supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    console.error('[Supabase] Invalid URL format:', supabaseUrl)
  }

  // Create browser client with @supabase/ssr
  // This automatically handles:
  // - PKCE flow (code_verifier in cookies)
  // - Session management
  // - Cookie-based storage
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
