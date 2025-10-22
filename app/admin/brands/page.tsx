'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Filter,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Shield,
  Star,
  Eye,
  Save,
  X,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'


interface Brand {
  id: string
  name: string
  manufacturer: string
  recall_history: Array<{
    date: string
    reason: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
  }>
  overall_rating: number
  product_lines: string[]
  established_year: number
  country: string
  certifications: string[]
  image?: string
  brand_description?: string
  manufacturing_info?: string
  brand_pros?: string[]
  brand_cons?: string[]
  ai_summary_status?: 'pending' | 'draft' | 'approved'
  ai_summary_review_count?: number
  ai_summary_last_generated?: string
  ai_summary_draft_pros?: string[]
  ai_summary_draft_cons?: string[]
}

interface BrandFormData {
  name: string
  manufacturer: string
  overall_rating: number
  product_lines: string
  established_year: number
  country: string
  certifications: string
  brand_description: string
  manufacturing_info: string
  brand_pros: string
  brand_cons: string
}

// 에러 메시지 컴포넌트
function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="mt-1 text-sm text-red-600 flex items-center">
      <AlertTriangle className="h-3 w-3 mr-1" />
      {error}
    </p>
  )
}

// 입력 필드 래퍼 컴포넌트
function FormField({ 
  label, 
  error, 
  required, 
  children 
}: { 
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <ErrorMessage error={error} />
    </div>
  )
}

