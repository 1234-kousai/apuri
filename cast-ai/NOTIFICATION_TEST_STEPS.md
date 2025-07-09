# 通知機能 動作確認手順

## 準備
1. アプリを開く（npm run dev）
2. ブラウザの開発者ツールを開く（F12）
3. Consoleタブを開いておく

## 手順1: 通知設定画面を開く

### 操作
1. Homeタブを開く
2. 「通知設定」ボタンをクリック

### 確認ポイント
- [ ] モーダルが表示される
- [ ] コンソールに以下のログが出力される：
```
=== NotificationSettings START ===
Initial state: {
  permission: "default",
  birthdayNotifications: true,
  visitPatternNotifications: true,
  notificationTime: "10:00"
}
=== NotificationSettings useEffect START ===
```

### 問題がある場合
- モーダルが表示されない → NotificationSettingsコンポーネントの問題
- ログが出力されない → デバッグログが正しく追加されていない

## 手順2: 通知権限の確認

### 操作
1. 通知設定モーダル内の権限状態を確認

### 確認ポイント（初回の場合）
- [ ] 「通知を有効にする」ボタンが表示される
- [ ] ボタンをクリックするとブラウザの権限ダイアログが表示される

### 確認ポイント（許可済みの場合）
- [ ] 緑のチェックマークと「通知が有効です」が表示される

### 確認ポイント（拒否済みの場合）
- [ ] 赤の×マークと「通知がブロックされています」が表示される
- [ ] 「ブラウザの設定から通知を許可してください」のメッセージ

## 手順3: 通知設定の変更

### 操作
1. 誕生日リマインダーのスイッチをOFF→ONに切り替える
2. 来店パターン通知のスイッチをOFF→ONに切り替える
3. 通知時刻を10:00から15:00に変更
4. 「保存」ボタンをクリック

### 確認ポイント
- [ ] スイッチ切り替え時にコンソールログが出る
- [ ] 保存時に「通知設定を保存しました」のトーストが表示される
- [ ] モーダルが閉じる

### コンソールログの例
```
Birthday notifications toggled: false
Birthday notifications toggled: true
Visit pattern notifications toggled: false
Visit pattern notifications toggled: true
Notification time changed: 15:00
=== saveSettings START ===
Saving settings: {
  birthday: true,
  visitPattern: true,
  time: "15:00"
}
Settings saved to localStorage
```

## 手順4: 設定の永続性確認

### 操作
1. ページをリロード（F5）
2. 再度「通知設定」ボタンをクリック

### 確認ポイント
- [ ] 保存した設定（時刻15:00など）が維持されている
- [ ] コンソールに「Saved settings from localStorage:」のログ

## 手順5: テスト用顧客データの準備

### 誕生日通知テスト用
1. 新規顧客を追加
2. 誕生日を「今日から3日後」に設定
3. もう一人追加して誕生日を「今日」に設定

### 来店パターン通知テスト用
1. 顧客の来店履歴を追加（複数回）
2. 最終来店日を45日以上前に設定

## 手順6: 通知の動作確認

### 操作
1. アプリを開いて5秒待つ（初回チェック）

### 確認ポイント
- [ ] コンソールに「=== Initial notification check triggered ===」
- [ ] 該当する顧客がいれば通知が表示される

### 期待される通知
- 3日後が誕生日：「🎂 誕生日リマインダー」
- 今日が誕生日：「🎉 今日は誕生日！」
- 45日以上来店なし：「💫 お客様のフォローアップ」

## トラブルシューティング

### 通知が表示されない場合
1. ブラウザの通知権限を確認
2. OSの通知設定を確認
3. コンソールエラーを確認

### デバッグ情報の確認
```javascript
// Consoleで実行
localStorage.getItem('cast_ai_notification_settings')
Notification.permission
```