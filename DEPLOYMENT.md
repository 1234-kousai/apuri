# Cast AI デプロイメントガイド

## 🚀 デプロイオプション

### 1. Vercel（推奨）

#### メリット
- 自動HTTPS
- 高速なCDN
- プレビューデプロイ
- カスタムドメイン対応
- 無料枠が十分

#### デプロイ方法
1. [vercel.com](https://vercel.com) でアカウント作成
2. GitHubと連携
3. 新規プロジェクト作成
4. `1234-kousai/apuri` リポジトリを選択
5. 以下の設定：
   - Root Directory: `cast-ai`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2. GitHub Pages

#### メリット
- 完全無料
- GitHubと統合
- シンプル

#### デメリット
- カスタムドメインはHTTPSが複雑
- パスが `/apuri/` になる

#### デプロイ方法
1. GitHubリポジトリの Settings → Pages
2. Source: GitHub Actions を選択
3. プッシュすると自動デプロイ

### 3. Netlify

#### デプロイ方法
```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# ビルド
npm run build

# デプロイ
netlify deploy --prod --dir=dist
```

## 🌐 カスタムドメイン設定

### Vercelの場合
1. プロジェクト設定 → Domains
2. ドメインを追加
3. DNSレコードを設定

### 推奨ドメイン名
- cast-ai.app
- cast-ai.jp
- cast-ai-app.com

## 📱 PWAの確認事項

デプロイ後、以下を確認：

1. **HTTPS接続**であること
2. **インストールプロンプト**が表示される
3. **オフライン動作**する
4. **Lighthouse スコア**が90以上

## 🔧 トラブルシューティング

### 404エラーが出る場合
- SPAのルーティング設定を確認
- `vercel.json` の rewrites が正しいか確認

### PWAがインストールできない場合
- HTTPS接続か確認
- manifest.json が正しく配信されているか確認
- Service Worker が登録されているか確認

### ビルドエラーの場合
```bash
# ローカルでビルドテスト
npm run build

# 依存関係をクリーンインストール
rm -rf node_modules package-lock.json
npm install
```

## 📊 パフォーマンス監視

### Vercel Analytics
- プロジェクト設定から有効化
- Core Web Vitals を自動計測

### Google Analytics
必要に応じて追加：
```html
<!-- index.html に追加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 🚨 セキュリティ設定

### 環境変数
本番環境では以下を設定：
- Firebase設定（バックアップ機能用）
- Stripe公開鍵（決済機能用）

### CSPヘッダー
`vercel.json` に追加：
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```