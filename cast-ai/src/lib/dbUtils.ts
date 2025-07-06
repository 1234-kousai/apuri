import { db } from './db'

// データベース接続を確認し、必要に応じて再接続する
export async function ensureDbConnection(): Promise<void> {
  if (!db.isOpen()) {
    try {
      await db.open()
    } catch (error) {
      console.error('Failed to open database:', error)
      throw new Error('データベースの接続に失敗しました')
    }
  }
}

// データベース操作をラップして接続を保証する
export async function withDbConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    await ensureDbConnection()
    return await operation()
  } catch (error: any) {
    // InvalidStateErrorの場合は再接続を試みる
    if (error.name === 'InvalidStateError' || error.name === 'DatabaseClosedError') {
      console.warn('Database connection lost, attempting to reconnect...')
      try {
        await db.open()
        return await operation()
      } catch (retryError) {
        console.error('Failed to reconnect to database:', retryError)
        throw new Error('データベースへの再接続に失敗しました')
      }
    }
    throw error
  }
}

// 重複来店チェック用のユーティリティ
export async function checkDuplicateVisit(
  customerId: number,
  date: Date,
  excludeVisitId?: number
): Promise<boolean> {
  return withDbConnection(async () => {
    const visits = await db.visits
      .where('customerId')
      .equals(customerId)
      .toArray()
    
    const targetDateString = date.toDateString()
    
    return visits.some(visit => {
      if (excludeVisitId && visit.id === excludeVisitId) {
        return false
      }
      return new Date(visit.date).toDateString() === targetDateString
    })
  })
}

// データベーストランザクションのラッパー
export async function withTransaction<T>(
  operation: () => Promise<T>
): Promise<T> {
  return db.transaction('rw', db.customers, db.visits, db.aiAnalysis, async () => {
    return await operation()
  })
}