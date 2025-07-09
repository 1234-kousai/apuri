# デバッグ手順

以下の手順でアプリの動作を確認してください：

## 1. ブラウザでアプリを開く
```bash
npm run dev
```
ブラウザで http://localhost:5173 を開く

## 2. デベロッパーツールを開く
- Chrome/Edge: F12 または右クリック → 検証
- Firefox: F12 または右クリック → 要素を調査
- Safari: 開発メニューから「Webインスペクタを表示」

## 3. コンソールタブに切り替える
開発者ツールで「Console」タブを選択

## 4. 顧客登録のテスト

### 4.1 新規顧客登録
1. 「新規顧客」ボタンをクリック
2. 以下の情報を入力：
   - 名前: テスト顧客1
   - 誕生日: 1990-01-01
   - 電話番号: 090-1234-5678
   - LINE ID: test_line_id
   - メモ: これはテストです

3. 「顧客を登録」ボタンをクリック

### 4.2 コンソールで確認すべきログ
以下のようなログが順番に表示されるはずです：

```
=== addCustomer START ===
Input customerData: {name: "テスト顧客1", birthday: "1990-01-01", ...}
New customer object: {name: "テスト顧客1", createdAt: ..., totalRevenue: 0, vipRank: "bronze"}
Starting encryption...
encryptCustomerData input: {...}
Encrypting phone: 090-1234-5678 string
Encrypted phone result: {encrypted: "...", iv: "..."}
Encrypting lineId: test_line_id string
Encrypted lineId result: {encrypted: "...", iv: "..."}
Encrypting memo: これはテストです string
Encrypted memo result: {encrypted: "...", iv: "..."}
encryptCustomerData output: {...}
Encrypted data: {...}
Saving to database...
Received ID from database: 1 number
Customer with ID: {...}
Current customers: []
New state: {customers: [...]}
=== addCustomer SUCCESS ===
```

### 4.3 エラーが発生した場合
もしエラーが発生した場合、以下のようなログが表示されます：
```
=== addCustomer ERROR ===
Error details: [エラーオブジェクト]
Error stack: [スタックトレース]
```

## 5. 顧客リストの確認

### 5.1 Customersタブに移動
画面下部の「Customers」タブをクリック

### 5.2 登録した顧客が表示されるか確認
- 顧客カードが表示されているか
- 名前、ID、統計情報が正しく表示されているか

## 6. 顧客クリックのテスト

### 6.1 顧客カードをクリック
登録した顧客のカードをクリック

### 6.2 コンソールで確認すべきログ
```
Customer clicked: {id: 1, name: "テスト顧客1", ...}
Customer ID: 1 Type: number
```

### 6.3 顧客詳細画面が表示されるか確認
- 顧客詳細モーダルが開くか
- 顧客情報が正しく表示されているか
- 編集・削除ボタンが機能するか

## 7. 問題があった場合の報告内容

以下の情報を報告してください：

1. どの手順で問題が発生したか
2. コンソールに表示されたエラーメッセージ（全文）
3. コンソールに表示されたデバッグログ（全文）
4. 画面に表示されたエラーメッセージやトースト通知
5. Network タブでエラーになっているリクエストがあるか

## 8. 追加の確認事項

### IndexedDB の確認
1. 開発者ツールの「Application」タブを開く
2. 左側の「Storage」→「IndexedDB」を展開
3. 「cast-ai-db」データベースを確認
4. 「customers」テーブルにデータが保存されているか確認

### Service Worker の確認
1. 開発者ツールの「Application」タブ
2. 左側の「Service Workers」を確認
3. Service Worker が登録されているか確認