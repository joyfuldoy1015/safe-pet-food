'use client'

import { useState } from 'react'
import Landing from '@/components/butler/Landing'
import PetInfo from '@/components/butler/PetInfo'
import FoodInfo from '@/components/butler/FoodInfo'
import Survey from '@/components/butler/Survey'
import LoadingPaws from '@/components/butler/LoadingPaws'
import Result from '@/components/butler/Result'
import type { ButlerResult } from '@/lib/butler/scoreCalc'
import { getFallbackResult } from '@/lib/butler/scoreCalc'

type Screen = 'landing' | 'petInfo' | 'foodInfo' | 'survey' | 'loading' | 'result'

interface FormData {
  petName: string
  petType: string
  petAge: string
  healthStatus: string
  foodInput: string
  feedCount: string
  productId?: string
  answers: Record<string, string>
}

const INITIAL_FORM: FormData = {
  petName: '',
  petType: '',
  petAge: '',
  healthStatus: '',
  foodInput: '',
  feedCount: '',
  answers: {},
}

export default function ButlerTestPage() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [result, setResult] = useState<ButlerResult | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = (next: Screen) => {
    setTransitioning(true)
    setTimeout(() => {
      setScreen(next)
      setTransitioning(false)
    }, 180)
  }

  const handleAnalyze = async (answers: Record<string, string>) => {
    const finalData = { ...formData, answers }
    setFormData(finalData)
    goTo('loading')

    // 잠깐 로딩 애니메이션 보여주기 위해 최소 2초 보장
    const [apiResult] = await Promise.all([
      fetchResult(finalData),
      new Promise(res => setTimeout(res, 2000)),
    ])

    setResult(apiResult)
    setScreen('result')
    setTransitioning(false)
  }

  const fetchResult = async (data: FormData): Promise<ButlerResult> => {
    try {
      const res = await fetch('/api/butler-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: data.petName,
          petType: data.petType,
          petAge: data.petAge,
          healthStatus: data.healthStatus,
          foodInput: data.foodInput,
          feedCount: data.feedCount,
          answers: data.answers,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.jipsaType) throw new Error()
      return json as ButlerResult
    } catch {
      return getFallbackResult(data)
    }
  }

  const handleRestart = () => {
    setFormData(INITIAL_FORM)
    setResult(null)
    goTo('landing')
  }

  const wrapperStyle: React.CSSProperties = {
    minHeight: 'calc(100vh - 64px)',
    opacity: transitioning ? 0 : 1,
    transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
    transition: 'opacity 0.18s ease, transform 0.18s ease',
  }

  return (
    <div style={wrapperStyle}>
      {screen === 'landing' && (
        <Landing onStart={() => goTo('petInfo')} />
      )}

      {screen === 'petInfo' && (
        <PetInfo
          initial={{
            petName: formData.petName,
            petType: formData.petType,
            petAge: formData.petAge,
            healthStatus: formData.healthStatus,
          }}
          onNext={data => {
            setFormData(prev => ({ ...prev, ...data }))
            goTo('foodInfo')
          }}
          onBack={() => goTo('landing')}
        />
      )}

      {screen === 'foodInfo' && (
        <FoodInfo
          initial={{
            foodInput: formData.foodInput,
            feedCount: formData.feedCount,
            productId: formData.productId,
          }}
          onNext={data => {
            setFormData(prev => ({ ...prev, foodInput: data.foodInput, feedCount: data.feedCount, productId: data.productId }))
            goTo('survey')
          }}
          onBack={() => goTo('petInfo')}
        />
      )}

      {screen === 'survey' && (
        <Survey
          initial={formData.answers}
          onComplete={handleAnalyze}
          onBack={() => goTo('foodInfo')}
        />
      )}

      {screen === 'loading' && (
        <LoadingPaws petName={formData.petName} />
      )}

      {screen === 'result' && result && (
        <Result
          result={result}
          petName={formData.petName}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
