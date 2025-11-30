'use client'

import React from 'react'
import { AlertTriangle, Heart, Shield } from 'lucide-react'

interface HealthBadgeProps {
  tag: string
}

/**
 * Health badge component for pet health tags
 * Categorizes tags by type (allergy, sensitive, etc.) and applies appropriate styling
 */
export default function HealthBadge({ tag }: HealthBadgeProps) {
  // Parse tag to determine type and display text
  const getTagInfo = (tag: string) => {
    const lowerTag = tag.toLowerCase()
    
    // Allergy tags (e.g., "allergy-chicken", "allergy-beef")
    if (lowerTag.includes('allergy')) {
      const allergen = tag
        .replace(/^allergy[-_]?/i, '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Common allergen translations
      const allergenMap: Record<string, string> = {
        'chicken': '닭고기',
        'beef': '소고기',
        'pork': '돼지고기',
        'fish': '생선',
        'egg': '계란',
        'dairy': '유제품',
        'wheat': '밀',
        'corn': '옥수수',
        'soy': '대두'
      }
      
      const translatedAllergen = allergenMap[lowerTag.replace(/^allergy[-_]?/, '')] || allergen
      
      return {
        type: 'allergy' as const,
        text: `알러지: ${translatedAllergen}`,
        icon: AlertTriangle,
        className: 'bg-red-50 text-red-700 border-red-200'
      }
    }
    
    // Sensitive tags (e.g., "sensitive-stomach", "sensitive-skin")
    if (lowerTag.includes('sensitive')) {
      const issue = tag
        .replace(/^sensitive[-_]?/i, '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Common sensitive issue translations
      const issueMap: Record<string, string> = {
        'stomach': '소화기',
        'skin': '피부',
        'digestive': '소화기',
        'digestion': '소화'
      }
      
      const translatedIssue = issueMap[lowerTag.replace(/^sensitive[-_]?/, '')] || issue
      
      return {
        type: 'sensitive' as const,
        text: `민감: ${translatedIssue}`,
        icon: Heart,
        className: 'bg-yellow-50 text-yellow-800 border-yellow-200'
      }
    }
    
    // Picky eater
    if (lowerTag.includes('picky') || lowerTag.includes('eater')) {
      return {
        type: 'behavior' as const,
        text: '까다로운 식성',
        icon: Heart,
        className: 'bg-purple-50 text-purple-700 border-purple-200'
      }
    }
    
    // Disease/condition tags
    if (lowerTag.includes('disease') || lowerTag.includes('condition')) {
      return {
        type: 'condition' as const,
        text: tag,
        icon: Shield,
        className: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    }
    
    // Default
    return {
      type: 'default' as const,
      text: tag,
      icon: Shield,
      className: 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const tagInfo = getTagInfo(tag)
  const Icon = tagInfo.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${tagInfo.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{tagInfo.text}</span>
    </span>
  )
}

