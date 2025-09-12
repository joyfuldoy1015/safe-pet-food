'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Droplets, Calculator } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            일일 음수량 계산기 💧
          </h1>
          <p className="text-lg text-gray-600">
            우리 아이의 적정 하루 물 섭취량을 계산하여 건강한 수분 공급을 도와드려요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">반려동물 정보</h2>
          
          {/* Pet Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              반려동물 종류
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPetType('dog')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  petType === 'dog'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🐶</div>
                <div className="font-medium">강아지</div>
              </button>
              <button
                onClick={() => setPetType('cat')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  petType === 'cat'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">🐱</div>
                <div className="font-medium">고양이</div>
              </button>
            </div>
          </div>

          {/* Weight */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              체중 (kg)
            </label>
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="체중을 입력하세요"
              step="0.1"
              min="0.1"
            />
            <p className="text-sm text-gray-500 mt-1">
              일반적으로 강아지는 40-60ml/kg, 고양이는 50-70ml/kg을 권장합니다.
            </p>
          </div>

          {/* Activity Level */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              활동량 (반려동물의 일상적인 활동 수준)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setActivityLevel('low')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activityLevel === 'low'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">😴</div>
                <div className="font-medium">낮음 (주로 실내, 최소한의 활동)</div>
              </button>
              <button
                onClick={() => setActivityLevel('normal')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activityLevel === 'normal'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">😊</div>
                <div className="font-medium">보통 (일반적인 활동량, 규칙적 산책)</div>
              </button>
              <button
                onClick={() => setActivityLevel('high')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activityLevel === 'high'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">🏃</div>
                <div className="font-medium">높음 (활동적, 긴 산책 또는 운동)</div>
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateWater}
            disabled={!petType || weight <= 0}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Calculator className="h-5 w-5" />
            <span>음수량 계산하기</span>
          </button>

          {/* Result */}
          {result && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <Droplets className="h-6 w-6 mr-2" />
                예상 일일 권장 음수량
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  약 {Math.round(result.min)} ml ~ {Math.round(result.max)} ml
                </div>
                <div className="text-lg text-gray-600">
                  (이는 일반적인 추정치이며, 환경, 건강 상태, 급여 종류(건식/습식)에 따라 달라질 수 있습니다.)
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">계산 기준:</h4>
                <p className="text-sm text-gray-600">
                  • {petType === 'dog' ? '강아지' : '고양이'}: 체중 kg당 음수량 계수 {result.coefficient}
                </p>
                <p className="text-sm text-gray-600">
                  • 체중: {weight}kg
                </p>
                {activityLevel === 'low' && (
                  <p className="text-sm text-gray-600">
                    • 낮은 활동량으로 인해 10% 감소 계산됨
                  </p>
                )}
                {activityLevel === 'high' && (
                  <p className="text-sm text-gray-600">
                    • 높은 활동량으로 인해 20% 추가 계산됨
                  </p>
                )}
              </div>

              <div className="text-sm text-blue-800 space-y-1">
                <p>주의: 본 계산기는 일반적인 참고용이며, 개체차이가 있을 수 있습니다.</p>
                <p>• 더운 날씨나 활동량이 많을 때는 더 많은 물이 필요할 수 있습니다</p>
                <p>• 특별한 질병이 있거나 특별한 관리가 필요한 경우 수의사와 상담하세요</p>
                <p>• 항상 신선한 물을 충분히 제공해주세요</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}