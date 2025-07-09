# 顧客編集機能のデバッグ手順

## 1. 編集機能のテスト準備

### 1.1 前提条件
- 少なくとも1人の顧客が登録されていること
- 顧客の詳細情報（電話番号、LINE ID、メモなど）が登録されていること

### 1.2 コンソールログの準備
デベロッパーツールのコンソールを開いて、ログをクリアしておく

## 2. 編集フォームを開く

### 2.1 顧客詳細画面を開く
1. Customersタブで編集したい顧客をクリック
2. 顧客詳細画面が表示されることを確認
3. 以下のログを確認：
```
=== CustomerDetail RENDER ===
Customer prop: {...}
Customer ID: 1 Type: number
```

### 2.2 編集ボタンをクリック
1. 画面右上の「編集」ボタンをクリック
2. 編集フォームが表示される
3. 以下のログを確認：
```
=== CustomerEditForm RENDER ===
Customer prop: {id: 1, name: "テスト顧客1", ...}
Customer ID: 1 Type: number
Default values: {
  name: "テスト顧客1",
  birthday: "1990-01-01",
  phone: "[暗号化されたデータ]",
  lineId: "[暗号化されたデータ]",
  memo: "[暗号化されたデータ]"
}
```

### 2.3 初期値の確認
**問題点**: 現在、暗号化されたデータが「[暗号化されたデータ]」として表示される
- 本来は復号化された値が表示されるべき
- これは `getDecryptedString` 関数の現在の実装による

## 3. 編集操作の実行

### 3.1 情報を変更
以下の情報を変更：
- 名前: テスト顧客1 → テスト顧客1（更新）
- 誕生日: 変更なし
- 電話番号: 090-9999-8888
- LINE ID: new_line_id
- メモ: 更新されたメモ

### 3.2 保存ボタンをクリック
「保存」ボタンをクリックし、以下のログを確認：

```
=== onSubmit START ===
Form data: {
  name: "テスト顧客1（更新）",
  birthday: "1990-01-01",
  phone: "090-9999-8888",
  lineId: "new_line_id",
  memo: "更新されたメモ"
}
Customer ID: 1
Update data: {
  name: "テスト顧客1（更新）",
  birthday: "1990-01-01",
  phone: "090-9999-8888",
  lineId: "new_line_id",
  memo: "更新されたメモ"
}
=== updateCustomer START ===
Customer ID: 1 Type: number
Update data: {...}
Encrypting customer data...
encryptCustomerData input: {...}
Encrypting phone: 090-9999-8888 string
Encrypted phone result: {encrypted: "...", iv: "..."}
Encrypting lineId: new_line_id string
Encrypted lineId result: {encrypted: "...", iv: "..."}
Encrypting memo: 更新されたメモ string
Encrypted memo result: {encrypted: "...", iv: "..."}
encryptCustomerData output: {...}
Encrypted data: {...}
Updating database...
Database update result: 1
Updating state...
Updated customers: [...]
=== updateCustomer SUCCESS ===
=== onSubmit SUCCESS ===
```

## 4. 更新成功時の確認

### 4.1 UI の更新
- 編集フォームが自動的に閉じる
- 顧客詳細画面に戻る
- 「顧客情報を更新しました」というトーストが表示される

### 4.2 更新内容の確認
- 顧客名が更新されているか
- ただし、現在の実装では暗号化されたフィールドは表示されない

### 4.3 データベースの確認
1. Application → Storage → IndexedDB → cast-ai-db → customers
2. 該当顧客のデータを確認
3. phone、lineId、memoフィールドが暗号化形式で保存されているか確認

## 5. エラーが発生した場合

### 5.1 よくあるエラーパターン

#### ID が undefined の場合
```
Customer ID is undefined!
```
**原因**: 顧客オブジェクトにIDが設定されていない
**対策**: 顧客詳細画面から正しく顧客データが渡されているか確認

#### データベース更新エラー
```
Database update result: 0
No customer found with the given ID
```
**原因**: 指定されたIDの顧客が存在しない
**対策**: IDが正しいか、顧客が削除されていないか確認

#### 暗号化エラー
```
Failed to encrypt data
```
**原因**: 暗号化処理でエラーが発生
**対策**: crypto.subtle APIが利用可能か確認

### 5.2 デバッグのポイント

1. **初期値の問題**
   - 暗号化されたデータが復号化されずに表示される
   - これは現在の `getDecryptedString` 実装の制限

2. **更新データの整合性**
   - stateの更新とデータベースの更新が一致しているか
   - 暗号化前のデータがstateに保存されていないか

3. **バリデーション**
   - 電話番号、LINE IDの形式チェックが正しく動作しているか

## 6. 追加のテストケース

### 6.1 部分更新
1. 名前だけを変更して保存
2. 他のフィールドが保持されているか確認

### 6.2 空値の処理
1. オプションフィールドを空にして保存
2. undefinedとして正しく処理されるか確認

### 6.3 連続編集
1. 編集→保存→すぐに再編集
2. データの整合性が保たれているか確認

### 6.4 同時編集の防止
1. 同じ顧客を複数のタブで開く
2. 両方で編集した場合の動作を確認

## 7. 現在の実装の課題

### 7.1 暗号化データの表示
- 編集フォームで暗号化されたデータが表示されない
- 編集時に既存の値が見えないため、ユーザビリティが低い

### 7.2 解決案
1. `loadCustomers` で復号化したデータをstateに保存
2. 表示時は復号化済みのデータを使用
3. 保存時のみ暗号化を実行

## 8. 問題報告時に必要な情報

1. **完全なコンソールログ**
   - 特に`=== `で始まるセクション
   - エラーメッセージとスタックトレース

2. **編集内容**
   - 変更前の値
   - 変更後の値
   - どのフィールドを編集したか

3. **画面の状態**
   - 編集フォームのスクリーンショット
   - エラーが表示された場合の画面

4. **再現手順**
   - どの顧客を編集したか
   - どのような操作を行ったか