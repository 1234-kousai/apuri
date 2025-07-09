# 来店記録（Visit）登録機能のデバッグ手順

## 1. 来店記録登録の準備

### 1.1 前提条件
- 少なくとも1人の顧客が登録されていること
- アプリが正常に起動していること
- デベロッパーツールのコンソールが開いていること

### 1.2 来店記録フォームを開く方法
来店記録フォームは2つの方法で開けます：

#### 方法1: ヘッダーから
1. 画面上部の「+」ボタンをクリック
2. 「来店記録」をクリック

#### 方法2: 顧客詳細から
1. Customersタブで顧客をクリック
2. 顧客詳細画面で「来店記録を追加」ボタンをクリック
   - この場合、顧客が自動的に選択される

## 2. フォーム表示時のログ確認

### 2.1 期待されるログ
```
=== VisitForm RENDER ===
Customers prop: [{...}, {...}]
Number of customers: X
PreSelectedCustomerId: 1 (または undefined)
```

### 2.2 確認ポイント
- 顧客リストが正しく渡されているか
- 事前選択された顧客IDがある場合、正しく設定されているか

## 3. 来店記録の入力

### 3.1 入力項目
1. **顧客**（必須）
   - ドロップダウンから選択
   - 事前選択されている場合は既に選択済み

2. **日付**（必須）
   - デフォルトは今日の日付
   - 過去の日付も選択可能
   - 将来の日付は選択不可

3. **売上金額**（必須）
   - 0以上の整数値
   - 例: 10000

4. **メモ**（任意）
   - 来店時の特記事項
   - 例: "誕生日来店"

### 3.2 テストケース1: 正常な登録
入力値:
- 顧客: テスト顧客1
- 日付: 今日
- 売上金額: 10000
- メモ: テスト来店

## 4. 保存ボタンクリック時のログ

### 4.1 正常な場合の期待されるログ
```
=== onSubmit START ===
Form data: {
  customerId: "1",
  date: "2024-01-09",
  revenue: "10000",
  memo: "テスト来店"
}
Parsed values:
- customerId: 1 Type: number
- revenue: 10000 Type: number
- visitDate: Tue Jan 09 2024 09:00:00 GMT+0900 (JST)
Checking duplicate visit...
=== checkDuplicateVisit START ===
Customer ID: 1
Date: Tue Jan 09 2024 09:00:00 GMT+0900 (JST)
Exclude visit ID: undefined
Found visits for customer: X
Target date string: Tue Jan 09 2024
Comparing: ... === ...
Is duplicate: false
=== checkDuplicateVisit END ===
Is duplicate: false
Date check - Visit date: ... Now: ...
Visit data to add: {
  customerId: 1,
  date: ...,
  revenue: 10000,
  memo: "テスト来店"
}
=== addVisit START ===
Visit data: {...}
Adding visit to database...
=== withTransaction START ===
Transaction started
Database add result: 1
Transaction operation completed
=== withTransaction SUCCESS ===
New visit with ID: {id: 1, ...}
Current visits: [...]
New visits: [...]
Updating customer stats for customer ID: 1
=== addVisit SUCCESS ===
=== onSubmit SUCCESS ===
```

### 4.2 成功時の確認
- 「来店記録を追加しました」というトーストが表示される
- フォームが自動的に閉じる
- 顧客の統計情報が更新される

## 5. エラーケースのテスト

### 5.1 重複来店
同じ顧客・同じ日付で再度登録を試みる：
```
Checking duplicate visit...
Is duplicate: true
```
- 「この日付の来店記録は既に存在します」エラー

### 5.2 将来の日付
明日の日付を選択：
```
Date check - Visit date: Wed Jan 10 2024 ... Now: Tue Jan 09 2024 ...
Future date detected
```
- 「将来の日付は入力できません」エラー

### 5.3 無効な金額
- 負の数: -1000
- 文字列: "abc"
```
Invalid revenue: -1000
```
- 「無効な売上金額です」エラー

### 5.4 顧客未選択
顧客を選択せずに保存：
- フォームバリデーションエラー
- 「顧客を選択してください」

## 6. データベースの確認

### 6.1 IndexedDBの確認
1. Application → Storage → IndexedDB → cast-ai-db → visits
2. 新しい来店記録が追加されているか確認
3. フィールドの値が正しいか確認：
   - id: 自動採番
   - customerId: 選択した顧客のID
   - date: 入力した日付
   - revenue: 入力した金額
   - memo: 入力したメモ（省略可）

### 6.2 顧客統計の更新
1. customers テーブルを確認
2. 該当顧客の以下のフィールドが更新されているか：
   - totalRevenue: 売上合計が増加
   - lastVisit: 最新の来店日
   - vipRank: 売上に応じてランクが更新

## 7. UI での確認

### 7.1 売上テーブル（Sales）タブ
1. Salesタブを開く
2. 新しい来店記録が表示されているか
3. 日付順にソートされているか

### 7.2 顧客詳細画面
1. 該当顧客の詳細を開く
2. 来店履歴に新しい記録が表示されているか
3. 統計情報が更新されているか：
   - 累計売上
   - 来店回数
   - 平均単価
   - 最終来店

## 8. パフォーマンステスト

### 8.1 連続登録
1. 複数の来店記録を連続で登録
2. 各登録が正しく処理されるか
3. UIがフリーズしないか

### 8.2 大量データ
1. 同じ顧客に100件以上の来店記録を登録
2. 統計計算のパフォーマンスを確認

## 9. 問題がある場合の確認事項

### 9.1 フォームが開かない
- 顧客データが読み込まれているか
- コンソールエラーがないか

### 9.2 保存できない
- 必須項目がすべて入力されているか
- バリデーションエラーがないか
- データベース接続エラーがないか

### 9.3 統計が更新されない
- updateCustomerStats のログを確認
- 計算ロジックにエラーがないか

## 10. 改善提案

現在の実装で見つかった課題：
1. 売上金額の入力に通貨記号や桁区切りがない
2. 日付選択のUIが標準的なdate inputで使いにくい可能性
3. 重複チェックが日付のみ（時刻は考慮しない）