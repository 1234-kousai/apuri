import Dexie from 'dexie'

// セキュアストレージ用のデータベース
class SecureStorageDB extends Dexie {
  keys!: Dexie.Table<{ id: string; key: JsonWebKey; created: Date }, string>

  constructor() {
    super('CastAISecureStorage')
    this.version(1).stores({
      keys: 'id, created'
    })
  }
}

const secureDB = new SecureStorageDB()

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const KEY_ID = 'main-encryption-key'

// 暗号化キーの取得または生成
export async function getOrCreateSecureKey(): Promise<CryptoKey> {
  try {
    // IndexedDBからキーを取得
    const storedKeyData = await secureDB.keys.get(KEY_ID)
    
    if (storedKeyData) {
      return await crypto.subtle.importKey(
        'jwk',
        storedKeyData.key,
        { name: ALGORITHM, length: KEY_LENGTH },
        false, // extractable = false for better security
        ['encrypt', 'decrypt']
      )
    }
    
    // 新しいキーを生成
    const key = await crypto.subtle.generateKey(
      { name: ALGORITHM, length: KEY_LENGTH },
      true, // extractable = true only for initial storage
      ['encrypt', 'decrypt']
    )
    
    // キーをJWK形式でエクスポート
    const exportedKey = await crypto.subtle.exportKey('jwk', key)
    
    // IndexedDBに保存
    await secureDB.keys.add({
      id: KEY_ID,
      key: exportedKey,
      created: new Date()
    })
    
    // 再インポート（extractable = false）
    return await crypto.subtle.importKey(
      'jwk',
      exportedKey,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    )
  } catch (error) {
    console.error('Failed to get or create secure key:', error)
    throw new Error('暗号化キーの初期化に失敗しました')
  }
}

// キーのローテーション（将来の実装用）
export async function rotateEncryptionKey(): Promise<void> {
  // 1. 新しいキーを生成
  // 2. 既存データを新しいキーで再暗号化
  // 3. 古いキーを削除
  console.warn('Key rotation not yet implemented')
}

// 既存のlocalStorageキーを移行
export async function migrateFromLocalStorage(): Promise<void> {
  const storedKey = localStorage.getItem('cast-ai-encryption-key')
  
  if (storedKey && !(await secureDB.keys.get(KEY_ID))) {
    try {
      const keyData = JSON.parse(storedKey)
      await secureDB.keys.add({
        id: KEY_ID,
        key: keyData,
        created: new Date()
      })
      
      // 移行成功後、localStorageから削除
      localStorage.removeItem('cast-ai-encryption-key')
      console.log('Successfully migrated encryption key to secure storage')
    } catch (error) {
      console.error('Failed to migrate encryption key:', error)
    }
  }
}