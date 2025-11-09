import { Owner, Pet, ReviewLog, Comment } from '@/lib/types/review-log'

// Mock Owners
export const mockOwners: Owner[] = [
  {
    id: 'owner-1',
    nickname: '김집사',
    avatarUrl: '👨‍💼',
    pets: ['pet-1', 'pet-2']
  },
  {
    id: 'owner-2',
    nickname: '이수진',
    avatarUrl: '👩‍🦰',
    pets: ['pet-3']
  }
]

// Mock Pets
export const mockPets: Pet[] = [
  {
    id: 'pet-1',
    name: '뽀미',
    species: 'dog',
    birthDate: '2021-03-15',
    weightKg: 28,
    tags: ['allergy-chicken', 'sensitive-stomach']
  },
  {
    id: 'pet-2',
    name: '코코',
    species: 'dog',
    birthDate: '2020-06-20',
    weightKg: 32,
    tags: []
  },
  {
    id: 'pet-3',
    name: '모모',
    species: 'cat',
    birthDate: '2022-01-10',
    weightKg: 4.2,
    tags: ['picky-eater']
  }
]

// Helper to calculate duration in days
function calculateDurationDays(start: string, end?: string): number {
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date()
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Mock Review Logs
export const mockReviewLogs: ReviewLog[] = [
  {
    id: 'log-1',
    petId: 'pet-1',
    ownerId: 'owner-1',
    category: 'feed',
    brand: '로얄캐닌',
    product: '골든 리트리버 어덜트',
    status: 'feeding',
    periodStart: '2024-10-02',
    durationDays: calculateDurationDays('2024-10-02'),
    rating: 5,
    recommend: true,
    continueReasons: ['변 상태 개선', '모질 윤기', '알러지 없음'],
    excerpt: '3살 골든 리트리버에게 급여 중입니다. 털 윤기가 정말 좋아졌고, 변 상태도 완벽해요. 기호성도 우수해서 매일 잘 먹고 있습니다.',
    notes: '로얄캐닌으로 바꾼 후 변 상태가 완벽해졌고, 털도 윤기가 나기 시작했습니다. 알러지 반응도 전혀 없어서 안심하고 급여하고 있어요.',
    likes: 89,
    commentsCount: 23,
    views: 1247,
    createdAt: '2024-10-02T10:00:00Z',
    updatedAt: '2024-10-15T14:30:00Z'
  },
  {
    id: 'log-2',
    petId: 'pet-1',
    ownerId: 'owner-1',
    category: 'feed',
    brand: '힐스',
    product: '어덜트 라지 브리드',
    status: 'completed',
    periodStart: '2024-06-01',
    periodEnd: '2024-09-15',
    durationDays: calculateDurationDays('2024-06-01', '2024-09-15'),
    rating: 4,
    recommend: true,
    continueReasons: ['소화 잘됨', '기호성 좋음'],
    stopReasons: ['가격 부담'],
    excerpt: '다이어트용 사료로 3개월간 급여했습니다. 체중 관리에는 효과가 있었지만, 기호성은 조금 아쉬웠어요.',
    notes: '체중 관리에는 효과가 있었지만, 가격이 부담스러워서 다른 제품으로 바꿨습니다.',
    likes: 67,
    commentsCount: 15,
    views: 892,
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-09-15T18:00:00Z'
  },
  {
    id: 'log-3',
    petId: 'pet-2',
    ownerId: 'owner-1',
    category: 'snack',
    brand: '네츄럴발란스',
    product: '트레이닝 트릿',
    status: 'feeding',
    periodStart: '2024-09-10',
    durationDays: calculateDurationDays('2024-09-10'),
    rating: 5,
    recommend: true,
    continueReasons: ['치아 건강', '기호성 우수', '훈련 효과'],
    excerpt: '치아 건강을 위해 구매했는데 코코가 너무 좋아해요! 씹는 재미도 있고 실제로 치석도 줄어든 것 같습니다.',
    notes: '매일 하나씩 주고 있는데 치석이 눈에 띄게 줄어들었어요. 훈련용으로도 완벽합니다.',
    likes: 52,
    commentsCount: 18,
    views: 743,
    createdAt: '2024-09-10T11:00:00Z',
    updatedAt: '2024-09-10T11:00:00Z'
  },
  {
    id: 'log-4',
    petId: 'pet-1',
    ownerId: 'owner-1',
    category: 'supplement',
    brand: '뉴트리코',
    product: '오메가3 오일',
    status: 'feeding',
    periodStart: '2024-08-01',
    durationDays: calculateDurationDays('2024-08-01'),
    rating: 4,
    recommend: true,
    continueReasons: ['모질 윤기', '피부 건강'],
    excerpt: '털 윤기 개선을 위해 급여 중입니다. 효과가 있는 것 같아요.',
    notes: '오메가3 오일을 급여한 후 털이 부드러워지고 윤기가 나기 시작했습니다.',
    likes: 45,
    commentsCount: 12,
    views: 678,
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-15T15:00:00Z'
  },
  {
    id: 'log-5',
    petId: 'pet-3',
    ownerId: 'owner-2',
    category: 'feed',
    brand: '로얄캐닌',
    product: '페르시안 어덜트',
    status: 'feeding',
    periodStart: '2024-09-01',
    durationDays: calculateDurationDays('2024-09-01'),
    rating: 5,
    recommend: true,
    continueReasons: ['모질 윤기', '기호성 우수', '소화 잘됨'],
    excerpt: '페르시안 고양이 전용 사료라서 그런지 우리 모모가 정말 잘 먹어요! 털도 더 윤기나고 소화도 잘 되는 것 같아요.',
    notes: '페르시안 전용이라 털 관리에 특화되어 있어서 만족합니다. 모모가 정말 좋아해요.',
    likes: 78,
    commentsCount: 22,
    views: 1123,
    createdAt: '2024-09-01T09:00:00Z',
    updatedAt: '2024-09-20T14:00:00Z'
  },
  {
    id: 'log-6',
    petId: 'pet-1',
    ownerId: 'owner-1',
    category: 'feed',
    brand: '오리젠',
    product: '오리지널',
    status: 'paused',
    periodStart: '2024-05-01',
    periodEnd: '2024-05-30',
    durationDays: calculateDurationDays('2024-05-01', '2024-05-30'),
    rating: 4,
    recommend: true,
    continueReasons: ['고품질 원료', '소화 잘됨'],
    stopReasons: ['가격 부담', '섭취 거부'],
    excerpt: '고품질 원료로 만든 사료라서 믿고 급여하고 있어요. 루이가 정말 잘 먹고, 털도 윤기가 나고 소화도 잘 되는 것 같습니다.',
    notes: '품질은 좋았지만 가격이 부담스러웠고, 뽀미가 가끔 거부하는 경우가 있어서 바꿨습니다.',
    likes: 34,
    commentsCount: 8,
    views: 456,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-30T18:00:00Z'
  },
  {
    id: 'log-7',
    petId: 'pet-2',
    ownerId: 'owner-1',
    category: 'supplement',
    brand: '뉴트리코',
    product: '프로바이오틱스',
    status: 'feeding',
    periodStart: '2024-07-15',
    durationDays: calculateDurationDays('2024-07-15'),
    rating: 5,
    recommend: true,
    continueReasons: ['소화 개선', '변 상태 개선'],
    excerpt: '소화 개선을 위해 급여 중입니다. 변 상태가 훨씬 좋아졌어요.',
    notes: '프로바이오틱스를 급여한 후 소화가 개선되고 변 상태가 안정적이 되었습니다.',
    likes: 38,
    commentsCount: 9,
    views: 512,
    createdAt: '2024-07-15T11:00:00Z',
    updatedAt: '2024-07-20T16:00:00Z'
  },
  {
    id: 'log-8',
    petId: 'pet-3',
    ownerId: 'owner-2',
    category: 'snack',
    brand: '캣챠',
    product: '츄르',
    status: 'feeding',
    periodStart: '2024-08-20',
    durationDays: calculateDurationDays('2024-08-20'),
    rating: 5,
    recommend: true,
    continueReasons: ['기호성 우수', '훈련 효과'],
    excerpt: '간식으로 매일 조금씩 주고 있어요. 정말 좋아해요!',
    notes: '모모가 정말 좋아하는 간식입니다. 훈련용으로도 완벽해요.',
    likes: 28,
    commentsCount: 5,
    views: 345,
    createdAt: '2024-08-20T10:00:00Z',
    updatedAt: '2024-08-20T10:00:00Z'
  },
  {
    id: 'log-9',
    petId: 'pet-1',
    ownerId: 'owner-1',
    category: 'toilet',
    brand: '퍼피나스',
    product: '벤토나이트 모래',
    status: 'completed',
    periodStart: '2024-03-01',
    periodEnd: '2024-05-31',
    durationDays: calculateDurationDays('2024-03-01', '2024-05-31'),
    rating: 3,
    recommend: false,
    stopReasons: ['먼지 많음', '냄새 제거 부족'],
    excerpt: '먼지가 많아서 다른 제품으로 바꿨습니다.',
    notes: '먼지가 너무 많아서 호흡기 건강이 걱정되어 다른 제품으로 바꿨습니다.',
    likes: 12,
    commentsCount: 3,
    views: 234,
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-05-31T20:00:00Z'
  },
  {
    id: 'log-10',
    petId: 'pet-2',
    ownerId: 'owner-1',
    category: 'feed',
    brand: '아카나',
    product: '그라스랜드',
    status: 'feeding',
    periodStart: '2024-09-05',
    durationDays: calculateDurationDays('2024-09-05'),
    rating: 5,
    recommend: true,
    continueReasons: ['고품질 원료', '기호성 우수', '소화 잘됨'],
    excerpt: '고품질 원료로 만든 사료라서 믿고 급여하고 있어요. 코코가 정말 잘 먹고 있어요.',
    notes: '그레인프리 사료로 소화도 잘 되고 코코가 정말 좋아해요.',
    likes: 56,
    commentsCount: 14,
    views: 789,
    createdAt: '2024-09-05T10:00:00Z',
    updatedAt: '2024-09-18T15:00:00Z'
  }
]

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    logId: 'log-1',
    authorId: 'owner-2',
    content: '저희 고양이도 같은 사료 먹고 있어요! 정말 좋은 선택이에요.',
    createdAt: '2024-10-05T10:00:00Z',
    isHelpful: true
  },
  {
    id: 'comment-2',
    logId: 'log-1',
    authorId: 'owner-1',
    content: '급여량은 어떻게 하시나요? 저희는 하루 3컵씩 주고 있는데...',
    createdAt: '2024-10-06T14:00:00Z',
    parentId: 'comment-1'
  },
  {
    id: 'comment-3',
    logId: 'log-5',
    authorId: 'owner-1',
    content: '페르시안 전용 사료라니 좋네요! 저희 강아지도 장모종인데 추천할 만한가요?',
    createdAt: '2024-09-05T11:00:00Z',
    isBestAnswer: true
  }
]

