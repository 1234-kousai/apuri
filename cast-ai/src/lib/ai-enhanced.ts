import type { Customer, Visit } from './db'

// 拡張された顧客データ型
export interface CustomerWithAnalytics extends Customer {
  visits: Visit[]
  analytics: {
    totalRevenue: number
    visitCount: number
    avgRevenue: number
    avgInterval: number
    lastVisit: Date | null
    trend: 'increasing' | 'stable' | 'decreasing'
    lifetime: number // 顧客生涯価値の予測
    churnRisk: number // 離脱リスク (0-1)
  }
}

// AI提案の詳細型
export interface AISuggestion {
  customer: CustomerWithAnalytics
  score: number
  category: 'urgent' | 'opportunity' | 'relationship' | 'surprise'
  primaryReason: string
  subReasons: string[]
  actions: {
    type: 'contact' | 'special_offer' | 'birthday' | 'retention'
    message: string
    priority: 'high' | 'medium' | 'low'
  }[]
  expectedImpact: {
    revenue: number
    retention: number
  }
}

// 顧客分析
export function analyzeCustomer(customer: Customer, visits: Visit[]): CustomerWithAnalytics {
  const now = new Date()
  const sortedVisits = [...visits].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  // 基本統計
  const totalRevenue = visits.reduce((sum, v) => sum + v.revenue, 0)
  const visitCount = visits.length
  const avgRevenue = visitCount > 0 ? totalRevenue / visitCount : 0
  const lastVisit = sortedVisits.length > 0 ? new Date(sortedVisits[0].date) : null
  
  // 平均来店間隔の計算
  let avgInterval = 0
  if (sortedVisits.length >= 2) {
    const intervals: number[] = []
    for (let i = 1; i < sortedVisits.length; i++) {
      const interval = Math.floor(
        (new Date(sortedVisits[i - 1].date).getTime() - 
         new Date(sortedVisits[i].date).getTime()) / (1000 * 60 * 60 * 24)
      )
      intervals.push(interval)
    }
    avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
  }
  
  // トレンド分析
  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
  if (sortedVisits.length >= 4) {
    const recentVisits = sortedVisits.slice(0, Math.floor(sortedVisits.length / 2))
    const olderVisits = sortedVisits.slice(Math.floor(sortedVisits.length / 2))
    
    const recentAvgRevenue = recentVisits.reduce((sum, v) => sum + v.revenue, 0) / recentVisits.length
    const olderAvgRevenue = olderVisits.reduce((sum, v) => sum + v.revenue, 0) / olderVisits.length
    
    if (recentAvgRevenue > olderAvgRevenue * 1.2) {
      trend = 'increasing'
    } else if (recentAvgRevenue < olderAvgRevenue * 0.8) {
      trend = 'decreasing'
    }
  }
  
  // 顧客生涯価値の予測（簡易版）
  const monthsSinceFirst = lastVisit 
    ? Math.max(1, Math.floor((lastVisit.getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 1
  const monthlyRevenue = totalRevenue / monthsSinceFirst
  const expectedLifetimeMonths = trend === 'increasing' ? 24 : trend === 'decreasing' ? 6 : 12
  const lifetime = monthlyRevenue * expectedLifetimeMonths
  
  // 離脱リスクの計算
  let churnRisk = 0
  if (lastVisit) {
    const daysSinceLastVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    
    if (avgInterval > 0) {
      churnRisk = Math.min(1, daysSinceLastVisit / (avgInterval * 2))
    } else {
      churnRisk = Math.min(1, daysSinceLastVisit / 30)
    }
    
    if (trend === 'decreasing') {
      churnRisk = Math.min(1, churnRisk * 1.5)
    }
  }
  
  return {
    ...customer,
    visits: sortedVisits,
    analytics: {
      totalRevenue,
      visitCount,
      avgRevenue,
      avgInterval,
      lastVisit,
      trend,
      lifetime,
      churnRisk
    }
  }
}

// 誕生日チェック
function checkBirthday(customer: Customer): { daysUntil: number; isThisWeek: boolean } {
  if (!customer.birthday) return { daysUntil: -1, isThisWeek: false }
  
  const now = new Date()
  const birthday = new Date(customer.birthday)
  const thisYearBirthday = new Date(
    now.getFullYear(),
    birthday.getMonth(),
    birthday.getDate()
  )
  
  if (thisYearBirthday < now) {
    thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1)
  }
  
  const daysUntil = Math.floor(
    (thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return {
    daysUntil,
    isThisWeek: daysUntil >= 0 && daysUntil <= 7
  }
}

// 提案スコアリング
export function generateSuggestion(customer: CustomerWithAnalytics): AISuggestion | null {
  const now = new Date()
  const { analytics } = customer
  const birthday = checkBirthday(customer)
  
  let score = 0
  let category: AISuggestion['category'] = 'relationship'
  let primaryReason = ''
  const subReasons: string[] = []
  const actions: AISuggestion['actions'] = []
  
  // 1. 緊急度の高い提案
  if (analytics.churnRisk > 0.7) {
    score = 0.95
    category = 'urgent'
    primaryReason = `離脱リスクが高まっています（${Math.round(analytics.churnRisk * 100)}%）`
    
    if (analytics.lastVisit) {
      const daysSince = Math.floor((now.getTime() - analytics.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      subReasons.push(`最終来店から${daysSince}日経過`)
    }
    
    if (analytics.trend === 'decreasing') {
      subReasons.push('来店頻度が低下傾向')
    }
    
    actions.push({
      type: 'retention',
      message: '特別オファーで再来店を促しましょう',
      priority: 'high'
    })
  }
  
  // 2. 誕生日提案
  else if (birthday.isThisWeek) {
    score = 0.9
    category = 'opportunity'
    primaryReason = `誕生日まであと${birthday.daysUntil}日です！`
    subReasons.push('誕生日特典で特別な体験を提供')
    
    if (customer.vipRank === 'gold') {
      subReasons.push('ゴールドランクの重要顧客')
    }
    
    actions.push({
      type: 'birthday',
      message: '誕生日のお祝いメッセージを送りましょう',
      priority: 'high'
    })
    
    actions.push({
      type: 'special_offer',
      message: '誕生日限定の特別プランを提案',
      priority: 'medium'
    })
  }
  
  // 3. ビジネスチャンス
  else if (analytics.trend === 'increasing' && analytics.avgRevenue > 30000) {
    score = 0.85
    category = 'opportunity'
    primaryReason = '売上が上昇傾向の優良顧客です'
    subReasons.push(`平均単価: ${Math.round(analytics.avgRevenue).toLocaleString()}円`)
    subReasons.push(`予測生涯価値: ${Math.round(analytics.lifetime).toLocaleString()}円`)
    
    actions.push({
      type: 'special_offer',
      message: 'VIPプランへのアップグレードを提案',
      priority: 'medium'
    })
  }
  
  // 4. 定期的な関係構築
  else if (analytics.lastVisit) {
    const daysSince = Math.floor((now.getTime() - analytics.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    
    if (analytics.avgInterval > 0 && daysSince >= analytics.avgInterval * 0.8) {
      score = 0.7
      category = 'relationship'
      primaryReason = `そろそろ来店時期です（通常${analytics.avgInterval}日間隔）`
      subReasons.push(`前回から${daysSince}日経過`)
      
      actions.push({
        type: 'contact',
        message: '定期的な挨拶で関係を維持',
        priority: 'medium'
      })
    }
  }
  
  // 5. 新規顧客のフォローアップ
  else if (analytics.visitCount <= 3) {
    const daysSinceCreated = Math.floor(
      (now.getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceCreated <= 30) {
      score = 0.75
      category = 'relationship'
      primaryReason = '新規顧客の定着化が重要です'
      subReasons.push(`登録から${daysSinceCreated}日（来店${analytics.visitCount}回）`)
      
      actions.push({
        type: 'contact',
        message: '初回体験の感想を伺いましょう',
        priority: 'medium'
      })
    }
  }
  
  // 6. サプライズ枠
  if (score < 0.5 && Math.random() < 0.1) {
    score = 0.6
    category = 'surprise'
    primaryReason = '今日のラッキー顧客です！'
    subReasons.push('予期せぬ連絡で好印象を与えるチャンス')
    
    actions.push({
      type: 'contact',
      message: 'お元気ですか？の一言から始めましょう',
      priority: 'low'
    })
  }
  
  if (score < 0.5) return null
  
  // 期待される影響の計算
  const expectedImpact = {
    revenue: analytics.avgRevenue * (category === 'urgent' ? 2 : 1) * (1 + score * 0.5),
    retention: Math.min(1, (1 - analytics.churnRisk) + score * 0.3)
  }
  
  return {
    customer,
    score,
    category,
    primaryReason,
    subReasons,
    actions,
    expectedImpact
  }
}

// メインの提案生成関数
export function getEnhancedSuggestions(
  customers: Customer[],
  visits: Visit[],
  settings?: {
    maxSuggestions?: number
    includeCategories?: AISuggestion['category'][]
    minScore?: number
  }
): AISuggestion[] {
  const {
    maxSuggestions = 5,
    includeCategories = ['urgent', 'opportunity', 'relationship', 'surprise'],
    minScore = 0.5
  } = settings || {}
  
  // 顧客分析
  const analyzedCustomers = customers.map(customer => 
    analyzeCustomer(customer, visits.filter(v => v.customerId === customer.id))
  )
  
  // 提案生成
  const suggestions: AISuggestion[] = []
  for (const customer of analyzedCustomers) {
    const suggestion = generateSuggestion(customer)
    if (suggestion && 
        suggestion.score >= minScore && 
        includeCategories.includes(suggestion.category)) {
      suggestions.push(suggestion)
    }
  }
  
  // カテゴリー別にソートして多様性を確保
  const categorized = {
    urgent: suggestions.filter(s => s.category === 'urgent'),
    opportunity: suggestions.filter(s => s.category === 'opportunity'),
    relationship: suggestions.filter(s => s.category === 'relationship'),
    surprise: suggestions.filter(s => s.category === 'surprise')
  }
  
  const finalSuggestions: AISuggestion[] = []
  
  // 各カテゴリーから最適な提案を選出
  for (const category of includeCategories) {
    const categoryItems = categorized[category].sort((a, b) => b.score - a.score)
    if (categoryItems.length > 0) {
      finalSuggestions.push(...categoryItems.slice(0, Math.ceil(maxSuggestions / 4)))
    }
  }
  
  // スコア順にソートして上位を返す
  return finalSuggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
}