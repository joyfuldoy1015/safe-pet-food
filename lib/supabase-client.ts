import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/**
 * Browser-side Supabase client using @supabase/ssr
 * 
 * ⚠️ IMPORTANT: Uses cookie-based storage for PKCE flow
 * This ensures code_verifier is accessible to both client and server
 * 
 * No custom storage adapter - @supabase/ssr handles everything!
 */

/**
 * Get browser client instance
 * Creates a new client on each call - @supabase/ssr manages internal state
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
    return null as any
  }

  // Validate URL format
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    console.error('[Supabase] Invalid URL format:', supabaseUrl)
  }

  // Create browser client with @supabase/ssr
  // This automatically handles:
  // - PKCE flow (code_verifier in cookies)
  // - Session management
  // - Cookie-based storage
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

