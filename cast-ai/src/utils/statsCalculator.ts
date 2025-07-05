import type { Customer, Visit } from '../lib/db'
import type { StatsPeriod } from '../components/StatsPeriodSelector'

export interface DetailedStats {
  totalRevenue: number
  visitCount: number
  customerCount: number
  newCustomerCount: number
  avgRevenuePerVisit: number
  avgVisitsPerCustomer: number
  topCustomers: Array<{
    customer: Customer
    revenue: number
    visits: number
  }>
  revenueByDay: Array<{
    date: Date
    revenue: number
    visits: number
  }>
  prediction?: {
    dailyAverage: number
    periodEnd: number
    daysRemaining: number
  }
}

export function calculateStats(
  customers: Customer[],
  visits: Visit[],
  period: StatsPeriod
): DetailedStats {
  const now = new Date()
  const { startDate, endDate } = getPeriodDates(period, now)
  
  // 期間内の訪問を抽出
  const periodVisits = visits.filter(v => {
    const visitDate = new Date(v.date)
    return visitDate >= startDate && visitDate <= endDate
  })
  
  // 期間内の新規顧客を抽出
  const newCustomers = customers.filter(c => {
    const createdDate = new Date(c.createdAt)
    return createdDate >= startDate && createdDate <= endDate
  })
  
  // 基本統計
  const totalRevenue = periodVisits.reduce((sum, v) => sum + v.revenue, 0)
  const visitCount = periodVisits.length
  const avgRevenuePerVisit = visitCount > 0 ? totalRevenue / visitCount : 0
  const avgVisitsPerCustomer = customers.length > 0 ? visitCount / customers.length : 0
  
  // トップ顧客の計算
  const customerStats = new Map<number, { revenue: number; visits: number }>()
  periodVisits.forEach(visit => {
    const stats = customerStats.get(visit.customerId) || { revenue: 0, visits: 0 }
    stats.revenue += visit.revenue
    stats.visits += 1
    customerStats.set(visit.customerId, stats)
  })
  
  const topCustomers = Array.from(customerStats.entries())
    .map(([customerId, stats]) => ({
      customer: customers.find(c => c.id === customerId)!,
      ...stats
    }))
    .filter(item => item.customer)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  
  // 日別売上の計算
  const revenueByDayMap = new Map<string, { revenue: number; visits: number }>()
  periodVisits.forEach(visit => {
    const dateKey = new Date(visit.date).toISOString().split('T')[0]
    const stats = revenueByDayMap.get(dateKey) || { revenue: 0, visits: 0 }
    stats.revenue += visit.revenue
    stats.visits += 1
    revenueByDayMap.set(dateKey, stats)
  })
  
  const revenueByDay = Array.from(revenueByDayMap.entries())
    .map(([date, stats]) => ({
      date: new Date(date),
      ...stats
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  
  // 予測計算（今月・今週・今日の場合のみ）
  let prediction: DetailedStats['prediction']
  if (['today', 'week', 'month'].includes(period)) {
    const daysPassed = Math.max(1, getDaysPassed(startDate, now))
    const dailyAverage = totalRevenue / daysPassed
    const totalDays = getTotalDays(startDate, endDate)
    const daysRemaining = Math.max(0, totalDays - daysPassed)
    const periodEnd = Math.round(dailyAverage * totalDays)
    
    prediction = {
      dailyAverage,
      periodEnd,
      daysRemaining
    }
  }
  
  return {
    totalRevenue,
    visitCount,
    customerCount: customers.length,
    newCustomerCount: newCustomers.length,
    avgRevenuePerVisit,
    avgVisitsPerCustomer,
    topCustomers,
    revenueByDay,
    prediction
  }
}

function getPeriodDates(period: StatsPeriod, now: Date): { startDate: Date; endDate: Date } {
  const startDate = new Date(now)
  const endDate = new Date(now)
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    
    case 'week':
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 月曜始まり
      startDate.setDate(now.getDate() - diff)
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      break
    
    case 'month':
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(now.getMonth() + 1, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      startDate.setMonth(quarter * 3, 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(quarter * 3 + 3, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    
    case 'year':
      startDate.setMonth(0, 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(11, 31)
      endDate.setHours(23, 59, 59, 999)
      break
    
    case 'all':
      startDate.setFullYear(2000, 0, 1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setFullYear(2100, 11, 31)
      endDate.setHours(23, 59, 59, 999)
      break
  }
  
  return { startDate, endDate }
}

function getDaysPassed(startDate: Date, now: Date): number {
  const diff = now.getTime() - startDate.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getTotalDays(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}