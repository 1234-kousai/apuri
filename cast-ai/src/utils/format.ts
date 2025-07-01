// 共通フォーマット関数

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount)
}

export const formatDate = (date: Date | undefined): string => {
  if (!date) return '未来店'
  const d = new Date(date)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export const formatDateShort = (date: Date | undefined): string => {
  if (!date) return '未来店'
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今日'
  if (diffDays === 1) return '昨日'
  if (diffDays < 7) return `${diffDays}日前`
  
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export const getRankColor = (rank: string): string => {
  switch (rank) {
    case 'gold':
      return 'bg-yellow-100 text-yellow-800'
    case 'silver':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-orange-100 text-orange-800'
  }
}

export const getRankColorWithBorder = (rank: string): string => {
  switch (rank) {
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-orange-100 text-orange-800 border-orange-300'
  }
}

// 電話番号のフォーマット
export const formatPhoneNumber = (phone: string): string => {
  // 数字以外を削除
  const cleaned = phone.replace(/\D/g, '')
  
  // 日本の電話番号形式に整形
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}

// 電話番号の検証
export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return /^0\d{9,10}$/.test(cleaned)
}

// LINE IDの検証
export const validateLineId = (lineId: string): boolean => {
  // LINE IDは4-20文字の英数字とアンダースコア、ピリオド
  return /^[a-zA-Z0-9._]{4,20}$/.test(lineId)
}