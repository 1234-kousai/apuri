import { useMemo } from 'react'
import type { Customer, Visit } from '../lib/db'
import { getEnhancedSuggestions } from '../lib/ai-enhanced'
import type { AISuggestion } from '../lib/ai-enhanced'

interface AISettings {
  maxSuggestions: number
  includeCategories: AISuggestion['category'][]
  minScore: number
}

// データのハッシュを計算してメモ化の効率を改善
function calculateDataHash(customers: Customer[], visits: Visit[]): string {
  // 最新の更新情報を含むハッシュを作成
  const customerHash = customers.reduce((acc, c) => {
    return acc + (c.id || 0) + (c.lastVisit?.getTime() || 0) + c.totalRevenue
  }, 0)
  
  const visitHash = visits.reduce((acc, v) => {
    return acc + v.customerId + v.revenue + new Date(v.date).getTime()
  }, 0)
  
  return `${customers.length}-${customerHash}-${visits.length}-${visitHash}`
}

export function useMemoizedAISuggestions(
  customers: Customer[],
  visits: Visit[],
  settings: AISettings
): AISuggestion[] {
  // データのハッシュを計算
  const dataHash = useMemo(
    () => calculateDataHash(customers, visits),
    [customers, visits]
  )
  
  return useMemo(() => {
    if (!customers.length || !visits.length) return []
    
    try {
      return getEnhancedSuggestions(customers, visits, settings)
    } catch (error) {
      console.error('AI suggestions calculation failed:', error)
      return []
    }
  }, [
    dataHash,
    settings.maxSuggestions,
    settings.includeCategories.join(','),
    settings.minScore
  ])
}