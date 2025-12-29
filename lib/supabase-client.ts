import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * Browser-side Supabase client with auth support
 * Use this in client components
 * 
 * ⚠️ SINGLETON PATTERN: Only one instance per browser context
 * This prevents "Multiple GoTrueClient instances" warning
 */

/**
 * Singleton browser client instance
 * Stored in global scope to survive hot reloads in development
 */
declare global {
  var __supabase_browser_client: SupabaseClient<Database> | undefined
}

export const createBrowserClient = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate Supabase URL format
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    console.error('[Supabase] Invalid URL format. Expected: https://[project-ref].supabase.co')
    console.error('[Supabase] Current URL:', supabaseUrl)
    console.error('[Supabase] Please check your Supabase Dashboard → Settings → API for the correct URL')
  }

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Supabase] Missing or invalid environment variables. Using placeholder client.')
      console.warn('[Supabase] Authentication will not work. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    }
    // Fallback for development - this won't work for real auth
    return createClient<Database>(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storage: undefined // Disable storage for placeholder
        }
      }
    )
  }

  // Extract project ref for unique storage key
  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
  
  // Custom storage adapter that syncs between cookies and localStorage
  const customStorage = typeof window !== 'undefined' ? {
    getItem: (key: string) => {
      // Try localStorage first
      const localValue = window.localStorage.getItem(key)
      if (localValue) {
        return localValue
      }
      
      // Fallback to cookies (for OAuth callback case)
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=')
        if (cookieName === key) {
          const decoded = decodeURIComponent(cookieValue)
          // Sync to localStorage for future reads
          window.localStorage.setItem(key, decoded)
          return decoded
        }
      }
      
      return null
    },
    setItem: (key: string, value: string) => {
      window.localStorage.setItem(key, value)
    },
    removeItem: (key: string) => {
      window.localStorage.removeItem(key)
      // Also remove from cookies
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  } : undefined
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // ⭐ CRITICAL: Force PKCE flow to get ?code= instead of #access_token
      flowType: 'pkce',
      // Use explicit storage key to prevent conflicts
      storageKey: `sb-${projectRef}-auth-token`,
      // Use custom storage that reads from both localStorage and cookies
      storage: customStorage
    }
  })
}

/**
 * Get browser client instance (singleton)
 * Uses global variable to survive hot reloads in development
 */
export const getBrowserClient = (): SupabaseClient<Database> => {
  // Server-side check - return null to prevent SSR errors
  if (typeof window === 'undefined') {
    console.warn('[Supabase] getBrowserClient() called on server-side, returning null')
    return null as any
  }

  // Use global variable to prevent multiple instances during hot reload
  if (!global.__supabase_browser_client) {
    global.__supabase_browser_client = createBrowserClient()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Browser client initialized')
    }
  }

  return global.__supabase_browser_client
}

