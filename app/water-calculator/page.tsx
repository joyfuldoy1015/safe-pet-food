'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Droplets, Calculator, Info } from 'lucide-react'

interface WaterResult {
  min: number
  max: number
  average: number
  coefficient: string
}

export default function WaterCalculator() {
  const [petType, setPetType] = useState<'dog' | 'cat' | ''>('')
  const [weight, setWeight] = useState<number>(0)
  const [activityLevel, setActivityLevel] = useState<'low' | 'normal' | 'high' | ''>('')
  const [result, setResult] = useState<WaterResult | null>(null)

  const calculateWater = () => {
    if (weight > 0 && petType) {
      let minCoeff: number
      let maxCoeff: number
      let coefficientText: string

      // 반려동물 종류별 계수 설정
      if (petType === 'dog') {
        minCoeff = 40
        maxCoeff = 60
        coefficientText = '40-60ml/kg'
      } else {
        minCoeff = 50
        maxCoeff = 70
        coefficientText = '50-70ml/kg'
      }

      // 활동량에 따른 조정
      if (activityLevel === 'low') {
        minCoeff = Math.round(minCoeff * 0.9)
        maxCoeff = Math.round(maxCoeff * 0.9)
      } else if (activityLevel === 'high') {
        minCoeff = Math.round(minCoeff * 1.2)
        maxCoeff = Math.round(maxCoeff * 1.2)
      }

      const minWater = weight * minCoeff
      const maxWater = weight * maxCoeff
      const avgWater = (minWater + maxWater) / 2

      setResult({
        min: minWater,
        max: maxWater,
        average: avgWater,
        coefficient: coefficientText
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">음수량 계산기</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Droplets className="h-6 w-6 text-cyan-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">반려동물 정보 입력</h2>
            <p className="text-xs text-gray-500">우리 아이의 적정 하루 물 섭취량을 계산해보세요</p>
          </div>
          
          {/* Pet Type */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              반려동물 종류
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPetType('dog')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  petType === 'dog'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-xl mb-1">🐶</div>
                <div className="text-sm font-medium">강아지</div>
              </button>
              <button
                onClick={() => setPetType('cat')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  petType === 'cat'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-xl mb-1">🐱</div>
                <div className="text-sm font-medium">고양이</div>
              </button>
            </div>
          </div>

          {/* Weight */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              체중 (kg)
            </label>
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="체중을 입력하세요"
              step="0.1"
              min="0.1"
            />
            <p className="text-[10px] text-gray-400 mt-1.5">
              강아지는 40-60ml/kg, 고양이는 50-70ml/kg을 권장합니다.
            </p>
          </div>

          {/* Activity Level */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              활동량
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActivityLevel('low')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  activityLevel === 'low'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-lg mb-1">😴</div>
                <div className="text-sm font-medium">낮음</div>
                <div className="text-[10px] text-gray-500">실내 생활</div>
              </button>
              <button
                onClick={() => setActivityLevel('normal')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  activityLevel === 'normal'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-lg mb-1">😊</div>
                <div className="text-sm font-medium">보통</div>
                <div className="text-[10px] text-gray-500">규칙적 산책</div>
              </button>
              <button
                onClick={() => setActivityLevel('high')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  activityLevel === 'high'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-lg mb-1">🏃</div>
                <div className="text-sm font-medium">높음</div>
                <div className="text-[10px] text-gray-500">활발한 운동</div>
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateWater}
            disabled={!petType || weight <= 0}
            className="w-full bg-violet-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            <span>음수량 계산하기</span>
          </button>

          {/* Result */}
          {result && (
            <div className="mt-5 p-4 bg-cyan-50 rounded-xl">
              <h3 className="text-sm font-bold text-cyan-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Droplets className="h-4 w-4 text-cyan-600" />
                </div>
                예상 일일 권장 음수량
              </h3>
              
              <div className="text-center mb-4 p-4 bg-white rounded-xl">
                <div className="text-2xl font-bold text-cyan-600 mb-1">
                  {Math.round(result.min)} ~ {Math.round(result.max)} ml
                </div>
                <div className="text-[10px] text-gray-500">
                  환경, 건강 상태, 급여 종류에 따라 달라질 수 있습니다.
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 mb-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">계산 기준:</h4>
                <div className="space-y-1 text-[11px] text-gray-600">
                  <p>• {petType === 'dog' ? '강아지' : '고양이'}: 체중 kg당 {result.coefficient}</p>
                  <p>• 체중: {weight}kg</p>
                  {activityLevel === 'low' && (
                    <p>• 낮은 활동량: 10% 감소</p>
                  )}
                  {activityLevel === 'high' && (
                    <p>• 높은 활동량: 20% 증가</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-amber-700 space-y-0.5">
                  <p>본 계산기는 일반적인 참고용입니다.</p>
                  <p>특별한 질병이 있는 경우 수의사와 상담하세요.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
