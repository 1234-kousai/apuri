# 顧客一覧表示のデバッグ手順

## 1. アプリの起動とデータ読み込みの確認

### 1.1 ブラウザでアプリを開く
- http://localhost:5174 を開く
- デベロッパーツールのコンソールを開く

### 1.2 初回読み込み時のログ確認
アプリ起動時に以下のログが表示されるはずです：

```
Loading customers and visits...
=== loadCustomers START ===
Fetching customers from database...
Encrypted customers from DB: [...]
Number of customers: X
Decrypting customer 0: {...}
decryptCustomerData input: {...}
Decrypting phone: {...}
Decrypted phone result: "090-1234-5678"
Decrypting lineId: {...}
Decrypted lineId result: "test_line_id"
Decrypting memo: {...}
Decrypted memo result: "これはテストです"
decryptCustomerData output: {...}
Decrypted customer 0: {...}
Valid customers after filtering: [...]
Filtered out: 0 customers
Setting customers to state: [...]
=== loadCustomers SUCCESS ===
Data loading completed
=== Customer store state changed ===
Customers: [...]
Number of customers: X
```

## 2. Customersタブでの表示確認

### 2.1 Customersタブに移動
画面下部の「Customers」タブをクリック

### 2.2 コンポーネントレンダリング時のログ確認
```
=== UltrathinkCustomerList RENDER ===
Customers prop: [...]
Number of customers: X
Visits prop: [...]
Number of visits: X
```

### 2.3 画面表示の確認ポイント
- 顧客カードが表示されているか
- 各カードに以下の情報が表示されているか：
  - 顧客名
  - ID（6桁のゼロパディング）
  - 売上（Revenue）とプログレスバー
  - 来店回数（Visits）
  - 最終来店日（Last visit）
- 検索バーが機能するか

## 3. 問題がある場合の確認事項

### 3.1 顧客が表示されない場合
1. **IndexedDBの確認**
   - Application → Storage → IndexedDB → cast-ai-db → customers
   - データが保存されているか確認

2. **コンソールエラーの確認**
   - 赤いエラーメッセージがないか
   - 特に暗号化・復号化エラーがないか

3. **ネットワークタブの確認**
   - 読み込み失敗しているリソースがないか

### 3.2 顧客は表示されるがクリックできない場合
1. **クリックイベントのログ確認**
   ```
   Customer clicked: {...}
   Customer ID: X Type: number
   ```

2. **IDが正しく設定されているか**
   - Customer IDがundefinedやnullになっていないか
   - Typeがnumberになっているか

### 3.3 検索が機能しない場合
1. **フィルタリング処理の確認**
   - searchQueryの値が更新されているか
   - filteredCustomersの配列が正しく更新されているか

## 4. 詳細な問題報告

問題が発生した場合、以下の情報を提供してください：

1. **コンソールログ全文**
   - 特に`=== `で始まるセクション
   - エラーメッセージ

2. **画面のスクリーンショット**
   - 顧客一覧画面の状態
   - デベロッパーツールのコンソール

3. **IndexedDBの状態**
   - customersテーブルのデータ
   - データの形式（特に暗号化されたフィールド）

4. **再現手順**
   - どの操作で問題が発生したか
   - 問題発生前に何をしたか

## 5. よくある問題と解決方法

### 暗号化エラー
- crypto.subtle APIが利用できない環境（HTTPではなくHTTPSが必要）
- 解決：localhostでは問題ないはずだが、他のホストの場合はHTTPSを使用

### データベースエラー
- IndexedDBの容量不足
- 解決：不要なデータを削除するか、ブラウザのストレージをクリア

### 表示の遅延
- 大量のデータがある場合の描画パフォーマンス
- 解決：仮想スクロールの実装を検討