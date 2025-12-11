'use client'

import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

/**
 * SessionProvider - Supabase Auth를 사용하므로 NextAuth SessionProvider는 필요 없음
 * 이 컴포넌트는 레이아웃 호환성을 위해 유지하되, 실제로는 children만 반환
 */
export default function SessionProvider({ children }: SessionProviderProps) {
  // Supabase Auth를 사용하므로 NextAuth SessionProvider는 사용하지 않음
  // useAuth hook이 직접 Supabase 세션을 관리함
  return <>{children}</>
}
