'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row'] | null

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string) => Promise<{ error: Error | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithProvider: (provider: 'google' | 'kakao') => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

/**
 * Authentication hook for Supabase
 * Provides user, profile, and auth methods
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = getBrowserClient()

  // Load initial session and profile
  useEffect(() => {
    let mounted = true

    const loadProfile = async (userId: string, userEmail?: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          // Profile might not exist yet, create it
          if (error.code === 'PGRST116') {
            const nickname = userEmail?.split('@')[0] || '사용자'
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                nickname
              })
              .select()
              .single()

            if (createError) {
              console.error('Error creating profile:', createError)
              if (mounted) setProfile(null)
            } else if (newProfile && mounted) {
              setProfile(newProfile)
            }
          } else {
            console.error('Error loading profile:', error)
            if (mounted) setProfile(null)
          }
        } else if (data && mounted) {
          setProfile(data)
        }
      } catch (error) {
        console.error('Error in loadProfile:', error)
        if (mounted) setProfile(null)
      }
    }

    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error loading session:', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setSession(null)
            setIsLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          // Load profile if user exists
          if (session?.user) {
            await loadProfile(session.user.id, session.user.email)
          } else {
            setProfile(null)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error in loadSession:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state changed:', event, session?.user?.email)
        if (mounted) {
          // 세션 상태 즉시 업데이트
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            await loadProfile(session.user.id, session.user.email)
          } else {
            setProfile(null)
          }
          
          // 프로필 로드 완료 후 항상 로딩 상태 해제
          setIsLoading(false)
        }
      }
    )

    // URL에서 auth=success 파라미터가 있으면 세션을 다시 확인
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('auth') === 'success') {
        // 세션 다시 로드 (약간의 지연을 주어 쿠키가 설정될 시간 제공)
        setTimeout(() => {
          loadSession()
        }, 500)
      }
    }

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'kakao'): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithPassword = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  return {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signInWithPassword,
    signInWithProvider,
    signOut,
    refreshProfile
  }
}

