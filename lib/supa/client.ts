import { getBrowserClient } from '@/lib/supabase-client'

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    console.warn('[Supabase] getSupabaseClient() called on server-side. Use server client instead.')
    return null
  }
  return getBrowserClient()
}
