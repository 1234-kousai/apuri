# Cast AI アプリ デバッグサマリー

## 追加したデバッグログ

### 1. 顧客登録機能
- **ファイル**: `src/stores/customerStore.ts`
- **関数**: `addCustomer`, `encryptCustomerData`
- **ログ内容**: 
  - 入力データ
  - 暗号化プロセス
  - データベース保存
  - state更新

### 2. 顧客一覧表示
- **ファイル**: 
  - `src/stores/customerStore.ts` - `loadCustomers`, `decryptCustomerData`
  - `src/components/UltrathinkCustomerList.tsx`
  - `src/App.tsx`
- **ログ内容**:
  - データベースからの読み込み
  - 復号化プロセス
  - コンポーネントへのデータ渡し
  - レンダリング時の顧客数

### 3. 顧客詳細表示
- **ファイル**: 
  - `src/components/CustomerDetail.tsx`
  - `src/lib/customerDataUtils.ts` - `getDecryptedString`
- **ログ内容**:
  - 顧客データの表示
  - 暗号化データの検出
  - 統計情報の計算

### 4. 顧客削除機能
- **ファイル**: 
  - `src/stores/customerStore.ts` - `deleteCustomer`
  - `src/components/CustomerDetail.tsx` - `handleDelete`
  - `src/lib/dbUtils.ts` - `withTransaction`
- **ログ内容**:
  - 削除対象の確認
  - トランザクション処理
  - UI更新とロールバック

### 5. 顧客編集機能
- **ファイル**: 
  - `src/components/CustomerEditForm.tsx`
  - `src/stores/customerStore.ts` - `updateCustomer`
- **ログ内容**:
  - フォームデータ
  - 暗号化プロセス
  - データベース更新
  - state更新

## 発見された問題点

### 1. 暗号化データの表示問題
**現象**: 編集フォームで電話番号、LINE ID、メモが「[暗号化されたデータ]」と表示される

**原因**: 
- `getDecryptedString`関数が暗号化されたオブジェクトを受け取った場合、復号化せずに固定文字列を返す
- loadCustomers時に復号化されたデータがstateに保存されているはずだが、編集フォームで暗号化されたデータが渡されている

**影響**: 
- ユーザーが既存の値を確認できない
- 編集時のユーザビリティが低い

### 2. データフローの不整合
**期待される流れ**:
1. DB → 暗号化データ読み込み
2. 復号化 → 平文データ
3. State保存 → 平文データ
4. 表示 → 平文データ
5. 編集・保存時のみ暗号化

**実際の流れ**:
- 一部で暗号化データがそのまま表示層に渡されている可能性

## テスト手順

各機能の詳細なテスト手順は以下のファイルを参照：

1. **全般**: `DEBUG_INSTRUCTIONS.md`
2. **顧客一覧**: `DEBUG_CUSTOMER_LIST.md`
3. **顧客詳細**: `DEBUG_CUSTOMER_DETAIL.md`
4. **削除機能**: `DEBUG_DELETE_FUNCTION.md`
5. **編集機能**: `DEBUG_EDIT_FUNCTION.md`

## 推奨される修正

### 1. 即時対応が必要
- `getDecryptedString`関数の改善または削除
- loadCustomers後のstateに保存されるデータ形式の確認

### 2. 中期的な改善
- 暗号化・復号化のタイミングを明確に分離
- エラーハンドリングの強化
- TypeScriptの型定義を活用した型安全性の向上

## デバッグ時のチェックポイント

1. **コンソールログ**
   - `=== XXX START ===` と `=== XXX SUCCESS/ERROR ===` のペアを確認
   - エラーの場合は詳細なスタックトレースを確認

2. **データの形式**
   - 暗号化データ: `{encrypted: "...", iv: "..."}`
   - 平文データ: 文字列

3. **IndexedDB**
   - Application → Storage → IndexedDB → cast-ai-db
   - customers、visitsテーブルのデータ形式を確認

4. **ネットワーク**
   - Service Workerが正しく動作しているか
   - キャッシュの影響がないか

## 次のステップ

1. ブラウザでアプリを開き、各テスト手順に従ってテストを実行
2. コンソールログを収集し、問題の原因を特定
3. 必要に応じてさらに詳細なログを追加
4. 問題が特定できたら、適切な修正を実施