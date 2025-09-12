'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Heart, Share2, Copy } from 'lucide-react'

interface PetInfo {
  name: string
  type: 'dog' | 'cat'
  breed: string
  age: number
  ageUnit: 'months' | 'years'
  gender: 'male' | 'female'
  neutered: boolean
  conditions: string
  concerns: string
}

interface AnalysisResult {
  summary: string
  positive_signs: Array<{
    item: string
    value: string
    range: string
    description: string
  }>
  watchList: Array<{
    name: string
    value: string
    range: string
    meaning: string
    reason: string
    severity: 'high' | 'medium' | 'low'
  }>
  normalSigns: Array<{
    name: string
    value: string
    range: string
  }>
  recommendations: string[]
  fullReport: Record<string, any>
}

export default function HealthAnalyzer() {
  const [files, setFiles] = useState<File[]>([])
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: '',
    type: 'dog',
    breed: '',
    age: 1,
    ageUnit: 'years',
    gender: 'male',
    neutered: false,
    conditions: '',
    concerns: ''
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setError('')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files))
      setError('')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('PDF 파일을 업로드해주세요.')
      return
    }

    if (!petInfo.name.trim()) {
      setError('반려동물의 이름을 입력해주세요.')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('petInfo', JSON.stringify(petInfo))

      const response = await fetch('/api/health-analyzer', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`분석 요청 실패: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (err) {
      console.error('분석 오류:', err)
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="w-5 h-5" />
      case 'medium': return <AlertCircle className="w-5 h-5" />
      case 'low': return <AlertCircle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  const generateQuestions = (watchList: AnalysisResult['watchList']) => {
    const questions = watchList.map(item => 
      `${item.name}에 대해 더 자세히 알고 싶어요. ${item.reason}`
    )
    
    if (questions.length > 0) {
      questions.push('다음 검진은 언제 받는 것이 좋을까요?')
    }
    
    return questions
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        alert('클립보드에 복사되었습니다!')
      } else {
        // 폴백: 텍스트 선택 방식
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('클립보드에 복사되었습니다!')
      }
    } catch (err) {
      console.error('복사 실패:', err)
      alert('복사에 실패했습니다.')
    }
  }

  const shareToSNS = (platform: string) => {
    const text = `${petInfo.name}의 건강 분석 결과를 확인했어요! 🏥✨`
    const url = window.location.href

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case 'kakao':
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`)
        break
    }
  }

  const isButtonDisabled = files.length === 0 || !petInfo.name.trim() || isAnalyzing

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            건강검진표 AI 분석기 ❤️
          </h1>
          <p className="text-lg text-gray-600">
            반려동물의 건강검진 결과를 업로드하면 AI가 상세하게 분석하여 보호자가 이해하기 쉽게 설명해드려요
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
        {!result ? (
          <div className="space-y-8">
            {/* Pet Information Form */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Heart className="w-5 h-5 text-red-500 mr-2" />
                반려동물 정보
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={petInfo.name}
                    onChange={(e) => setPetInfo({...petInfo, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="반려동물의 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종류
                  </label>
                  <select
                    value={petInfo.type}
                    onChange={(e) => setPetInfo({...petInfo, type: e.target.value as 'dog' | 'cat'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="dog">강아지 🐕</option>
                    <option value="cat">고양이 🐱</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    품종
                  </label>
                  <input
                    type="text"
                    value={petInfo.breed}
                    onChange={(e) => setPetInfo({...petInfo, breed: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="품종을 입력하세요 (예: 골든리트리버)"
                  />
                </div>

                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      나이
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={petInfo.age}
                      onChange={(e) => setPetInfo({...petInfo, age: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      단위
                    </label>
                    <select
                      value={petInfo.ageUnit}
                      onChange={(e) => setPetInfo({...petInfo, ageUnit: e.target.value as 'months' | 'years'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="months">개월</option>
                      <option value="years">세</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성별
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={petInfo.gender === 'male'}
                        onChange={(e) => setPetInfo({...petInfo, gender: e.target.value as 'male' | 'female'})}
                        className="mr-2"
                      />
                      수컷
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={petInfo.gender === 'female'}
                        onChange={(e) => setPetInfo({...petInfo, gender: e.target.value as 'male' | 'female'})}
                        className="mr-2"
                      />
                      암컷
                    </label>
                  </div>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={petInfo.neutered}
                      onChange={(e) => setPetInfo({...petInfo, neutered: e.target.checked})}
                      className="mr-2"
                    />
                    중성화 완료
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기저질환 또는 복용 중인 약물
                  </label>
                  <textarea
                    value={petInfo.conditions}
                    onChange={(e) => setPetInfo({...petInfo, conditions: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={2}
                    placeholder="기저질환이나 복용 중인 약물이 있다면 입력하세요"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    보호자 관심사 또는 걱정되는 점
                  </label>
                  <textarea
                    value={petInfo.concerns}
                    onChange={(e) => setPetInfo({...petInfo, concerns: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={2}
                    placeholder="특별히 관심있거나 걱정되는 부분이 있다면 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                건강검진표 업로드
              </h2>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-600">
                    PDF 파일을 드래그하여 올리거나 클릭하여 선택하세요
                  </p>
                  <p className="text-sm text-gray-500">
                    혈액검사, 소변검사 등 건강검진 결과표를 업로드해주세요
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  파일 선택
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">업로드된 파일:</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500 mr-3" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Helper Text */}
            {isButtonDisabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
                  <p className="text-blue-700">
                    {files.length === 0 && '📄 PDF 파일을 업로드해주세요.'}
                    {files.length > 0 && !petInfo.name.trim() && '🐾 반려동물의 이름을 입력해주세요.'}
                  </p>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                disabled={isButtonDisabled}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  isButtonDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    분석 중...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 inline mr-2" />
                    분석 시작하기
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-8">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {petInfo.name}의 건강 분석 완료! 🎉
                </h2>
                <p className="text-gray-600">{result.summary}</p>
              </div>
            </div>

            {/* Positive Signs */}
            {result.positive_signs && result.positive_signs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  긍정적인 소견
                </h3>
                <div className="space-y-4">
                  {result.positive_signs.map((sign, index) => (
                    <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-green-800">{sign.item}</h4>
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          {sign.value}
                        </span>
                      </div>
                      <p className="text-sm text-green-700">{sign.description}</p>
                      <p className="text-xs text-green-600 mt-1">정상범위: {sign.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Watch List */}
            {result.watchList && result.watchList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
                  주의 관찰 항목
                </h3>
                <div className="space-y-4">
                  {result.watchList.map((item, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(item.severity)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {getSeverityIcon(item.severity)}
                          <h4 className="font-medium ml-2">{item.name}</h4>
                        </div>
                        <span className="text-sm px-2 py-1 rounded bg-white/50">
                          {item.value}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{item.meaning}</p>
                      <p className="text-sm font-medium">{item.reason}</p>
                      <p className="text-xs mt-1 opacity-75">정상범위: {item.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Normal Signs */}
            {result.normalSigns && result.normalSigns.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CheckCircle className="w-6 h-6 text-blue-500 mr-2" />
                  정상 범위 항목
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.normalSigns.map((sign, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-blue-800">{sign.name}</h4>
                        <span className="text-sm text-blue-600">{sign.value}</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">정상범위: {sign.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Heart className="w-6 h-6 text-red-500 mr-2" />
                  관리 권장사항
                </h3>
                <div className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-sm font-medium text-red-600">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 flex-1">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Report */}
            {result.fullReport && Object.keys(result.fullReport).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 text-gray-500 mr-2" />
                  전체 검사 결과
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">항목</th>
                        <th className="text-left py-2 px-3">결과</th>
                        <th className="text-left py-2 px-3">단위</th>
                        <th className="text-left py-2 px-3">정상범위</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.fullReport).map(([key, data]: [string, any]) => (
                        <tr key={key} className="border-b">
                          <td className="py-2 px-3 font-medium">{key}</td>
                          <td className="py-2 px-3">{data?.value || '-'}</td>
                          <td className="py-2 px-3">{data?.unit || '-'}</td>
                          <td className="py-2 px-3">{data?.range || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Questions for Vet */}
            {result.watchList && result.watchList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <AlertCircle className="w-6 h-6 text-purple-500 mr-2" />
                  수의사에게 물어볼 질문들
                </h3>
                <div className="space-y-3">
                  {generateQuestions(result.watchList).map((question, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-sm font-medium text-purple-600">Q{index + 1}</span>
                      </div>
                      <p className="text-gray-700 flex-1">{question}</p>
                      <button
                        onClick={() => copyToClipboard(question)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                        title="복사하기"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Share2 className="w-6 h-6 text-blue-500 mr-2" />
                분석 결과 공유하기
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => shareToSNS('twitter')}
                  className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  트위터 공유
                </button>
                <button
                  onClick={() => shareToSNS('facebook')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  페이스북 공유
                </button>
                <button
                  onClick={() => shareToSNS('kakao')}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  카카오스토리 공유
                </button>
              </div>
            </div>

            {/* New Analysis Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setFiles([])
                  setError('')
                }}
                className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                새로운 분석하기
              </button>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  )
}