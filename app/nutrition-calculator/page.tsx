'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle, Info, Share2, Heart, Calculator, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Nutritional Standards (Dry Matter Basis)
const NUTRIENT_STANDARDS = {
  dog: {
    growth: {
      protein: { min: 22.5, max: 35 },
      fat: { min: 8.5, max: 18 },
      fiber: { min: 2, max: 8 },
      ash: { min: 5, max: 10 },
      calcium: { min: 1.0, max: 1.8 },
      phosphorus: { min: 0.8, max: 1.4 },
      ca_p_ratio: { min: 1.0, max: 2.0 }
    },
    adult: {
      protein: { min: 18, max: 32 },
      fat: { min: 5.5, max: 16 },
      fiber: { min: 2, max: 8 },
      ash: { min: 5, max: 10 },
      calcium: { min: 0.6, max: 1.5 },
      phosphorus: { min: 0.5, max: 1.2 },
      ca_p_ratio: { min: 1.0, max: 2.0 }
    },
    senior: {
      protein: { min: 18, max: 28 },
      fat: { min: 5.5, max: 14 },
      fiber: { min: 3, max: 10 },
      ash: { min: 5, max: 9 },
      calcium: { min: 0.6, max: 1.2 },
      phosphorus: { min: 0.5, max: 1.0 },
      ca_p_ratio: { min: 1.0, max: 2.0 }
    }
  },
  cat: {
    growth: {
      protein: { min: 30, max: 45 },
      fat: { min: 9, max: 20 },
      fiber: { min: 1, max: 6 },
      ash: { min: 6, max: 12 },
      calcium: { min: 1.0, max: 1.8 },
      phosphorus: { min: 0.8, max: 1.4 },
      ca_p_ratio: { min: 1.0, max: 2.0 }
    },
    adult: {
      protein: { min: 26, max: 40 },
      fat: { min: 9, max: 18 },
      fiber: { min: 1, max: 6 },
      ash: { min: 6, max: 12 },
      calcium: { min: 0.6, max: 1.5 },
      phosphorus: { min: 0.5, max: 1.2 },
      ca_p_ratio: { min: 1.0, max: 2.0 }
    },
    senior: {
      protein: { min: 26, max: 35 },
      fat: { min: 9, max: 16 },
      fiber: { min: 2, max: 8 },
      ash: { min: 6, max: 10 },
      calcium: { min: 0.6, max: 1.2 },
      phosphorus: { min: 0.5, max: 1.0 },
      ca_p_ratio: { min: 1.0, max: 2.0 }
    }
  }
}

// Component Weights
const COMPONENT_WEIGHTS = {
  protein: 25,
  fat: 20,
  calcium: 10,
  phosphorus: 10,
  ca_p_ratio: 10,
  fiber: 10,
  ash: 10,
  moisture: 5
}

// Health Status Penalty Multipliers
const HEALTH_PENALTY_MULTIPLIERS = {
  normal: 1.0,
  obesity: 1.2,
  kidney_disease: 1.5,
  diabetes: 1.3,
  heart_disease: 1.3,
  digestive_issues: 1.1
}

interface NutrientInput {
  protein: number
  fat: number
  fiber: number
  ash: number
  moisture: number
  calcium: number
  phosphorus: number
}

interface ScoreBreakdown {
  component: string
  weight: number
  dm_value: number
  target_range: string
  deduction: number
  remaining_points: number
  status: 'optimal' | 'acceptable' | 'danger'
}

interface CalculationResult {
  total_score: number
  breakdown: ScoreBreakdown[]
  ca_p_ratio: number
  overall_grade: string
}

