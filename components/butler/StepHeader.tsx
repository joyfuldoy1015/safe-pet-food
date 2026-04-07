'use client'

import { ArrowLeft } from 'lucide-react'

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
            borderRadius: '12px',
            border: 'none',
            background: '#EDE8FF',
            color: '#7C5CFC',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A2E', flex: 1 }}>{title}</span>
        <span
          style={{
            background: '#EDE8FF',
            color: '#7C5CFC',
            borderRadius: '99px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {step} / {totalSteps}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div style={{ height: '4px', borderRadius: '99px', background: '#E8E4F8', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(step / totalSteps) * 100}%`,
            borderRadius: '99px',
            background: 'linear-gradient(90deg, #7C5CFC, #A78BFA)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
