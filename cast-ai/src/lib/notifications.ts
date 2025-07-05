import type { Customer } from './db'

// 通知の権限状態
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// 通知を送信
export function sendNotification(title: string, body: string, options?: NotificationOptions) {
  if (Notification.permission !== 'granted') {
    return
  }

  const notification = new Notification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'cast-ai-notification',
    ...options
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}

// 誕生日通知のチェック
export function checkBirthdayNotifications(customers: Customer[]) {
  const today = new Date()
  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)

  customers.forEach(customer => {
    if (!customer.birthday) return

    const birthday = new Date(customer.birthday)
    const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
    
    // 誕生日が過ぎていたら来年の誕生日を設定
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1)
    }

    const daysUntilBirthday = Math.floor((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilBirthday === 3) {
      sendNotification(
        '🎂 誕生日リマインダー',
        `${customer.name}さんの誕生日まであと3日です！`,
        {
          data: { customerId: customer.id, type: 'birthday' },
          requireInteraction: true
        }
      )
    } else if (daysUntilBirthday === 0) {
      sendNotification(
        '🎉 今日は誕生日！',
        `${customer.name}さんの誕生日です！お祝いメッセージを送りましょう`,
        {
          data: { customerId: customer.id, type: 'birthday-today' },
          requireInteraction: true
        }
      )
    }
  })
}

// 来店パターン通知のチェック
export function checkVisitPatternNotifications(customers: Customer[]) {
  const today = new Date()
  
  customers.forEach(customer => {
    if (!customer.lastVisit || !customer.avgVisitInterval) return
    
    const lastVisitDate = new Date(customer.lastVisit)
    const daysSinceLastVisit = Math.floor((today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // 平均来店間隔の1.5倍を超えたら通知
    if (daysSinceLastVisit > customer.avgVisitInterval * 1.5) {
      sendNotification(
        '💫 お客様のフォローアップ',
        `${customer.name}さんが最後に来店してから${daysSinceLastVisit}日経過しています`,
        {
          data: { customerId: customer.id, type: 'follow-up' },
          requireInteraction: true
        }
      )
    }
  })
}

// 通知スケジューラーの初期化
export function initNotificationScheduler(getCustomers: () => Customer[]) {
  // 初回権限リクエスト
  requestNotificationPermission()

  // 毎日朝10時に通知をチェック
  const scheduleDaily = () => {
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(10, 0, 0, 0)
    
    // 今日の10時を過ぎていたら明日の10時に設定
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }
    
    const timeUntilScheduled = scheduledTime.getTime() - now.getTime()
    
    setTimeout(() => {
      const customers = getCustomers()
      checkBirthdayNotifications(customers)
      checkVisitPatternNotifications(customers)
      
      // 次の日のスケジュールを設定
      scheduleDaily()
    }, timeUntilScheduled)
  }
  
  scheduleDaily()
  
  // 初回チェック（アプリ起動時）
  setTimeout(() => {
    const customers = getCustomers()
    checkBirthdayNotifications(customers)
    checkVisitPatternNotifications(customers)
  }, 5000) // 5秒後に実行
}

// Service Workerでプッシュ通知を受信
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    // 既存のサブスクリプションをチェック
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      // VAPIDキーは実際のプロジェクトでは環境変数から取得
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })
    }
    
    // サブスクリプションをサーバーに送信（実装時）
    console.log('Push subscription:', subscription)
    
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
  }
}

// Base64 URL-safe文字列をUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}