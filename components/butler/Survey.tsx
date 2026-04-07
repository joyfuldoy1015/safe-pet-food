'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { QUESTIONS } from '@/lib/butler/questions'

interface Props {
  onComplete: (answers: Record<string, string>) => void
  onBack: () => void
  initial: Record<string, string>
}

export default function Survey({ onComplete, onBack, initial }: Props) {
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(initial)
  const [animating, setAnimating] = useState(false)

  const q = QUESTIONS[qIndex]
  const progress = ((qIndex) / QUESTIONS.length) * 100

  const handleAnswer = (key: string) => {
    const newAnswers = { ...answers, [q.id]: key }
    setAnswers(newAnswers)
    setAnimating(true)
    setTimeout(() => {
      setAnimating(false)
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(qIndex + 1)
      } else {
        onComplete(newAnswers)
      }
    }, 250)
  }

  const handleBack = () => {
    if (qIndex > 0) setQIndex(qIndex - 1)
    else onBack()
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#F7F5FF', padding: '0 0 32px' }}>
      {/* 헤더 */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <button
            onClick={handleBack}
            aria-label="이전으로"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '12px',
              border: 'none', background: '#EDE8FF', color: '#7C5CFC', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A2E', flex: 1 }}>집사 마음 설문</span>
          <span style={{
            background: '#EDE8FF', color: '#7C5CFC',
            borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 700,
          }}>
            {qIndex + 1} / {QUESTIONS.length}
          </span>
        </div>
        {/* 프로그레스 */}
        <div style={{ height: '4px', borderRadius: '99px', background: '#E8E4F8', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: '99px',
            background: 'linear-gradient(90deg, #7C5CFC, #A78BFA)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '8px 20px 0' }}>
        {/* 질문 */}
        <div
          key={qIndex}
          style={{
            marginBottom: '20px',
            animation: animating ? 'slideOut 0.25s ease' : 'slideIn 0.3s ease',
          }}
        >
          <h2 style={{
            fontSize: '19px', fontWeight: 700, color: '#1A1A2E',
            lineHeight: 1.45, marginBottom: '20px', textAlign: 'center',
          }}>
            {q.text}
          </h2>

          {/* 답변 카드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {q.options.map(opt => {
              const isSelected = answers[q.id] === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => handleAnswer(opt.key)}
                  aria-label={opt.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    borderRadius: '18px',
                    border: `2px solid ${isSelected ? '#7C5CFC' : '#E8E4F8'}`,
                    background: isSelected ? '#EDE8FF' : '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 16px rgba(124,92,252,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  }}
                >
                  <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{opt.emoji}</span>
                  <span style={{
                    fontSize: '15px', fontWeight: 600,
                    color: isSelected ? '#7C5CFC' : '#1A1A2E', flex: 1,
                  }}>
                    {opt.label}
                  </span>
                  {isSelected && (
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: '#7C5CFC', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, flexShrink: 0,
                    }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-24px); }
        }
      `}</style>
    </div>
  )
}