export default function BrandAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    manufacturer: '',
    overall_rating: 0,
    product_lines: '건식사료',  // 기본값 추가
    established_year: new Date().getFullYear(),
    country: '',
    certifications: 'AAFCO',  // 기본값 추가
    brand_description: '',
    manufacturing_info: '',
    brand_pros: '',
    brand_cons: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSafetyScore = (brand: Brand) => {
    const recallCount = brand.recall_history.length
    const highSeverityCount = brand.recall_history.filter(r => r.severity === 'high').length
    const unresolvedCount = brand.recall_history.filter(r => !r.resolved).length
    
    let score = 5
    score -= recallCount * 0.5
    score -= highSeverityCount * 1
    score -= unresolvedCount * 2
    
    return Math.max(0, Math.min(5, score))
  }

  const getSafetyStats = () => {
    const safe = brands.filter(b => getSafetyScore(b) >= 4.5).length
    const medium = brands.filter(b => {
      const score = getSafetyScore(b)
      return score >= 3 && score < 4.5
    }).length
    const warning = brands.filter(b => getSafetyScore(b) < 3).length
    
    return { safe, medium, warning }
  }

  const handleAddBrand = async () => {
    setValidationErrors({})
    setIsSubmitting(true)
    
    try {
      const newBrandData = {
        ...formData,
        product_lines: formData.product_lines.split(',').map(s => s.trim()).filter(s => s),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(s => s),
        brand_pros: formData.brand_pros.split('\n').map(s => s.trim()).filter(s => s),
        brand_cons: formData.brand_cons.split('\n').map(s => s.trim()).filter(s => s),
        recall_history: []
      }
      
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBrandData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // 검증 에러 처리
        if (data.details && Array.isArray(data.details)) {
          const errors: Record<string, string> = {}
          data.details.forEach((err: any) => {
            errors[err.field] = err.message
          })
          setValidationErrors(errors)
          
          // 에러 요약 메시지
          const errorCount = data.details.length
          alert(`입력한 정보에 ${errorCount}개의 오류가 있습니다.\n\n${data.details.map((e: any) => `• ${e.message}`).join('\n')}`)
        } else {
          alert(data.error || '브랜드 추가에 실패했습니다.')
        }
        return
      }
      
      setBrands([...brands, data])
      setShowAddModal(false)
      resetForm()
      alert(`✅ "${data.name}" 브랜드가 성공적으로 등록되었습니다.`)
    } catch (error) {
      console.error('Failed to add brand:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditBrand = async () => {
    if (!editingBrand) return
    
    setValidationErrors({})
    setIsSubmitting(true)
    
    try {
      const updatedBrandData = {
        id: editingBrand.id,
        ...formData,
        product_lines: formData.product_lines.split(',').map(s => s.trim()).filter(s => s),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(s => s),
        brand_pros: formData.brand_pros.split('\n').map(s => s.trim()).filter(s => s),
        brand_cons: formData.brand_cons.split('\n').map(s => s.trim()).filter(s => s)
      }
      
      const response = await fetch('/api/brands', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBrandData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // 검증 에러 처리
        if (data.details && Array.isArray(data.details)) {
          const errors: Record<string, string> = {}
          data.details.forEach((err: any) => {
            errors[err.field] = err.message
          })
          setValidationErrors(errors)
          
          const errorCount = data.details.length
          alert(`입력한 정보에 ${errorCount}개의 오류가 있습니다.\n\n${data.details.map((e: any) => `• ${e.message}`).join('\n')}`)
        } else {
          alert(data.error || '브랜드 수정에 실패했습니다.')
        }
        return
      }
      
      setBrands(brands.map(b => b.id === editingBrand.id ? data : b))
      setShowEditModal(false)
      setEditingBrand(null)
      resetForm()
      alert(`✅ "${data.name}" 브랜드가 성공적으로 수정되었습니다.`)
    } catch (error) {
      console.error('Failed to update brand:', error)
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('정말로 이 브랜드를 삭제하시겠습니까?')) return
    
    try {
      const response = await fetch(`/api/brands?id=${brandId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete brand')
      }
      
      setBrands(brands.filter(b => b.id !== brandId))
    } catch (error) {
      console.error('Failed to delete brand:', error)
      alert('브랜드 삭제에 실패했습니다.')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`선택된 ${selectedBrands.length}개 브랜드를 삭제하시겠습니까?`)) return
    
    try {
      const deletePromises = selectedBrands.map(brandId =>
        fetch(`/api/brands?id=${brandId}`, { method: 'DELETE' })
      )
      
      const responses = await Promise.all(deletePromises)
      const failedDeletes = responses.filter(response => !response.ok)
      
      if (failedDeletes.length > 0) {
        throw new Error(`${failedDeletes.length}개 브랜드 삭제에 실패했습니다.`)
      }
      
      setBrands(brands.filter(b => !selectedBrands.includes(b.id)))
      setSelectedBrands([])
    } catch (error) {
      console.error('Failed to delete brands:', error)
      alert('일부 브랜드 삭제에 실패했습니다.')
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', '브랜드명', '제조사', '평점', '안전성점수', '설립년도', '국가', '인증']
    const csvData = brands.map(brand => [
      brand.id,
      brand.name,
      brand.manufacturer,
      brand.overall_rating,
      getSafetyScore(brand).toFixed(1),
      brand.established_year,
      brand.country,
      brand.certifications.join('; ')
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `brands_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturer: '',
      overall_rating: 0,
      product_lines: '건식사료',
      established_year: new Date().getFullYear(),
      country: '',
      certifications: 'AAFCO',
      brand_description: '',
      manufacturing_info: '',
      brand_pros: '',
      brand_cons: ''
    })
    setValidationErrors({})
    setIsSubmitting(false)
  }

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      manufacturer: brand.manufacturer,
      overall_rating: brand.overall_rating,
      product_lines: brand.product_lines.join(', '),
      established_year: brand.established_year,
      country: brand.country,
      certifications: brand.certifications.join(', '),
      brand_description: brand.brand_description || '',
      manufacturing_info: brand.manufacturing_info || '',
      brand_pros: brand.brand_pros?.join('\n') || '',
      brand_cons: brand.brand_cons?.join('\n') || ''
    })
    setShowEditModal(true)
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const safetyStats = getSafetyStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center text-gray-900 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              관리자 패널
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportToCSV}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center border border-gray-300"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV 내보내기
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 브랜드 등록
            </button>
          </div>
        </div>
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 브랜드</p>
                <p className="text-3xl font-bold text-gray-900">{brands.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">안전 브랜드</p>
                <p className="text-3xl font-bold text-green-600">{safetyStats.safe}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">보통 브랜드</p>
                <p className="text-3xl font-bold text-yellow-600">{safetyStats.medium}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">주의 브랜드</p>
                <p className="text-3xl font-bold text-red-600">{safetyStats.warning}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="브랜드명 또는 제조사 검색..."
              />
            </div>
            
            {selectedBrands.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                선택 삭제 ({selectedBrands.length})
              </button>
            )}
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBrands.length === filteredBrands.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBrands(filteredBrands.map(b => b.id))
                        } else {
                          setSelectedBrands([])
                        }
                      }}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    브랜드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제조사
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평점
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    안전성
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설립년도
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    리콜 이력
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI 요약
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.map((brand) => {
                  const safetyScore = getSafetyScore(brand)
                  const safetyColor = safetyScore >= 4.5 ? 'text-green-600' : safetyScore >= 3 ? 'text-yellow-600' : 'text-red-600'
                  
                  return (
                    <tr key={brand.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand.id])
                            } else {
                              setSelectedBrands(selectedBrands.filter(id => id !== brand.id))
                            }
                          }}
                          className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {brand.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                            <div className="text-sm text-gray-500">{brand.country}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {brand.manufacturer}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {brand.overall_rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${safetyColor}`}>
                          {safetyScore.toFixed(1)}/5.0
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {brand.established_year}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          brand.recall_history.length === 0 
                            ? 'bg-green-100 text-green-800'
                            : brand.recall_history.some(r => r.severity === 'high')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {brand.recall_history.length === 0 ? '없음' : `${brand.recall_history.length}건`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {brand.ai_summary_status === 'approved' ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              승인됨
                            </span>
                          ) : brand.ai_summary_status === 'draft' ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3 mr-1" />
                              검토 대기
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              미생성
                            </span>
                          )}
                          <button
                            onClick={() => {/* TODO: AI 요약 생성/검토 */}}
                            className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                            title="AI 요약 생성"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {brand.ai_summary_status === 'draft' ? '검토' : '생성'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(brand)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">새 브랜드 추가</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="브랜드명" error={validationErrors.name} required>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="브랜드명을 입력하세요"
                    disabled={isSubmitting}
                  />
                </FormField>
                
                <FormField label="제조사" error={validationErrors.manufacturer} required>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.manufacturer ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="제조사를 입력하세요"
                    disabled={isSubmitting}
                  />
                </FormField>
                
                <FormField label="평점 (0-5)" error={validationErrors.overall_rating}>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.overall_rating}
                    onChange={(e) => setFormData({...formData, overall_rating: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.overall_rating ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                </FormField>
                
                <FormField label="설립년도" error={validationErrors.established_year} required>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.established_year}
                    onChange={(e) => setFormData({...formData, established_year: parseInt(e.target.value) || new Date().getFullYear()})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.established_year ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                </FormField>
                
                <FormField label="국가" error={validationErrors.country} required>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="예: 대한민국, 미국, 프랑스"
                    disabled={isSubmitting}
                  />
                </FormField>
                
                <FormField label="제품 라인 (쉼표로 구분)" error={validationErrors.product_lines} required>
                  <input
                    type="text"
                    value={formData.product_lines}
                    onChange={(e) => setFormData({...formData, product_lines: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                      validationErrors.product_lines ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="성견용, 퍼피, 소형견"
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
              
              <FormField label="인증 (쉼표로 구분)" error={validationErrors.certifications}>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    validationErrors.certifications ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="AAFCO, ISO 9001, FDA"
                  disabled={isSubmitting}
                />
              </FormField>
              
              <FormField label="브랜드 설명" error={validationErrors.brand_description}>
                <textarea
                  value={formData.brand_description}
                  onChange={(e) => setFormData({...formData, brand_description: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    validationErrors.brand_description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="브랜드에 대한 설명을 입력하세요"
                  disabled={isSubmitting}
                />
              </FormField>
              
              <FormField label="제조 및 소싱 정보" error={validationErrors.manufacturing_info}>
                <textarea
                  value={formData.manufacturing_info}
                  onChange={(e) => setFormData({...formData, manufacturing_info: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    validationErrors.manufacturing_info ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="제조 공장 및 원료 소싱에 대한 정보를 입력하세요"
                  disabled={isSubmitting}
                />
              </FormField>
              
              <FormField label="신뢰하는 이유 (한 줄에 하나씩)" error={validationErrors.brand_pros}>
                <textarea
                  value={formData.brand_pros}
                  onChange={(e) => setFormData({...formData, brand_pros: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    validationErrors.brand_pros ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="엄격한 품질 관리&#10;투명한 원료 공개&#10;다양한 제품 라인업"
                  disabled={isSubmitting}
                />
              </FormField>
              
              <FormField label="보완하면 좋은 점 (한 줄에 하나씩)" error={validationErrors.brand_cons}>
                <textarea
                  value={formData.brand_cons}
                  onChange={(e) => setFormData({...formData, brand_cons: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    validationErrors.brand_cons ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="가격이 다소 높음&#10;구매처가 제한적&#10;특정 제품의 재고 부족"
                  disabled={isSubmitting}
                />
              </FormField>
              
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">입력 오류</h4>
                      <p className="text-sm text-red-700">
                        {Object.keys(validationErrors).length}개의 필드에 오류가 있습니다. 위의 빨간색 필드를 확인해주세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  onClick={handleAddBrand}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      처리 중...
                    </>
                  ) : (
                    '추가'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">브랜드 수정</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    브랜드명 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="브랜드명을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제조사 *
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="제조사를 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평점 (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.overall_rating}
                    onChange={(e) => setFormData({...formData, overall_rating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설립년도
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.established_year}
                    onChange={(e) => setFormData({...formData, established_year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    국가
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="국가를 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제품 라인 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={formData.product_lines}
                    onChange={(e) => setFormData({...formData, product_lines: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="성견용, 퍼피, 소형견"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="AAFCO, ISO 9001, FDA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드 설명
                </label>
                <textarea
                  value={formData.brand_description}
                  onChange={(e) => setFormData({...formData, brand_description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                  placeholder="브랜드에 대한 설명을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제조 및 소싱 정보
                </label>
                <textarea
                  value={formData.manufacturing_info}
                  onChange={(e) => setFormData({...formData, manufacturing_info: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                  placeholder="제조 공장 및 원료 소싱에 대한 정보를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신뢰하는 이유 (한 줄에 하나씩)
                </label>
                <textarea
                  value={formData.brand_pros}
                  onChange={(e) => setFormData({...formData, brand_pros: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                  placeholder="엄격한 품질 관리&#10;투명한 원료 공개&#10;다양한 제품 라인업"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보완하면 좋은 점 (한 줄에 하나씩)
                </label>
                <textarea
                  value={formData.brand_cons}
                  onChange={(e) => setFormData({...formData, brand_cons: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={4}
                  placeholder="가격이 다소 높음&#10;구매처가 제한적&#10;특정 제품의 재고 부족"
                />
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleEditBrand}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

 

