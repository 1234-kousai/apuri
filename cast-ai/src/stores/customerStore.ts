import { create } from 'zustand'
import type { Customer, Visit } from '../lib/db'
import { db } from '../lib/db'
import { encryptData, decryptData } from '../lib/crypto'
import { showToast } from '../components/Toast'
import { withDbConnection, withTransaction } from '../lib/dbUtils'

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
  console.log('encryptCustomerData input:', customer);
  const encrypted: any = { ...customer }
  
  if (customer.phone) {
    console.log('Encrypting phone:', customer.phone, typeof customer.phone);
    // Only encrypt if it's a plain string
    if (typeof customer.phone === 'string') {
      encrypted.phone = await encryptData(customer.phone)
      console.log('Encrypted phone result:', encrypted.phone);
    } else {
      encrypted.phone = customer.phone
    }
  }
  if (customer.lineId) {
    console.log('Encrypting lineId:', customer.lineId, typeof customer.lineId);
    // Only encrypt if it's a plain string
    if (typeof customer.lineId === 'string') {
      encrypted.lineId = await encryptData(customer.lineId)
      console.log('Encrypted lineId result:', encrypted.lineId);
    } else {
      encrypted.lineId = customer.lineId
    }
  }
  if (customer.memo) {
    console.log('Encrypting memo:', customer.memo, typeof customer.memo);
    // Only encrypt if it's a plain string
    if (typeof customer.memo === 'string') {
      encrypted.memo = await encryptData(customer.memo)
      console.log('Encrypted memo result:', encrypted.memo);
    } else {
      encrypted.memo = customer.memo
    }
  }
  
  console.log('encryptCustomerData output:', encrypted);
  return encrypted
}

