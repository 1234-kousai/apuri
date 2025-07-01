import { create } from 'zustand'
import { Customer, Visit, db } from '../lib/db'

interface CustomerStore {
  customers: Customer[]
  visits: Visit[]
  isLoading: boolean
  
  // 顧客関連
  loadCustomers: () => Promise<void>
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalRevenue' | 'vipRank'>) => Promise<void>
  updateCustomer: (id: number, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>
  
  // 来店記録関連
  loadVisits: () => Promise<void>
  addVisit: (visit: Omit<Visit, 'id'>) => Promise<void>
  
  // 計算関連
  calculateVipRank: (totalRevenue: number, visitCount: number) => 'gold' | 'silver' | 'bronze'
  updateCustomerStats: (customerId: number) => Promise<void>
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  visits: [],
  isLoading: false,

  loadCustomers: async () => {
    set({ isLoading: true })
    try {
      const customers = await db.customers.toArray()
      set({ customers, isLoading: false })
    } catch (error) {
      console.error('Failed to load customers:', error)
      set({ isLoading: false })
    }
  },

  addCustomer: async (customerData) => {
    try {
      const newCustomer: Customer = {
        ...customerData,
        createdAt: new Date(),
        totalRevenue: 0,
        vipRank: 'bronze'
      }
      
      const id = await db.customers.add(newCustomer)
      newCustomer.id = id
      
      set((state) => ({
        customers: [...state.customers, newCustomer]
      }))
    } catch (error) {
      console.error('Failed to add customer:', error)
      throw error
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      await db.customers.update(id, customerData)
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...customerData } : c
        )
      }))
    } catch (error) {
      console.error('Failed to update customer:', error)
      throw error
    }
  },

  deleteCustomer: async (id) => {
    try {
      await db.customers.delete(id)
      await db.visits.where('customerId').equals(id).delete()
      
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        visits: state.visits.filter((v) => v.customerId !== id)
      }))
    } catch (error) {
      console.error('Failed to delete customer:', error)
      throw error
    }
  },

  loadVisits: async () => {
    try {
      const visits = await db.visits.toArray()
      set({ visits })
    } catch (error) {
      console.error('Failed to load visits:', error)
    }
  },

  addVisit: async (visitData) => {
    try {
      const id = await db.visits.add(visitData)
      const newVisit = { ...visitData, id }
      
      set((state) => ({
        visits: [...state.visits, newVisit]
      }))
      
      // 顧客の統計情報を更新
      await get().updateCustomerStats(visitData.customerId)
    } catch (error) {
      console.error('Failed to add visit:', error)
      throw error
    }
  },

  calculateVipRank: (totalRevenue, visitCount) => {
    const avgRevenuePerVisit = visitCount > 0 ? totalRevenue / visitCount : 0
    
    if (totalRevenue >= 500000 || avgRevenuePerVisit >= 50000) {
      return 'gold'
    } else if (totalRevenue >= 200000 || avgRevenuePerVisit >= 20000) {
      return 'silver'
    }
    return 'bronze'
  },

  updateCustomerStats: async (customerId) => {
    try {
      const customerVisits = await db.visits
        .where('customerId')
        .equals(customerId)
        .toArray()
      
      const totalRevenue = customerVisits.reduce((sum, visit) => sum + visit.revenue, 0)
      const visitCount = customerVisits.length
      const vipRank = get().calculateVipRank(totalRevenue, visitCount)
      
      // 最終来店日
      const lastVisit = customerVisits.length > 0
        ? new Date(Math.max(...customerVisits.map(v => v.date.getTime())))
        : undefined
      
      // 平均来店間隔の計算
      let avgVisitInterval: number | undefined
      if (customerVisits.length >= 2) {
        const sortedVisits = customerVisits.sort((a, b) => a.date.getTime() - b.date.getTime())
        const intervals: number[] = []
        
        for (let i = 1; i < sortedVisits.length; i++) {
          const daysDiff = Math.floor(
            (sortedVisits[i].date.getTime() - sortedVisits[i - 1].date.getTime()) / 
            (1000 * 60 * 60 * 24)
          )
          intervals.push(daysDiff)
        }
        
        avgVisitInterval = Math.round(
          intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
        )
      }
      
      await get().updateCustomer(customerId, {
        totalRevenue,
        vipRank,
        lastVisit,
        avgVisitInterval
      })
    } catch (error) {
      console.error('Failed to update customer stats:', error)
    }
  }
}))