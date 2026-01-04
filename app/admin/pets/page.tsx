'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Table, { Column } from '@/components/admin/Table'
import FilterBar from '@/components/admin/FilterBar'
import { Heart } from 'lucide-react'

interface Pet {
  id: string
  name: string
  species: 'dog' | 'cat'
  owner_id: string
  tags: string[]
  logs_count: number
  created_at: string
}

export default function AdminPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    loadPets()
  }, [filters])

  const loadPets = async () => {
    setLoading(true)
    try {
      // TODO: Fetch from API
      setPets([])
    } catch (error) {
      console.error('[AdminPetsPage] Error loading pets:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: Column<Pet>[] = [
    {
      key: 'name',
      label: '이름',
      render: (pet) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {pet.name[0]}
          </div>
          <div className="font-medium">{pet.name}</div>
        </div>
      )
    },
    {
      key: 'species',
      label: '종류',
      render: (pet) => (
        <span className={`px-2 py-1 rounded text-xs ${
          pet.species === 'dog' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
        }`}>
          {pet.species === 'dog' ? '강아지' : '고양이'}
        </span>
      )
    },
    {
      key: 'tags',
      label: '태그',
      render: (pet) => (
        <div className="flex flex-wrap gap-1">
          {pet.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
              {tag}
            </span>
          ))}
          {pet.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
              +{pet.tags.length - 3}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'logs_count',
      label: '로그',
      render: (pet) => (
        <span className="text-sm">{pet.logs_count}개</span>
      )
    },
    {
      key: 'created_at',
      label: '등록일',
      render: (pet) => (
        <span className="text-sm text-gray-600">
          {new Date(pet.created_at).toLocaleDateString('ko-KR')}
        </span>
      )
    }
  ]

  const filterChips = Object.entries(filters).map(([key, value]) => ({
    key,
    label: key,
    value
  }))

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">반려동물 관리</h1>
          <p className="text-gray-600 mt-1">반려동물 정보를 관리하세요</p>
        </div>

        <FilterBar
          chips={filterChips}
          onRemoveChip={(key) => {
            const newFilters = { ...filters }
            delete newFilters[key]
            setFilters(newFilters)
          }}
          onClearAll={() => setFilters({})}
        >
          <select
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            value={filters.species || ''}
            onChange={(e) => setFilters({ ...filters, species: e.target.value })}
          >
            <option value="">전체 종류</option>
            <option value="dog">강아지</option>
            <option value="cat">고양이</option>
          </select>
        </FilterBar>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            로딩 중...
          </div>
        ) : (
          <Table
            data={pets}
            columns={columns}
            onRowClick={(pet) => {
              // TODO: Open detail drawer
              console.log('Open detail for:', pet.id)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
