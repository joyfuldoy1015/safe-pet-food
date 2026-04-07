'use client'

import { ArrowLeft } from 'lucide-react'
import { colors, radii } from '@/lib/design-tokens'

interface Props {
  step: number
  totalSteps: number
  onBack: () => void
  title: string
}

export default function StepHeader({ step, totalSteps, onBack, title }: Props) {
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px 20px 12px' }}>
      {/* 상단 내비 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <button
          onClick={onBack}
          aria-label="이전으로"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: radii.sm,
            border: 'none',
            background: colors.primaryXLight,
            color: colors.primary,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, flex: 1 }}>{title}</span>
        <span
          style={{
            background: colors.primaryXLight,
            color: colors.primary,
            borderRadius: radii.full,
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {step} / {totalSteps}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ height: '4px', borderRadius: radii.full, background: colors.primaryBorder, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(step / totalSteps) * 100}%`,
            borderRadius: radii.full,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryLight})`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
