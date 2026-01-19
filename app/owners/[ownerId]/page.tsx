'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, Heart, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { getOwner, getPetsByOwner, getLogsByOwner } from '@/lib/supa/queries'
import type { ReviewLog, Pet, Owner } from '@/lib/types/review-log'
import { mockReviewLogs, mockOwners, mockPets } from '@/lib/mock/review-log'
import { getBrowserClient } from '@/lib/supabase-client'

type CategoryFilter = 'all' | 'feed' | 'supplement' | 'toilet' | 'health'

/**
 * Owner Profile Page
 * Route: /owners/[ownerId]
 */
export default function OwnerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const ownerId = params.ownerId as string

  const [owner, setOwner] = useState<Owner | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [logs, setLogs] = useState<ReviewLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          loadMockData()
          setIsLoading(false)
          return
        }

        // 타임아웃 설정
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )

        const dataPromise = Promise.all([
          getOwner(ownerId),
          getPetsByOwner(ownerId),
          getLogsByOwner(ownerId)
        ])

        const [ownerData, petsData, logsData] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [any, any, any]

        if (ownerData) {
          setOwner(ownerData as unknown as Owner)
          setPets(petsData as unknown as Pet[])
          setLogs(logsData as unknown as ReviewLog[])
        } else {
          loadMockData()
        }
      } catch (error) {
        console.error('[OwnerProfilePage] Error loading data:', error)
        loadMockData()
      } finally {
        setIsLoading(false)
      }
    }

    const loadMockData = () => {
      const mockOwner = mockOwners.find((o) => o.id === ownerId)
      if (mockOwner) {
        setOwner(mockOwner)
        setPets(mockPets.filter((p) => mockOwner.pets.includes(p.id)))
        setLogs(mockReviewLogs.filter((l) => l.ownerId === ownerId))
      }
    }

    loadData()
  }, [ownerId])

  // 도움 지수 계산 (임시 로직)
  const helpScore = useMemo(() => {
    return logs.length * 10 + logs.reduce((sum, l) => sum + l.likes, 0)
  }, [logs])

  // 카테고리별 필터링
  const filteredLogs = useMemo(() => {
    if (categoryFilter === 'all') return logs
    if (categoryFilter === 'feed') {
      return logs.filter((l) => l.category === 'feed' || l.category === 'snack')
    }
    return logs.filter((l) => l.category === categoryFilter)
  }, [logs, categoryFilter])

  // 카테고리 탭
  const categoryTabs = [
    { id: 'all' as CategoryFilter, label: '전체' },
    { id: 'feed' as CategoryFilter, label: '사료' },
    { id: 'supplement' as CategoryFilter, label: '영양제' },
    { id: 'toilet' as CategoryFilter, label: '용품' },
    { id: 'health' as CategoryFilter, label: '건강' },
  ]

  // 날짜 포맷
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  }

  // 사용 일수 계산
  const calculateDaysUsed = (since: string, until?: string): number => {
    try {
      const sinceDate = new Date(since)
      const endDate = until ? new Date(until) : new Date()
      const diffTime = endDate.getTime() - sinceDate.getTime()
      return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    } catch {
      return 0
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-500"></div>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">프로필을 찾을 수 없습니다</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-blue-50 to-white">
      {/* 헤더 */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <span className="text-sm text-gray-500">뒤로가기</span>
      </div>

      {/* 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-6 bg-white rounded-3xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          {/* 아바타 */}
          <div className="relative flex-shrink-0">
            {owner.avatarUrl ? (
              <Image
                src={owner.avatarUrl}
                alt={owner.nickname}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-2xl text-gray-500 font-medium">
                  {owner.nickname.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* 이름 & 도움 지수 */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {owner.nickname} <span className="text-violet-500">집사님</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              도움 지수 <span className="font-semibold text-violet-500">{helpScore}pts</span>
            </p>
          </div>
        </div>

        {/* 반려동물 목록 */}
        {pets.length > 0 && (
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => router.push(`/owners/${ownerId}/pets/${pet.id}`)}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-colors flex-shrink-0"
              >
                {/* 펫 아바타 (임시) */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                  <span className="text-xl">🐾</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{pet.name}</p>
                  <p className="text-xs text-violet-500">
                    {pet.species === 'dog' ? '강아지' : pet.species === 'cat' ? '고양이' : pet.species}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* 나의 기록 보관함 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pb-8"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">나의 기록 보관함</h2>
          <button
            onClick={() => router.push(`/owners/${ownerId}/pets/${pets[0]?.id || ''}`)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            전체보기
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === tab.id
                  ? 'bg-violet-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 기록 목록 */}
        <div className="space-y-3">
          {filteredLogs.length > 0 ? (
            filteredLogs.slice(0, 10).map((log, index) => {
              const pet = pets.find((p) => p.id === log.petId)
              const daysUsed = calculateDaysUsed(log.periodStart, log.periodEnd)

              return (
                <motion.button
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    if (pet) {
                      router.push(`/owners/${ownerId}/pets/${pet.id}`)
                    }
                  }}
                  className="w-full bg-white rounded-2xl p-4 border border-gray-100 hover:border-violet-200 transition-colors text-left flex items-center gap-4"
                >
                  {/* 아이콘 */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">
                      {log.category === 'feed' ? '🍖' :
                       log.category === 'snack' ? '🦴' :
                       log.category === 'supplement' ? '💊' :
                       log.category === 'toilet' ? '🧻' : '📝'}
                    </span>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{log.product}</h3>
                      <span className={`flex-shrink-0 ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.status === 'feeding' ? 'bg-green-100 text-green-600' :
                        log.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {log.status === 'feeding' ? '급여 중' :
                         log.status === 'completed' ? '급여 완료' : '급여 중지'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(log.periodStart)} 시작 · {daysUsed}일째
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-400" />
                        {log.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                        {log.commentsCount}
                      </span>
                    </div>
                  </div>

                  {/* 화살표 */}
                  <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                </motion.button>
              )
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500">기록이 없습니다</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
