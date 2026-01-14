// Review Log Types

export type Species = 'dog' | 'cat'
export type Category = 'feed' | 'snack' | 'supplement' | 'toilet'
export type Status = 'feeding' | 'paused' | 'completed'

export interface Owner {
  id: string
  nickname: string
  avatarUrl?: string
  pets: string[] // pet ids
}

export interface Pet {
  id: string
  name: string
  species: Species
  birthDate: string
  weightKg?: number
  tags?: string[] // e.g., ["allergy-chicken", "sensitive-stomach"]
}

export interface ReviewLog {
  id: string
  petId: string
  ownerId: string
  category: Category
  brand: string
  product: string
  status: Status
  periodStart: string
  periodEnd?: string
  durationDays?: number
  rating?: number
  recommend?: boolean
  continueReasons?: string[] // up to 5, show max 3 on card
  stopReasons?: string[] // idem
  excerpt: string
  notes?: string
  likes: number
  commentsCount: number
  views: number
  createdAt: string
  updatedAt: string
  // SAFI 계산을 위한 옵셔널 필드
  stool_score?: number | null
  allergy_symptoms?: boolean | null
  vomiting?: boolean | null
  appetite_change?: 'increased' | 'decreased' | 'no_change' | null
}

export interface Comment {
  id: string
  logId: string
  authorId: string
  authorName?: string  // 작성자 닉네임
  avatarUrl?: string   // 작성자 프로필 이미지
  content: string
  createdAt: string
  parentId?: string
  isBestAnswer?: boolean
  isHelpful?: boolean
  isDeleted?: boolean  // soft delete 여부
}

// Q&A Thread Types
export interface QAThread {
  id: string
  logId: string
  title: string
  authorId: string
  createdAt: string
}

export interface QAPost {
  id: string
  threadId: string
  authorId: string
  kind: 'question' | 'answer' | 'comment'
  content: string
  parentId?: string
  isAccepted: boolean
  upvotes: number
  createdAt: string
  isDeleted?: boolean  // soft delete 여부
}

export interface QAPostWithAuthor extends QAPost {
  author?: {
    id: string
    nickname: string
    avatarUrl?: string
  }
}

