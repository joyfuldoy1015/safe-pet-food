'use client'

import React, { useState } from 'react'
import { Calculator, ArrowLeft, Info, Heart, Zap } from 'lucide-react'
import Link from 'next/link'

interface PetInfo {
  type: 'dog' | 'cat'
  age: 'puppy' | 'adult' | 'senior'
  weight: number
  activityLevel: 'low' | 'normal' | 'high'
  isNeutered: boolean
  feedCaloriePerKg: number // 사료 1kg당 칼로리 (kcal/kg)
}

interface CalorieResult {
  baseCalories: number
  adjustedCalories: number
  dailyFeedingAmount: number
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

  const calculateCalories = () => {
    if (petInfo.weight <= 0) return

    // RER (Resting Energy Requirement) 계산
    const rer = 70 * Math.pow(petInfo.weight, 0.75)
    
    // 활동 계수 적용
    let activityMultiplier = 1.6 // 기본값 (성견/성묘, 중성화됨)
    
    if (petInfo.type === 'dog') {
      if (petInfo.age === 'puppy') {
        activityMultiplier = 3.0
      } else if (petInfo.age === 'senior') {
        activityMultiplier = petInfo.isNeutered ? 1.4 : 1.6
      } else {
        if (petInfo.isNeutered) {
          activityMultiplier = petInfo.activityLevel === 'low' ? 1.4 : 
                             petInfo.activityLevel === 'normal' ? 1.6 : 1.8
        } else {
          activityMultiplier = petInfo.activityLevel === 'low' ? 1.6 : 
                             petInfo.activityLevel === 'normal' ? 1.8 : 2.0
        }
      }
    } else { // cat
      if (petInfo.age === 'puppy') { // kitten
        activityMultiplier = 2.5
      } else if (petInfo.age === 'senior') {
        activityMultiplier = petInfo.isNeutered ? 1.1 : 1.4
      } else {
        if (petInfo.isNeutered) {
          activityMultiplier = petInfo.activityLevel === 'low' ? 1.2 : 
                             petInfo.activityLevel === 'normal' ? 1.4 : 1.6
        } else {
          activityMultiplier = petInfo.activityLevel === 'low' ? 1.4 : 
                             petInfo.activityLevel === 'normal' ? 1.6 : 1.8
        }
      }
    }

    const dailyCalories = Math.round(rer * activityMultiplier)
    // 입력한 사료 1kg당 칼로리를 기반으로 급여량 계산 (g 단위)
    const feedingAmount = petInfo.feedCaloriePerKg > 0 
      ? Math.round((dailyCalories / petInfo.feedCaloriePerKg) * 1000)
      : 0

    const recommendations = [
      `하루 ${Math.round(dailyCalories / 2)} 칼로리씩 2회 급여를 권장합니다.`,
      petInfo.type === 'dog' ? 
        '강아지는 규칙적인 운동과 함께 급여량을 조절하세요.' : 
        '고양이는 소량씩 여러 번 나누어 급여하는 것이 좋습니다.',
      '체중 변화를 주기적으로 확인하고 급여량을 조절하세요.',
      '특별한 건강 상태가 있다면 수의사와 상담하세요.'
    ]

    setResult({
      baseCalories: Math.round(rer),
      adjustedCalories: dailyCalories,
      dailyFeedingAmount: feedingAmount,
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
  }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            사료 칼로리 & 급여량 계산기 ⚡
          </h1>
          <p className="text-lg text-gray-600">
            우리 아이의 체중과 활동량에 맞는 적정 칼로리와 급여량을 계산해보세요
          </p>
        </div>

        {!showResult ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">반려동물 정보 입력</h2>
              <p className="text-gray-600">반려동물의 정보를 입력하여 적정 칼로리를 계산해보세요</p>
            </div>

            <div className="space-y-6">
              {/* 반려동물 종류 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">반려동물 종류</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'dog', label: '강아지', icon: '🐕' },
                    { value: 'cat', label: '고양이', icon: '🐱' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPetInfo(prev => ({ ...prev, type: option.value as 'dog' | 'cat' }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        petInfo.type === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 나이 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">나이</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'puppy', label: petInfo.type === 'dog' ? '강아지' : '새끼고양이', desc: '1세 미만' },
                    { value: 'adult', label: '성체', desc: '1-7세' },
                    { value: 'senior', label: '노령', desc: '7세 이상' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPetInfo(prev => ({ ...prev, age: option.value as any }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        petInfo.age === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 체중 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">체중 (kg)</label>
                <input
                  type="number"
                  value={petInfo.weight || ''}
                  onChange={(e) => setPetInfo(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="체중을 입력하세요"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* 활동량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">활동량</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'low', label: '낮음', desc: '실내생활, 운동 적음' },
                    { value: 'normal', label: '보통', desc: '일반적인 활동량' },
                    { value: 'high', label: '높음', desc: '활발한 운동, 많은 활동' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPetInfo(prev => ({ ...prev, activityLevel: option.value as any }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        petInfo.activityLevel === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 중성화 여부 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">중성화 여부</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: true, label: '중성화함' },
                    { value: false, label: '중성화 안함' }
                  ].map((option) => (
                    <button
                      key={option.value.toString()}
                      onClick={() => setPetInfo(prev => ({ ...prev, isNeutered: option.value }))}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        petInfo.isNeutered === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 사료 1kg당 칼로리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  사료 1kg당 칼로리 (kcal/kg)
                  <span className="ml-2 text-xs text-gray-500">사료 포장지의 영양성분표를 확인하세요</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={petInfo.feedCaloriePerKg || ''}
                    onChange={(e) => setPetInfo(prev => ({ ...prev, feedCaloriePerKg: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 350 (일반적인 건사료 기준)"
                    min="0"
                    step="1"
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-semibold mb-1">참고 사항:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• 일반 건사료: 300-400 kcal/kg</li>
                          <li>• 습사료: 800-1,200 kcal/kg</li>
                          <li>• 반습식 사료: 1,200-1,400 kcal/kg</li>
                          <li>• 사료 포장지의 "사료 1kg당 칼로리" 또는 "대사 에너지" 값을 입력하세요</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={calculateCalories}
                disabled={petInfo.weight <= 0 || petInfo.feedCaloriePerKg <= 0}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                칼로리 계산하기
              </button>
            </div>
          </div>
        ) : (
          <div id="calculation-result" className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">계산 결과</h2>
              <p className="text-gray-600">반려동물의 하루 권장 칼로리입니다</p>
            </div>

            {result && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {result.baseCalories}
                    </div>
                    <div className="text-sm text-gray-600">기초 대사량 (kcal)</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {result.adjustedCalories}
                    </div>
                    <div className="text-sm text-gray-600">하루 권장 칼로리 (kcal)</div>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {result.dailyFeedingAmount}g
                    </div>
                    <div className="text-sm text-gray-600">일일 사료량</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({petInfo.feedCaloriePerKg} kcal/kg 기준)
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-3">급여 권장사항</h3>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="text-yellow-700 text-sm">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={resetCalculator}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                  >
                    다시 계산하기
                  </button>
                  <Link
                    href="/nutrition-calculator"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    영양성분 분석하기
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