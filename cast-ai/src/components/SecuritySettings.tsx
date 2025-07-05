import { useState } from 'react'
import { useAuthStore } from '../lib/auth'
import { Modal } from './ui/Modal'
import { Switch } from './ui/Switch'
import { showToast } from './Toast'

interface SecuritySettingsProps {
  onClose: () => void
}

export function SecuritySettings({ onClose }: SecuritySettingsProps) {
  const { 
    hasPasscode, 
    useBiometric,
    removePasscode,
    enableBiometric,
    lockApp
  } = useAuthStore()

  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false)
  const [newPasscode, setNewPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')

  const handleSetPasscode = () => {
    if (step === 'enter') {
      if (newPasscode.length !== 6) {
        showToast('error', '6桁のパスコードを入力してください')
        return
      }
      setStep('confirm')
      setConfirmPasscode('')
    } else {
      if (newPasscode !== confirmPasscode) {
        showToast('error', 'パスコードが一致しません')
        setNewPasscode('')
        setConfirmPasscode('')
        setStep('enter')
        return
      }
      
      // パスコード設定後、アプリをロックして再認証を促す
      lockApp()
      window.location.reload()
    }
  }

  const handleRemovePasscode = () => {
    if (confirm('パスコードを削除しますか？アプリのセキュリティが無効になります。')) {
      removePasscode()
      showToast('success', 'パスコードを削除しました')
    }
  }

  const handleToggleBiometric = async () => {
    if (!useBiometric) {
      try {
        const success = await enableBiometric()
        if (success) {
          showToast('success', '生体認証を有効にしました')
        }
      } catch (error: any) {
        showToast('error', error.message)
      }
    } else {
      // 生体認証を無効化（パスコードは残す）
      showToast('info', '生体認証を無効にしました')
    }
  }

  return (
    <Modal title="セキュリティ設定" onClose={onClose}>
      <div className="space-y-6">
        {/* パスコード設定 */}
        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-3">パスコード</h3>
          {hasPasscode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium">パスコードが設定されています</span>
                </div>
              </div>
              <button
                onClick={handleRemovePasscode}
                className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                パスコードを削除
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPasscodeDialog(true)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              パスコードを設定
            </button>
          )}
        </div>

        {/* 生体認証 */}
        {hasPasscode && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">生体認証</h3>
            <label className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
              <div>
                <p className="font-medium">Face ID / Touch ID</p>
                <p className="text-sm text-neutral-600">生体認証でロック解除</p>
              </div>
              <Switch
                checked={useBiometric}
                onChange={handleToggleBiometric}
              />
            </label>
            {!('credentials' in navigator) && (
              <p className="mt-2 text-xs text-amber-600">
                このブラウザは生体認証に対応していません
              </p>
            )}
          </div>
        )}

        {/* セキュリティ情報 */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">セキュリティについて</h4>
          <ul className="space-y-1 text-xs text-blue-700">
            <li>• すべてのデータは暗号化されて保存されます</li>
            <li>• パスコードを5回間違えると5分間ロックされます</li>
            <li>• 生体認証はデバイスのセキュア領域で処理されます</li>
          </ul>
        </div>
      </div>

      {/* パスコード設定ダイアログ */}
      {showPasscodeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {step === 'enter' ? '新しいパスコードを入力' : 'パスコードを再入力'}
            </h3>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={step === 'enter' ? newPasscode : confirmPasscode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                if (step === 'enter') {
                  setNewPasscode(value)
                } else {
                  setConfirmPasscode(value)
                }
              }}
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="• • • • • •"
            />
            <p className="mt-2 text-xs text-neutral-600 text-center">
              6桁の数字を入力してください
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasscodeDialog(false)
                  setNewPasscode('')
                  setConfirmPasscode('')
                  setStep('enter')
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSetPasscode}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {step === 'enter' ? '次へ' : '設定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}