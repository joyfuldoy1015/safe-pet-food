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
    let initialLoadComplete = false

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
            const { data: newProfile, error: createError } = await (supabase
              .from('profiles') as any)
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
        // 세션 로드 시 타임아웃 설정 (10초로 연장 - 네트워크 지연 고려)
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session load timeout')), 10000)
        )
        
        let sessionData
        try {
          sessionData = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<ReturnType<typeof supabase.auth.getSession>>
        } catch (timeoutError) {
          // 타임아웃 발생 시 세션이 없다고 가정하고 즉시 로딩 해제
          // 개발 환경에서만 경고 표시
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useAuth] Session load timeout, assuming no session')
          }
          if (mounted) {
            setUser(null)
            setProfile(null)
            setSession(null)
            setIsLoading(false)
            initialLoadComplete = true
          }
          return
        }
        
        const { data: { session }, error } = sessionData
        
        if (error) {
          console.error('Error loading session:', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setSession(null)
            setIsLoading(false)
            initialLoadComplete = true
          }
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          // Load profile if user exists (비동기로 처리하여 로딩 상태를 먼저 해제)
          if (session?.user) {
            // 프로필 로드는 백그라운드에서 처리하고 먼저 로딩 상태 해제
            setIsLoading(false)
            initialLoadComplete = true
            loadProfile(session.user.id, session.user.email).catch(err => {
              console.error('Error loading profile in background:', err)
            })
          } else {
            setProfile(null)
            setIsLoading(false)
            initialLoadComplete = true
          }
        }
      } catch (error) {
        console.error('Error in loadSession:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setSession(null)
          setIsLoading(false)
          initialLoadComplete = true
        }
      }
    }

    // 초기 로드 시작
    loadSession()

    // 안전장치: 5초 후에도 로딩이 끝나지 않으면 강제로 해제
    // 로그아웃 후 로그인 페이지 접근 시 빠른 응답을 위해 타임아웃 단축
    const timeoutId = setTimeout(() => {
      if (mounted && !initialLoadComplete) {
        // 개발 환경에서만 경고 표시 (프로덕션에서는 조용히 처리)
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useAuth] Initial load timeout, forcing isLoading to false')
        }
        setIsLoading(false)
        initialLoadComplete = true
      }
    }, 5000) // 5초로 단축 (로그아웃 후 빠른 응답을 위해)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 개발 환경에서만 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.log('[useAuth] Auth state changed:', event, session?.user?.email)
        }
        
        // INITIAL_SESSION 이벤트는 loadSession과 중복될 수 있으므로
        // initialLoadComplete가 false일 때만 처리 (아직 로드 중이면 무시)
        if (event === 'INITIAL_SESSION') {
          if (mounted && !initialLoadComplete) {
            // loadSession이 아직 실행 중이면 이 이벤트는 무시
            return
          }
        }

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
          
          // 초기 로드가 완료되지 않았다면 완료로 표시
          if (!initialLoadComplete) {
            initialLoadComplete = true
          }
        }
      }
    )

    // URL에서 auth=success 파라미터가 있으면 세션을 다시 확인
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('auth') === 'success') {
        console.log('[useAuth] Auth success parameter detected, reloading session...')
        
        // 세션 다시 로드 (여러 번 재시도)
        const retrySessionLoad = async () => {
          for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
            
            const { data: { session }, error } = await supabase.auth.getSession()
            
            console.log(`[useAuth] Session reload attempt ${i + 1}:`, {
              hasSession: !!session,
              userId: session?.user?.id,
              error: error?.message
            })
            
            if (session?.user) {
              console.log('[useAuth] Session found! Updating state...')
              if (mounted) {
                setSession(session)
                setUser(session.user)
                await loadProfile(session.user.id, session.user.email)
                setIsLoading(false)
              }
              break
            }
          }
        }
        
        retrySessionLoad()
      }
    }

    return () => {
      mounted = false
      clearTimeout(timeoutId)
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
    console.log('[useAuth] signOut 함수 호출됨')
    try {
      // 로컬 상태 즉시 정리 (UI 반응성 향상)
      console.log('[useAuth] 로컬 상태 정리 시작')
      setUser(null)
      setProfile(null)
      setSession(null)
      console.log('[useAuth] 로컬 상태 정리 완료')
      
      // Supabase 세션 정리
      try {
        console.log('[useAuth] Supabase signOut 호출 시작')
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('[useAuth] Sign out error:', error)
        } else {
          console.log('[useAuth] Supabase session cleared successfully')
        }
      } catch (signOutError) {
        console.error('[useAuth] Error during Supabase signOut:', signOutError)
      }
      
      // 로컬 스토리지 및 쿠키 정리
      if (typeof window !== 'undefined') {
        try {
          // 1. localStorage 정리
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          if (supabaseUrl) {
            const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
            if (projectRef) {
              // Supabase의 기본 세션 키 형식: sb-{project-ref}-auth-token
              const sessionKey = `sb-${projectRef}-auth-token`
              localStorage.removeItem(sessionKey)
            }
          }
          
          // 모든 Supabase 관련 키 제거
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (
              key.startsWith('user_') || 
              key.startsWith('sb-') || 
              key.startsWith('supabase.auth.')
            )) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
          
          // 2. 쿠키 정리 (Supabase 세션 쿠키)
          const cookiesToRemove = [
            `sb-${supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`,
            'sb-auth-token',
            'supabase.auth.token'
          ]
          
          cookiesToRemove.forEach(cookieName => {
            // 현재 도메인과 상위 도메인에서 쿠키 삭제
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            
            // 서브도메인도 고려
            const domainParts = window.location.hostname.split('.')
            if (domainParts.length > 1) {
              const baseDomain = '.' + domainParts.slice(-2).join('.')
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${baseDomain};`
            }
          })
          
          console.log('[useAuth] Local storage and cookies cleared')
        } catch (storageError) {
          console.warn('[useAuth] Error clearing storage:', storageError)
        }
      }
      
      // 세션이 완전히 정리될 때까지 약간 대기
      await new Promise(resolve => setTimeout(resolve, 300))
      
    } catch (error) {
      console.error('[useAuth] Unexpected error during sign out:', error)
      // 에러가 있어도 로컬 상태는 정리
      setUser(null)
      setProfile(null)
      setSession(null)
    }
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

