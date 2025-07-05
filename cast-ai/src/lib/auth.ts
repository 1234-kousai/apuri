import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const AUTH_STORAGE_KEY = 'cast_ai_auth'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 5 * 60 * 1000 // 5分

interface AuthState {
  isAuthenticated: boolean
  isLocked: boolean
  lockUntil: number | null
  failedAttempts: number
  hasPasscode: boolean
  passcodeHash: string | null
  useBiometric: boolean
  
  // Actions
  checkAuth: () => boolean
  setPasscode: (passcode: string) => Promise<void>
  verifyPasscode: (passcode: string) => Promise<boolean>
  removePasscode: () => void
  lockApp: () => void
  unlockApp: () => void
  enableBiometric: () => Promise<boolean>
  authenticateWithBiometric: () => Promise<boolean>
  logout: () => void
}

// パスコードをハッシュ化
async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(passcode)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLocked: false,
      lockUntil: null,
      failedAttempts: 0,
      hasPasscode: false,
      passcodeHash: null,
      useBiometric: false,

      checkAuth: () => {
        const state = get()
        
        // ロックアウト中かチェック
        if (state.isLocked && state.lockUntil) {
          if (Date.now() < state.lockUntil) {
            return false
          } else {
            // ロックアウト期間が終了
            set({ isLocked: false, lockUntil: null, failedAttempts: 0 })
          }
        }
        
        // パスコード未設定の場合は認証済みとする
        if (!state.hasPasscode) {
          set({ isAuthenticated: true })
          return true
        }
        
        return state.isAuthenticated
      },

      setPasscode: async (passcode: string) => {
        const hash = await hashPasscode(passcode)
        set({ 
          passcodeHash: hash, 
          hasPasscode: true,
          isAuthenticated: true,
          failedAttempts: 0
        })
      },

      verifyPasscode: async (passcode: string) => {
        const state = get()
        
        // ロックアウト中
        if (state.isLocked && state.lockUntil && Date.now() < state.lockUntil) {
          const remainingMinutes = Math.ceil((state.lockUntil - Date.now()) / 60000)
          throw new Error(`アプリはロックされています。${remainingMinutes}分後に再試行してください。`)
        }
        
        const hash = await hashPasscode(passcode)
        
        if (hash === state.passcodeHash) {
          set({ 
            isAuthenticated: true, 
            failedAttempts: 0,
            isLocked: false,
            lockUntil: null
          })
          return true
        } else {
          const newFailedAttempts = state.failedAttempts + 1
          
          if (newFailedAttempts >= MAX_ATTEMPTS) {
            const lockUntil = Date.now() + LOCKOUT_DURATION
            set({ 
              failedAttempts: newFailedAttempts,
              isLocked: true,
              lockUntil
            })
            throw new Error(`パスコードを${MAX_ATTEMPTS}回間違えました。5分間ロックされます。`)
          } else {
            set({ failedAttempts: newFailedAttempts })
            throw new Error(`パスコードが違います。残り${MAX_ATTEMPTS - newFailedAttempts}回`)
          }
        }
      },

      removePasscode: () => {
        set({ 
          passcodeHash: null, 
          hasPasscode: false,
          isAuthenticated: true,
          failedAttempts: 0,
          isLocked: false,
          lockUntil: null,
          useBiometric: false
        })
      },

      lockApp: () => {
        set({ isAuthenticated: false })
      },

      unlockApp: () => {
        const state = get()
        if (!state.hasPasscode) {
          set({ isAuthenticated: true })
        }
      },

      enableBiometric: async () => {
        if (!('credentials' in navigator)) {
          throw new Error('このブラウザは生体認証に対応していません')
        }

        try {
          // Web Authentication APIを使用した生体認証の登録
          const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            rp: {
              name: "Cast AI",
              id: window.location.hostname,
            },
            user: {
              id: new TextEncoder().encode("cast-ai-user"),
              name: "user@cast-ai",
              displayName: "Cast AI User",
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            },
            timeout: 60000,
            attestation: "direct"
          }

          const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
          })

          if (credential) {
            // 認証情報を保存（実際の実装では適切に保存）
            localStorage.setItem('cast_ai_biometric_id', (credential as PublicKeyCredential).id)
            set({ useBiometric: true })
            return true
          }
        } catch (error) {
          console.error('Failed to enable biometric:', error)
          throw new Error('生体認証の設定に失敗しました')
        }

        return false
      },

      authenticateWithBiometric: async () => {
        if (!('credentials' in navigator)) {
          return false
        }

        const credentialId = localStorage.getItem('cast_ai_biometric_id')
        if (!credentialId) {
          return false
        }

        try {
          const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            allowCredentials: [{
              id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
              type: 'public-key',
              transports: ['internal']
            }],
            userVerification: "required",
            timeout: 60000,
          }

          const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
          })

          if (assertion) {
            set({ isAuthenticated: true })
            return true
          }
        } catch (error) {
          console.error('Biometric authentication failed:', error)
        }

        return false
      },

      logout: () => {
        set({ isAuthenticated: false })
      }
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        hasPasscode: state.hasPasscode,
        passcodeHash: state.passcodeHash,
        useBiometric: state.useBiometric,
        isLocked: state.isLocked,
        lockUntil: state.lockUntil,
        failedAttempts: state.failedAttempts
      })
    }
  )
)