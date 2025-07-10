// 自己診断・修復機能
import { db } from './db'
import { decryptData } from './crypto'
import type { Customer } from './db'

interface DiagnosticResult {
  issue: string
  severity: 'error' | 'warning' | 'info'
  details: any
  fix?: () => Promise<void>
}

// 顧客データの診断
export async function diagnoseCustomerData(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = []
  
  try {
    // 1. データベースから直接顧客データを取得
    const rawCustomers = await db.customers.toArray()
    console.log('=== DIAGNOSTIC: Raw customers from DB ===', rawCustomers)
    
    // 2. 各顧客データをチェック
    for (const customer of rawCustomers) {
      // IDチェック
      if (!customer.id || typeof customer.id !== 'number') {
        results.push({
          issue: 'Invalid customer ID',
          severity: 'error',
          details: { customer, id: customer.id, type: typeof customer.id }
        })
      }
      
      // 暗号化フィールドチェック
      const encryptedFields = ['phone', 'lineId', 'memo']
      for (const field of encryptedFields) {
        const value = (customer as any)[field]
        if (value && typeof value === 'object' && 'encrypted' in value && 'iv' in value) {
          // 暗号化されたデータが見つかった
          results.push({
            issue: `Encrypted ${field} found`,
            severity: 'info',
            details: { customerId: customer.id, field, value }
          })
          
          // 復号化を試みる
          try {
            const decrypted = await decryptData(value.encrypted, value.iv)
            results.push({
              issue: `${field} decryption test`,
              severity: 'info',
              details: { customerId: customer.id, field, success: true, decrypted }
            })
          } catch (error) {
            results.push({
              issue: `${field} decryption failed`,
              severity: 'error',
              details: { customerId: customer.id, field, error: error?.toString() },
              fix: async () => {
                // 復号化できないフィールドをクリア
                await db.customers.update(customer.id!, { [field]: undefined })
              }
            })
          }
        }
      }
      
      // 必須フィールドチェック
      if (!customer.name) {
        results.push({
          issue: 'Missing customer name',
          severity: 'error',
          details: { customerId: customer.id }
        })
      }
    }
    
    // 3. 重複IDチェック
    const idCounts = new Map<number, number>()
    for (const customer of rawCustomers) {
      if (customer.id) {
        idCounts.set(customer.id, (idCounts.get(customer.id) || 0) + 1)
      }
    }
    for (const [id, count] of idCounts) {
      if (count > 1) {
        results.push({
          issue: 'Duplicate customer ID',
          severity: 'error',
          details: { id, count }
        })
      }
    }
    
  } catch (error) {
    results.push({
      issue: 'Database access error',
      severity: 'error',
      details: { error: error?.toString() }
    })
  }
  
  return results
}

// 自動修復を実行
export async function autoFixIssues(results: DiagnosticResult[]): Promise<void> {
  console.log('=== AUTO-FIX: Starting automatic repairs ===')
  
  for (const result of results) {
    if (result.fix && result.severity === 'error') {
      console.log(`Fixing: ${result.issue}`)
      try {
        await result.fix()
        console.log(`Fixed: ${result.issue}`)
      } catch (error) {
        console.error(`Failed to fix ${result.issue}:`, error)
      }
    }
  }
  
  console.log('=== AUTO-FIX: Completed ===')
}

// CustomerDetailコンポーネントのクラッシュを防ぐ
export function safeCustomerDetailProps(customer: Customer): Customer {
  // 安全なデフォルト値を提供
  return {
    id: customer.id || 0,
    name: customer.name || '名前なし',
    vipRank: customer.vipRank || 'bronze',
    rank: customer.rank || 'C',
    totalRevenue: customer.totalRevenue || 0,
    visitCount: customer.visitCount || 0,
    lastVisit: customer.lastVisit,
    avgVisitInterval: customer.avgVisitInterval,
    phone: typeof customer.phone === 'string' ? customer.phone : undefined,
    lineId: typeof customer.lineId === 'string' ? customer.lineId : undefined,
    birthday: customer.birthday,
    memo: typeof customer.memo === 'string' ? customer.memo : undefined,
    createdAt: customer.createdAt || new Date(),
    updatedAt: customer.updatedAt || new Date()
  }
}

// 診断レポートを生成
export function generateDiagnosticReport(results: DiagnosticResult[]): string {
  const errors = results.filter(r => r.severity === 'error')
  const warnings = results.filter(r => r.severity === 'warning')
  const info = results.filter(r => r.severity === 'info')
  
  return `
=== DIAGNOSTIC REPORT ===
Errors: ${errors.length}
Warnings: ${warnings.length}
Info: ${info.length}

${errors.length > 0 ? 'ERRORS:\n' + errors.map(e => `- ${e.issue}: ${JSON.stringify(e.details)}`).join('\n') : ''}
${warnings.length > 0 ? '\nWARNINGS:\n' + warnings.map(w => `- ${w.issue}: ${JSON.stringify(w.details)}`).join('\n') : ''}
${info.length > 0 ? '\nINFO:\n' + info.map(i => `- ${i.issue}: ${JSON.stringify(i.details)}`).join('\n') : ''}
========================
`
}