import Dexie, { Table } from 'dexie'

export interface Customer {
  id?: number
  name: string
  birthday?: string
  phone?: string
  lineId?: string
  memo?: string
  vipRank: 'gold' | 'silver' | 'bronze'
  totalRevenue: number
  lastVisit?: Date
  createdAt: Date
  avgVisitInterval?: number
}

export interface Visit {
  id?: number
  customerId: number
  date: Date
  revenue: number
  memo?: string
}

export interface AIAnalysis {
  id?: number
  customerId: number
  priorityScore: number
  lastRank?: string
  analyzedAt: Date
}

class CastAIDatabase extends Dexie {
  customers!: Table<Customer>
  visits!: Table<Visit>
  aiAnalysis!: Table<AIAnalysis>

  constructor() {
    super('CastAIDatabase')
    this.version(1).stores({
      customers: '++id, name, vipRank, lastVisit, createdAt',
      visits: '++id, customerId, date',
      aiAnalysis: '++id, customerId, analyzedAt'
    })
  }
}

export const db = new CastAIDatabase()