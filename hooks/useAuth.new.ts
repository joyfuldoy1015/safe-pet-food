'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase-client.new'

/**
 * Minimal useAuth hook
 * 
 * ⚠️ RULES:
 * 1. Only essential features
 * 2. No custom retry logic
 * 3. No timeout handling
 * 4. Let @supabase/ssr handle session
 * 
 * 📝 What this does:
 * - Get initial session
 * - Listen to auth state changes
 * - Return user and loading state
 * 
 * 🚫 What this does NOT do:
 * - No custom session retry
 * - No URL parameter checking
 * - No complex profile loading (add later if needed)
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = getBrowserClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useAuth] Initial session:', session?.user?.email || 'none')
      }
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useAuth] Auth state changed:', event, session?.user?.email || 'none')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
