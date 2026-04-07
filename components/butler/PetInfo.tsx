'use client'

import { useState } from 'react'
import StepHeader from './StepHeader'
import { colors, radii } from '@/lib/design-tokens'

const PET_TYPES = [
  { value: '강아지', label: '강아지', emoji: '🐕' },
  { value: '고양이', label: '고양이', emoji: '🐱' },
  { value: '토끼', label: '토끼', emoji: '🐰' },
  { value: '햄스터', label: '햄스터', emoji: '🐹' },
  { value: '새', label: '새', emoji: '🐦' },
  { value: '기타', label: '기타', emoji: '🐾' },
]

const HEALTH_OPTIONS = [
  { value: '건강해요', label: '건강해요 💪' },
  { value: '관리 중이에요', label: '관리 중이에요 🏥' },
  { value: '식이 조절 중', label: '식이 조절 중 🥗' },
  { value: '노령이에요', label: '노령이에요 🌿' },
  { value: '잘 모르겠어요', label: '잘 모르겠어요 🤔' },
]

interface Props {
  onNext: (data: { petName: string; petType: string; petAge: string; healthStatus: string }) => void
  onBack: () => void
  initial: { petName: string; petType: string; petAge: string; healthStatus: string }
}

export default function PetInfo({ onNext, onBack, initial }: Props) {
  const [petName, setPetName] = useState(initial.petName)
  const [petType, setPetType] = useState(initial.petType)
  const [petAge, setPetAge] = useState(initial.petAge)
  const [ageUnit, setAgeUnit] = useState<'살' | '개월'>('살')
  const [healthStatus, setHealthStatus] = useState(initial.healthStatus)
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!petName.trim()) return setError('반려동물 이름을 입력해주세요.')
    if (!petType) return setError('종류를 선택해주세요.')
    setError('')
    onNext({
      petName: petName.trim(),
      petType,
      petAge: petAge ? `${petAge}${ageUnit}` : '',
      healthStatus,
    })
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: colors.primaryBg, padding: '0 0 32px' }}>
      <StepHeader step={1} totalSteps={3} onBack={onBack} title="반려동물 정보" />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{
            background: colors.white,
            borderRadius: radii.card,
            padding: '24px 20px',
            boxShadow: '0 8px 32px rgba(124,92,252,0.10)',
          }}
        >
          {/* 종류 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: colors.textSecondary, marginBottom: '12px' }}>
              종류 선택 <span style={{ color: colors.primary }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {PET_TYPES.map(pt => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setPetType(pt.value)}
                  aria-label={pt.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '14px 8px',
                    borderRadius: radii.lg,
                    border: `2px solid ${petType === pt.value ? colors.primary : colors.primaryBorder}`,
                    background: petType === pt.value ? colors.primaryXLight : colors.white,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: petType === pt.value ? colors.primary : colors.textSecondary,
                  }}
                >
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{pt.emoji}</span>
                  {pt.label}
                  {petType === pt.value && (
                    <span style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: colors.primary, color: colors.white,
                      borderRadius: radii.full, fontSize: '10px', padding: '1px 5px',
                    }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 이름 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: colors.textSecondary, marginBottom: '8px' }}>
              이름 <span style={{ color: colors.primary }}>*</span>
            </label>
            <input
              type="text"
              placeholder="예: 초코, 나비"
              value={petName}
              onChange={e => setPetName(e.target.value)}
              aria-label="반려동물 이름"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: radii.md,
                border: `1.5px solid ${colors.primaryBorder}`,
                fontSize: '15px',
                color: colors.textPrimary,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = colors.primary)}
              onBlur={e => (e.target.style.borderColor = colors.primaryBorder)}
            />
          </div>

          {/* 나이 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: colors.textSecondary, marginBottom: '8px' }}>
              나이 <span style={{ color: colors.textTertiary, fontWeight: 400 }}>(선택)</span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={petAge}
                onChange={e => setPetAge(e.target.value)}
                aria-label="나이"
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: radii.md,
                  border: `1.5px solid ${colors.primaryBorder}`,
                  fontSize: '15px',
                  color: colors.textPrimary,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = colors.primary)}
                onBlur={e => (e.target.style.borderColor = colors.primaryBorder)}
              />
              <div style={{ display: 'flex', borderRadius: radii.md, border: `1.5px solid ${colors.primaryBorder}`, overflow: 'hidden' }}>
                {(['살', '개월'] as const).map(unit => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setAgeUnit(unit)}
                    style={{
                      padding: '14px 16px',
                      border: 'none',
                      background: ageUnit === unit ? colors.primaryXLight : colors.white,
                      color: ageUnit === unit ? colors.primary : colors.textTertiary,
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 건강 상태 */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: colors.textSecondary, marginBottom: '10px' }}>
              건강 상태 <span style={{ color: colors.textTertiary, fontWeight: 400 }}>(선택)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {HEALTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHealthStatus(healthStatus === opt.value ? '' : opt.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: radii.full,
                    border: `1.5px solid ${healthStatus === opt.value ? colors.primary : colors.primaryBorder}`,
                    background: healthStatus === opt.value ? colors.primaryXLight : colors.white,
                    color: healthStatus === opt.value ? colors.primary : colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: radii.sm, background: colors.errorBg, color: colors.errorText, fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '16px',
            borderRadius: radii.lg,
            border: 'none',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
            color: colors.white,
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(124,92,252,0.30)',
          }}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}
