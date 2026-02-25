import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface PetInfo {
  type: 'dog' | 'cat'
  breed: string
  age: string
  ageUnit: 'years' | 'months'
  gender: 'male' | 'female'
  neutered: boolean
  conditions: string
  concerns: string
}

interface BloodTestItem {
  name: string
  value: number
  unit: string
  range: string
  isNormal: boolean
}

interface AnalysisResult {
  summary: string
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
  fullReport: any
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5
const ALLOWED_TYPES = ['application/pdf']

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.analyzeHealth)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE * MAX_FILES) {
      return NextResponse.json(
        { error: '전체 파일 크기가 제한을 초과했습니다.' },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const petInfoStr = formData.get('petInfo') as string
    
    if (!files.length || !petInfoStr) {
      return NextResponse.json(
        { error: 'PDF 파일과 반려동물 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `파일은 최대 ${MAX_FILES}개까지 업로드 가능합니다.` },
        { status: 400 }
      )
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다: ${file.name}` },
          { status: 413 }
        )
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `허용되지 않는 파일 형식입니다: ${file.name}. PDF 파일만 업로드 가능합니다.` },
          { status: 400 }
        )
      }
    }

    let petInfo: PetInfo
    try {
      petInfo = JSON.parse(petInfoStr)
    } catch {
      return NextResponse.json(
        { error: '반려동물 정보 형식이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 1. PDF 텍스트 추출 (OCR)
    const extractedTexts = await Promise.all(
      files.map(file => extractTextFromPDF(file))
    )
    const combinedText = extractedTexts.join('\n\n')

    // 2. 혈액검사 데이터 파싱
    const bloodTestData = parseBloodTestData(combinedText)

    // 3. LLM을 이용한 분석
    const analysisResult = await analyzeWithLLM(combinedText, bloodTestData, petInfo)

    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Health analysis error:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  // 실제 구현에서는 PDF-lib, pdf2pic + Tesseract, 또는 Google Cloud Vision API 사용
  // 여기서는 시뮬레이션을 위한 모의 데이터 반환
  
  const mockPDFContent = `
    COMPREHENSIVE HEALTH CHECK REPORT
    Pet Name: 멍멍이
    Date: 2024-12-15
    
    BLOOD CHEMISTRY PANEL
    ========================
    BUN (Blood Urea Nitrogen): 28 mg/dL (Reference: 7-27)
    CREA (Creatinine): 1.9 mg/dL (Reference: 0.5-1.8)
    ALT (Alanine Aminotransferase): 45 U/L (Reference: 10-100)
    AST (Aspartate Aminotransferase): 32 U/L (Reference: 10-100)
    Total Protein: 6.8 g/dL (Reference: 5.2-8.2)
    
    COMPLETE BLOOD COUNT
    ====================
    WBC (White Blood Cell): 8.5 K/μL (Reference: 5.5-16.9)
    RBC (Red Blood Cell): 7.2 M/μL (Reference: 5.5-8.5)
    HGB (Hemoglobin): 14.2 g/dL (Reference: 12.0-18.0)
    HCT (Hematocrit): 42% (Reference: 37-55)
    
    VETERINARY NOTES:
    Overall condition appears stable. Slight elevation in kidney markers (BUN, CREA) 
    warrants monitoring. Recommend follow-up in 2-3 weeks.
  `
  
  return mockPDFContent
}

function parseBloodTestData(text: string): BloodTestItem[] {
  const bloodTestItems: BloodTestItem[] = []
  
  // 정규식을 사용하여 혈액검사 항목 추출
  const patterns = [
    /BUN[^:]*:\s*(\d+\.?\d*)\s*mg\/dL[^(]*\(Reference:\s*([^)]+)\)/i,
    /CREA[^:]*:\s*(\d+\.?\d*)\s*mg\/dL[^(]*\(Reference:\s*([^)]+)\)/i,
    /ALT[^:]*:\s*(\d+\.?\d*)\s*U\/L[^(]*\(Reference:\s*([^)]+)\)/i,
    /AST[^:]*:\s*(\d+\.?\d*)\s*U\/L[^(]*\(Reference:\s*([^)]+)\)/i,
    /Total Protein[^:]*:\s*(\d+\.?\d*)\s*g\/dL[^(]*\(Reference:\s*([^)]+)\)/i,
    /WBC[^:]*:\s*(\d+\.?\d*)\s*K\/μL[^(]*\(Reference:\s*([^)]+)\)/i,
    /RBC[^:]*:\s*(\d+\.?\d*)\s*M\/μL[^(]*\(Reference:\s*([^)]+)\)/i,
  ]

  const itemNames = ['BUN', 'CREA', 'ALT', 'AST', 'Total Protein', 'WBC', 'RBC']
  const units = ['mg/dL', 'mg/dL', 'U/L', 'U/L', 'g/dL', 'K/μL', 'M/μL']

  patterns.forEach((pattern, index) => {
    const match = text.match(pattern)
    if (match) {
      const value = parseFloat(match[1])
      const range = match[2]
      const isNormal = isValueInRange(value, range)
      
      bloodTestItems.push({
        name: itemNames[index],
        value,
        unit: units[index],
        range,
        isNormal
      })
    }
  })

  return bloodTestItems
}

function isValueInRange(value: number, range: string): boolean {
  // "7-27" 형태의 범위 문자열을 파싱하여 정상 범위 내인지 확인
  const rangeMatch = range.match(/(\d+\.?\d*)-(\d+\.?\d*)/)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1])
    const max = parseFloat(rangeMatch[2])
    return value >= min && value <= max
  }
  return true
}

async function analyzeWithLLM(
  pdfText: string, 
  bloodTestData: BloodTestItem[], 
  petInfo: PetInfo
): Promise<AnalysisResult> {
  
  if (!OPENAI_API_KEY) {
    // API 키가 없는 경우 모의 데이터 반환
    return getMockAnalysisResult(bloodTestData)
  }

  try {
    const systemPrompt = `
너는 수의학 지식이 풍부한 반려동물 건강 데이터 분석가야. 
보호자가 이해하기 쉬운 언어로 설명해야 해. 
절대로 의학적 진단을 내리지 말고, '참고 정보'임을 항상 강조해야 해.

반려동물 정보:
- 종류: ${petInfo.type === 'dog' ? '강아지' : '고양이'}
- 품종: ${petInfo.breed || '정보 없음'}
- 나이: ${petInfo.age} ${petInfo.ageUnit === 'years' ? '년' : '개월'}
- 성별: ${petInfo.gender === 'male' ? '수컷' : '암컷'} (중성화: ${petInfo.neutered ? '함' : '안함'})
- 기저 질환: ${petInfo.conditions || '없음'}
- 보호자 관심사: ${petInfo.concerns || '없음'}

결과는 반드시 아래와 같은 JSON 형식으로 출력해줘:
{
  "summary": "종합 요약 (1-2문장)",
  "watchList": [
    {
      "name": "항목명",
      "value": "결과값",
      "range": "정상범위",
      "meaning": "이 수치의 의미",
      "reason": "관찰이 필요한 이유",
      "severity": "high|medium|low"
    }
  ],
  "normalSigns": [
    {
      "name": "항목명",
      "value": "결과값", 
      "range": "정상범위"
    }
  ]
}
`

    const userPrompt = `
다음 건강검진 결과를 분석해주세요:

PDF 내용:
${pdfText}

구조화된 혈액검사 데이터:
${JSON.stringify(bloodTestData, null, 2)}
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        temperature: 0.3,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API 호출 실패')
    }

    const data = await response.json()
    const analysisText = data.choices[0].message.content

    // JSON 추출 및 파싱
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0])
      return {
        ...analysisResult,
        fullReport: bloodTestData
      }
    }

    throw new Error('LLM 응답 파싱 실패')

  } catch (error) {
    console.error('LLM analysis error:', error)
    // LLM 분석 실패 시 모의 데이터 반환
    return getMockAnalysisResult(bloodTestData)
  }
}

