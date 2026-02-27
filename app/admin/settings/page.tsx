'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Save, Settings as SettingsIcon } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    showLeaderboard: true,
    showActivityPanel: true,
    showQAonHome: true,
    continueReasons: ['변 상태 개선', '알러지 없음', '모질 윤기', '식욕 증가', '활동성 향상'],
    stopReasons: ['알러지 의심', '섭취 거부', '가격 부담', '변 상태 악화', '기타']
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('spf_admin_settings')
      if (saved) setSettings(JSON.parse(saved))
    } catch {}
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem('spf_admin_settings', JSON.stringify(settings))
      alert('설정이 저장되었습니다.')
    } catch (error) {
      console.error('[AdminSettingsPage] Error saving settings:', error)
      alert('설정 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-600 mt-1">시스템 설정 및 기능 플래그를 관리하세요</p>
        </div>

        {/* Feature Flags */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기능 플래그</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.showLeaderboard}
                onChange={(e) => setSettings({ ...settings, showLeaderboard: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">랭킹 보드 표시</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.showActivityPanel}
                onChange={(e) => setSettings({ ...settings, showActivityPanel: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">활동 패널 표시</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.showQAonHome}
                onChange={(e) => setSettings({ ...settings, showQAonHome: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">홈페이지에 Q&A 표시</span>
            </label>
          </div>
        </div>

        {/* Taxonomies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">태그 및 사유</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계속 급여 사유
              </label>
              <div className="space-y-2">
                {settings.continueReasons.map((reason, index) => (
                  <input
                    key={index}
                    type="text"
                    value={reason}
                    onChange={(e) => {
                      const newReasons = [...settings.continueReasons]
                      newReasons[index] = e.target.value
                      setSettings({ ...settings, continueReasons: newReasons })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                중지 사유
              </label>
              <div className="space-y-2">
                {settings.stopReasons.map((reason, index) => (
                  <input
                    key={index}
                    type="text"
                    value={reason}
                    onChange={(e) => {
                      const newReasons = [...settings.stopReasons]
                      newReasons[index] = e.target.value
                      setSettings({ ...settings, stopReasons: newReasons })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
