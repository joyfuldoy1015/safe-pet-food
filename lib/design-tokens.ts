// ─────────────────────────────────────────
// Safe Petfood Design Tokens
// ─────────────────────────────────────────

export const colors = {
  // Primary
  primary: '#7C5CFC',
  primaryLight: '#A78BFA',
  primaryXLight: '#EDE8FF',
  primaryBg: '#F7F5FF',
  primaryBorder: '#E8E4F8',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B8A',
  textTertiary: '#9B9BB8',

  // White / Surface
  white: '#ffffff',
  cardBg: '#ffffff',

  // Semantic - Stats
  statLove: '#7C5CFC',
  statResp: '#52C47A',
  statObs: '#FFB347',
  statNutr: '#FF8A7A',

  // Semantic - Error
  errorText: '#D94F4F',
  errorBg: '#FFF0F0',

  // Semantic - Score badge
  scoreBadgeFrom: '#6B48F0',
  scoreBadgeTo: '#C4B5FD',

  // Overlay
  overlayDark: 'rgba(40,20,90,0.65)',
  overlayTopGrad: 'rgba(0,0,0,0.38)',
} as const

export const radii = {
  sm: '12px',   // 보조 버튼, 에러 박스
  md: '14px',   // input 필드
  lg: '16px',   // 주요 버튼
  xl: '20px',   // highlight pill
  card: '24px', // 카드 컨테이너
  full: '99px', // pill 태그, 프로그레스 바
  circle: '50%',
} as const

export const fontSizes = {
  xs: '11px',   // 워터마크
  sm: '12px',   // 보조 캡션, 스텝 배지
  md: '13px',   // 레이블, 스탯 텍스트
  base: '14px', // 일반 본문
  lg: '15px',   // 입력 필드, 버튼 보조
  xl: '16px',   // 주요 버튼, 섹션 제목
  '2xl': '17px',// 로딩 메시지
  '3xl': '19px',// 설문 질문
  '4xl': '24px',// 카드 타입명
  '5xl': '28px',// 섹션 헤더
  hero: '56px', // 랜딩 메인 타이틀 (이모지 포함)
} as const

export const fontWeights = {
  regular: 400,
  medium: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
} as const