export default function NutritionCalculator() {
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog')
  const [lifeStage, setLifeStage] = useState<'growth' | 'adult' | 'senior'>('adult')
  const [healthStatus, setHealthStatus] = useState<keyof typeof HEALTH_PENALTY_MULTIPLIERS>('normal')
  const [nutrients, setNutrients] = useState<NutrientInput>({
    protein: 0,
    fat: 0,
    fiber: 0,
    ash: 0,
    moisture: 0,
    calcium: 0,
    phosphorus: 0
  })
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  // Helper function to convert to dry matter basis
  const convertToDryMatter = (asFedPercentage: number, moisturePercentage: number): number => {
    if (moisturePercentage >= 100) return 0
    return (asFedPercentage / (100 - moisturePercentage)) * 100
  }

  // Calculate deduction based on scoring framework
  const calculateDeduction = (
    dmValue: number,
    targetRange: { min: number; max: number },
    weight: number,
    penaltyMultiplier: number
  ): { deduction: number; status: 'optimal' | 'acceptable' | 'danger' } => {
    const { min, max } = targetRange
    
    // Optimal Range: No deduction
    if (dmValue >= min && dmValue <= max) {
      return { deduction: 0, status: 'optimal' }
    }
    
    // Calculate acceptable range (±15% of optimal)
    const acceptableMin = min * 0.85
    const acceptableMax = max * 1.15
    
    // Acceptable Range
    if (dmValue >= acceptableMin && dmValue <= acceptableMax) {
      let deviationRatio: number
      if (dmValue < min) {
        deviationRatio = (min - dmValue) / (min - acceptableMin)
      } else {
        deviationRatio = (dmValue - max) / (acceptableMax - max)
      }
      
      const deduction = weight * Math.pow(deviationRatio, 2) * penaltyMultiplier
      return { deduction, status: 'acceptable' }
    }
    
    // Danger Zone
    let furtherDeviationRatio: number
    if (dmValue < acceptableMin) {
      furtherDeviationRatio = (acceptableMin - dmValue) / acceptableMin
    } else {
      furtherDeviationRatio = (dmValue - acceptableMax) / acceptableMax
    }
    
    const deduction = weight * (1 + furtherDeviationRatio) * 1.5 * penaltyMultiplier
    return { deduction: Math.min(deduction, weight), status: 'danger' }
  }

  // Main scoring method
  const calculateNutritionScore = (): CalculationResult => {
    let totalScore = 100
    const breakdown: ScoreBreakdown[] = []
    const standards = NUTRIENT_STANDARDS[petType][lifeStage]
    const penaltyMultiplier = HEALTH_PENALTY_MULTIPLIERS[healthStatus]
    
    // Calculate Ca:P ratio
    const caValue = convertToDryMatter(nutrients.calcium, nutrients.moisture)
    const pValue = convertToDryMatter(nutrients.phosphorus, nutrients.moisture)
    const caPRatio = pValue > 0 ? caValue / pValue : 0
    
    // Process each nutrient
    const nutrientKeys = ['protein', 'fat', 'fiber', 'ash', 'calcium', 'phosphorus'] as const
    
    for (const nutrient of nutrientKeys) {
      const dmValue = convertToDryMatter(nutrients[nutrient], nutrients.moisture)
      const targetRange = standards[nutrient]
      const weight = COMPONENT_WEIGHTS[nutrient]
      
      const { deduction, status } = calculateDeduction(dmValue, targetRange, weight, penaltyMultiplier)
      const remainingPoints = Math.max(0, weight - deduction)
      
      breakdown.push({
        component: nutrient,
        weight,
        dm_value: dmValue,
        target_range: `${targetRange.min}-${targetRange.max}%`,
        deduction,
        remaining_points: remainingPoints,
        status
      })
      
      totalScore -= deduction
    }
    
    // Process Ca:P ratio
    const caPWeight = COMPONENT_WEIGHTS.ca_p_ratio
    const caPTargetRange = standards.ca_p_ratio
    const { deduction: caPDeduction, status: caPStatus } = calculateDeduction(
      caPRatio, caPTargetRange, caPWeight, penaltyMultiplier
    )
    const caPRemainingPoints = Math.max(0, caPWeight - caPDeduction)
    
    breakdown.push({
      component: 'ca_p_ratio',
      weight: caPWeight,
      dm_value: caPRatio,
      target_range: `${caPTargetRange.min}-${caPTargetRange.max}`,
      deduction: caPDeduction,
      remaining_points: caPRemainingPoints,
      status: caPStatus
    })
    
    totalScore -= caPDeduction
    
    // Process moisture (special case for dry kibble)
    const moistureWeight = COMPONENT_WEIGHTS.moisture
    let moistureDeduction = 0
    let moistureStatus: 'optimal' | 'acceptable' | 'danger' = 'optimal'
    
    if (nutrients.moisture < 15 && nutrients.moisture > 12) {
      moistureDeduction = moistureWeight // Deduct all points for mold risk
      moistureStatus = 'danger'
    }
    
    breakdown.push({
      component: 'moisture',
      weight: moistureWeight,
      dm_value: nutrients.moisture,
      target_range: '< 12% (건식사료)',
      deduction: moistureDeduction,
      remaining_points: moistureWeight - moistureDeduction,
      status: moistureStatus
    })
    
    totalScore -= moistureDeduction
    totalScore = Math.max(0, Math.min(100, totalScore))
    
    // Determine overall grade
    let overallGrade = ''
    if (totalScore >= 90) overallGrade = '우수 (A)'
    else if (totalScore >= 80) overallGrade = '양호 (B)'
    else if (totalScore >= 70) overallGrade = '보통 (C)'
    else if (totalScore >= 60) overallGrade = '미흡 (D)'
    else overallGrade = '부족 (F)'
    
    return {
      total_score: totalScore,
      breakdown,
      ca_p_ratio: caPRatio,
      overall_grade: overallGrade
    }
  }

  const handleCalculate = () => {
    const calculationResult = calculateNutritionScore()
    setResult(calculationResult)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'acceptable': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'danger': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800'
      case 'acceptable': return 'bg-yellow-100 text-yellow-800'
      case 'danger': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getComponentName = (component: string) => {
    const names: Record<string, string> = {
      'protein': '조단백질',
      'fat': '조지방',
      'fiber': '조섬유',
      'ash': '조회분',
      'calcium': '칼슘',
      'phosphorus': '인',
      'ca_p_ratio': 'Ca:P 비율(칼슘과 인의 비율)',
      'moisture': '수분'
    }
    return names[component] || component
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const generateShareUrl = () => {
    return `${window.location.origin}/nutrition-calculator?score=${result?.total_score}&type=${petType}&stage=${lifeStage}`
  }

  const handleSNSShare = (platform: string) => {
    if (!result) return

    const shareText = `🧪 우리 댕냥이 사료 영양성분 분석 결과: ${result.total_score.toFixed(1)}점 (${result.overall_grade})! 건조물질 기준 과학적 분석으로 더 정확한 영양 평가를 받아보세요. 🐾`
    const shareUrl = generateShareUrl()

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      kakao: `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  const copyToClipboard = () => {
    if (!result) return
    
    const shareText = `🧪 영양성분 분석 결과\n\n점수: ${result.total_score.toFixed(1)}점 (${result.overall_grade})\n반려동물: ${petType === 'dog' ? '강아지' : '고양이'} (${lifeStage === 'growth' ? '성장기' : lifeStage === 'adult' ? '성견/성묘' : '노령견/노령묘'})\n\n주요 성분 분석:\n${result.breakdown.slice(0, 3).map(item => `• ${getComponentName(item.component)}: ${item.dm_value.toFixed(1)}% (${item.status === 'optimal' ? '최적' : item.status === 'acceptable' ? '허용' : '위험'})`).join('\n')}\n\nSafe Pet Food 영양성분 분석기\n${generateShareUrl()}`
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert('결과가 클립보드에 복사되었습니다!')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            영양성분 분석기 🧪
          </h1>
          <p className="text-lg text-gray-600">
            반려동물 사료의 영양성분을 건조물질 기준으로 과학적으로 분석하고 평가합니다
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">반려동물 정보 및 영양성분</h2>
              
              {/* Pet Information */}
              <div className="space-y-6">
                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">반려동물 종류</label>
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

                {/* Life Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">생애주기</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setLifeStage('growth')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        lifeStage === 'growth'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">🌱</div>
                      <div className="font-medium text-sm">성장기</div>
                    </button>
                    <button
                      onClick={() => setLifeStage('adult')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        lifeStage === 'adult'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">🦴</div>
                      <div className="font-medium text-sm">성견/성묘</div>
                    </button>
                    <button
                      onClick={() => setLifeStage('senior')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        lifeStage === 'senior'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">👴</div>
                      <div className="font-medium text-sm">노령견/노령묘</div>
                    </button>
                  </div>
                </div>

                {/* Health Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">건강상태</label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value as keyof typeof HEALTH_PENALTY_MULTIPLIERS)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">정상</option>
                    <option value="obesity">비만</option>
                    <option value="kidney_disease">신장질환</option>
                    <option value="diabetes">당뇨</option>
                    <option value="heart_disease">심장질환</option>
                    <option value="digestive_issues">소화기 문제</option>
                  </select>
                </div>

                {/* Nutrient Inputs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">영양성분 입력 (%)</h3>
                  <p className="text-sm text-gray-600">사료 포장지의 영양성분 분석표를 참고하여 입력하세요</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(nutrients).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getComponentName(key)}
                        </label>
                        <input
                          type="number"
                          value={value || ''}
                          onChange={(e) => setNutrients(prev => ({
                            ...prev,
                            [key]: parseFloat(e.target.value) || 0
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.0"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Calculator className="h-5 w-5" />
                  <span>영양성분 분석하기</span>
                </button>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">분석 결과</h2>
                
                {/* Overall Score */}
                <div className="text-center mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {result.total_score.toFixed(1)}점
                  </div>
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    {result.overall_grade}
                  </div>
                                      <div className="text-sm text-gray-600">
                      Ca:P 비율(칼슘과 인의 비율): {result.ca_p_ratio.toFixed(2)}:1
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-gray-900">성분별 상세 분석</h3>
                  {result.breakdown.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="font-medium">
                            {getComponentName(item.component)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status === 'optimal' ? '최적' :
                             item.status === 'acceptable' ? '허용' : '위험'}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {item.remaining_points.toFixed(1)}/{item.weight}점
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                        <div>
                          {item.component === 'moisture' ? '수분함량' : '건조물질 기준'}: {item.dm_value.toFixed(2)}%
                        </div>
                        <div>
                          권장범위: {item.target_range}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    개선 권장사항
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {result.breakdown.filter(item => item.status !== 'optimal').slice(0, 3).map((item, index) => (
                      <li key={index}>
                        • {getComponentName(item.component)} 수치 조정이 필요합니다 
                        (현재: {item.dm_value.toFixed(2)}%, 권장: {item.target_range})
                      </li>
                    ))}
                    {result.breakdown.filter(item => item.status !== 'optimal').length === 0 && (
                      <li>• 모든 영양성분이 최적 범위에 있습니다! 👍</li>
                    )}
                  </ul>
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span>분석 결과 공유하기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">분석 결과 공유</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Preview Card */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {result.total_score.toFixed(1)}점
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {result.overall_grade}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {petType === 'dog' ? '🐶 강아지' : '🐱 고양이'} • {lifeStage === 'growth' ? '성장기' : lifeStage === 'adult' ? '성견/성묘' : '노령견/노령묘'}
                  </div>
                  
                  {/* Top 3 Components */}
                  <div className="space-y-2 mb-4">
                    {result.breakdown
                      .sort((a, b) => b.remaining_points - a.remaining_points)
                      .slice(0, 3)
                      .map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg text-sm">
                          <span className="font-medium">
                            {getComponentName(item.component)}: {item.dm_value.toFixed(1)}%
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                            {item.status === 'optimal' ? '최적' :
                             item.status === 'acceptable' ? '허용' : '위험'}
                          </span>
                        </div>
                      ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-3">
                    🧪 Safe Pet Food 영양성분 분석기
                  </div>
                </div>
              </div>
              
              {/* Share Options */}
              <div className="space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  📋 결과 복사하기
                </button>
                
                <button
                  onClick={() => handleSNSShare('kakao')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  💬 카카오톡으로 공유하기
                </button>
                
                <button
                  onClick={() => handleSNSShare('twitter')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  🐦 트위터로 공유하기
                </button>
                
                <button
                  onClick={() => handleSNSShare('facebook')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  📘 페이스북으로 공유하기
                </button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 text-center">
                분석 결과는 일반적인 참고용이며, 개체차이가 있을 수 있습니다.<br/>
                특별한 건강 상태가 있다면 수의사와 상담하세요.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 