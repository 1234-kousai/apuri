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
  console.log('=== checkDuplicateVisit START ===');
  console.log('Customer ID:', customerId);
  console.log('Date:', date);
  console.log('Exclude visit ID:', excludeVisitId);
  
  return withDbConnection(async () => {
    const visits = await db.visits
      .where('customerId')
      .equals(customerId)
      .toArray()
    
    console.log('Found visits for customer:', visits.length);
    
    const targetDateString = date.toDateString()
    console.log('Target date string:', targetDateString);
    
    const duplicate = visits.some(visit => {
      if (excludeVisitId && visit.id === excludeVisitId) {
        return false
      }
      const visitDateString = new Date(visit.date).toDateString();
      console.log(`Comparing: ${visitDateString} === ${targetDateString}`);
      return visitDateString === targetDateString
    })
    
    console.log('Is duplicate:', duplicate);
    console.log('=== checkDuplicateVisit END ===');
    return duplicate
  })
}

// データベーストランザクションのラッパー
export async function withTransaction<T>(
  operation: () => Promise<T>
): Promise<T> {
  console.log('=== withTransaction START ===');
  await ensureDbConnection()
  try {
    const result = await db.transaction('rw', db.customers, db.visits, db.aiAnalysis, async () => {
      console.log('Transaction started');
      const res = await operation()
      console.log('Transaction operation completed');
      return res
    })
    console.log('=== withTransaction SUCCESS ===');
    return result
  } catch (error) {
    console.error('=== withTransaction ERROR ===');
    console.error('Transaction error:', error);
    throw error
  }
}