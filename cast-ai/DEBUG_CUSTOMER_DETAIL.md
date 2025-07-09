# 顧客詳細表示のデバッグ手順

## 1. 顧客詳細画面を開く

### 1.1 前提条件
- 顧客が登録されていること
- Customersタブで顧客カードが表示されていること

### 1.2 顧客カードをクリック
1. Customersタブで任意の顧客カードをクリック
2. コンソールで以下のログを確認：

```
Customer clicked: {id: 1, name: "テスト顧客1", ...}
Customer ID: 1 Type: number
=== CustomerDetail RENDER ===
Customer prop: {...}
Customer ID: 1 Type: number
Visits prop: [...]
Number of visits: X
```

## 2. 顧客詳細画面の表示確認

### 2.1 基本情報の表示
- 顧客名が正しく表示されているか
- VIPランク（BRONZE/SILVER/GOLD）が表示されているか
- 登録日が表示されているか
- 累計売上が表示されているか

### 2.2 連絡先情報の表示
暗号化されたデータの表示確認：

```
getDecryptedString input: {encrypted: "...", iv: "..."} Type: object
Encrypted data detected in getDecryptedString - this should be decrypted before display
```

現在の実装では、暗号化されたデータは「[暗号化されたデータ]」と表示されます。

**問題点**：
- 電話番号、LINE ID、メモが暗号化されたまま表示されている
- これらは本来、復号化されてから表示されるべき

### 2.3 統計情報の表示
- 来店回数
- 平均単価
- 最終来店（X日前）
- 今月の売上

### 2.4 来店履歴の表示
- 各来店記録が日付順に表示されているか
- 各記録に売上額が表示されているか
- 編集・削除ボタンが表示されているか

## 3. 削除機能のテスト

### 3.1 削除ボタンをクリック
1. 画面右上の「削除」ボタンをクリック
2. 削除確認ダイアログが表示されるか確認

### 3.2 削除を実行
1. 削除確認ダイアログで「削除」をクリック
2. コンソールで以下のログを確認：

```
=== handleDelete START ===
Deleting customer: {...}
Customer ID: 1
=== deleteCustomer START (in store) ===
...
=== handleDelete SUCCESS ===
```

### 3.3 削除後の確認
- 顧客詳細画面が閉じるか
- 顧客一覧から該当顧客が削除されているか
- 成功トーストが表示されるか

## 4. 編集機能のテスト

### 4.1 編集ボタンをクリック
1. 画面右上の「編集」ボタンをクリック
2. 編集フォームが表示されるか確認

## 5. 問題がある場合の確認事項

### 5.1 暗号化データの表示問題
現在の実装では、顧客データは以下の流れで処理されます：

1. **保存時**：CustomerForm → encryptCustomerData → DB保存
2. **読み込み時**：DB → decryptCustomerData → メモリ保存
3. **表示時**：メモリ → getDecryptedString → 画面表示

**問題**：ステップ2で復号化されたデータがメモリに保存されていない可能性

### 5.2 削除が失敗する場合
- Customer IDが正しく渡されているか
- IndexedDBのトランザクションエラーがないか
- 関連する来店記録の削除でエラーが発生していないか

## 6. 修正が必要な箇所

### 6.1 データの復号化
loadCustomers関数で復号化したデータが正しくstateに保存されているか確認が必要

### 6.2 表示関数
getDecryptedString関数が暗号化されたオブジェクトを受け取った場合の処理を改善する必要がある

## 7. デバッグのための追加確認

### 7.1 Redux DevToolsの使用
もしインストールされていれば、Redux DevToolsでZustandのstateを確認：
- customers配列の中身
- 各顧客のphone、lineId、memoフィールドの値

### 7.2 IndexedDBの直接確認
1. Application → Storage → IndexedDB → cast-ai-db → customers
2. 保存されているデータの形式を確認
3. 暗号化されたフィールドの構造を確認