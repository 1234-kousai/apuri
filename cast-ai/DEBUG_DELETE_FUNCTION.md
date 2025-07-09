# 顧客削除機能のデバッグ手順

## 1. 削除機能のテスト準備

### 1.1 前提条件
- 少なくとも1人の顧客が登録されていること
- 顧客詳細画面が開けること

### 1.2 コンソールログの準備
デベロッパーツールのコンソールを開いて、ログをクリアしておく

## 2. 削除処理の実行

### 2.1 顧客詳細画面を開く
1. Customersタブで削除したい顧客をクリック
2. 顧客詳細画面が表示されることを確認

### 2.2 削除ボタンをクリック
1. 画面右上の「削除」ボタンをクリック
2. 削除確認ダイアログが表示されることを確認

### 2.3 削除を実行
削除確認ダイアログで「削除」をクリックし、以下のログを確認：

```
=== handleDelete START ===
Deleting customer: {id: 1, name: "テスト顧客1", ...}
Customer ID: 1
=== deleteCustomer START ===
Deleting customer ID: 1 Type: number
Current customers: [{...}, {...}]
Customer to delete: {id: 1, name: "テスト顧客1", ...}
Optimistically updating UI...
New customers after filter: [...]
Removed customers: 1
Deleting from database...
=== withTransaction START ===
Transaction started
Deleting customer from DB...
Deleting visits from DB...
Deleted visits count: X
Transaction operation completed
=== withTransaction SUCCESS ===
=== deleteCustomer SUCCESS ===
=== handleDelete SUCCESS ===
```

## 3. 削除成功時の確認

### 3.1 UI の更新
- 顧客詳細画面が自動的に閉じる
- 顧客一覧から該当顧客が消えている
- 「顧客を削除しました」というトーストが表示される

### 3.2 データベースの確認
1. Application → Storage → IndexedDB → cast-ai-db
2. customersテーブルを確認し、該当顧客が削除されている
3. visitsテーブルを確認し、関連する来店記録も削除されている

## 4. エラーが発生した場合

### 4.1 よくあるエラーパターン

#### ID が undefined の場合
```
Customer ID is undefined!
```
**原因**: 顧客オブジェクトにIDが設定されていない
**対策**: 顧客登録時のID設定を確認

#### トランザクションエラー
```
=== withTransaction ERROR ===
Transaction error: [エラー詳細]
```
**原因**: データベースのトランザクション処理中にエラー
**対策**: IndexedDBの状態を確認、ブラウザの再起動

#### 楽観的更新のロールバック
```
=== deleteCustomer ERROR ===
Rolling back UI changes...
```
**原因**: データベース削除に失敗し、UIを元に戻している
**対策**: エラーの詳細を確認し、データベースの問題を解決

### 4.2 デバッグのポイント

1. **ID の型確認**
   - Customer IDがnumber型であることを確認
   - undefinedやnullでないことを確認

2. **データベース接続**
   - IndexedDBが開いているか確認
   - ブラウザのストレージ容量を確認

3. **関連データ**
   - 来店記録の削除が正しく行われているか
   - 外部キー制約のようなエラーがないか

## 5. パフォーマンスの確認

### 5.1 削除処理の時間
- 楽観的更新により、UIは即座に更新される
- データベース削除は非同期で実行される

### 5.2 大量データの場合
- 来店記録が多い顧客の削除時間を測定
- トランザクションのタイムアウトがないか確認

## 6. 追加のテストケース

### 6.1 連続削除
1. 複数の顧客を連続で削除
2. 各削除が正しく処理されるか確認

### 6.2 削除中の操作
1. 削除処理中に他の操作（顧客追加など）を実行
2. 競合状態が発生しないか確認

### 6.3 削除のキャンセル
1. 削除確認ダイアログでキャンセル
2. 顧客データが保持されているか確認

## 7. 問題報告時に必要な情報

1. **完全なコンソールログ**
   - 特に`=== `で始まるセクション
   - エラーメッセージとスタックトレース

2. **削除対象の顧客情報**
   - Customer ID
   - 関連する来店記録の数

3. **ブラウザ情報**
   - ブラウザ名とバージョン
   - プライベートブラウジングモードか

4. **再現手順**
   - エラーが発生するまでの操作手順
   - エラーが必ず発生するか、時々発生するか