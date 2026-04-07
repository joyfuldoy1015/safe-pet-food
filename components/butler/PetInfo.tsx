'use client'

import { useState } from 'react'
import StepHeader from './StepHeader'

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
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#F7F5FF', padding: '0 0 32px' }}>
      <StepHeader step={1} totalSteps={3} onBack={onBack} title="반려동물 정보" />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '24px 20px',
            boxShadow: '0 8px 32px rgba(124,92,252,0.10)',
          }}
        >
          {/* 종류 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#6B6B8A', marginBottom: '12px' }}>
              종류 선택 <span style={{ color: '#7C5CFC' }}>*</span>
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
                    borderRadius: '16px',
                    border: `2px solid ${petType === pt.value ? '#7C5CFC' : '#E8E4F8'}`,
                    background: petType === pt.value ? '#EDE8FF' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: petType === pt.value ? '#7C5CFC' : '#6B6B8A',
                  }}
                >
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{pt.emoji}</span>
                  {pt.label}
                  {petType === pt.value && (
                    <span style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: '#7C5CFC', color: '#fff',
                      borderRadius: '99px', fontSize: '10px', padding: '1px 5px',
                    }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 이름 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#6B6B8A', marginBottom: '8px' }}>
              이름 <span style={{ color: '#7C5CFC' }}>*</span>
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
                borderRadius: '14px',
                border: '1.5px solid #E8E4F8',
                fontSize: '15px',
                color: '#1A1A2E',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#7C5CFC')}
              onBlur={e => (e.target.style.borderColor = '#E8E4F8')}
            />
          </div>

          {/* 나이 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#6B6B8A', marginBottom: '8px' }}>
              나이 <span style={{ color: '#9B9BB8', fontWeight: 400 }}>(선택)</span>
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
                  borderRadius: '14px',
                  border: '1.5px solid #E8E4F8',
                  fontSize: '15px',
                  color: '#1A1A2E',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#7C5CFC')}
                onBlur={e => (e.target.style.borderColor = '#E8E4F8')}
              />
              <div style={{ display: 'flex', borderRadius: '14px', border: '1.5px solid #E8E4F8', overflow: 'hidden' }}>
                {(['살', '개월'] as const).map(unit => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setAgeUnit(unit)}
                    style={{
                      padding: '14px 16px',
                      border: 'none',
                      background: ageUnit === unit ? '#EDE8FF' : '#fff',
                      color: ageUnit === unit ? '#7C5CFC' : '#9B9BB8',
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
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#6B6B8A', marginBottom: '10px' }}>
              건강 상태 <span style={{ color: '#9B9BB8', fontWeight: 400 }}>(선택)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {HEALTH_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHealthStatus(healthStatus === opt.value ? '' : opt.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '99px',
                    border: `1.5px solid ${healthStatus === opt.value ? '#7C5CFC' : '#E8E4F8'}`,
                    background: healthStatus === opt.value ? '#EDE8FF' : '#fff',
                    color: healthStatus === opt.value ? '#7C5CFC' : '#6B6B8A',
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
          <div style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '12px', background: '#FFF0F0', color: '#D94F4F', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #7C5CFC, #A78BFA)',
            color: '#fff',
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
