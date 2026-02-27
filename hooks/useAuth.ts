'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row'] | null

/**
 * Auth hook with profile loading
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
 * - Load profile when user logs in
 * - Return user, profile, and loading state
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = getBrowserClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Function to load profile
    const loadProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist - this is OK, it will be created by callback
            console.log('[useAuth] Profile not found, will be created on next login')
          } else {
            console.error('[useAuth] Error loading profile:', error)
          }
          setProfile(null)
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error('[useAuth] Error in loadProfile:', error)
        setProfile(null)
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useAuth] Initial session:', session?.user?.email || 'none')
      }
    }).catch((error) => {
      console.error('[useAuth] Failed to get session:', error)
      setUser(null)
      setProfile(null)
      setLoading(false)
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          loadProfile(session.user.id).finally(() => setLoading(false))
        } else {
          setProfile(null)
          setLoading(false)
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useAuth] Auth state changed:', event, session?.user?.email || 'none')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign out function - uses server-side API for reliable cookie clearing
  const signOut = async () => {
    try {
      console.log('[useAuth] Starting sign out...')
      
      // Clear local state first
      setUser(null)
      setProfile(null)

      // Call server-side logout API to properly clear cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (!response.ok) {
        console.error('[useAuth] Logout API error:', response.status)
      } else {
        console.log('[useAuth] Logout API successful')
      }

      // Also sign out from client-side Supabase
      const supabase = getBrowserClient()
      if (supabase) {
        await supabase.auth.signOut({ scope: 'global' })
      }

      console.log('[useAuth] Signed out successfully')
    } catch (error) {
      console.error('[useAuth] Sign out exception:', error)
    }
  }

  // Refresh profile function
  const refreshProfile = async () => {
    if (!user) return

    const supabase = getBrowserClient()
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('[useAuth] Error refreshing profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('[useAuth] Error in refreshProfile:', error)
      setProfile(null)
    }
  }

  return { 
    user, 
    profile, 
    loading,
    isLoading: loading, // Alias for backward compatibility
    signOut,
    refreshProfile
  }
}
