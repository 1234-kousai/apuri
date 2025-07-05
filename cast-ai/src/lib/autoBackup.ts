import { showToast } from '../components/Toast'

const BACKUP_INTERVAL = 24 * 60 * 60 * 1000 // 24時間
const BACKUP_KEY = 'cast_ai_last_backup'
const AUTO_BACKUP_KEY = 'cast_ai_auto_backup_enabled'

// 自動バックアップの有効/無効を取得
export function isAutoBackupEnabled(): boolean {
  return localStorage.getItem(AUTO_BACKUP_KEY) === 'true'
}

// 自動バックアップの有効/無効を設定
export function setAutoBackupEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_BACKUP_KEY, enabled ? 'true' : 'false')
}

// 最後のバックアップ時刻を取得
export function getLastBackupTime(): Date | null {
  const timestamp = localStorage.getItem(BACKUP_KEY)
  return timestamp ? new Date(parseInt(timestamp)) : null
}

// 最後のバックアップ時刻を保存
function setLastBackupTime(date: Date): void {
  localStorage.setItem(BACKUP_KEY, date.getTime().toString())
}

// バックアップが必要かチェック
export function shouldBackup(): boolean {
  if (!isAutoBackupEnabled()) return false
  
  const lastBackup = getLastBackupTime()
  if (!lastBackup) return true
  
  const now = new Date()
  const timeSinceLastBackup = now.getTime() - lastBackup.getTime()
  
  return timeSinceLastBackup >= BACKUP_INTERVAL
}

// 自動バックアップを実行
export async function performAutoBackup(): Promise<void> {
  if (!shouldBackup()) return
  
  try {
    // dataExportを使用してデータを取得
    const customerStore = (await import('../stores/customerStore')).useCustomerStore.getState()
    const customers = customerStore.customers
    const visits = customerStore.visits
    
    const data = { customers, visits }
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `cast-ai-backup-${timestamp}.json`
    
    // ブラウザのIndexedDBに保存（容量が大きいため）
    const backupDB = await openBackupDB()
    const transaction = backupDB.transaction(['backups'], 'readwrite')
    const store = transaction.objectStore('backups')
    
    // 古いバックアップを削除（最新5件のみ保持）
    const allBackupsRequest = store.getAll()
    const allBackups = await new Promise<any[]>((resolve) => {
      allBackupsRequest.onsuccess = () => resolve(allBackupsRequest.result)
    })
    
    if (allBackups.length >= 5) {
      const oldestBackup = allBackups.sort((a: any, b: any) => a.timestamp - b.timestamp)[0]
      await store.delete(oldestBackup.id)
    }
    
    // 新しいバックアップを保存
    await store.add({
      filename,
      data: JSON.stringify(data),
      timestamp: new Date().getTime()
    })
    
    setLastBackupTime(new Date())
    showToast('success', '自動バックアップが完了しました')
  } catch (error) {
    console.error('Auto backup failed:', error)
    // エラーは通知せず、次回再試行
  }
}

// バックアップ用のIndexedDBを開く
async function openBackupDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CastAIBackups', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('backups')) {
        const store = db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

// 保存されたバックアップを取得
export async function getSavedBackups(): Promise<Array<{
  id: number
  filename: string
  timestamp: number
  data: string
}>> {
  try {
    const db = await openBackupDB()
    const transaction = db.transaction(['backups'], 'readonly')
    const store = transaction.objectStore('backups')
    
    const backupsRequest = store.getAll()
    const backups = await new Promise<any[]>((resolve) => {
      backupsRequest.onsuccess = () => resolve(backupsRequest.result)
    })
    
    return backups.sort((a: any, b: any) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to get saved backups:', error)
    return []
  }
}

// バックアップを削除
export async function deleteBackup(id: number): Promise<void> {
  const db = await openBackupDB()
  const transaction = db.transaction(['backups'], 'readwrite')
  const store = transaction.objectStore('backups')
  await store.delete(id)
}

// バックアップをダウンロード
export function downloadBackup(backup: { filename: string; data: string }): void {
  const blob = new Blob([backup.data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backup.filename
  a.click()
  URL.revokeObjectURL(url)
}

// 自動バックアップの初期化
export function initAutoBackup(): void {
  // 初回起動時は自動バックアップを有効に
  if (localStorage.getItem(AUTO_BACKUP_KEY) === null) {
    setAutoBackupEnabled(true)
  }
  
  // アプリ起動時にバックアップチェック
  performAutoBackup()
  
  // 定期的にバックアップチェック（1時間ごと）
  setInterval(() => {
    performAutoBackup()
  }, 60 * 60 * 1000)
}