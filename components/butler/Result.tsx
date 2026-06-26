'use client'

import { useState, useEffect } from 'react'
import type { ButlerResult } from '@/lib/butler/scoreCalc'
import { downloadCard, shareResult } from '@/lib/butler/shareExport'

const HAPPINESS_EMOJIS = ['😢', '😐', '🙂', '😊', '🥰']

function getScoreBadgeGradient(score: number): string {
  if (score >= 85) return 'linear-gradient(135deg, #F59E0B, #FCD34D)'
  if (score >= 70) return 'linear-gradient(135deg, #6B48F0, #C4B5FD)'
  if (score >= 55) return 'linear-gradient(135deg, #10B981, #6EE7B7)'
  if (score >= 40) return 'linear-gradient(135deg, #3B82F6, #93C5FD)'
  return 'linear-gradient(135deg, #9CA3AF, #D1D5DB)'
}

function getScoreBadgeShadow(score: number): string {
  if (score >= 85) return '0 6px 20px rgba(245,158,11,0.40)'
  if (score >= 70) return '0 6px 20px rgba(80,50,200,0.35)'
  if (score >= 55) return '0 6px 20px rgba(16,185,129,0.35)'
  if (score >= 40) return '0 6px 20px rgba(59,130,246,0.35)'
  return '0 6px 20px rgba(156,163,175,0.35)'
}

function getIllustration(score: number): string {
  if (score >= 85) return '/illustrations/result-s-grade.png'
  if (score >= 70) return '/illustrations/result-perfect.png'
  if (score >= 55) return '/illustrations/result-effort.png'
  if (score >= 40) return '/illustrations/result-chill.png'
  return '/illustrations/result-beginner.png'
}

const STAT_COLORS: Record<string, string> = {
  애정력: '#7C5CFC',
  책임감: '#52C47A',
  관찰력: '#FFB347',
  영양관리: '#FF8A7A',
}


interface Props {
  result: ButlerResult
  petName: string
  onRestart: () => void
}

