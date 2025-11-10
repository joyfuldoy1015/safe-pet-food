'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from './components/Header'
import Footer from './components/Footer'
import SessionProvider from './providers/SessionProvider'

/**
 * Client component that conditionally renders Header and Footer
 * based on the current route pathname
 */
export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <SessionProvider>
      {!isAdminPage && <Header />}
      {children}
      {!isAdminPage && <Footer isAdmin={false} />}
    </SessionProvider>
  )
}


