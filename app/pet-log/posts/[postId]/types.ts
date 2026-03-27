export type ProductCategory = '사료' | '간식' | '영양제' | '화장실'

export type FeedingStatus = '급여중' | '급여완료' | '급여중지'

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
  replies: Reply[]
  isLiked: boolean
  type?: 'comment' | 'inquiry'
}

export interface Reply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
}

export interface FeedingRecord {
  id: string
  productName: string
  category: ProductCategory
  brand: string
  startDate: string
  endDate?: string
  status: FeedingStatus
  duration: string
  palatability: number
  satisfaction: number
  repurchaseIntent: boolean
  comment?: string
  imageUrl?: string
  price?: string
  purchaseLocation?: string
  sideEffects?: string[]
  benefits?: string[]
}

export interface DetailedPetLogPost {
  id: string
  petName: string
  petBreed: string
  petAge: string
  petWeight: string
  ownerName: string
  ownerId: string
  createdAt: string
  updatedAt: string
  totalRecords: number
  feedingRecords: FeedingRecord[]
  comments: Comment[]
  totalComments: number
}

export const categoryConfig = {
  '사료': { icon: '🥘', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50' },
  '간식': { icon: '🦴', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' },
  '영양제': { icon: '💊', color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50' },
  '화장실': { icon: '🚽', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50' }
}

export const statusConfig = {
  '급여중': { color: 'bg-green-100 text-green-800', icon: '🟢', label: '급여 중' },
  '급여완료': { color: 'bg-gray-100 text-gray-800', icon: '⚫', label: '급여 완료' },
  '급여중지': { color: 'bg-red-100 text-red-800', icon: '🔴', label: '급여 중지' }
}
