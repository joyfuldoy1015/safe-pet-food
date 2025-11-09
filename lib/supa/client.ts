import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * Safe Supabase client factory
 * Returns a client if env vars are present, otherwise returns a noop client
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing environment variables. Using mock data fallback.')
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

/**
 * Get Supabase client instance (singleton)
 */
let client: ReturnType<typeof createSupabaseClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createSupabaseClient()
  }
  return client
}