export default function Result({ result, petName, onRestart }: Props) {
  const [barsVisible, setBarsVisible] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  const filename = `집사력테스트_${petName}_${result.jipsaScore}점.png`

  const handleDownload = async () => {
    setIsBusy(true)
    await downloadCard('result-card-export', filename)
    setIsBusy(false)
  }

  const handleShare = async () => {
    setIsBusy(true)
    await shareResult({
      elementId: 'result-card-export',
      petName,
      score: result.jipsaScore,
      jipsaType: result.jipsaType,
      filename,
    })
    setIsBusy(false)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#F7F5FF', padding: '20px 0 40px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>

        {/* ── 내보내기 대상 카드 (고정 390px) ── */}
        <div
          id="result-card-export"
          style={{
            width: '390px',
            maxWidth: '100%',
            margin: '0 auto',
            background: '#fff',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(124,92,252,0.12)',
            fontFamily: 'system-ui, -apple-system, "Noto Sans KR", sans-serif',
          }}
        >
          {/* 상단 헤더 — 일러스트 풀뷰 */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src={getIllustration(result.jipsaScore)}
              alt=""
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
            {/* 상단 highlight 필 오버레이 */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              padding: '16px 20px',
              textAlign: 'center',
            }}>
              <div style={{
                display: 'inline-block',
                maxWidth: '82%',
                background: 'rgba(255,255,255,0.75)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1A1A2E',
                letterSpacing: '0.2px',
                lineHeight: '1.4',
              }}>
                {result.highlight}
              </div>
            </div>
            {/* 하단 집사 타입명 오버레이 — 배지(44px 겹침) 위로 올라오도록 padding-bottom 확보 */}
            <div style={{
              position: 'absolute',
              top: 0, bottom: 0, left: 0, right: 0,
              padding: '0 20px 44px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              background: 'linear-gradient(to top, rgba(40,20,90,0.65) 0%, transparent 55%)',
            }}>
              <h2 style={{
                fontSize: '24px', fontWeight: 800, color: '#fff',
                lineHeight: '1.3', margin: 0,
                letterSpacing: '-0.3px',
                textShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>
                {result.jipsaType}
              </h2>
            </div>
          </div>

          <div style={{ padding: '0 20px 20px', position: 'relative', zIndex: 1, background: '#fff' }}>
            {/* 점수 배지 */}
            <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
              <div style={{
                display: 'inline-block',
                width: '88px', height: '88px',
                borderRadius: '50%',
                background: getScoreBadgeGradient(result.jipsaScore),
                boxShadow: getScoreBadgeShadow(result.jipsaScore),
                border: '4px solid #fff',
                boxSizing: 'border-box',
              }}>
                <div style={{ display: 'table', width: '100%', height: '100%' }}>
                  <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff', lineHeight: '1' }}>
                      {result.jipsaScore}점
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* 능력치 바 */}
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(result.stats).map(([label, value], i) => (
                <div key={label} style={{
                  background: '#F7F5FF',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  border: `1.5px solid ${STAT_COLORS[label] || '#7C5CFC'}22`,
                }}>
                  {/* table-cell로 html2canvas 호환 좌우 정렬 */}
                  <div style={{ display: 'table', width: '100%', marginBottom: '8px' }}>
                    <span style={{ display: 'table-cell', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#1A1A2E' }}>{label}</span>
                    <span style={{ display: 'table-cell', textAlign: 'right', fontSize: '14px', fontWeight: 800, color: STAT_COLORS[label] || '#7C5CFC' }}>{value}</span>
                  </div>
                  <div style={{ height: '10px', borderRadius: '99px', background: `${STAT_COLORS[label] || '#7C5CFC'}22`, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '99px',
                      background: `linear-gradient(90deg, ${STAT_COLORS[label] || '#7C5CFC'}, ${STAT_COLORS[label] || '#7C5CFC'}88)`,
                      width: barsVisible ? `${value}%` : '0%',
                      transition: `width 1s ease-out ${i * 0.15}s`,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 반려동물 시점 메시지 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,138,122,0.10), rgba(255,179,71,0.10))',
              border: '1.5px solid rgba(255,138,122,0.25)',
              borderLeft: '4px solid #FF8A7A',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '14px', lineHeight: 1.65, color: '#3D2B2B',
                fontStyle: 'italic', margin: 0,
              }}>
                {result.petMessage}
              </p>
            </div>

            {/* 집사 설명 */}
            <div style={{
              background: '#F7F5FF', borderRadius: '14px', padding: '14px', marginBottom: '16px',
            }}>
              <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#6B6B8A', margin: 0 }}>
                {result.jipsaDescription}
              </p>
            </div>

            {/* 행복 지수 */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: '#9B9BB8', fontWeight: 600, marginBottom: '8px' }}>
                반려동물 행복 지수
              </p>
              <div style={{ textAlign: 'center' }}>
                {HAPPINESS_EMOJIS.map((emoji, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      margin: '0 4px',
                      fontSize: i + 1 === result.happinessLevel ? '28px' : '20px',
                      opacity: i + 1 === result.happinessLevel ? 1 : 0.3,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>

            {/* 워터마크 */}
            <div style={{ textAlign: 'right', marginTop: '12px', paddingBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#A0A0B8', fontWeight: 600 }}>
                🐾 세펫푸 집사력 테스트
              </span>
            </div>
          </div>
          {/* 하단 여백 — 클리핑 방지 */}
          <div style={{ height: '8px', background: '#fff' }} />
        </div>

        {/* 액션 버튼 */}
        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={handleDownload}
            disabled={isBusy}
            style={{
              padding: '15px',
              borderRadius: '16px',
              border: '1.5px solid #E8E4F8',
              background: '#fff',
              color: '#1A1A2E',
              fontSize: '14px', fontWeight: 700,
              cursor: isBusy ? 'not-allowed' : 'pointer',
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            📸 이미지 저장
          </button>
          <button
            onClick={handleShare}
            disabled={isBusy}
            style={{
              padding: '15px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #7C5CFC, #A78BFA)',
              color: '#fff',
              fontSize: '14px', fontWeight: 700,
              cursor: isBusy ? 'not-allowed' : 'pointer',
              opacity: isBusy ? 0.6 : 1,
              boxShadow: '0 4px 16px rgba(124,92,252,0.30)',
            }}
          >
            🐾 집사력 자랑하기
          </button>
        </div>

        <button
          onClick={onRestart}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '15px',
            borderRadius: '16px',
            border: '1.5px solid #E8E4F8',
            background: 'transparent',
            color: '#9B9BB8',
            fontSize: '14px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          다시 테스트하기
        </button>
      </div>
    </div>
  )
}
