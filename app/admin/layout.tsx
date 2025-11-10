'use client'

import React from 'react'

/**
 * Admin layout that overrides the root layout
 * This prevents the main Header and Footer from rendering on admin pages
 */
export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


