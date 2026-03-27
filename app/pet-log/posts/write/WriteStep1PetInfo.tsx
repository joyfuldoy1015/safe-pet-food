import Link from 'next/link'
import { PetProfile, PetInfo } from './types'

interface WriteStep1PetInfoProps {
  petProfiles: PetProfile[]
  selectedPetProfile: string
  petInfo: PetInfo
  setPetInfo: (info: PetInfo) => void
  useNewPet: boolean
  onPetSelect: (petId: string) => void
  onNext: () => void
}

export default function WriteStep1PetInfo({
  petProfiles,
  selectedPetProfile,
  petInfo,
  setPetInfo,
  useNewPet,
  onPetSelect,
  onNext
}: WriteStep1PetInfoProps) {
  const canProceedToStep2 = petInfo.petName && petInfo.petBreed && petInfo.petAge && petInfo.petWeight && petInfo.ownerName

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-900">반려동물 정보</h2>
        {petProfiles.length > 0 && (
          <Link
            href="/pet-log/pets/new"
            className="text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            + 새 반려동물 등록
          </Link>
        )}
      </div>
      
      {petProfiles.length > 0 && (
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            등록된 반려동물 선택
          </label>
          <select
            value={useNewPet ? 'new' : selectedPetProfile}
            onChange={(e) => onPetSelect(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            {petProfiles.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.breed}, {pet.age})
              </option>
            ))}
            <option value="new">+ 새 반려동물 정보 입력</option>
          </select>
        </div>
      )}
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${petProfiles.length > 0 && !useNewPet ? 'opacity-60' : ''}`}>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            반려동물 이름 *
          </label>
          <input
            type="text"
            value={petInfo.petName}
            onChange={(e) => setPetInfo({...petInfo, petName: e.target.value})}
            className={`w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="예: 뽀미"
            disabled={!useNewPet && petProfiles.length > 0}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            품종 *
          </label>
          <input
            type="text"
            value={petInfo.petBreed}
            onChange={(e) => setPetInfo({...petInfo, petBreed: e.target.value})}
            className={`w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="예: 골든 리트리버"
            disabled={!useNewPet && petProfiles.length > 0}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            나이 *
          </label>
          <input
            type="text"
            value={petInfo.petAge}
            onChange={(e) => setPetInfo({...petInfo, petAge: e.target.value})}
            className={`w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="예: 3세"
            disabled={!useNewPet && petProfiles.length > 0}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            체중 *
          </label>
          <input
            type="text"
            value={petInfo.petWeight}
            onChange={(e) => setPetInfo({...petInfo, petWeight: e.target.value})}
            className={`w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
            }`}
            placeholder="예: 28kg"
            disabled={!useNewPet && petProfiles.length > 0}
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            집사 이름 *
          </label>
          <input
            type="text"
            value={petInfo.ownerName}
            onChange={(e) => setPetInfo({...petInfo, ownerName: e.target.value})}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="예: 김집사"
            disabled={!useNewPet && petProfiles.length > 0}
          />
        </div>
      </div>
      
      {petProfiles.length === 0 && (
        <div className="mt-5 p-3 bg-violet-50 rounded-xl">
          <p className="text-xs text-violet-700">
            💡 반려동물을 먼저 등록하면 다음 급여 기록 작성 시 자동으로 정보가 입력됩니다.{' '}
            <Link href="/pet-log/pets/new" className="underline font-medium">
              새 반려동물 등록하기
            </Link>
          </p>
        </div>
      )}
      
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          disabled={!canProceedToStep2}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            canProceedToStep2
              ? 'bg-violet-500 text-white hover:bg-violet-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음 단계
        </button>
      </div>
    </div>
  )
}
