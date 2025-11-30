'use client'

import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

/**
 * Stat card component for displaying key metrics
 * Emphasizes numbers with large font, labels with small font
 * Health & Care Minimalism design
 */
export default function StatCard({ label, value, icon, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      {icon && (
        <div className="mb-3 text-gray-400">
          {icon}
        </div>
      )}
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {label}
      </div>
      <div className="text-3xl font-bold text-[#0D1B2A] leading-tight">
        {value}
      </div>
    </div>
  )
}

