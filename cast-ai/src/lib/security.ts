// セキュリティ関連のユーティリティ

// セッション管理
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30分
let sessionTimeoutId: NodeJS.Timeout | null = null

export function updateSessionActivity() {
  // 既存のタイムアウトをクリア
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
  }
  
  // 新しいタイムアウトを設定
  sessionTimeoutId = setTimeout(() => {
    handleSessionTimeout()
  }, SESSION_TIMEOUT)
}

function handleSessionTimeout() {
  // セッションタイムアウト時の処理
  if (window.confirm('セッションがタイムアウトしました。ページを再読み込みしますか？')) {
    window.location.reload()
  }
}

// CSPヘッダーの設定（メタタグで設定）
export function setContentSecurityPolicy() {
  const meta = document.createElement('meta')
  meta.httpEquiv = 'Content-Security-Policy'
  meta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Viteの開発環境のため
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'"
  ].join('; ')
  
  document.head.appendChild(meta)
}

// XSS対策：安全なHTML生成
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// アクティビティトラッキングの初期化
export function initSecurityFeatures() {
  // CSPを設定
  setContentSecurityPolicy()
  
  // アクティビティトラッキング
  updateSessionActivity()
  
  // ユーザーアクティビティを監視
  const events = ['click', 'keydown', 'mousemove', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, updateSessionActivity, { passive: true })
  })
  
  // ページ離脱時の警告
  window.addEventListener('beforeunload', (e) => {
    const hasUnsavedChanges = checkForUnsavedChanges()
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = ''
    }
  })
}

// 未保存の変更をチェック（実装は各フォームで行う）
let unsavedChanges = false

export function setUnsavedChanges(value: boolean) {
  unsavedChanges = value
}

export function checkForUnsavedChanges(): boolean {
  return unsavedChanges
}

// データベースアクセスの監査ログ
export function auditLog(action: string, details: any) {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent
  }
  
  // ローカルストレージに最新のログを保存（実際の実装ではサーバーに送信）
  try {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]')
    logs.push(log)
    // 最新100件のみ保持
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }
    localStorage.setItem('audit_logs', JSON.stringify(logs))
  } catch (error) {
    console.error('Failed to save audit log:', error)
  }
}