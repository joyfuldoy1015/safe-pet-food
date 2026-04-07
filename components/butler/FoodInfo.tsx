'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import StepHeader from './StepHeader'

const FEED_COUNTS = [
  { value: '1회', label: '1회' },
  { value: '2회', label: '2회' },
  { value: '3회 이상', label: '3회 이상' },
  { value: '자율 급식', label: '자율 급식' },
]

interface Product {
  id: string
  name: string
  brands?: { name: string }
}

interface Props {
  onNext: (data: { foodInput: string; feedCount: string; productId?: string }) => void
  onBack: () => void
  initial: { foodInput: string; feedCount: string; productId?: string }
}

export default function FoodInfo({ onNext, onBack, initial }: Props) {
  const [query, setQuery] = useState(initial.foodInput)
  const [productId, setProductId] = useState(initial.productId ?? '')
  const [selectedLabel, setSelectedLabel] = useState(initial.foodInput)
  const [feedCount, setFeedCount] = useState(initial.feedCount)
  const [results, setResults] = useState<Product[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 제품 검색 (디바운스 300ms)
  useEffect(() => {
    if (productId) return // 이미 선택됨
    if (query.trim().length < 1) {
      setResults([])
      setShowDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=20`)
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : []
          setResults(list)
          setShowDropdown(list.length > 0)
        }
      } catch { /* ignore */ } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, productId])

  const handleSelect = (p: Product) => {
    const label = p.brands?.name ? `${p.brands.name} · ${p.name}` : p.name
    setSelectedLabel(label)
    setQuery(label)
    setProductId(p.id)
    setShowDropdown(false)
    setResults([])
  }

  const handleClear = () => {
    setQuery('')
    setSelectedLabel('')
    setProductId('')
    setResults([])
    setShowDropdown(false)
  }

  const handleNext = () => {
    const foodInput = selectedLabel.trim() || query.trim()
    if (!foodInput) return setError('급여 중인 사료를 입력해주세요.')
    if (!feedCount) return setError('하루 급식 횟수를 선택해주세요.')
    setError('')
    onNext({ foodInput, feedCount, productId: productId || undefined })
  }

  const isSelected = !!productId

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#F7F5FF', padding: '0 0 32px' }}>
      <StepHeader step={2} totalSteps={3} onBack={onBack} title="사료 정보" />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: '0 8px 32px rgba(124,92,252,0.10)',
          marginBottom: '12px',
        }}>
          {/* 제품 검색 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#6B6B8A', marginBottom: '8px' }}>
              급여 중인 사료 <span style={{ color: '#7C5CFC' }}>*</span>
            </label>

            <div ref={wrapperRef} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9B9BB8', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  placeholder="제품명으로 검색 (예: 오리젠, 로얄캐닌)"
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value)
                    if (productId) {
                      setProductId('')
                      setSelectedLabel('')
                    }
                  }}
                  aria-label="사료 제품 검색"
                  style={{
                    width: '100%',
                    padding: '14px 40px 14px 40px',
                    borderRadius: '14px',
                    border: `1.5px solid ${isSelected ? '#7C5CFC' : '#E8E4F8'}`,
                    background: isSelected ? '#F5F2FF' : '#fff',
                    fontSize: '15px',
                    color: '#1A1A2E',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { if (!isSelected) e.target.style.borderColor = '#7C5CFC' }}
                  onBlur={e => { if (!isSelected) e.target.style.borderColor = '#E8E4F8' }}
                />
                {searching && (
                  <Loader2 size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9B9BB8', animation: 'spin 1s linear infinite' }} />
                )}
                {isSelected && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="선택 취소"
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9B9BB8', padding: '4px' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* DB 검색 결과 드롭다운 */}
              {showDropdown && results.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                  background: '#fff', borderRadius: '16px',
                  border: '1.5px solid #E8E4F8', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  zIndex: 20, maxHeight: '220px', overflowY: 'auto',
                }}>
                  {results.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelect(p)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '12px 16px',
                        border: 'none', background: 'none', cursor: 'pointer',
                        borderBottom: i < results.length - 1 ? '1px solid #F0EDF8' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F7F5FF')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E' }}>{p.name}</div>
                      {p.brands?.name && (
                        <div style={{ fontSize: '12px', color: '#9B9BB8', marginTop: '2px' }}>{p.brands.name}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 선택 완료 뱃지 */}
            {isSelected && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#7C5CFC', fontWeight: 600 }}>
                ✓ DB에서 찾았어요! 정확한 성분 정보로 분석됩니다
              </div>
            )}

            {/* DB에 없을 경우 안내 */}
            {!isSelected && query.trim().length > 1 && !searching && results.length === 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#9B9BB8' }}>
                검색 결과가 없어요. 입력한 이름 그대로 분석에 사용됩니다
              </div>
            )}
          </div>

          {/* 급식 횟수 */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#6B6B8A', marginBottom: '10px' }}>
              하루 몇 번 밥을 주시나요? <span style={{ color: '#7C5CFC' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {FEED_COUNTS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFeedCount(opt.value)}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: `2px solid ${feedCount === opt.value ? '#7C5CFC' : '#E8E4F8'}`,
                    background: feedCount === opt.value ? '#EDE8FF' : '#fff',
                    color: feedCount === opt.value ? '#7C5CFC' : '#6B6B8A',
                    fontSize: '14px', fontWeight: 600,
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
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FFF0F0', color: '#D94F4F', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          style={{
            marginTop: '12px', width: '100%', padding: '16px',
            borderRadius: '16px', border: 'none',
            background: 'linear-gradient(135deg, #7C5CFC, #A78BFA)',
            color: '#fff', fontSize: '16px', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,92,252,0.30)',
          }}
        >
          다음 →
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </div>
  )
}
