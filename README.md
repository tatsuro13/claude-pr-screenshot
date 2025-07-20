# Claude PR Screenshot

Claude CodeとPlaywright MCPを使用して、PRに自動的にスクリーンショット付きコメントを生成するツールです。

## 特徴

- 🚀 **自動PR作成**: ブランチ分析からPR作成まで完全自動化
- 📸 **スクリーンショット自動撮影**: Playwrightで複数ページを自動キャプチャ
- 📝 **コメント自動生成**: Git差分から適切なPRコメントを生成
- 🎯 **Claude Code統合**: カスタムスラッシュコマンドで簡単実行
- ⚡ **TypeScript**: 完全な型安全性とモダンなコード

## インストール

```bash
# グローバルインストール
npm install -g claude-pr-screenshot

# またはプロジェクト単位
npm install --save-dev claude-pr-screenshot
```

## セットアップ

### 1. GitHub Personal Access Token の取得

1. [GitHub Settings > Personal access tokens](https://github.com/settings/tokens) にアクセス
2. "Generate new token (classic)" をクリック
3. 必要な権限を選択:
   - `repo` (プライベートリポジトリの場合)
   - `public_repo` (パブリックリポジトリの場合)
   - `workflow` (GitHub Actionsを使用する場合)

### 2. 初期設定

```bash
npx claude-pr-screenshot init
```

対話式で以下の設定を行います:
- GitHub Personal Access Token
- GitHub Owner/Repository
- 開発サーバーURL
- スクリーンショット対象パス

## 使用方法

### コマンドライン

```bash
# 基本的な使用方法
npx claude-pr-screenshot create-pr feature/new-feature

# ベースブランチを指定
npx claude-pr-screenshot create-pr feature/new-feature --base develop

# 開発サーバーURLを指定
npx claude-pr-screenshot create-pr feature/new-feature --url http://localhost:8080

# プレビュー（PR作成せずにコメントを確認）
npx claude-pr-screenshot preview feature/new-feature
```

### Claude Code内での使用

```bash
# カスタムスラッシュコマンド
/pr-ready feature/new-feature

# オプション付き
/pr-ready feature/new-feature --base develop --url http://localhost:8080
```

## 設定ファイル

`.claude-pr-config.json` が自動生成されます:

```json
{
  "github": {
    "token": "ghp_xxxxxxxxxxxx",
    "owner": "your-username",
    "repo": "your-repo"
  },
  "playwright": {
    "viewport": { "width": 1920, "height": 1080 },
    "baseUrl": "http://localhost:3000"
  },
  "screenshots": {
    "paths": ["/", "/about", "/contact"],
    "selectors": {
      "header": "header",
      "main": "main"
    }
  }
}
```

## 生成されるPRコメント例

```markdown
## 🚀 変更概要

### 📋 実装内容
- Add user authentication feature
- Update navigation component
- Fix responsive design issues

### 📁 ファイル変更
**追加**: src/auth/login.ts, src/components/Nav.vue
**変更**: src/App.vue, src/styles/main.css

## 🖼️ スクリーンショット

### Homepage
![Homepage](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)

### About Page
![About](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)

## ✅ テスト項目
- [ ] 機能動作確認
- [ ] レスポンシブ確認
- [ ] 既存機能への影響なし
```

## コマンド一覧

| コマンド | 説明 |
|----------|------|
| `init` | 初期設定を行う |
| `create-pr <branch>` | PRを作成する |
| `preview <branch>` | PRコメントをプレビューする |
| `config` | 現在の設定を表示する |
| `setup` | セットアップ手順を表示する |

## オプション

| オプション | 短縮形 | 説明 | デフォルト |
|------------|--------|------|------------|
| `--base` | `-b` | ベースブランチ | `main` |
| `--url` | `-u` | 開発サーバーURL | 設定ファイルの値 |
| `--draft` | - | ドラフトPRとして作成 | `false` |

## トラブルシューティング

### よくある問題

**Q: "設定ファイルが見つかりません" エラー**
```bash
# 初期設定を実行してください
npx claude-pr-screenshot init
```

**Q: GitHub API エラー**
- Personal Access Tokenの権限を確認
- トークンの有効期限を確認
- リポジトリ名・オーナー名を確認

**Q: スクリーンショット撮影失敗**
- 開発サーバーが起動しているか確認
- URLが正しいか確認
- ネットワーク接続を確認

**Q: TypeScriptエラー**
```bash
# 型定義をインストール
npm install --save-dev @types/node
```

## 開発

```bash
# リポジトリをクローン
git clone https://github.com/your-username/claude-pr-screenshot.git
cd claude-pr-screenshot

# 依存関係をインストール
npm install

# ビルド
npm run build

# 開発モード
npm run dev
```

## ライセンス

MIT License