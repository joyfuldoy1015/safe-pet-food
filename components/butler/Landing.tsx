'use client'

const FLOATING_PETS = ['🐕', '🐱', '🐰', '🐹', '🐦', '🐾', '🐶', '🐈']

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(160deg, #EDE8FF 0%, #F7F5FF 40%, #FFF0E8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 플로팅 이모지 */}
      {FLOATING_PETS.map((pet, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            fontSize: `${20 + (i % 3) * 8}px`,
            opacity: 0.12,
            left: `${(i * 137) % 90}%`,
            top: `${(i * 83) % 85}%`,
            animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.5}s infinite alternate`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {pet}
        </span>
      ))}

      {/* 콘텐츠 */}
      <div style={{ textAlign: 'center', maxWidth: '360px', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>🐾</div>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#1A1A2E',
            lineHeight: 1.3,
            marginBottom: '12px',
            letterSpacing: '-0.5px',
          }}
        >
          나는 몇 점짜리
          <br />
          집사일까?
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#6B6B8A',
            marginBottom: '8px',
            lineHeight: 1.5,
          }}
        >
          내 반려동물이 직접 채점한다면?
        </p>
        <p style={{ fontSize: '14px', color: '#9B9BB8', marginBottom: '40px' }}>
          약 2분 · 5단계 테스트
        </p>

        <button
          onClick={onStart}
          aria-label="집사력 테스트 시작하기"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #7C5CFC, #A78BFA)',
            color: '#fff',
            border: 'none',
            borderRadius: '99px',
            padding: '16px 36px',
            fontSize: '17px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(124,92,252,0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 28px rgba(124,92,252,0.45)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(124,92,252,0.35)'
          }}
        >
          🐾 테스트 시작하기
        </button>
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to   { transform: translateY(-14px) rotate(8deg); }
        }
      `}</style>
    </div>
  )
}
