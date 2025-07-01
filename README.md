# Cast AI プロジェクト

夜職キャストのための顧客管理PWAアプリケーション

## 📁 プロジェクト構成

```
.
├── cast-ai/          # メインアプリケーション
├── CLAUDE.md         # Claude Code用ガイドライン
├── RD.md             # 要件定義書
├── DEVELOPMENT_GUIDE.md  # 開発ガイド
└── DEPLOYMENT.md     # デプロイメントガイド
```

## 🚀 クイックスタート

```bash
# プロジェクトディレクトリに移動
cd cast-ai

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 📱 主な機能

- **顧客管理**: 基本情報と来店履歴
- **AI営業提案**: 毎日3名の重要顧客をピックアップ
- **売上分析**: 自動集計と予測
- **PWA対応**: オフラインでも使用可能

## 🛠 技術スタック

- React 19 + TypeScript
- Tailwind CSS
- Zustand (状態管理)
- IndexedDB (ローカルストレージ)
- Vite (ビルドツール)

## 📚 ドキュメント

- [要件定義書](./RD.md) - プロジェクトの詳細な要件
- [開発ガイド](./DEVELOPMENT_GUIDE.md) - 開発の進め方
- [デプロイガイド](./DEPLOYMENT.md) - デプロイ方法
- [アプリREADME](./cast-ai/README.md) - アプリケーションの詳細

## 🚀 デプロイ

### Vercel でデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/1234-kousai/apuri&root-directory=cast-ai)

### GitHub Pages でデプロイ

リポジトリの Settings → Pages → Source: GitHub Actions を選択

## 📄 ライセンス

MIT License

---

<div align="center">
  Developed with Claude Code and Gemini CLI
</div>