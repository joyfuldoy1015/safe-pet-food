export type ProductCategory = '사료' | '간식' | '영양제' | '화장실'

export type FeedingStatus = '급여중' | '급여완료' | '급여중지'

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

export interface PostData {
  petName: string
  petBreed: string
  petAge: string
  petWeight: string
  ownerName: string
  feedingRecords: FeedingRecord[]
}

export interface PetProfile {
  id: string
  name: string
  species: 'dog' | 'cat'
  birthYear: number
  age: string
  gender: 'male' | 'female'
  neutered: boolean
  breed: string
  weight: string
  allergies: string[]
  healthConditions: string[]
  specialNotes: string
  createdAt: string
  updatedAt: string
  ownerId: string
  ownerName: string
}

export interface PetInfo {
  petName: string
  petBreed: string
  petAge: string
  petWeight: string
  ownerName: string
}

export const categoryConfig: Record<ProductCategory, { icon: string; color: string }> = {
  '사료': { icon: '🍽️', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  '간식': { icon: '🦴', color: 'text-green-600 bg-green-50 border-green-200' },
  '영양제': { icon: '💊', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  '화장실': { icon: '🚽', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

export const statusConfig: Record<FeedingStatus, { color: string }> = {
  '급여중': { color: 'text-green-700 bg-green-100 border-green-300' },
  '급여완료': { color: 'text-gray-700 bg-gray-100 border-gray-300' },
  '급여중지': { color: 'text-red-700 bg-red-100 border-red-300' }
}
