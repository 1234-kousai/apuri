// 暗号化されたデータが文字列かどうかを判定
export function isEncryptedData(data: any): data is { encrypted: string; iv: string } {
  return data && typeof data === 'object' && 'encrypted' in data && 'iv' in data
}

// 暗号化されたデータを文字列として取得（表示用）
export function getDecryptedString(data: string | { encrypted: string; iv: string } | undefined): string {
  console.log('getDecryptedString input:', data, 'Type:', typeof data);
  if (!data) return ''
  if (typeof data === 'string') return data
  if (isEncryptedData(data)) {
    console.error('ERROR: Encrypted data detected in getDecryptedString - this indicates data was not properly decrypted when loaded from database');
    console.error('Data:', data);
    return '' // エラーの原因になるため空文字を返す
  }
  return ''
}

// 検索用に暗号化されたデータを文字列として扱う
export function getSearchableString(data: string | { encrypted: string; iv: string } | undefined): string {
  if (!data) return ''
  if (typeof data === 'string') return data
  return '' // 暗号化されたデータは検索対象外
}