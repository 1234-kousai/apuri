import { create } from 'zustand'
import type { Customer, Visit } from '../lib/db'
import { db } from '../lib/db'
import { encryptData, decryptData } from '../lib/crypto'
import { showToast } from '../components/Toast'

// 暗号化が必要なフィールド
type EncryptedCustomerFields = {
  phone?: { encrypted: string; iv: string }
  lineId?: { encrypted: string; iv: string }
  memo?: { encrypted: string; iv: string }
}

// 暗号化されたデータを含む顧客タイプ
type EncryptedCustomer = Omit<Customer, 'phone' | 'lineId' | 'memo'> & EncryptedCustomerFields

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
  updateVisit: (id: number, visit: Partial<Omit<Visit, 'id'>>) => Promise<void>
  deleteVisit: (id: number) => Promise<void>
  
  // 計算関連
  calculateVipRank: (totalRevenue: number, visitCount: number) => 'gold' | 'silver' | 'bronze'
  updateCustomerStats: (customerId: number) => Promise<void>
}

// 顧客データを暗号化
async function encryptCustomerData(customer: Partial<Customer>): Promise<Partial<EncryptedCustomer>> {
  const encrypted: any = { ...customer }
  
  if (customer.phone) {
    encrypted.phone = await encryptData(customer.phone)
  }
  if (customer.lineId) {
    encrypted.lineId = await encryptData(customer.lineId)
  }
  if (customer.memo) {
    encrypted.memo = await encryptData(customer.memo)
  }
  
  return encrypted
}

// 顧客データを復号化
async function decryptCustomerData(customer: EncryptedCustomer): Promise<Customer> {
  const decrypted: any = { ...customer }
  
  if (customer.phone && typeof customer.phone === 'object') {
    try {
      decrypted.phone = await decryptData(customer.phone.encrypted, customer.phone.iv)
    } catch {
      decrypted.phone = undefined
    }
  }
  
  if (customer.lineId && typeof customer.lineId === 'object') {
    try {
      decrypted.lineId = await decryptData(customer.lineId.encrypted, customer.lineId.iv)
    } catch {
      decrypted.lineId = undefined
    }
  }
  
  if (customer.memo && typeof customer.memo === 'object') {
    try {
      decrypted.memo = await decryptData(customer.memo.encrypted, customer.memo.iv)
    } catch {
      decrypted.memo = undefined
    }
  }
  
  return decrypted as Customer
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  visits: [],
  isLoading: false,

  loadCustomers: async () => {
    set({ isLoading: true })
    try {
      const encryptedCustomers = await db.customers.toArray() as EncryptedCustomer[]
      const customers = await Promise.all(
        encryptedCustomers.map(async (customer) => {
          try {
            return await decryptCustomerData(customer)
          } catch (error) {
            console.error('Failed to decrypt customer data:', error)
            showToast('error', '一部の顧客データの復号化に失敗しました')
            return customer as Customer
          }
        })
      )
      set({ customers, isLoading: false })
    } catch (error) {
      console.error('Failed to load customers:', error)
      showToast('error', '顧客データの読み込みに失敗しました')
      set({ isLoading: false })
    }
  },

  addCustomer: async (customerData) => {
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        const newCustomer: Customer = {
          ...customerData,
          createdAt: new Date(),
          totalRevenue: 0,
          vipRank: 'bronze'
        }
        
        // 暗号化が必要なフィールドを暗号化
        const encryptedData = await encryptCustomerData(newCustomer)
        
        const id = await db.customers.add(encryptedData as Customer)
        newCustomer.id = id
        
        set((state) => ({
          customers: [...state.customers, newCustomer]
        }))
        
        showToast('success', '顧客を登録しました')
        return // 成功したら終了
      } catch (error: any) {
        console.error(`Failed to add customer (attempt ${retryCount + 1}):`, error)
        
        // エラーの種類に応じた処理
        if (error.name === 'QuotaExceededError') {
          showToast('error', 'ストレージ容量が不足しています。不要なデータを削除してください')
          throw error
        } else if (error.name === 'InvalidStateError') {
          // データベースが閉じている場合は再接続を試みる
          await db.open()
          retryCount++
          if (retryCount === maxRetries) {
            showToast('error', 'データベース接続エラー。ページを再読み込みしてください')
            throw error
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // リトライ間隔を増やす
        } else {
          showToast('error', `顧客の登録に失敗しました: ${error.message || '不明なエラー'}`)
          throw error
        }
      }
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      // 暗号化が必要なフィールドを暗号化
      const encryptedData = await encryptCustomerData(customerData)
      
      await db.customers.update(id, encryptedData as any)
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? { ...c, ...customerData } : c
        )
      }))
      
      showToast('success', '顧客情報を更新しました')
    } catch (error) {
      console.error('Failed to update customer:', error)
      showToast('error', '顧客情報の更新に失敗しました')
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

  updateVisit: async (id, visitData) => {
    try {
      await db.visits.update(id, visitData)
      
      set((state) => ({
        visits: state.visits.map(v => 
          v.id === id ? { ...v, ...visitData } : v
        )
      }))
      
      // 関連する顧客の統計情報を更新
      const visit = await db.visits.get(id)
      if (visit) {
        await get().updateCustomerStats(visit.customerId)
      }
      
      showToast('success', '来店記録を更新しました')
    } catch (error) {
      console.error('Failed to update visit:', error)
      showToast('error', '来店記録の更新に失敗しました')
      throw error
    }
  },

  deleteVisit: async (id) => {
    try {
      // 削除前に顧客IDを取得
      const visit = await db.visits.get(id)
      if (!visit) {
        throw new Error('来店記録が見つかりません')
      }
      
      await db.visits.delete(id)
      
      set((state) => ({
        visits: state.visits.filter(v => v.id !== id)
      }))
      
      // 顧客の統計情報を更新
      await get().updateCustomerStats(visit.customerId)
      
      showToast('success', '来店記録を削除しました')
    } catch (error) {
      console.error('Failed to delete visit:', error)
      showToast('error', '来店記録の削除に失敗しました')
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