// Mock Q&A Threads
import type { QAThread, QAPost } from '@/lib/types/review-log'

export const mockQAThreads: QAThread[] = [
  {
    id: 'thread-1',
    logId: 'log-1',
    title: '급여량은 어떻게 하시나요?',
    authorId: 'owner-2',
    createdAt: '2024-10-05T10:00:00Z'
  },
  {
    id: 'thread-2',
    logId: 'log-1',
    title: '알러지 반응은 없으셨나요?',
    authorId: 'owner-2',
    createdAt: '2024-10-06T14:00:00Z'
  },
  {
    id: 'thread-3',
    logId: 'log-5',
    title: '페르시안 고양이에게 추천할 만한가요?',
    authorId: 'owner-1',
    createdAt: '2024-09-05T11:00:00Z'
  }
]

// Mock Q&A Posts
export const mockQAPosts: QAPost[] = [
  // Thread 1: 급여량 질문
  {
    id: 'post-1',
    threadId: 'thread-1',
    authorId: 'owner-2',
    kind: 'question',
    content: '급여량은 어떻게 하시나요? 저희 강아지는 3살이고 28kg인데 하루에 몇 컵씩 주시는지 궁금해요.',
    isAccepted: false,
    upvotes: 5,
    createdAt: '2024-10-05T10:00:00Z'
  },
  {
    id: 'post-2',
    threadId: 'thread-1',
    authorId: 'owner-1',
    kind: 'answer',
    content: '저희 뽀미는 3살 골든 리트리버 28kg인데 하루에 3컵씩 주고 있어요. 아침 1.5컵, 저녁 1.5컵으로 나눠서 주고 있습니다. 체중이 안정적으로 유지되고 있어서 이 양이 적당한 것 같아요.',
    isAccepted: true,
    upvotes: 12,
    createdAt: '2024-10-05T11:30:00Z',
    parentId: 'post-1'
  },
  {
    id: 'post-3',
    threadId: 'thread-1',
    authorId: 'owner-2',
    kind: 'comment',
    content: '감사합니다! 저희도 비슷하게 해볼게요.',
    isAccepted: false,
    upvotes: 2,
    createdAt: '2024-10-05T12:00:00Z',
    parentId: 'post-2'
  },
  // Thread 2: 알러지 질문
  {
    id: 'post-4',
    threadId: 'thread-2',
    authorId: 'owner-2',
    kind: 'question',
    content: '알러지 반응은 없으셨나요? 저희 강아지가 닭고기 알러지가 있어서 걱정이에요.',
    isAccepted: false,
    upvotes: 3,
    createdAt: '2024-10-06T14:00:00Z'
  },
  {
    id: 'post-5',
    threadId: 'thread-2',
    authorId: 'owner-1',
    kind: 'answer',
    content: '저희 뽀미도 닭고기 알러지가 있었는데 이 사료는 전혀 문제가 없었어요. 원료를 확인해보니 닭고기가 포함되어 있지만, 가공 방식이 달라서 그런지 알러지 반응이 없었습니다. 하지만 개체차가 있을 수 있으니 처음에는 소량으로 테스트해보시는 것을 추천드려요.',
    isAccepted: true,
    upvotes: 8,
    createdAt: '2024-10-06T15:00:00Z',
    parentId: 'post-4'
  },
  // Thread 3: 페르시안 추천 질문
  {
    id: 'post-6',
    threadId: 'thread-3',
    authorId: 'owner-1',
    kind: 'question',
    content: '페르시안 고양이에게 추천할 만한가요? 저희 강아지도 장모종인데 털 관리에 도움이 될까요?',
    isAccepted: false,
    upvotes: 4,
    createdAt: '2024-09-05T11:00:00Z'
  },
  {
    id: 'post-7',
    threadId: 'thread-3',
    authorId: 'owner-2',
    kind: 'answer',
    content: '페르시안 전용 사료라서 털 관리에 특화되어 있어요. 저희 모모는 이 사료를 먹은 후 털이 훨씬 부드러워지고 윤기가 나기 시작했어요. 장모종 강아지에게도 도움이 될 것 같아요!',
    isAccepted: true,
    upvotes: 10,
    createdAt: '2024-09-05T12:00:00Z',
    parentId: 'post-6'
  }
]

