# 通知機能 テストチェックリスト

## 通知設定画面
- [ ] Settingsタブから「通知設定」ボタンでモーダルが開く
- [ ] 通知権限の状態が正しく表示される
- [ ] 保存した設定が次回開いた時も維持される

## 通知権限
- [ ] 「通知を有効にする」ボタンが表示される（未許可時）
- [ ] 権限許可後、緑のチェックマークが表示される
- [ ] 権限拒否後、赤の×マークと説明が表示される
- [ ] ブラウザ設定への誘導メッセージが表示される（拒否時）

## 通知設定の変更
- [ ] 誕生日リマインダーのON/OFF切り替えができる
- [ ] 来店パターン通知のON/OFF切り替えができる
- [ ] 通知時刻を変更できる
- [ ] 「保存」ボタンで設定が保存される
- [ ] 「キャンセル」ボタンで変更が破棄される

## 誕生日通知
- [ ] 3日後が誕生日の顧客に通知が出る
- [ ] 今日が誕生日の顧客に通知が出る
- [ ] 通知をクリックするとアプリにフォーカスする
- [ ] 誕生日が設定されていない顧客は無視される

## 来店パターン通知
- [ ] 平均来店間隔の1.5倍を超えた顧客に通知が出る
- [ ] lastVisitがない顧客は無視される
- [ ] avgVisitIntervalがない顧客は無視される

## スケジューラー
- [ ] アプリ起動5秒後に初回チェックが実行される
- [ ] 設定した時刻に毎日チェックが実行される
- [ ] ページをリロードしても設定が維持される

## コンソールログ確認
- [ ] 各関数の開始/終了ログが出力される
- [ ] エラー時に適切なエラーログが出力される
- [ ] 通知送信時に詳細情報がログに出力される