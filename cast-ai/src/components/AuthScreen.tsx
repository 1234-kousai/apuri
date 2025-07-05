import { useState, useEffect } from 'react'
import { useAuthStore } from '../lib/auth'
import { showToast } from './Toast'

export function AuthScreen() {
  const { 
    hasPasscode, 
    isLocked,
    lockUntil,
    verifyPasscode, 
    setPasscode: setStorePasscode,
    authenticateWithBiometric,
    useBiometric
  } = useAuthStore()
  
  const [passcode, setPasscode] = useState('')
  const [isSettingPasscode] = useState(!hasPasscode)
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')

  useEffect(() => {
    // 生体認証が有効な場合、自動的に試行
    if (hasPasscode && useBiometric && !isLocked) {
      handleBiometricAuth()
    }
  }, [])

  const handleBiometricAuth = async () => {
    try {
      const success = await authenticateWithBiometric()
      if (!success) {
        showToast('error', '生体認証に失敗しました')
      }
    } catch (error) {
      console.error('Biometric auth error:', error)
    }
  }

  const handlePasscodeSubmit = async () => {
    if (isSettingPasscode) {
      if (step === 'enter') {
        if (passcode.length !== 6) {
          showToast('error', '6桁のパスコードを入力してください')
          return
        }
        setConfirmPasscode(passcode)
        setPasscode('')
        setStep('confirm')
      } else {
        if (passcode !== confirmPasscode) {
          showToast('error', 'パスコードが一致しません')
          setPasscode('')
          setConfirmPasscode('')
          setStep('enter')
          return
        }
        await setStorePasscode(passcode)
        showToast('success', 'パスコードを設定しました')
      }
    } else {
      try {
        await verifyPasscode(passcode)
      } catch (error: any) {
        showToast('error', error.message)
        setPasscode('')
      }
    }
  }

  const handleNumberClick = (num: string) => {
    if (passcode.length < 6) {
      const newPasscode = passcode + num
      setPasscode(newPasscode)
      
      // 6桁入力されたら自動的に送信
      if (newPasscode.length === 6) {
        setTimeout(() => {
          handlePasscodeSubmit()
        }, 100)
      }
    }
  }

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1))
  }

  // ロックアウト中の残り時間を計算
  const getRemainingLockTime = () => {
    if (!isLocked || !lockUntil) return ''
    
    const remaining = Math.max(0, lockUntil - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (isLocked && lockUntil) {
      const interval = setInterval(() => {
        if (Date.now() >= lockUntil) {
          window.location.reload() // ロック解除時にリロード
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [isLocked, lockUntil])

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-thin text-white mb-2">Cast AI</h1>
          <p className="text-sm text-white/60">
            {isLocked ? 'アプリがロックされています' : 
             isSettingPasscode ? 
              (step === 'enter' ? '新しいパスコードを入力' : 'パスコードを再入力') : 
              'パスコードを入力'}
          </p>
        </div>

        {/* パスコード表示 */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full border-2 ${
                i < passcode.length 
                  ? 'bg-white border-white' 
                  : 'bg-transparent border-white/30'
              } transition-all duration-200`}
            />
          ))}
        </div>

        {/* ロックアウトメッセージ */}
        {isLocked && lockUntil && (
          <div className="text-center mb-6">
            <p className="text-red-400 text-sm">
              あと {getRemainingLockTime()} でロックが解除されます
            </p>
          </div>
        )}

        {/* 数字パッド */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              disabled={isLocked}
              className="w-20 h-20 rounded-full bg-white/10 text-white text-2xl font-light 
                       hover:bg-white/20 active:bg-white/30 transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          
          {/* 生体認証ボタン */}
          <button
            onClick={handleBiometricAuth}
            disabled={isLocked || !hasPasscode || !useBiometric || isSettingPasscode}
            className="w-20 h-20 rounded-full bg-white/10 text-white 
                     hover:bg-white/20 active:bg-white/30 transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </button>
          
          <button
            onClick={() => handleNumberClick('0')}
            disabled={isLocked}
            className="w-20 h-20 rounded-full bg-white/10 text-white text-2xl font-light 
                     hover:bg-white/20 active:bg-white/30 transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
          >
            0
          </button>
          
          {/* 削除ボタン */}
          <button
            onClick={handleDelete}
            disabled={isLocked || passcode.length === 0}
            className="w-20 h-20 rounded-full bg-white/10 text-white 
                     hover:bg-white/20 active:bg-white/30 transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>

        {/* パスコードを忘れた場合 */}
        {!isSettingPasscode && !isLocked && (
          <div className="text-center">
            <button className="text-white/60 text-sm hover:text-white transition-colors">
              パスコードを忘れた場合
            </button>
          </div>
        )}
      </div>
    </div>
  )
}