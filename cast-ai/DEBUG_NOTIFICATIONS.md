# 通知機能の動作確認とデバッグ手順

## 1. 通知機能の概要

Cast AIの通知機能は以下の要素で構成されています：
- ブラウザ通知権限の管理
- 誕生日リマインダー（3日前と当日）
- 来店パターン通知（しばらく来店がない顧客）
- 通知時刻の設定（デフォルト10:00）
- 通知のON/OFF設定

## 2. 通知設定画面の確認

### 2.1 通知設定画面を開く
1. Settingsタブを開く
2. 「通知設定」ボタンをクリック
3. モーダルが表示される

### 2.2 期待されるコンソールログ
```
=== NotificationSettings START ===
Initial state: {
  permission: "default",
  birthdayNotifications: true,
  visitPatternNotifications: true,
  notificationTime: "10:00"
}
=== NotificationSettings useEffect START ===
Notification API available
Current permission: default
Saved settings from localStorage: null
No saved notification settings found
=== NotificationSettings useEffect END ===
```

## 3. 通知権限の取得

### 3.1 権限状態の確認
- **granted**: 通知が許可されている（緑色のチェックマーク）
- **denied**: 通知がブロックされている（赤色の×マーク）
- **default**: まだ権限を要求していない（「通知を有効にする」ボタン）

### 3.2 通知を有効にする
1. 「通知を有効にする」ボタンをクリック
2. ブラウザの権限ダイアログが表示される
3. 「許可」または「ブロック」を選択

期待されるログ：
```
=== handleEnableNotifications START ===
=== requestNotificationPermission START ===
Current permission status: default
Requesting notification permission...
Permission result: granted
=== handleEnableNotifications END ===
Notifications enabled successfully
```

## 4. 通知設定の保存

### 4.1 設定項目
- **誕生日リマインダー**: 3日前と当日に通知
- **来店パターン通知**: しばらく来店がない顧客を通知
- **通知時刻**: 毎日の通知チェック時刻

### 4.2 設定の変更と保存
1. 各スイッチをON/OFFに切り替え
2. 通知時刻を変更
3. 「保存」ボタンをクリック

期待されるログ：
```
Birthday notifications toggled: false
Visit pattern notifications toggled: true
Notification time changed: 09:30
=== saveSettings START ===
Saving settings: {
  birthday: false,
  visitPattern: true,
  time: "09:30"
}
Settings saved to localStorage
Verification - saved settings: {"birthday":false,"visitPattern":true,"time":"09:30"}
=== saveSettings END ===
```

## 5. 通知スケジューラーの動作

### 5.1 初期化時のログ
アプリ起動時：
```
=== initNotificationScheduler START ===
=== requestNotificationPermission START ===
Current permission status: granted
Notifications already granted
=== scheduleDaily START ===
Next scheduled check: 2024-01-01T10:00:00.000Z
Time until next check: 12345678 ms
=== scheduleDaily END ===
=== initNotificationScheduler END ===
```

### 5.2 初回チェック（5秒後）
```
=== Initial notification check triggered ===
=== checkBirthdayNotifications START ===
Checking birthdays for 10 customers
Today: 2024-01-01T00:00:00.000Z
Three days later: 2024-01-04T00:00:00.000Z
Checking customer: 田中太郎
- Birthday this year: 2024-01-04T00:00:00.000Z
- Days until birthday: 3
- Sending 3-day reminder!
=== sendNotification START ===
Title: 🎂 誕生日リマインダー
Body: 田中太郎さんの誕生日まであと3日です！
Options: {data: {customerId: "1", type: "birthday"}, requireInteraction: true}
Notification created successfully
=== sendNotification END ===
=== checkBirthdayNotifications END ===
```

## 6. 誕生日通知のテスト

### 6.1 テストデータの準備
1. 誕生日が3日後の顧客を作成
2. 誕生日が今日の顧客を作成
3. 誕生日が過去/未来の顧客を作成

### 6.2 通知の確認
- 3日前通知：「🎂 誕生日リマインダー」
- 当日通知：「🎉 今日は誕生日！」

## 7. 来店パターン通知のテスト

### 7.1 テストデータの準備
1. 平均来店間隔が30日の顧客
2. 最終来店が45日前（30日×1.5）

### 7.2 期待されるログ
```
=== checkVisitPatternNotifications START ===
Checking visit patterns for 10 customers
Today: 2024-01-01T00:00:00.000Z
Checking customer: 佐藤花子
- Last visit: 2023-11-17T00:00:00.000Z
- Days since last visit: 45
- Average visit interval: 30
- Threshold (1.5x): 45
- Sending follow-up notification!
=== sendNotification START ===
Title: 💫 お客様のフォローアップ
Body: 佐藤花子さんが最後に来店してから45日経過しています
=== sendNotification END ===
=== checkVisitPatternNotifications END ===
```

## 8. エラーケースの確認

### 8.1 通知がブロックされている場合
```
=== sendNotification START ===
Title: test
Body: test
Options: undefined
Cannot send notification - permission not granted
=== sendNotification END ===
```

### 8.2 Notification APIが使えない場合
```
=== requestNotificationPermission START ===
This browser does not support notifications
```

## 9. localStorage の確認

ブラウザのDevToolsで確認：
```javascript
// 保存された設定を確認
localStorage.getItem('cast_ai_notification_settings')
// 期待される値: {"birthday":true,"visitPattern":true,"time":"10:00"}

// 設定をクリア（テスト用）
localStorage.removeItem('cast_ai_notification_settings')
```

## 10. トラブルシューティング

### 10.1 通知が表示されない
1. ブラウザの通知権限を確認
2. OSの通知設定を確認
3. サイレントモード/集中モードがOFFか確認

### 10.2 スケジューラーが動作しない
1. コンソールでタイマーIDを確認
2. ページがバックグラウンドでも動作するか確認
3. Service Workerの登録状態を確認

### 10.3 誕生日通知が出ない
1. 顧客の誕生日データが正しいか確認
2. 日付計算のタイムゾーンを確認
3. 年をまたぐ場合の計算を確認

## 11. 改善提案

1. **通知履歴の記録**
   - どの通知をいつ送信したか記録
   - 重複送信を防ぐ

2. **通知のカスタマイズ**
   - 通知音のON/OFF
   - 通知の表示時間設定

3. **プッシュ通知の実装**
   - Service Workerでバックグラウンド通知
   - サーバーからのプッシュ通知対応

4. **通知のテスト機能**
   - 「今すぐテスト通知を送信」ボタン
   - 各種通知のプレビュー機能