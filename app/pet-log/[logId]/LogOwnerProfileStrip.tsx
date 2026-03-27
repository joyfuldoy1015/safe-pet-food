'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import type { Pet, Owner } from '@/lib/types/review-log'

interface LogOwnerProfileStripProps {
  owner: Owner
  pet: Pet
  onNavigateToOwner: () => void
}

export default function LogOwnerProfileStrip({ owner, pet, onNavigateToOwner }: LogOwnerProfileStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white px-4 py-4"
    >
      <button
        onClick={onNavigateToOwner}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="relative flex-shrink-0">
          {owner.avatarUrl && (owner.avatarUrl.startsWith('http') || owner.avatarUrl.startsWith('/')) ? (
            <Image
              src={owner.avatarUrl}
              alt={owner.nickname}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-500 font-medium">
                {owner.nickname.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">{owner.nickname}</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {pet.name} · {pet.species === 'dog' ? '강아지' : pet.species === 'cat' ? '고양이' : pet.species}
          </p>
        </div>
      </button>
    </motion.div>
  )
}
