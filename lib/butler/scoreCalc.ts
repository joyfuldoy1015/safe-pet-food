export interface ButlerResult {
  jipsaType: string
  jipsaScore: number
  stats: { 애정력: number; 책임감: number; 관찰력: number; 영양관리: number }
  petMessage: string
  jipsaDescription: string
  happinessLevel: number
  typeEmoji: string
  highlight: string
}

const RESULT_TYPES: Array<{
  min: number
  max: number
  jipsaType: string
  typeEmoji: string
  highlight: string
  jipsaDescription: string
}> = [
  {
    min: 85, max: 100,
    jipsaType: '완전무결 S급 집사',
    typeEmoji: '👑',
    highlight: '이 집사 실화냐? 레전드 등극!',
    jipsaDescription: '사랑, 책임감, 영양관리까지 모든 면에서 완벽에 가까운 집사입니다. 반려동물이 매일 행복한 이유가 있군요.',
  },
  {
    min: 70, max: 84,
    jipsaType: '마음만큼은 만점 집사',
    typeEmoji: '💜',
    highlight: '오히려 조아! 럭키 집사야',
    jipsaDescription: '진심 어린 사랑을 바탕으로 반려동물을 잘 돌보는 집사입니다. 조금만 더 디테일을 챙기면 S급도 시간 문제!',
  },
  {
    min: 55, max: 69,
    jipsaType: '노력하는 현실 집사',
    typeEmoji: '🌱',
    highlight: '성장 중, 지금도 충분히 잘하고 있어',
    jipsaDescription: '열심히 하고 싶은 마음은 가득하지만 현실의 벽이 있는 집사입니다. 꾸준히 관심을 쏟으면 반려동물도 알아줄 거예요.',
  },
  {
    min: 40, max: 54,
    jipsaType: '무심한 듯 다정한 집사',
    typeEmoji: '😅',
    highlight: '사실 많이 사랑하는 거 나는 알아',
    jipsaDescription: '겉으론 무심해 보여도 속으론 반려동물을 아끼는 집사입니다. 표현을 조금만 더 해준다면 관계가 더 깊어질 거예요.',
  },
  {
    min: 0, max: 39,
    jipsaType: '집사 입문 중',
    typeEmoji: '🌟',
    highlight: '지금부터 시작해도 충분해!',
    jipsaDescription: '아직 반려동물과 호흡을 맞춰가는 단계의 집사입니다. 작은 관심 하나하나가 쌓여 최고의 집사가 될 거예요.',
  },
]

export function getJipsaDescription(score: number): string {
  const type = RESULT_TYPES.find(t => score >= t.min && score <= t.max) ?? RESULT_TYPES[2]
  return type.jipsaDescription
}

// 질문별 스탯 점수 매핑
// Q1: 아픈 것 같을 때 → 책임감 + 관찰력
// Q2: 교감 시간 → 애정력
// Q3: 생일 인지 → 애정력
// Q4: 배변/건강 체크 → 관찰력 + 책임감
// Q5: 최근에 한 일 → 애정력 + 책임감
const STAT_MAP: Record<string, Record<string, Partial<Record<'애정력' | '책임감' | '관찰력', number>>>> = {
  Q1: {
    A: { 책임감: 100, 관찰력: 90 },
    B: { 책임감: 65,  관찰력: 75 },
    C: { 책임감: 45,  관찰력: 50 },
    D: { 책임감: 15,  관찰력: 15 },
  },
  Q2: {
    A: { 애정력: 100 },
    B: { 애정력: 65 },
    C: { 애정력: 35 },
    D: { 애정력: 50 }, // 자율 방임이 꼭 나쁜 건 아니나 교감은 낮음
  },
  Q3: {
    A: { 애정력: 100 },
    B: { 애정력: 75 },
    C: { 애정력: 50 },
    D: { 애정력: 20 },
  },
  Q4: {
    A: { 관찰력: 100, 책임감: 90 },
    B: { 관찰력: 70,  책임감: 65 },
    C: { 관찰력: 35,  책임감: 30 },
    D: { 관찰력: 10,  책임감: 10 },
  },
  Q5: {
    A: { 애정력: 90, 책임감: 75 },
    B: { 애정력: 85, 책임감: 70 },
    C: { 애정력: 80, 책임감: 90 }, // 산책/운동은 책임감 최고
    D: { 애정력: 20, 책임감: 15 },
  },
}

function avg(nums: number[]): number {
  if (!nums.length) return 50
  return nums.reduce((s, v) => s + v, 0) / nums.length
}

export function getFallbackResult(formData: {
  petName: string
  petType: string
  foodInput: string
  feedCount?: string
  answers: Record<string, string>
}): ButlerResult {
  const answers = formData.answers || {}

  // 스탯별로 해당 질문의 점수만 모아 평균
  const love: number[] = []
  const resp: number[] = []
  const obs:  number[] = []

  for (const [qId, ansKey] of Object.entries(answers)) {
    const mapping = STAT_MAP[qId]?.[ansKey]
    if (!mapping) continue
    if (mapping.애정력 !== undefined) love.push(mapping.애정력)
    if (mapping.책임감 !== undefined) resp.push(mapping.책임감)
    if (mapping.관찰력 !== undefined) obs.push(mapping.관찰력)
  }

  // 영양관리: 급식 횟수 + 사료 입력 여부로 산정
  const feedBonus =
    formData.feedCount === '2회' ? 85 :
    formData.feedCount === '1회' ? 65 :
    formData.feedCount === '3회 이상' ? 70 :
    formData.feedCount === '자율 급식' ? 60 : 60
  const foodBonus = (formData.foodInput?.length ?? 0) > 3 ? 10 : 0
  const nutr = Math.min(100, Math.round(feedBonus + foodBonus))

  const loveScore = Math.min(100, Math.round(avg(love)))
  const respScore = Math.min(100, Math.round(avg(resp)))
  const obsScore  = Math.min(100, Math.round(avg(obs)))

  // 종합 점수: 스탯 가중 평균 (영양관리는 사료 정보 기반이므로 낮은 가중치)
  const jipsaScore = Math.min(100, Math.round(
    loveScore * 0.3 + respScore * 0.3 + obsScore * 0.25 + nutr * 0.15
  ))

  const type = RESULT_TYPES.find(t => jipsaScore >= t.min && jipsaScore <= t.max) ?? RESULT_TYPES[2]
  const happinessLevel = Math.max(1, Math.min(5, Math.round(jipsaScore / 20)))

  return {
    jipsaType: type.jipsaType,
    jipsaScore,
    stats: { 애정력: loveScore, 책임감: respScore, 관찰력: obsScore, 영양관리: nutr },
    petMessage: `${formData.petName}아, 솔직히 말할게. 넌 나를 나름 열심히 챙겨주는 편이야. 밥도 잘 챙겨주고, 가끔 쓰다듬어 줄 때 사실 엄청 좋거든. 앞으로도 지금처럼만 해줘. 우린 꽤 괜찮은 팀이야. 🐾`,
    jipsaDescription: type.jipsaDescription,
    happinessLevel,
    typeEmoji: type.typeEmoji,
    highlight: type.highlight,
  }
}
