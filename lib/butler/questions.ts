export interface QuestionOption {
  key: string
  label: string
  emoji: string
}

export interface Question {
  id: string
  text: string
  options: QuestionOption[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    text: '반려동물이 아픈 것 같을 때 나는?',
    options: [
      { key: 'A', label: '바로 동물병원 예약한다', emoji: '🏥' },
      { key: 'B', label: '하루 더 지켜본다', emoji: '👀' },
      { key: 'C', label: '인터넷 검색부터 한다', emoji: '🔍' },
      { key: 'D', label: '대수롭지 않게 넘긴다', emoji: '😅' },
    ],
  },
  {
    id: 'Q2',
    text: '반려동물과 하루에 얼마나 교감하나요?',
    options: [
      { key: 'A', label: '퇴근하자마자 30분 이상', emoji: '💜' },
      { key: 'B', label: '밥 줄 때 쓰다듬는 편', emoji: '🤲' },
      { key: 'C', label: '바빠서 많이 못해', emoji: '😢' },
      { key: 'D', label: '자율적으로 알아서 지냄', emoji: '🏠' },
    ],
  },
  {
    id: 'Q3',
    text: '반려동물의 생일을 알고 있나요?',
    options: [
      { key: 'A', label: '당연하죠, 파티도 열어요', emoji: '🎂' },
      { key: 'B', label: '알아요 (기념은 못 해요)', emoji: '📅' },
      { key: 'C', label: '대략 알아요', emoji: '🤔' },
      { key: 'D', label: '잘 모르겠어요', emoji: '💦' },
    ],
  },
  {
    id: 'Q4',
    text: '반려동물의 배변/건강 상태를 체크하나요?',
    options: [
      { key: 'A', label: '매일 꼼꼼하게 봐요', emoji: '🔬' },
      { key: 'B', label: '이상하면 체크해요', emoji: '👁️' },
      { key: 'C', label: '가끔 생각날 때만요', emoji: '😬' },
      { key: 'D', label: '잘 안 챙기는 편이에요', emoji: '😶' },
    ],
  },
  {
    id: 'Q5',
    text: '반려동물을 위해 가장 최근에 한 일은?',
    options: [
      { key: 'A', label: '특식 or 간식 준비', emoji: '🍗' },
      { key: 'B', label: '장난감 or 용품 구매', emoji: '🎁' },
      { key: 'C', label: '산책 or 운동', emoji: '🐕' },
      { key: 'D', label: '특별히 한 게 없는 것 같아요', emoji: '🥲' },
    ],
  },
]
