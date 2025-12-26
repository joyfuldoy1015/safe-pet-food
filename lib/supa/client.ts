/**
 * ⚠️ DEPRECATED: Use getBrowserClient() from '@/lib/supabase-client' instead
 * 
 * This file is kept for backward compatibility only.
 * It re-exports the singleton client to prevent multiple GoTrueClient instances.
 */

import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

/**
 * @deprecated Use getBrowserClient() directly from '@/lib/supabase-client'
 * Re-export to maintain backward compatibility
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    console.warn('[Supabase] getSupabaseClient() called on server-side. Use server client instead.')
    return null
  }
  return getBrowserClient()
}

/**
 * @deprecated Use getBrowserClient() directly from '@/lib/supabase-client'
 */
export function createSupabaseClient() {
  console.warn('[Supabase] createSupabaseClient() is deprecated. Use getBrowserClient() instead.')
  return getSupabaseClient()
}

