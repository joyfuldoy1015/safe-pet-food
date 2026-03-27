'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Header from './components/Header'
import Footer from './components/Footer'
import SessionProvider from './providers/SessionProvider'
import PostHogProvider from './providers/PostHogProvider'

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <PostHogProvider>
          {!isAdminPage && <Header />}
          {children}
          {!isAdminPage && <Footer isAdmin={false} />}
        </PostHogProvider>
      </Suspense>
    </SessionProvider>
  )
}



