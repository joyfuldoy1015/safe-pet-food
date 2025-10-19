'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Rocket, 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Calendar,
  User,
  Hash,
  AlertCircle,
  TrendingUp,
  Globe,
  ArrowLeft,
  Play,
  StopCircle,
  Eye
} from 'lucide-react'

interface Deployment {
  id: string
  status: 'success' | 'building' | 'failed' | 'queued'
  commit_message: string
  commit_hash: string
  branch: string
  author: string
  created_at: string
  duration?: number
  url?: string
  preview_url?: string
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 샘플 데이터 (실제로는 Vercel API를 통해 가져와야 함)
  useEffect(() => {
    const sampleDeployments: Deployment[] = [
      {
        id: '1',
        status: 'success',
        commit_message: 'fix: 모바일/웹 일관성 개선\n\n- 다크모드 자동 감지 비활성화\n- 폰트 렌더링 일관성 보장',
        commit_hash: '106b0d8c',
        branch: 'main',
        author: 'doheekong',
        created_at: new Date().toISOString(),
        duration: 45,
        url: 'https://safe-pet-food.vercel.app',
        preview_url: 'https://safe-pet-food-106b0d8c.vercel.app'
      },
      {
        id: '2',
        status: 'success',
        commit_message: 'feat: 브랜드 상세 페이지 개선\n\n- 제품군별 상세 분석 추가\n- Q&A 섹션 구현',
        commit_hash: '1d515815',
        branch: 'main',
        author: 'doheekong',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        duration: 52,
        url: 'https://safe-pet-food.vercel.app',
        preview_url: 'https://safe-pet-food-1d515815.vercel.app'
      },
      {
        id: '3',
        status: 'building',
        commit_message: 'feat: 관리자 배포 관리 페이지 추가',
        commit_hash: 'abc123de',
        branch: 'main',
        author: 'doheekong',
        created_at: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: '4',
        status: 'success',
        commit_message: 'fix: 투명성 점수 UI 업데이트',
        commit_hash: 'def456gh',
        branch: 'main',
        author: 'doheekong',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        duration: 48,
        url: 'https://safe-pet-food.vercel.app',
      },
      {
        id: '5',
        status: 'failed',
        commit_message: 'test: 새로운 기능 테스트',
        commit_hash: 'ghi789jk',
        branch: 'feature/test',
        author: 'doheekong',
        created_at: new Date(Date.now() - 10800000).toISOString(),
      }
    ]
    
    setTimeout(() => {
      setDeployments(sampleDeployments)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'building':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'queued':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      success: 'bg-green-100 text-green-700 border-green-200',
      building: 'bg-blue-100 text-blue-700 border-blue-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      queued: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
    const labels = {
      success: '배포 완료',
      building: '배포 중',
      failed: '배포 실패',
      queued: '대기 중'
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels]}</span>
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // 실제로는 API 호출
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  const handleRedeploy = (deployment: Deployment) => {
    alert(`재배포 시작: ${deployment.commit_hash}\n\n실제 환경에서는 Vercel API를 통해 재배포가 진행됩니다.`)
  }

  const handleRollback = (deployment: Deployment) => {
    if (confirm(`이 버전으로 롤백하시겠습니까?\n\n커밋: ${deployment.commit_hash}\n메시지: ${deployment.commit_message.split('\n')[0]}`)) {
      alert('롤백이 시작되었습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">배포 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            관리자 패널로 돌아가기
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">배포 버전 관리</h1>
                <p className="text-gray-600">Vercel 배포 히스토리 및 버전 관리</p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 배포</p>
                  <p className="text-2xl font-bold text-gray-900">{deployments.length}</p>
                </div>
                <Rocket className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">성공</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deployments.filter(d => d.status === 'success').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">실패</p>
                  <p className="text-2xl font-bold text-red-600">
                    {deployments.filter(d => d.status === 'failed').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">평균 빌드 시간</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      deployments
                        .filter(d => d.duration)
                        .reduce((acc, d) => acc + (d.duration || 0), 0) /
                      deployments.filter(d => d.duration).length
                    )}초
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Production */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">현재 프로덕션 버전</p>
                <h3 className="text-white text-xl font-bold">
                  {deployments.find(d => d.status === 'success')?.commit_hash}
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  {deployments.find(d => d.status === 'success')?.commit_message.split('\n')[0]}
                </p>
              </div>
            </div>
            <a
              href={deployments.find(d => d.status === 'success')?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>사이트 열기</span>
            </a>
          </div>
        </div>

        {/* Deployments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">배포 히스토리</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {deployments.map((deployment) => (
              <div
                key={deployment.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusBadge(deployment.status)}
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <GitBranch className="h-4 w-4" />
                        <span className="font-medium">{deployment.branch}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {deployment.commit_message.split('\n')[0]}
                    </h3>
                    
                    {deployment.commit_message.split('\n').slice(2).filter(line => line.trim()).length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-600 mb-3 space-y-1">
                        {deployment.commit_message
                          .split('\n')
                          .slice(2)
                          .filter(line => line.trim())
                          .map((line, idx) => (
                            <li key={idx}>{line.trim().replace(/^-\s*/, '')}</li>
                          ))}
                      </ul>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Hash className="h-4 w-4" />
                        <span className="font-mono">{deployment.commit_hash}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{deployment.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(deployment.created_at)}</span>
                      </div>
                      {deployment.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{deployment.duration}초</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {deployment.status === 'success' && (
                      <>
                        {deployment.preview_url && (
                          <a
                            href={deployment.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="미리보기"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleRedeploy(deployment)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="재배포"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                        {deployment.id !== '1' && (
                          <button
                            onClick={() => handleRollback(deployment)}
                            className="px-3 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200"
                          >
                            롤백
                          </button>
                        )}
                      </>
                    )}
                    {deployment.status === 'failed' && (
                      <button
                        onClick={() => handleRedeploy(deployment)}
                        className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                      >
                        재시도
                      </button>
                    )}
                    {deployment.status === 'building' && (
                      <button
                        className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      >
                        <StopCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">배포 관리 도움말</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• <strong>재배포</strong>: 같은 커밋을 다시 배포합니다.</li>
                <li>• <strong>롤백</strong>: 이전 버전으로 되돌립니다. 프로덕션 환경에 즉시 반영됩니다.</li>
                <li>• <strong>미리보기</strong>: 해당 버전의 미리보기 URL을 새 탭에서 엽니다.</li>
                <li>• Vercel과 연동하려면 <code className="px-2 py-1 bg-white rounded text-xs">VERCEL_TOKEN</code> 환경 변수를 설정해야 합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

