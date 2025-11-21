import { createClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase client with auth support
 * Use this in client components
 */
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate Supabase URL format
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    console.error('[Supabase] Invalid URL format. Expected: https://[project-ref].supabase.co')
    console.error('[Supabase] Current URL:', supabaseUrl)
    console.error('[Supabase] Please check your Supabase Dashboard → Settings → API for the correct URL')
  }

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('[Supabase] Missing or invalid environment variables. Using placeholder client.')
    console.warn('[Supabase] Authentication will not work. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    // Fallback for development - this won't work for real auth
    return createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
      {
        auth: {
          persistSession: false, // Disable session persistence for placeholder
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

/**
 * Singleton browser client instance
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const getBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

