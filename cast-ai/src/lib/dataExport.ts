import type { Customer, Visit } from './db'
import { db } from './db'
import { decryptData } from './crypto'

interface ExportData {
  version: string
  exportDate: string
  customers: Customer[]
  visits: Visit[]
}

// データのエクスポート（復号化済み）
export async function exportData(): Promise<void> {
  console.log('=== exportData START ===');
  
  try {
    // データを取得
    console.log('Fetching data from database...');
    const customers = await db.customers.toArray()
    const visits = await db.visits.toArray()
    console.log('Customers:', customers.length, 'Visits:', visits.length);
    
    // 顧客データを復号化
    console.log('Decrypting customer data...');
    const decryptedCustomers = await Promise.all(
      customers.map(async (customer: any) => {
        const decrypted = { ...customer }
        
        // 暗号化されたフィールドを復号化
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
      })
    )
    
    const exportData: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      customers: decryptedCustomers,
      visits
    }
    
    console.log('Export data prepared:', {
      version: exportData.version,
      customers: exportData.customers.length,
      visits: exportData.visits.length
    });
    
    // JSONファイルとしてダウンロード
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cast-ai-backup-${new Date().toISOString().split('T')[0]}.json`
    console.log('Downloading file:', a.download);
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log('=== exportData SUCCESS ===');
  } catch (error) {
    console.error('=== exportData ERROR ===');
    console.error('Export failed:', error)
    throw new Error('データのエクスポートに失敗しました')
  }
}

// データのインポート
export async function importData(file: File): Promise<{ customers: number; visits: number }> {
  console.log('=== importData START ===');
  
  try {
    console.log('Reading file...');
    const text = await file.text()
    const data: ExportData = JSON.parse(text)
    
    console.log('Parsed data:', {
      version: data.version,
      exportDate: data.exportDate,
      customers: data.customers?.length || 0,
      visits: data.visits?.length || 0
    });
    
    // バージョンチェック
    if (!data.version || !data.customers || !data.visits) {
      throw new Error('無効なバックアップファイルです')
    }
    
    // 既存データをクリア（オプション）
    const shouldClear = window.confirm('既存のデータを削除してインポートしますか？\n「キャンセル」を選択すると、データを追加します。')
    
    if (shouldClear) {
      console.log('Clearing existing data...');
      await db.customers.clear()
      await db.visits.clear()
    } else {
      console.log('Appending to existing data...');
    }
    
    // 顧客データをインポート（再暗号化が必要）
    console.log('Importing customers...');
    const customerIdMap = new Map<number, number>()
    let importedCustomers = 0
    
    for (const customer of data.customers) {
      const oldId = customer.id
      const { id, ...customerData } = customer
      
      // 新しいIDで保存
      const newId = await db.customers.add({
        ...customerData,
        createdAt: new Date(customerData.createdAt),
        lastVisit: customerData.lastVisit ? new Date(customerData.lastVisit) : undefined
      })
      
      if (oldId) {
        customerIdMap.set(oldId, newId)
      }
      importedCustomers++
    }
    
    // 訪問データをインポート（顧客IDを更新）
    console.log('Importing visits...');
    let importedVisits = 0
    for (const visit of data.visits) {
      const { id, ...visitData } = visit
      const newCustomerId = customerIdMap.get(visitData.customerId)
      
      if (newCustomerId) {
        await db.visits.add({
          ...visitData,
          customerId: newCustomerId,
          date: new Date(visitData.date)
        })
        importedVisits++
      }
    }
    
    console.log(`Import complete: ${importedCustomers} customers, ${importedVisits} visits`);
    console.log('=== importData SUCCESS ===');
    return { customers: importedCustomers, visits: importedVisits }
  } catch (error) {
    console.error('=== importData ERROR ===');
    console.error('Import failed:', error)
    throw new Error('データのインポートに失敗しました')
  }
}