// 顧客データを復号化
async function decryptCustomerData(customer: EncryptedCustomer): Promise<Customer> {
  console.log('decryptCustomerData input:', customer);
  const decrypted: any = { ...customer }
  
  if (customer.phone && typeof customer.phone === 'object') {
    console.log('Decrypting phone:', customer.phone);
    try {
      decrypted.phone = await decryptData(customer.phone.encrypted, customer.phone.iv)
      console.log('Decrypted phone result:', decrypted.phone);
    } catch (error) {
      console.error('Failed to decrypt phone:', error);
      decrypted.phone = undefined
    }
  }
  
  if (customer.lineId && typeof customer.lineId === 'object') {
    console.log('Decrypting lineId:', customer.lineId);
    try {
      decrypted.lineId = await decryptData(customer.lineId.encrypted, customer.lineId.iv)
      console.log('Decrypted lineId result:', decrypted.lineId);
    } catch (error) {
      console.error('Failed to decrypt lineId:', error);
      decrypted.lineId = undefined
    }
  }
  
  if (customer.memo && typeof customer.memo === 'object') {
    console.log('Decrypting memo:', customer.memo);
    try {
      decrypted.memo = await decryptData(customer.memo.encrypted, customer.memo.iv)
      console.log('Decrypted memo result:', decrypted.memo);
    } catch (error) {
      console.error('Failed to decrypt memo:', error);
      decrypted.memo = undefined
    }
  }
  
  console.log('decryptCustomerData output:', decrypted);
  return decrypted as Customer
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  visits: [],
  isLoading: false,

  loadCustomers: async () => {
    console.log('=== loadCustomers START ===');
    set({ isLoading: true })
    try {
      const customers = await withDbConnection(async () => {
        console.log('Fetching customers from database...');
        const encryptedCustomers = await db.customers.toArray() as EncryptedCustomer[]
        console.log('Encrypted customers from DB:', encryptedCustomers);
        console.log('Number of customers:', encryptedCustomers.length);
        
        const decryptedCustomers = await Promise.all(
          encryptedCustomers.map(async (customer, index) => {
            try {
              console.log(`Decrypting customer ${index}:`, customer);
              const decrypted = await decryptCustomerData(customer)
              console.log(`Decrypted customer ${index}:`, decrypted);
              return decrypted
            } catch (error) {
              console.error(`Failed to decrypt customer ${index}:`, error)
              showToast('error', '一部の顧客データの復号化に失敗しました')
              return customer as Customer
            }
          })
        )
        
        // Filter out any customers without valid IDs
        const validCustomers = decryptedCustomers.filter(customer => customer.id && typeof customer.id === 'number')
        console.log('Valid customers after filtering:', validCustomers);
        console.log('Filtered out:', decryptedCustomers.length - validCustomers.length, 'customers');
        return validCustomers
      })
      console.log('Setting customers to state:', customers);
      set({ customers, isLoading: false })
      console.log('=== loadCustomers SUCCESS ===');
    } catch (error) {
      console.error('=== loadCustomers ERROR ===');
      console.error('Error details:', error)
      showToast('error', '顧客データの読み込みに失敗しました')
      set({ isLoading: false })
    }
  },

  addCustomer: async (customerData) => {
    try {
      console.log('=== addCustomer START ===');
      console.log('Input customerData:', customerData);
      
      const newCustomer: Customer = {
        ...customerData,
        createdAt: new Date(),
        totalRevenue: 0,
        vipRank: 'bronze'
      }
      console.log('New customer object:', newCustomer);
      
      // 暗号化が必要なフィールドを暗号化
      console.log('Starting encryption...');
      const encryptedData = await encryptCustomerData(newCustomer)
      console.log('Encrypted data:', encryptedData);
      
      console.log('Saving to database...');
      const id = await withDbConnection(async () => {
        return await db.customers.add(encryptedData as Customer)
      })
      console.log('Received ID from database:', id, typeof id);
      
      if (!id || typeof id !== 'number') {
        throw new Error('Failed to get customer ID from database')
      }
      
      newCustomer.id = id
      console.log('Customer with ID:', newCustomer);
      
      set((state) => {
        console.log('Current customers:', state.customers);
        const newState = {
          customers: [...state.customers, newCustomer]
        };
        console.log('New state:', newState);
        return newState;
      })
      
      console.log('=== addCustomer SUCCESS ===');
      showToast('success', '顧客を登録しました')
    } catch (error: any) {
      console.error('=== addCustomer ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      if (error.name === 'QuotaExceededError') {
        showToast('error', 'ストレージ容量が不足しています。不要なデータを削除してください')
      } else {
        showToast('error', `顧客の登録に失敗しました: ${error.message || '不明なエラー'}`)
      }
      throw error
    }
  },

  updateCustomer: async (id, customerData) => {
    console.log('=== updateCustomer START ===');
    console.log('Customer ID:', id, 'Type:', typeof id);
    console.log('Update data:', customerData);
    
    try {
      // 暗号化が必要なフィールドを暗号化
      console.log('Encrypting customer data...');
      const encryptedData = await encryptCustomerData(customerData)
      console.log('Encrypted data:', encryptedData);
      
      console.log('Updating database...');
      await withDbConnection(async () => {
        const result = await db.customers.update(id, encryptedData as any)
        console.log('Database update result:', result);
        if (result === 0) {
          throw new Error('No customer found with the given ID');
        }
      })
      
      console.log('Updating state...');
      set((state) => {
        const newCustomers = state.customers.map((c) =>
          c.id === id ? { ...c, ...customerData } : c
        );
        console.log('Updated customers:', newCustomers);
        return { customers: newCustomers };
      })
      
      console.log('=== updateCustomer SUCCESS ===');
      showToast('success', '顧客情報を更新しました')
    } catch (error) {
      console.error('=== updateCustomer ERROR ===');
      console.error('Error details:', error)
      showToast('error', '顧客情報の更新に失敗しました')
      throw error
    }
  },

  deleteCustomer: async (id) => {
    console.log('=== deleteCustomer START ===');
    console.log('Deleting customer ID:', id, 'Type:', typeof id);
    
    const state = get()
    const originalCustomers = state.customers
    const originalVisits = state.visits
    
    console.log('Current customers:', originalCustomers);
    console.log('Customer to delete:', originalCustomers.find(c => c.id === id));
    
    try {
      // 楽観的更新（UIを先に更新）
      console.log('Optimistically updating UI...');
      set((state) => {
        const newState = {
          customers: state.customers.filter((c) => c.id !== id),
          visits: state.visits.filter((v) => v.customerId !== id)
        };
        console.log('New customers after filter:', newState.customers);
        console.log('Removed customers:', state.customers.length - newState.customers.length);
        return newState;
      })
      
      // トランザクション内で削除を実行
      console.log('Deleting from database...');
      await withTransaction(async () => {
        console.log('Deleting customer from DB...');
        await db.customers.delete(id)
        console.log('Deleting visits from DB...');
        const deletedVisits = await db.visits.where('customerId').equals(id).delete()
        console.log('Deleted visits count:', deletedVisits);
      })
      
      console.log('=== deleteCustomer SUCCESS ===');
      showToast('success', '顧客を削除しました')
    } catch (error: any) {
      console.error('=== deleteCustomer ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      // エラー時はUIを元に戻す
      console.log('Rolling back UI changes...');
      set({ 
        customers: originalCustomers,
        visits: originalVisits
      })
      
      showToast('error', '顧客の削除に失敗しました')
      throw error
    }
  },

  loadVisits: async () => {
    console.log('=== loadVisits START ===');
    try {
      const visits = await withDbConnection(async () => {
        const result = await db.visits.toArray()
        console.log('Loaded visits from DB:', result);
        console.log('Number of visits:', result.length);
        return result
      })
      set({ visits })
      console.log('=== loadVisits SUCCESS ===');
    } catch (error) {
      console.error('=== loadVisits ERROR ===');
      console.error('Error details:', error)
      showToast('error', '来店記録の読み込みに失敗しました')
    }
  },

  addVisit: async (visitData) => {
    console.log('=== addVisit START ===');
    console.log('Visit data:', visitData);
    
    try {
      console.log('Adding visit to database...');
      const id = await withDbConnection(async () => {
        const result = await db.visits.add(visitData)
        console.log('Database add result:', result);
        return result
      })
      
      if (!id || typeof id !== 'number') {
        throw new Error('Failed to get visit ID from database');
      }
      
      const newVisit = { ...visitData, id }
      console.log('New visit with ID:', newVisit);
      
      set((state) => {
        console.log('Current visits:', state.visits);
        const newState = {
          visits: [...state.visits, newVisit]
        };
        console.log('New visits:', newState.visits);
        return newState;
      })
      
      // 顧客の統計情報を更新
      console.log('Updating customer stats for customer ID:', visitData.customerId);
      await get().updateCustomerStats(visitData.customerId)
      
      console.log('=== addVisit SUCCESS ===');
    } catch (error: any) {
      console.error('=== addVisit ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      showToast('error', '来店記録の追加に失敗しました')
      throw error
    }
  },

  updateVisit: async (id, visitData) => {
    console.log('=== updateVisit START ===');
    console.log('Visit ID:', id, 'Type:', typeof id);
    console.log('Update data:', visitData);
    
    try {
      console.log('Updating database...');
      await withDbConnection(async () => {
        const result = await db.visits.update(id, visitData)
        console.log('Database update result:', result);
        if (result === 0) {
          throw new Error('No visit found with the given ID');
        }
      })
      
      console.log('Updating state...');
      set((state) => {
        const newVisits = state.visits.map(v => 
          v.id === id ? { ...v, ...visitData } : v
        );
        console.log('Updated visits:', newVisits);
        return { visits: newVisits };
      })
      
      // 関連する顧客の統計情報を更新
      console.log('Getting visit for stats update...');
      const visit = await withDbConnection(async () => {
        return await db.visits.get(id)
      })
      if (visit) {
        console.log('Updating customer stats for customer ID:', visit.customerId);
        await get().updateCustomerStats(visit.customerId)
      }
      
      console.log('=== updateVisit SUCCESS ===');
      showToast('success', '来店記録を更新しました')
    } catch (error) {
      console.error('=== updateVisit ERROR ===');
      console.error('Error details:', error)
      showToast('error', '来店記録の更新に失敗しました')
      throw error
    }
  },

  deleteVisit: async (id) => {
    console.log('=== deleteVisit START ===');
    console.log('Visit ID:', id, 'Type:', typeof id);
    
    const state = get()
    const originalVisits = state.visits
    console.log('Current visits:', originalVisits.length);
    
    try {
      // 削除前に顧客IDを取得
      console.log('Getting visit details...');
      const visit = await withDbConnection(async () => {
        const v = await db.visits.get(id)
        if (!v) {
          throw new Error('来店記録が見つかりません')
        }
        return v
      })
      console.log('Visit to delete:', visit);
      console.log('Customer ID:', visit.customerId);
      
      // 楽観的更新（UIを先に更新）
      console.log('Optimistically updating UI...');
      set((state) => {
        const newVisits = state.visits.filter(v => v.id !== id);
        console.log('Remaining visits:', newVisits.length);
        return { visits: newVisits };
      })
      
      // データベースから削除
      console.log('Deleting from database...');
      await withDbConnection(async () => {
        await db.visits.delete(id)
        console.log('Deleted from database');
      })
      
      // 顧客の統計情報を更新
      console.log('Updating customer stats...');
      await get().updateCustomerStats(visit.customerId)
      
      console.log('=== deleteVisit SUCCESS ===');
      showToast('success', '来店記録を削除しました')
    } catch (error) {
      console.error('=== deleteVisit ERROR ===');
      console.error('Error details:', error);
      
      // エラー時はUIを元に戻す
      console.log('Rolling back UI changes...');
      set({ visits: originalVisits })
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
    console.log('=== updateCustomerStats START ===');
    console.log('Customer ID:', customerId);
    
    try {
      const customerVisits = await withDbConnection(async () => {
        return await db.visits
          .where('customerId')
          .equals(customerId)
          .toArray()
      })
      
      console.log('Customer visits:', customerVisits.length);
      
      const totalRevenue = customerVisits.reduce((sum, visit) => sum + visit.revenue, 0)
      const visitCount = customerVisits.length
      const vipRank = get().calculateVipRank(totalRevenue, visitCount)
      
      console.log('Calculated stats:');
      console.log('- Total revenue:', totalRevenue);
      console.log('- Visit count:', visitCount);
      console.log('- VIP rank:', vipRank);
      
      // 最終来店日
      const lastVisit = customerVisits.length > 0
        ? new Date(Math.max(...customerVisits.map(v => new Date(v.date).getTime())))
        : undefined
      
      console.log('- Last visit:', lastVisit);
      
      // 平均来店間隔の計算
      let avgVisitInterval: number | undefined
      if (customerVisits.length >= 2) {
        const sortedVisits = customerVisits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        const intervals: number[] = []
        
        for (let i = 1; i < sortedVisits.length; i++) {
          const daysDiff = Math.floor(
            (new Date(sortedVisits[i].date).getTime() - new Date(sortedVisits[i - 1].date).getTime()) / 
            (1000 * 60 * 60 * 24)
          )
          intervals.push(daysDiff)
        }
        
        avgVisitInterval = Math.round(
          intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
        )
      }
      
      const updateData = {
        totalRevenue,
        vipRank,
        lastVisit,
        avgVisitInterval
      };
      
      console.log('Updating customer with:', updateData);
      
      await get().updateCustomer(customerId, updateData)
      
      console.log('=== updateCustomerStats SUCCESS ===');
    } catch (error) {
      console.error('=== updateCustomerStats ERROR ===');
      console.error('Error details:', error)
    }
  }
}))