// 入力値のサニタイゼーションとバリデーション

// HTMLエスケープ
export function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// 危険な文字列パターンのチェック
const DANGEROUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i, // onload=, onclick=, etc.
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /vbscript:/i,
  /data:text\/html/i,
]

export function containsDangerousContent(str: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(str))
}

// 安全な文字列のバリデーション
export function validateSafeString(
  str: string,
  maxLength: number = 500,
  fieldName: string = 'フィールド'
): { isValid: boolean; error?: string } {
  if (!str || typeof str !== 'string') {
    return { isValid: false, error: `${fieldName}は必須です` }
  }

  if (str.length > maxLength) {
    return { isValid: false, error: `${fieldName}は${maxLength}文字以内で入力してください` }
  }

  if (containsDangerousContent(str)) {
    return { isValid: false, error: `${fieldName}に不正な文字が含まれています` }
  }

  return { isValid: true }
}

// 電話番号のバリデーション
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  if (!phone) return { isValid: true } // オプショナル
  
  // 日本の電話番号形式（携帯・固定電話）
  const phoneRegex = /^(0[0-9]{1,4}-?[0-9]{1,4}-?[0-9]{3,4}|0[789]0-?[0-9]{4}-?[0-9]{4})$/
  
  if (!phoneRegex.test(phone.replace(/[\\s-]/g, ''))) {
    return { isValid: false, error: '有効な電話番号を入力してください' }
  }

  return { isValid: true }
}

// メールアドレスのバリデーション
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) return { isValid: true } // オプショナル
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '有効なメールアドレスを入力してください' }
  }

  return { isValid: true }
}

// 数値のバリデーション
export function validateNumber(
  value: number,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
  fieldName: string = '値'
): { isValid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName}は数値で入力してください` }
  }

  if (value < min) {
    return { isValid: false, error: `${fieldName}は${min}以上で入力してください` }
  }

  if (value > max) {
    return { isValid: false, error: `${fieldName}は${max}以下で入力してください` }
  }

  return { isValid: true }
}

// 日付のバリデーション
export function validateDate(
  date: string,
  minDate?: Date,
  maxDate?: Date,
  fieldName: string = '日付'
): { isValid: boolean; error?: string } {
  const parsedDate = new Date(date)
  
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: `${fieldName}は有効な日付で入力してください` }
  }

  if (minDate && parsedDate < minDate) {
    return { isValid: false, error: `${fieldName}は${minDate.toLocaleDateString()}以降で入力してください` }
  }

  if (maxDate && parsedDate > maxDate) {
    return { isValid: false, error: `${fieldName}は${maxDate.toLocaleDateString()}以前で入力してください` }
  }

  return { isValid: true }
}

// 複合バリデーション
export interface ValidationRule {
  field: string
  value: any
  rules: Array<(value: any) => { isValid: boolean; error?: string }>
}

export function validateAll(validations: ValidationRule[]): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}
  
  for (const { field, value, rules } of validations) {
    for (const rule of rules) {
      const result = rule(value)
      if (!result.isValid && result.error) {
        errors[field] = result.error
        break
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}