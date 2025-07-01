# Cast AI - 顧客管理PWAアプリ

<div align="center">
  <img src="public/logo.svg" alt="Cast AI Logo" width="128" height="128">
  
  **夜職キャストのための AI 搭載顧客管理アプリ**
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/1234-kousai/apuri&root-directory=cast-ai)
</div>

## ✨ 特徴

- 📱 **PWA対応** - スマホアプリとして使える
- 🤖 **AI営業提案** - 毎日3名の重要顧客をピックアップ
- 📊 **売上管理** - 自動集計と予測機能
- 🏅 **VIPランク** - 自動でランク判定
- 🔒 **プライバシー重視** - ローカルデータ保存

## 🚀 クイックスタート

### 開発環境

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview
```

## 📱 主な機能

### 1. 顧客管理
- 基本情報（名前、誕生日、連絡先）の登録
- 来店履歴の記録
- 自動でVIPランク判定（Gold/Silver/Bronze）

### 2. AI営業アシスタント
- **優先度スコアリング**: 来店パターンを学習
- **今日の提案**: 毎日3名をピックアップ
  - 優先度の高い2名
  - サプライズ枠1名（新規/休眠/ランクダウン顧客）
- **具体的な理由表示**: 「誕生日まであと5日」など

### 3. 売上分析
- 月間売上の自動集計
- 売上予測機能
- 顧客別売上ランキング

### 4. PWA機能
- オフライン対応
- ホーム画面への追加
- プッシュ通知（準備中）

## 🛠 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **データベース**: IndexedDB (Dexie.js)
- **ビルドツール**: Vite
- **PWA**: vite-plugin-pwa

## 📦 プロジェクト構成

```
cast-ai/
├── src/
│   ├── components/     # UIコンポーネント
│   ├── lib/           # ユーティリティ（AI、DB）
│   ├── stores/        # 状態管理
│   └── App.tsx        # メインアプリケーション
├── public/            # 静的アセット
├── index.html         # エントリーポイント
└── vite.config.ts     # Vite設定
```

## 🔧 環境変数

`.env.example` を `.env.local` にコピーして設定:

```bash
cp .env.example .env.local
```

## 🚀 デプロイ

### Vercel（推奨）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/1234-kousai/apuri&root-directory=cast-ai)

### GitHub Pages

1. リポジトリ Settings → Pages
2. Source: GitHub Actions を選択
3. 自動デプロイが開始

詳細は [DEPLOYMENT.md](../DEPLOYMENT.md) を参照。

## 📱 使い方

1. **顧客登録**: 「顧客」タブから新規登録
2. **来店記録**: 「売上」タブまたは顧客詳細から記録
3. **AI提案確認**: ホーム画面で毎日の提案をチェック
4. **連絡**: 電話/LINEボタンでワンタップ連絡

## 🔒 セキュリティ

- すべてのデータはローカル（端末内）に保存
- パスコード/生体認証対応（実装予定）
- 定期的な自動バックアップ（実装予定）

## 📈 今後の機能

- [ ] クラウドバックアップ（Firebase）
- [ ] 有料プラン決済（Stripe）
- [ ] CSVエクスポート
- [ ] 詳細な分析レポート
- [ ] 音声メモ機能

## 🤝 コントリビューション

1. Fork する
2. Feature branch を作成 (`git checkout -b feature/amazing-feature`)
3. Commit する (`git commit -m 'Add amazing feature'`)
4. Push する (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照。

## 🙏 謝辞

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Dexie.js](https://dexie.org/)

---

<div align="center">
  Made with ❤️ by Cast AI Team
</div>