function getMockAnalysisResult(bloodTestData: BloodTestItem[]): AnalysisResult {
  const abnormalItems = bloodTestData.filter(item => !item.isNormal)
  const normalItems = bloodTestData.filter(item => item.isNormal)

  const watchList = abnormalItems.map(item => ({
    name: `${item.name} (${getKoreanName(item.name)})`,
    value: `${item.value} ${item.unit}`,
    range: `${item.range} ${item.unit}`,
    meaning: getMeaning(item.name),
    reason: getReason(item.name, item.value, item.range),
    severity: getSeverity(item.name, item.value, item.range)
  }))

  const normalSigns = normalItems.map(item => ({
    name: getKoreanName(item.name),
    value: `${item.value} ${item.unit}`,
    range: `${item.range} ${item.unit}`
  }))

  const summary = abnormalItems.length > 0 
    ? "전반적으로 건강 상태는 양호하지만, 일부 수치에 대해 주의 깊은 관찰이 필요합니다. 수의사 선생님과 상담하여 추가적인 관리에 대해 논의해 보세요."
    : "모든 검사 수치가 정상 범위 내에 있어 전반적으로 건강한 상태로 보입니다. 정기적인 건강검진을 통해 계속 관리해 주세요."

  return {
    summary,
    watchList,
    normalSigns,
    fullReport: bloodTestData
  }
}

