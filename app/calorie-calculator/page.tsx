'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calculator, ArrowLeft, Info, Heart, Zap } from 'lucide-react'
import Link from 'next/link'
import { calculateFeeding } from '@/lib/calorie-calculator'

interface PetInfo {
  type: 'dog' | 'cat'
  age: 'puppy' | 'adult' | 'senior'
  weight: number
  activityLevel: 'low' | 'normal' | 'high' | 'weight_loss'
  isNeutered: boolean
  feedCaloriePerKg: number // 사료 1kg당 칼로리 (kcal/kg)
  ageMonths?: number // Optional: age in months for more precise puppy/kitten calculations
}

interface CalorieResult {
  baseCalories: number // RER
  adjustedCalories: number // DER
  dailyFeedingAmount: number // feedingGrams
  activityFactor: number // activity factor used
  recommendations: string[]
}

export default function CalorieCalculator() {
  const [petInfo, setPetInfo] = useState<PetInfo>({
    type: 'dog',
    age: 'adult',
    weight: 0,
    activityLevel: 'normal',
    isNeutered: false,
    feedCaloriePerKg: 350 // 기본값: 350 kcal/kg
  })
  
  const [result, setResult] = useState<CalorieResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Debounced calculation function
  const calculateCalories = useCallback(() => {
    // Validation
    if (petInfo.weight <= 0 || petInfo.feedCaloriePerKg <= 0) {
      setResult(null)
      return
    }

    const calculation = calculateFeeding({
      species: petInfo.type,
      age: petInfo.age,
      weightKg: petInfo.weight,
      activity: petInfo.activityLevel,
      neutered: petInfo.isNeutered,
      kcalPerKg: petInfo.feedCaloriePerKg,
      ageMonths: petInfo.ageMonths
    })

    if (!calculation) {
      setResult(null)
      return
    }

    const { rer, factor, der, feedingGrams } = calculation

    const recommendations = [
      `하루 ${Math.round(der / 2)} 칼로리씩 2회 급여를 권장합니다.`,
      petInfo.type === 'dog' ? 
        '강아지는 규칙적인 운동과 함께 급여량을 조절하세요.' : 
        '고양이는 소량씩 여러 번 나누어 급여하는 것이 좋습니다.',
      '체중 변화를 주기적으로 확인하고 급여량을 조절하세요.',
      '특별한 건강 상태가 있다면 수의사와 상담하세요.'
    ]

    // Add weight loss note if applicable
    if (petInfo.activityLevel === 'weight_loss') {
      recommendations.push('체중 감량은 수의사 지도하에 진행하세요.')
    }

    // Add tip about treats
    recommendations.push('간식을 주는 경우 사료량을 약 10% 줄이세요.')

    setResult({
      baseCalories: rer,
      adjustedCalories: der,
      dailyFeedingAmount: feedingGrams,
      activityFactor: factor,
      recommendations
    })
    setShowResult(true)
    
    // 결과 표시 후 결과 섹션으로 스크롤
    setTimeout(() => {
      const resultSection = document.getElementById('calculation-result')
      if (resultSection) {
        resultSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)
  }, [petInfo])

  // Debounce calculation on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showResult) {
        calculateCalories()
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [petInfo, showResult, calculateCalories])

  const resetCalculator = () => {
    setPetInfo({
      type: 'dog',
      age: 'adult',
      weight: 0,
      activityLevel: 'normal',
      isNeutered: false,
      feedCaloriePerKg: 350
    })
    setResult(null)
    setShowResult(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">칼로리 & 급여량 계산기</h1>
        </div>

        {!showResult ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calculator className="h-6 w-6 text-violet-500" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1">반려동물 정보 입력</h2>
              <p className="text-xs text-gray-500">반려동물의 정보를 입력하여 적정 칼로리를 계산해보세요</p>
            </div>

            <div className="space-y-5">
              {/* 반려동물 종류 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">반려동물 종류</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'dog', label: '강아지', icon: '🐕' },
                    { value: 'cat', label: '고양이', icon: '🐱' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPetInfo(prev => ({ ...prev, type: option.value as 'dog' | 'cat' }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        petInfo.type === option.value
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 나이 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">나이</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'puppy', label: petInfo.type === 'dog' ? '강아지' : '새끼고양이', desc: '1세 미만' },
                    { value: 'adult', label: '성체', desc: '1-7세' },
                    { value: 'senior', label: '노령', desc: '7세 이상' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPetInfo(prev => ({ ...prev, age: option.value as any }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        petInfo.age === option.value
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-[10px] text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 체중 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  value={petInfo.weight || ''}
                  onChange={(e) => setPetInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="체중을 입력하세요"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* 활동량 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">활동량</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'low', label: '낮음', desc: '실내생활' },
                    { value: 'normal', label: '보통', desc: '일반 활동' },
                    { value: 'high', label: '높음', desc: '활발한 운동' },
                    { value: 'weight_loss', label: '감량', desc: '체중 감량' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPetInfo(prev => ({ ...prev, activityLevel: option.value as any }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        petInfo.activityLevel === option.value
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-[10px] text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 중성화 여부 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">중성화 여부</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: true, label: '중성화함' },
                    { value: false, label: '중성화 안함' }
                  ].map((option) => (
                    <button
                      key={option.value.toString()}
                      onClick={() => setPetInfo(prev => ({ ...prev, isNeutered: option.value }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        petInfo.isNeutered === option.value
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 사료 1kg당 칼로리 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  사료 1kg당 칼로리 (kcal/kg)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={petInfo.feedCaloriePerKg || ''}
                    onChange={(e) => setPetInfo(prev => ({ ...prev, feedCaloriePerKg: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="예: 3500 (일반적인 건사료 기준)"
                    min="0"
                    step="1"
                  />
                  <div className="bg-violet-50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-violet-700">
                        <p className="font-medium mb-1">참고 사항:</p>
                        <ul className="space-y-1 text-[10px] text-violet-600">
                          <li>• 건사료: 3,300~4,500 kcal/kg</li>
                          <li>• 습사료: 800~1,200 kcal/kg</li>
                        </ul>
                        <p className="mt-1.5 text-[10px]">
                          사료 포장지의 &quot;대사 에너지(ME)&quot; 값을 확인하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  calculateCalories()
                }}
                disabled={petInfo.weight <= 0 || petInfo.feedCaloriePerKg <= 0}
                className="w-full bg-violet-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                칼로리 계산하기
              </button>
            </div>
          </div>
        ) : (
          <div id="calculation-result" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">계산 결과</h2>
              <p className="text-xs text-gray-500">반려동물의 하루 권장 칼로리입니다</p>
            </div>

            {result && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-violet-50 p-4 rounded-xl text-center">
                    <div className="text-xl font-bold text-violet-600 mb-1">
                      {result.baseCalories}
                    </div>
                    <div className="text-[10px] text-gray-500">기초 대사량 (kcal)</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="text-xl font-bold text-green-600 mb-1">
                      {result.adjustedCalories}
                    </div>
                    <div className="text-[10px] text-gray-500">하루 권장 (kcal)</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <div className="text-xl font-bold text-orange-600 mb-1">
                      {result.dailyFeedingAmount.toFixed(1)}g
                    </div>
                    <div className="text-[10px] text-gray-500">일일 사료량</div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-semibold text-amber-800 mb-2">급여 권장사항</h3>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="text-amber-700 text-[11px]">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetCalculator}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    다시 계산하기
                  </button>
                  <Link
                    href="/brands"
                    className="flex-1 bg-violet-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-violet-600 transition-colors text-center"
                  >
                    브랜드 평가 보기
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
