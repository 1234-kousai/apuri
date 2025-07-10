import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface Customer {
  id?: number
  name: string
  birthday?: string
  phone?: string | { encrypted: string; iv: string }
  lineId?: string | { encrypted: string; iv: string }
  memo?: string | { encrypted: string; iv: string }
  vipRank: 'gold' | 'silver' | 'bronze'
  rank?: 'S' | 'A' | 'B' | 'C' // ランクフィールドを追加
  totalRevenue: number
  visitCount?: number // 来店回数を追加
  lastVisit?: Date
  createdAt: Date
  updatedAt?: Date // 更新日時を追加
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