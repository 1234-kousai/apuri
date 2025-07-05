import { useState, useEffect } from 'react'
import { requestNotificationPermission } from '../lib/notifications'
import { Modal } from './ui/Modal'
import { Switch } from './ui/Switch'
import { showToast } from './Toast'

interface NotificationSettingsProps {
  onClose: () => void
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [birthdayNotifications, setBirthdayNotifications] = useState(true)
  const [visitPatternNotifications, setVisitPatternNotifications] = useState(true)
  const [notificationTime, setNotificationTime] = useState('10:00')

  useEffect(() => {
    // 現在の通知権限を取得
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // 保存された設定を読み込む
    const savedSettings = localStorage.getItem('cast_ai_notification_settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setBirthdayNotifications(settings.birthday ?? true)
      setVisitPatternNotifications(settings.visitPattern ?? true)
      setNotificationTime(settings.time ?? '10:00')
    }
  }, [])

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setPermission('granted')
      showToast('success', '通知を有効にしました')
    } else {
      showToast('error', '通知の権限が拒否されました')
    }
  }

  const saveSettings = () => {
    const settings = {
      birthday: birthdayNotifications,
      visitPattern: visitPatternNotifications,
      time: notificationTime
    }
    localStorage.setItem('cast_ai_notification_settings', JSON.stringify(settings))
    showToast('success', '通知設定を保存しました')
    onClose()
  }

  return (
    <Modal title="通知設定" onClose={onClose}>
      <div className="space-y-6">
        {/* 通知権限 */}
        <div>
          <h3 className="text-sm font-medium text-neutral-700 mb-3">通知の権限</h3>
          {permission === 'granted' ? (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">通知が有効です</span>
            </div>
          ) : permission === 'denied' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">通知がブロックされています</span>
              </div>
              <p className="text-xs text-neutral-600">
                ブラウザの設定から通知を許可してください
              </p>
            </div>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              通知を有効にする
            </button>
          )}
        </div>

        {permission === 'granted' && (
          <>
            {/* 通知の種類 */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">通知の種類</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">誕生日リマインダー</p>
                    <p className="text-sm text-neutral-600">3日前と当日に通知</p>
                  </div>
                  <Switch
                    checked={birthdayNotifications}
                    onChange={setBirthdayNotifications}
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">来店パターン通知</p>
                    <p className="text-sm text-neutral-600">しばらく来店がない顧客を通知</p>
                  </div>
                  <Switch
                    checked={visitPatternNotifications}
                    onChange={setVisitPatternNotifications}
                  />
                </label>
              </div>
            </div>

            {/* 通知時刻 */}
            <div>
              <label className="block">
                <span className="text-sm font-medium text-neutral-700">通知時刻</span>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => setNotificationTime(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
              <p className="mt-1 text-xs text-neutral-600">
                毎日この時刻に通知をチェックします
              </p>
            </div>
          </>
        )}

        {/* 保存ボタン */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={saveSettings}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </Modal>
  )
}