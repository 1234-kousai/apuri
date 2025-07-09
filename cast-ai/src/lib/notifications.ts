import type { Customer } from './db'

// 通知の権限状態
export async function requestNotificationPermission(): Promise<boolean> {
  console.log('=== requestNotificationPermission START ===');
  
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  console.log('Current permission status:', Notification.permission);
  
  if (Notification.permission === 'granted') {
    console.log('Notifications already granted');
    return true
  }

  if (Notification.permission !== 'denied') {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission()
    console.log('Permission result:', permission);
    return permission === 'granted'
  }

  console.log('Notifications are denied');
  return false
}

// 通知を送信
export function sendNotification(title: string, body: string, options?: NotificationOptions) {
  console.log('=== sendNotification START ===');
  console.log('Title:', title);
  console.log('Body:', body);
  console.log('Options:', options);
  
  if (Notification.permission !== 'granted') {
    console.log('Cannot send notification - permission not granted');
    return
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'cast-ai-notification',
      ...options
    })
    
    console.log('Notification created successfully');

    notification.onclick = () => {
      console.log('Notification clicked');
      window.focus()
      notification.close()
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
  
  console.log('=== sendNotification END ===');
}

// 誕生日通知のチェック
export function checkBirthdayNotifications(customers: Customer[]) {
  console.log('=== checkBirthdayNotifications START ===');
  console.log('Checking birthdays for', customers.length, 'customers');
  
  const today = new Date()
  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)
  
  console.log('Today:', today.toISOString());
  console.log('Three days later:', threeDaysLater.toISOString());

  customers.forEach(customer => {
    console.log('Checking customer:', customer.name);
    if (!customer.birthday) {
      console.log('- No birthday set');
      return
    }

    const birthday = new Date(customer.birthday)
    const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
    
    // 誕生日が過ぎていたら来年の誕生日を設定
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1)
    }

    const daysUntilBirthday = Math.floor((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    console.log('- Birthday this year:', birthdayThisYear.toISOString());
    console.log('- Days until birthday:', daysUntilBirthday);
    
    if (daysUntilBirthday === 3) {
      console.log('- Sending 3-day reminder!');
      sendNotification(
        '🎂 誕生日リマインダー',
        `${customer.name}さんの誕生日まであと3日です！`,
        {
          data: { customerId: customer.id, type: 'birthday' },
          requireInteraction: true
        }
      )
    } else if (daysUntilBirthday === 0) {
      console.log('- Sending birthday notification!');
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
  
  console.log('=== checkBirthdayNotifications END ===');
}

// 来店パターン通知のチェック
export function checkVisitPatternNotifications(customers: Customer[]) {
  console.log('=== checkVisitPatternNotifications START ===');
  console.log('Checking visit patterns for', customers.length, 'customers');
  
  const today = new Date()
  console.log('Today:', today.toISOString());
  
  customers.forEach(customer => {
    console.log('Checking customer:', customer.name);
    if (!customer.lastVisit || !customer.avgVisitInterval) {
      console.log('- Missing visit data');
      return
    }
    
    const lastVisitDate = new Date(customer.lastVisit)
    const daysSinceLastVisit = Math.floor((today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
    console.log('- Last visit:', lastVisitDate.toISOString());
    console.log('- Days since last visit:', daysSinceLastVisit);
    console.log('- Average visit interval:', customer.avgVisitInterval);
    console.log('- Threshold (1.5x):', customer.avgVisitInterval * 1.5);
    
    // 平均来店間隔の1.5倍を超えたら通知
    if (daysSinceLastVisit > customer.avgVisitInterval * 1.5) {
      console.log('- Sending follow-up notification!');
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
  
  console.log('=== checkBirthdayNotifications END ===');
}

// タイマーのクリーンアップ用
let dailySchedulerTimeout: NodeJS.Timeout | null = null
let initialCheckTimeout: NodeJS.Timeout | null = null

// 通知スケジューラーの初期化
export function initNotificationScheduler(getCustomers: () => Customer[]) {
  console.log('=== initNotificationScheduler START ===');
  
  // 初回権限リクエスト
  requestNotificationPermission()

  // 毎日朝10時に通知をチェック
  const scheduleDaily = () => {
    console.log('=== scheduleDaily START ===');
    // 既存のタイムアウトをクリア
    if (dailySchedulerTimeout) {
      clearTimeout(dailySchedulerTimeout)
    }
    
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(10, 0, 0, 0)
    
    // 今日の10時を過ぎていたら明日の10時に設定
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }
    
    const timeUntilScheduled = scheduledTime.getTime() - now.getTime()
    console.log('Next scheduled check:', scheduledTime.toISOString());
    console.log('Time until next check:', timeUntilScheduled, 'ms');
    
    dailySchedulerTimeout = setTimeout(() => {
      console.log('=== Daily notification check triggered ===');
      const customers = getCustomers()
      checkBirthdayNotifications(customers)
      checkVisitPatternNotifications(customers)
      
      // 次の日のスケジュールを設定
      scheduleDaily()
    }, timeUntilScheduled)
    
    console.log('=== scheduleDaily END ===');
  }
  
  scheduleDaily()
  
  // 初回チェック（アプリ起動時）
  if (initialCheckTimeout) {
    clearTimeout(initialCheckTimeout)
  }
  initialCheckTimeout = setTimeout(() => {
    console.log('=== Initial notification check triggered ===');
    const customers = getCustomers()
    checkBirthdayNotifications(customers)
    checkVisitPatternNotifications(customers)
  }, 5000) // 5秒後に実行
  
  console.log('=== initNotificationScheduler END ===');
}

// クリーンアップ関数
export function cleanupNotificationScheduler() {
  if (dailySchedulerTimeout) {
    clearTimeout(dailySchedulerTimeout)
    dailySchedulerTimeout = null
  }
  if (initialCheckTimeout) {
    clearTimeout(initialCheckTimeout)
    initialCheckTimeout = null
  }
}

// Service Workerでプッシュ通知を受信
export async function subscribeToPushNotifications() {
  console.log('=== subscribeToPushNotifications START ===');
  
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
  
  console.log('=== subscribeToPushNotifications END ===');
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