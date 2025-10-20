'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Settings, 
  Save, 
  ArrowLeft,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Key,
  Server,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic
} from 'lucide-react'

// RichTextEditor를 동적으로 import (SSR 방지)
const RichTextEditor = dynamic(() => import('@/app/components/RichTextEditor'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />
})

interface ServiceContent {
  title: string
  description: string
}

interface SystemSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  emailNotifications: boolean
  reviewAutoApproval: boolean
  maxFileSize: number
  apiKey: string
  databaseStatus: 'connected' | 'disconnected' | 'error'
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  serviceContents: {
    categoryDescriptions: {
      '사료/급여': string
      '건강/케어': string
      '커뮤니티': string
    }
    services: {
      [key: string]: ServiceContent
    }
  }
}

const initialSettings: SystemSettings = {
  siteName: 'Safe Pet Food',
  siteDescription: 'AI 기술과 집사들의 경험을 바탕으로 반려동물의 건강하고 행복한 생활을 도와드립니다.',
  adminEmail: 'admin@safepetfood.com',
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  reviewAutoApproval: false,
  maxFileSize: 10,
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  databaseStatus: 'connected',
  backupFrequency: 'daily',
  serviceContents: {
    categoryDescriptions: {
      '사료/급여': '우리 아이의 영양과 급여에 관한 모든 것',
      '건강/케어': '반려동물의 건강 관리를 위한 도구들',
      '커뮤니티': '집사들과 함께 나누는 정보와 소통의 공간'
    },
    services: {
      'nutrition-calculator': {
        title: '사료 성분 계산기',
        description: '사료의 보장성분표를 입력하면 건물기준으로 영양 점수를 계산해드려요.'
      },
      'calorie-calculator': {
        title: '사료 칼로리&급여량 계산기',
        description: '우리 아이에게 맞는 적정 칼로리와 급여량을 계산해보세요.'
      },
      'brands': {
        title: '브랜드 평가',
        description: '다양한 사료 브랜드의 안전성과 사용자 리뷰를 확인해보세요.'
      },
      'health-analyzer': {
        title: '건강검진표 분석기',
        description: '건강검진 결과를 업로드하면 AI가 상세하게 분석해드려요.'
      },
      'water-calculator': {
        title: '일일 음수량 계산기',
        description: '우리 아이의 적정 하루 물 섭취량을 계산해보세요.'
      },
      'pet-log': {
        title: '펫 로그',
        description: '우리 아이의 사료/간식 급여 이력을 기록하고 다른 집사들과 공유해보세요.'
      },
      'qa-forum': {
        title: 'Q&A 포럼',
        description: '반려동물에 대한 궁금한 점을 질문하고 경험을 나눠보세요.'
      }
    }
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          연결됨
        </span>
      case 'disconnected':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          연결 끊김
        </span>
      case 'error':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          오류
        </span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="h-6 w-6 text-gray-500" />
                  시스템 설정
                </h1>
                <p className="text-gray-600">사이트 전반적인 설정 및 환경 관리</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            설정이 성공적으로 저장되었습니다.
          </div>
        )}

        <div className="space-y-8">
          {/* Site Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900">사이트 설정</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사이트 이름</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사이트 설명</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">관리자 이메일</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900">시스템 설정</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">점검 모드</p>
                  <p className="text-sm text-gray-500">사이트를 일시적으로 점검 모드로 전환</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">회원가입 허용</p>
                  <p className="text-sm text-gray-500">새로운 사용자의 회원가입을 허용</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최대 파일 크기 (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-900">알림 설정</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">이메일 알림</p>
                  <p className="text-sm text-gray-500">시스템 알림을 이메일로 받기</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">리뷰 자동 승인</p>
                  <p className="text-sm text-gray-500">새로운 리뷰를 자동으로 승인</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reviewAutoApproval}
                    onChange={(e) => handleInputChange('reviewAutoApproval', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-900">API 설정</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API 키</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Contents Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-medium text-gray-900">서비스 콘텐츠 관리</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              메인 페이지에 표시되는 카테고리 설명과 각 서비스의 제목 및 설명을 편집할 수 있습니다.
            </p>
            
            <div className="space-y-6">
              {/* Category Descriptions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">카테고리 설명</h4>
                <div className="space-y-4">
                  {Object.entries(settings.serviceContents.categoryDescriptions).map(([category, description]) => (
                    <div key={category}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {category}
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            serviceContents: {
                              ...prev.serviceContents,
                              categoryDescriptions: {
                                ...prev.serviceContents.categoryDescriptions,
                                [category]: e.target.value
                              }
                            }
                          }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="카테고리 설명을 입력하세요"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Descriptions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">서비스 설명</h4>
                <div className="space-y-6">
                  {Object.entries(settings.serviceContents.services).map(([serviceKey, service]) => (
                    <div key={serviceKey} className="p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            제목
                          </label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => {
                              setSettings(prev => ({
                                ...prev,
                                serviceContents: {
                                  ...prev.serviceContents,
                                  services: {
                                    ...prev.serviceContents.services,
                                    [serviceKey]: {
                                      ...prev.serviceContents.services[serviceKey],
                                      title: e.target.value
                                    }
                                  }
                                }
                              }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            설명
                          </label>
                          <RichTextEditor
                            value={service.description}
                            onChange={(value) => {
                              setSettings(prev => ({
                                ...prev,
                                serviceContents: {
                                  ...prev.serviceContents,
                                  services: {
                                    ...prev.serviceContents.services,
                                    [serviceKey]: {
                                      ...prev.serviceContents.services[serviceKey],
                                      description: value
                                    }
                                  }
                                }
                              }))
                            }}
                            placeholder="서비스 설명을 입력하세요"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono bg-gray-200 px-2 py-1 rounded">{serviceKey}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900">데이터베이스 설정</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">데이터베이스 상태</p>
                  <p className="text-sm text-gray-500">현재 데이터베이스 연결 상태</p>
                </div>
                {getStatusBadge(settings.databaseStatus)}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">백업 주기</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-medium text-red-900">위험 구역</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">모든 데이터 초기화</p>
                  <p className="text-sm text-red-700">이 작업은 되돌릴 수 없습니다.</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

