# 売上テーブル機能 クイックチェックリスト

## 基本表示
- [ ] Salesタブが開ける
- [ ] 来店記録が表示される
- [ ] 日付が新しい順に並んでいる
- [ ] 最大20件表示されている
- [ ] 総売上額が表示されている

## フィルター機能
- [ ] 「All Time」で全期間表示
- [ ] 「Last Week」で過去7日間のみ表示
- [ ] 「Last Month」で過去30日間のみ表示
- [ ] フィルター切り替えで総売上が更新される

## データ表示
- [ ] 顧客名が正しく表示される
- [ ] 日付が「今日」「昨日」「X日前」形式で表示
- [ ] 売上金額が通貨形式で表示
- [ ] メモがある場合は表示される

## インタラクション
- [ ] 行にホバーするとハイライトされる
- [ ] 行をクリックすると顧客詳細が開く
- [ ] アニメーション効果が動作する

## エラーケース
- [ ] 削除された顧客の来店記録で警告が出る
- [ ] データがない場合に適切なメッセージが表示される

## パフォーマンス
- [ ] 大量データでもスムーズに動作する
- [ ] フィルター切り替えが高速

## コンソールログ確認
```
=== UltrathinkSalesTable RENDER ===
Visits prop: [Array]
Number of visits: X
Customers prop: [Array]
Number of customers: Y
Filtered visits by all/week/month: Z
Sorted visits (top 20): 20以下
Total revenue for displayed visits: 合計金額
```

## よくある問題
1. **顧客名が表示されない**
   → `Customer not found` 警告を確認

2. **フィルターが効かない**
   → dateFilterの値とフィルター後の件数を確認

3. **クリックしても反応しない**
   → onCustomerClickが正しく渡されているか確認