// Web Crypto APIを使用した暗号化ユーティリティ

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

// 暗号化キーの生成または取得
async function getOrCreateKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem('cast-ai-encryption-key')
  
  if (storedKey) {
    const keyData = JSON.parse(storedKey)
    return await crypto.subtle.importKey(
      'jwk',
      keyData,
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    )
  }
  
  // 新しいキーを生成
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
  
  // キーをJWK形式でエクスポートして保存
  const exportedKey = await crypto.subtle.exportKey('jwk', key)
  localStorage.setItem('cast-ai-encryption-key', JSON.stringify(exportedKey))
  
  return key
}

// データの暗号化
export async function encryptData(data: string): Promise<{ encrypted: string; iv: string }> {
  const key = await getOrCreateKey()
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  // 初期化ベクトル（IV）を生成
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // データを暗号化
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    dataBuffer
  )
  
  // Base64エンコード
  const encrypted = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
  const ivBase64 = btoa(String.fromCharCode(...iv))
  
  return { encrypted, iv: ivBase64 }
}

// データの復号化
export async function decryptData(encrypted: string, ivBase64: string): Promise<string> {
  const key = await getOrCreateKey()
  
  // Base64デコード
  const encryptedBuffer = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0))
  
  // データを復号化
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encryptedBuffer
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

// オブジェクトの特定フィールドを暗号化
export async function encryptSensitiveFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): Promise<T> {
  const result = { ...obj }
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      const { encrypted, iv } = await encryptData(result[field] as string)
      result[field] = `encrypted:${iv}:${encrypted}` as any
    }
  }
  
  return result
}

// オブジェクトの特定フィールドを復号化
export async function decryptSensitiveFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): Promise<T> {
  const result = { ...obj }
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      const value = result[field] as string
      if (value.startsWith('encrypted:')) {
        const [, iv, encrypted] = value.split(':')
        try {
          result[field] = await decryptData(encrypted, iv) as any
        } catch (error) {
          console.error(`Failed to decrypt field ${String(field)}:`, error)
          result[field] = '' as any
        }
      }
    }
  }
  
  return result
}