# 来店記録の編集・削除機能のデバッグ手順

## 1. 編集機能のテスト

### 1.1 前提条件
- 少なくとも1つの来店記録が存在すること
- 顧客詳細画面が開けること

### 1.2 編集フォームを開く
1. Customersタブで顧客をクリック
2. 顧客詳細画面で来店履歴を確認
3. 任意の来店記録の「編集」ボタンをクリック

### 1.3 編集フォーム表示時のログ
```
=== VisitEditForm RENDER ===
Visit prop: {id: 1, customerId: 1, date: ..., revenue: 10000, memo: "..."}
Customer name: テスト顧客1
Default values: {
  date: "2024-01-09",
  revenue: 10000,
  memo: "テスト来店"
}
```

### 1.4 編集操作
#### テストケース1: 正常な編集
1. 以下を変更:
   - 日付: 変更なし
   - 売上金額: 10000 → 15000
   - メモ: "テスト来店" → "編集済みメモ"
2. 「更新」ボタンをクリック

期待されるログ:
```
=== onSubmit START (Edit) ===
Form data: {date: "2024-01-09", revenue: 15000, memo: "編集済みメモ"}
Visit ID: 1
Visit date: Tue Jan 09 2024 09:00:00 GMT+0900
Checking duplicate with exclude ID: 1
Update data: {date: ..., revenue: 15000, memo: "編集済みメモ"}
=== updateVisit START ===
Visit ID: 1 Type: number
Update data: {...}
Updating database...
Database update result: 1
Updating state...
Updated visits: [...]
Getting visit for stats update...
Updating customer stats for customer ID: 1
=== updateCustomerStats START ===
...
=== updateVisit SUCCESS ===
=== onSubmit SUCCESS (Edit) ===
```

#### テストケース2: 日付を変更（重複チェック）
1. 他の来店記録と同じ日付に変更
2. 「更新」ボタンをクリック

期待される結果:
- 「この日付の来店記録は既に存在します」エラー
- `Duplicate found!` ログが表示される

#### テストケース3: 将来日付
1. 明日の日付に変更
2. 「更新」ボタンをクリック

期待される結果:
- 「将来の日付は入力できません」エラー

### 1.5 編集成功後の確認
- 編集フォームが閉じる
- 「来店記録を更新しました」トーストが表示される
- 来店履歴の表示が更新される
- 顧客の統計情報（累計売上など）が再計算される

## 2. 削除機能のテスト

### 2.1 削除ボタンをクリック
1. 顧客詳細画面の来店履歴で任意の記録の「削除」ボタンをクリック
2. 削除確認ダイアログが表示される

### 2.2 削除実行時のログ
削除を確認すると以下のログが表示される:

```
=== deleteVisit START ===
Visit ID: 1 Type: number
Current visits: 3
Getting visit details...
Visit to delete: {id: 1, customerId: 1, ...}
Customer ID: 1
Optimistically updating UI...
Remaining visits: 2
Deleting from database...
=== withTransaction START ===
Transaction started
Deleted from database
Transaction operation completed
=== withTransaction SUCCESS ===
Updating customer stats...
=== updateCustomerStats START ===
Customer ID: 1
Customer visits: 2
Calculated stats:
- Total revenue: 25000
- Visit count: 2
- VIP rank: bronze
...
=== updateCustomerStats SUCCESS ===
=== deleteVisit SUCCESS ===
```

### 2.3 削除成功後の確認
- 来店履歴から該当記録が消える
- 「来店記録を削除しました」トーストが表示される
- 顧客の統計情報が再計算される
  - 累計売上が減少
  - 来店回数が減少
  - 最終来店日が更新される可能性

## 3. エラーケースのテスト

### 3.1 存在しない来店記録の編集/削除
- 他のタブで既に削除された記録を編集/削除しようとする
- `No visit found with the given ID` エラー

### 3.2 データベースエラー
- IndexedDBの容量不足など
- ロールバック処理が実行され、UIが元に戻る

## 4. データベースの確認

### 4.1 編集後の確認
1. Application → IndexedDB → cast-ai-db → visits
2. 該当レコードの値が更新されているか

### 4.2 削除後の確認
1. visitsテーブルから該当レコードが削除されているか
2. customersテーブルの統計情報が更新されているか

## 5. UIでの表示確認

### 5.1 売上テーブル（Sales）
1. Salesタブを開く
2. 編集した記録の表示が更新されているか
3. 削除した記録が消えているか

### 5.2 ダッシュボード
1. Homeタブを開く
2. 統計情報が正しく更新されているか
   - 今月の売上
   - 総売上
   - 来店回数

## 6. 複雑なケースのテスト

### 6.1 最後の来店記録を削除
1. 顧客の唯一の来店記録を削除
2. 統計情報がリセットされるか確認
   - totalRevenue: 0
   - lastVisit: undefined
   - vipRank: bronze

### 6.2 連続編集
1. 同じ記録を連続で編集
2. 各編集が正しく反映されるか

### 6.3 並行操作
1. 編集中に別タブで同じ記録を削除
2. 適切なエラーハンドリングがされるか

## 7. パフォーマンステスト

### 7.1 大量の来店記録
1. 100件以上の来店記録がある顧客で編集/削除
2. 統計更新のパフォーマンスを確認

## 8. 問題がある場合の確認事項

### 8.1 編集フォームが開かない
- VisitEditFormコンポーネントのインポートエラー
- propsの渡し忘れ

### 8.2 更新/削除が反映されない
- stateの更新ロジックを確認
- データベースのトランザクションエラー

### 8.3 統計が正しく更新されない
- updateCustomerStatsの計算ロジック
- 非同期処理の順序

## 9. 改善提案

1. **UXの改善**
   - 削除確認ダイアログのメッセージをより具体的に
   - 編集中の自動保存機能

2. **バリデーション強化**
   - 売上金額の上限設定
   - メモの文字数制限の明確化

3. **エラーハンドリング**
   - より詳細なエラーメッセージ
   - リトライ機能の実装