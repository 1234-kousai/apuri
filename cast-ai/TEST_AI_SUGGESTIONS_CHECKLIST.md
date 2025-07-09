# AI提案機能 テストチェックリスト

## 基本動作確認
- [ ] Homeタブに提案カードが表示される
- [ ] 提案数が設定通り（デフォルト5件）
- [ ] 各提案にカテゴリーアイコンが表示される
- [ ] 提案理由（primaryReason）が表示される
- [ ] スコアインジケーターが表示される

## カテゴリー別確認

### 緊急（URGENT）
- [ ] 45日以上来店していない顧客が提案される
- [ ] 赤色のアイコンと「URGENT」ラベル
- [ ] 「連絡が必要」などのアクションボタン

### 機会（OPPORTUNITY）
- [ ] 高単価・増加傾向の顧客が提案される
- [ ] 青色のアイコンと「OPPORTUNITY」ラベル
- [ ] 「特別オファー」などのアクションボタン

### 関係構築（RELATIONSHIP）
- [ ] 誕生日が近い顧客が提案される
- [ ] 紫色のアイコンと「RELATIONSHIP」ラベル
- [ ] 「誕生日祝い」などのアクションボタン

### サプライズ（SURPRISE）
- [ ] ランダムに選ばれた顧客
- [ ] 緑色のアイコンと「SURPRISE」ラベル
- [ ] 「気軽に連絡」などのアクションボタン

## インタラクション

### カードクリック
- [ ] 顧客名エリアをクリックで顧客詳細が開く
- [ ] アクションボタンで適切な動作
  - [ ] 「連絡する」→ 電話/LINE
  - [ ] その他のアクション → 顧客詳細

### AI設定
- [ ] 「AI設定」ボタンで設定画面が開く
- [ ] 最大提案数の変更が反映される
- [ ] カテゴリーのON/OFFが機能する
- [ ] 最小スコアの変更が反映される

## コンソールログ確認

### 初回レンダリング時
```
=== useMemoizedAISuggestions ===
Customers: X
Visits: Y
Settings: {...}
=== Calculating AI suggestions ===
=== getEnhancedSuggestions START ===
Processing X customers
Generating suggestion for: [各顧客名]
=== getEnhancedSuggestions END ===
Returning X suggestions
```

### 提案カード表示時
```
=== UltrathinkSuggestionCard RENDER ===
Suggestion: {customer: {...}, score: 0.X, category: "...", ...}
```

### アクションクリック時
```
Suggestion card clicked: [顧客名]
Action clicked: {type: "...", message: "...", priority: "..."}
```

### AI設定変更時
```
=== AISettings RENDER ===
Current settings: {...}
=== Saving AI settings ===
New settings: {...}
```

## パフォーマンス
- [ ] 100人以上の顧客でも高速に表示
- [ ] タブ切り替え時にキャッシュが効く
- [ ] 設定変更後すぐに反映される

## エッジケース
- [ ] 顧客0人で「No customer data」表示
- [ ] 来店履歴0件で提案なし
- [ ] すべて低スコアで提案なし

## 問題チェック
- [ ] 同じ顧客が重複して提案されない
- [ ] カテゴリーバランスが適切
- [ ] 提案理由が明確で理解しやすい
- [ ] アクションが具体的で実行可能