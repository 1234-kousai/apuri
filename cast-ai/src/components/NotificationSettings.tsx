import { useState, useEffect } from 'react'
import { requestNotificationPermission } from '../lib/notifications'
import { Modal } from './ui/Modal'
import { Switch } from './ui/Switch'
import { showToast } from './Toast'

interface NotificationSettingsProps {
  onClose: () => void
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  console.log('=== NotificationSettings START ===');
  
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [birthdayNotifications, setBirthdayNotifications] = useState(true)
  const [visitPatternNotifications, setVisitPatternNotifications] = useState(true)
  const [notificationTime, setNotificationTime] = useState('10:00')
  
  console.log('Initial state:', {
    permission,
    birthdayNotifications,
    visitPatternNotifications,
    notificationTime
  });

  useEffect(() => {
    console.log('=== NotificationSettings useEffect START ===');
    
    // 現在の通知権限を取得
    if ('Notification' in window) {
      console.log('Notification API available');
      console.log('Current permission:', Notification.permission);
      setPermission(Notification.permission)
    } else {
      console.warn('Notification API not available in this browser');
    }

    // 保存された設定を読み込む
    const savedSettings = localStorage.getItem('cast_ai_notification_settings')
    console.log('Saved settings from localStorage:', savedSettings);
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        console.log('Parsed settings:', settings);
        setBirthdayNotifications(settings.birthday ?? true)
        setVisitPatternNotifications(settings.visitPattern ?? true)
        setNotificationTime(settings.time ?? '10:00')
      } catch (error) {
        console.error('Error parsing notification settings:', error);
      }
    } else {
      console.log('No saved notification settings found');
    }
    
    console.log('=== NotificationSettings useEffect END ===');
  }, [])

  const handleEnableNotifications = async () => {
    console.log('=== handleEnableNotifications START ===');
    
    try {
      const granted = await requestNotificationPermission()
      console.log('Permission request result:', granted);
      
      if (granted) {
        setPermission('granted')
        showToast('success', '通知を有効にしました')
        console.log('Notifications enabled successfully');
      } else {
        showToast('error', '通知の権限が拒否されました')
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      showToast('error', '通知の設定中にエラーが発生しました');
    }
    
    console.log('=== handleEnableNotifications END ===');
  }

  const saveSettings = () => {
    console.log('=== saveSettings START ===');
    
    const settings = {
      birthday: birthdayNotifications,
      visitPattern: visitPatternNotifications,
      time: notificationTime
    }
    console.log('Saving settings:', settings);
    
    try {
      localStorage.setItem('cast_ai_notification_settings', JSON.stringify(settings))
      console.log('Settings saved to localStorage');
      
      // 保存確認のため再読み込み
      const savedCheck = localStorage.getItem('cast_ai_notification_settings');
      console.log('Verification - saved settings:', savedCheck);
      
      showToast('success', '通知設定を保存しました')
      onClose()
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showToast('error', '設定の保存に失敗しました');
    }
    
    console.log('=== saveSettings END ===');
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
                    onChange={(value) => {
                      console.log('Birthday notifications toggled:', value);
                      setBirthdayNotifications(value);
                    }}
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">来店パターン通知</p>
                    <p className="text-sm text-neutral-600">しばらく来店がない顧客を通知</p>
                  </div>
                  <Switch
                    checked={visitPatternNotifications}
                    onChange={(value) => {
                      console.log('Visit pattern notifications toggled:', value);
                      setVisitPatternNotifications(value);
                    }}
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
                  onChange={(e) => {
                    console.log('Notification time changed:', e.target.value);
                    setNotificationTime(e.target.value);
                  }}
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
            onClick={() => {
              console.log('Cancel button clicked');
              onClose();
            }}
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