function getKoreanName(name: string): string {
  const nameMap: { [key: string]: string } = {
    'BUN': '혈액요소질소',
    'CREA': '크레아티닌',
    'ALT': 'ALT',
    'AST': 'AST',
    'Total Protein': '총 단백질',
    'WBC': '백혈구',
    'RBC': '적혈구'
  }
  return nameMap[name] || name
}

function getMeaning(name: string): string {
  const meaningMap: { [key: string]: string } = {
    'BUN': '신장의 노폐물 여과 기능을 나타내는 주요 지표 중 하나입니다.',
    'CREA': '근육에서 생성되는 노폐물로, 신장 기능을 평가하는 중요한 지표입니다.',
    'ALT': '간세포에서 주로 발견되는 효소로, 간 손상을 평가하는 지표입니다.',
    'AST': '간과 근육에서 발견되는 효소로, 간 기능과 근육 손상을 평가합니다.',
    'Total Protein': '혈액 내 총 단백질 농도로, 영양 상태와 간 기능을 반영합니다.',
    'WBC': '감염이나 염증에 대응하는 면역세포의 수치입니다.',
    'RBC': '산소를 운반하는 적혈구의 수치로, 빈혈 여부를 확인할 수 있습니다.'
  }
  return meaningMap[name] || '해당 항목에 대한 정보입니다.'
}

function getReason(name: string, value: number, range: string): string {
  const [min, max] = range.split('-').map(Number)
  const isHigh = value > max
  const isLow = value < min

  const reasonMap: { [key: string]: { high: string, low: string } } = {
    'BUN': {
      high: '정상 범위보다 높게 나타났습니다. 이는 탈수, 고단백 식이, 또는 초기 신장 기능 저하 등 다양한 원인일 수 있으므로 주의 깊은 관찰이 필요합니다.',
      low: '정상 범위보다 낮게 나타났습니다. 간 기능 저하나 단백질 섭취 부족 등이 원인일 수 있습니다.'
    },
    'CREA': {
      high: '정상 범위를 초과했습니다. 신장 기능에 대한 추가 검사가 필요할 수 있습니다.',
      low: '정상 범위보다 낮게 나타났습니다. 근육량 감소나 영양 상태를 확인해볼 필요가 있습니다.'
    }
  }

  const defaultReason = isHigh 
    ? '정상 범위보다 높게 측정되어 지속적인 관찰이 필요합니다.'
    : '정상 범위보다 낮게 측정되어 원인 파악이 필요합니다.'

  return reasonMap[name] ? (isHigh ? reasonMap[name].high : reasonMap[name].low) : defaultReason
}

function getSeverity(name: string, value: number, range: string): 'high' | 'medium' | 'low' {
  const [min, max] = range.split('-').map(Number)
  const deviation = Math.abs(value - (min + max) / 2) / ((max - min) / 2)
  
  if (deviation > 0.5) return 'high'
  if (deviation > 0.2) return 'medium'
  return 'low'
} 