import { useMemo } from 'react'
import type { Customer, Visit } from '../lib/db'
import { getEnhancedSuggestions } from '../lib/ai-enhanced'
import type { AISuggestion } from '../lib/ai-enhanced'

interface AISettings {
  maxSuggestions: number
  includeCategories: AISuggestion['category'][]
  minScore: number
}

export function useMemoizedAISuggestions(
  customers: Customer[],
  visits: Visit[],
  settings: AISettings
): AISuggestion[] {
  return useMemo(() => {
    if (!customers.length || !visits.length) return []
    
    try {
      return getEnhancedSuggestions(customers, visits, settings)
    } catch (error) {
      console.error('AI suggestions calculation failed:', error)
      return []
    }
  }, [
    // メモ化のキー：顧客と訪問の重要な情報のみを依存配列に含める
    customers.length,
    customers.map(c => c.id).join(','),
    visits.length,
    visits.map(v => `${v.customerId}-${v.date}`).join(','),
    settings.maxSuggestions,
    settings.includeCategories.join(','),
    settings.minScore
  ])
}