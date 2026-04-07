'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  '반려동물이 채점 중이에요...',
  '{name}이/가 냉정하게 평가하는 중...',
  '집사력 분석 완료 직전!',
  '두근두근... 🐾',
]

export default function LoadingPaws({ petName }: { petName: string }) {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % MESSAGES.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const message = MESSAGES[msgIdx].replace('{name}', petName || '반려동물')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #F7F5FF 0%, #EDE8FF 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      {/* 발바닥 애니메이션 */}
      <div style={{ position: 'relative', width: '120px', height: '80px', marginBottom: '32px' }}>
        {['🐾', '🐾', '🐾'].map((paw, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              fontSize: '28px',
              left: `${i * 40}px`,
              animation: `pawWalk 1.2s ease-in-out ${i * 0.4}s infinite`,
              opacity: 0,
            }}
          >
            {paw}
          </span>
        ))}
      </div>

      {/* 메시지 */}
      <p
        key={msgIdx}
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: '#1A1A2E',
          textAlign: 'center',
          animation: 'fadeIn 0.4s ease',
          padding: '0 24px',
        }}
      >
        {message}
      </p>

      <p style={{ marginTop: '8px', fontSize: '13px', color: '#6B6B8A' }}>
        AI가 분석하는 중이에요
      </p>

      <style>{`
        @keyframes pawWalk {
          0%   { opacity: 0; transform: translateY(8px) scale(0.8); }
          30%  { opacity: 1; transform: translateY(0px) scale(1); }
          70%  { opacity: 1; transform: translateY(0px) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(0.8); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
