# Claude PR Screenshot

Automated PR creation with screenshots for Claude Code using Playwright.

Claude CodeとPlaywrightを使用して、PRに自動的にスクリーンショット付きコメントを生成するツールです。

**Note**: This tool operates as an independent CLI application and does not require Playwright MCP integration.
**注意**: このツールはPlaywright MCPに依存せず、Claude Codeから独立したCLIアプリケーションとして動作します。

## Features / 特徴

- 🚀 **Automated PR Creation** / **自動PR作成**: Complete automation from branch analysis to PR creation / ブランチ分析からPR作成まで完全自動化
- 📸 **GitHub-Hosted Screenshots** / **GitHub添付スクリーンショット**: Direct image upload to GitHub repository for unlimited size / GitHubリポジトリに直接アップロードでサイズ制限なし
- 📝 **Smart Comment Generation** / **コメント自動生成**: Generate appropriate PR comments from Git diff analysis / Git差分から適切なPRコメントを生成
- 🎯 **Claude Code Integration** / **Claude Code統合**: Easy execution with custom slash commands / カスタムスラッシュコマンドで簡単実行
- ⚡ **TypeScript** / **TypeScript**: Complete type safety with modern code / 完全な型安全性とモダンなコード
- 🔧 **No Size Limits** / **サイズ制限なし**: Overcome GitHub comment size limitations with direct image hosting / 直接画像ホスティングでGitHubコメントサイズ制限を回避

## Installation / インストール

```bash
# Global installation / グローバルインストール
npm install -g claude-pr-screenshot

# Or project-specific / またはプロジェクト単位
npm install --save-dev claude-pr-screenshot
```

## Setup / セットアップ

### 1. Get GitHub Personal Access Token / GitHub Personal Access Token の取得

1. Go to [GitHub Settings > Personal access tokens](https://github.com/settings/tokens) / [GitHub Settings > Personal access tokens](https://github.com/settings/tokens) にアクセス
2. Click "Generate new token (classic)" / "Generate new token (classic)" をクリック
3. Select required permissions / 必要な権限を選択:
   - `repo` (for private repositories / プライベートリポジトリの場合)
   - `public_repo` (for public repositories / パブリックリポジトリの場合)
   - `workflow` (if using GitHub Actions / GitHub Actionsを使用する場合)

### 2. Initialize Configuration / 初期設定

```bash
npx claude-pr-screenshot init
```

Interactive setup for / 対話式で以下の設定を行います:
- GitHub Personal Access Token
- GitHub Owner/Repository
- Development server URL / 開発サーバーURL
- Screenshot target paths / スクリーンショット対象パス

## Usage / 使用方法

### Command Line / コマンドライン

```bash
# Basic usage / 基本的な使用方法
npx claude-pr-screenshot create-pr feature/new-feature

# Specify base branch / ベースブランチを指定
npx claude-pr-screenshot create-pr feature/new-feature --base develop

# Specify development server URL / 開発サーバーURLを指定
npx claude-pr-screenshot create-pr feature/new-feature --url http://localhost:8080

# Preview without creating PR / PR作成せずにプレビュー
npx claude-pr-screenshot preview feature/new-feature
```

### Claude Code Integration / Claude Code内での使用

```bash
# Custom slash command / カスタムスラッシュコマンド
/pr-ready feature/new-feature

# With options / オプション付き
/pr-ready feature/new-feature --base develop --url http://localhost:8080
```

## Configuration File / 設定ファイル

`.claude-pr-config.json` is automatically generated / `.claude-pr-config.json` が自動生成されます:

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

## Generated PR Comment Example / 生成されるPRコメント例

```markdown
## 🚀 Changes Overview / 変更概要

### 📋 Implementation Details / 実装内容
- Add user authentication feature
- Update navigation component
- Fix responsive design issues

### 📁 File Changes / ファイル変更
**Added / 追加**: src/auth/login.ts, src/components/Nav.vue
**Modified / 変更**: src/App.vue, src/styles/main.css

## 🖼️ Screenshots / スクリーンショット

### Homepage
![Homepage](https://raw.githubusercontent.com/your-username/your-repo/main/screenshots/1234567890-home.png)

### About Page
![About](https://raw.githubusercontent.com/your-username/your-repo/main/screenshots/1234567890-about.png)

## ✅ Test Items / テスト項目
- [ ] Functional verification / 機能動作確認
- [ ] Responsive design check / レスポンシブ確認
- [ ] No impact on existing features / 既存機能への影響なし
```

## Commands / コマンド一覧

| Command / コマンド | Description / 説明 |
|-------------------|-------------------|
| `init` | Initialize configuration / 初期設定を行う |
| `create-pr <branch>` | Create PR / PRを作成する |
| `preview <branch>` | Preview PR comment / PRコメントをプレビューする |
| `config` | Show current configuration / 現在の設定を表示する |
| `setup` | Show setup instructions / セットアップ手順を表示する |

## Options / オプション

| Option / オプション | Short / 短縮形 | Description / 説明 | Default / デフォルト |
|-------------------|---------------|-------------------|---------------------|
| `--base` | `-b` | Base branch / ベースブランチ | `main` |
| `--url` | `-u` | Development server URL / 開発サーバーURL | Config file value / 設定ファイルの値 |
| `--draft` | - | Create as draft PR / ドラフトPRとして作成 | `false` |

## Development / 開発

```bash
# Clone repository / リポジトリをクローン
git clone https://github.com/your-username/claude-pr-screenshot.git
cd claude-pr-screenshot

# Install dependencies / 依存関係をインストール
npm install

# Build / ビルド
npm run build

# Development mode / 開発モード
npm run dev

# Run tests / テスト実行
npm test
npm run test:watch    # Watch mode / ウォッチモード
npm run test:coverage # With coverage / カバレッジ付き
```

## GitHub Image Hosting / GitHub画像ホスティング

This tool uses GitHub's repository file hosting to store screenshots, which provides several advantages:

このツールはGitHubのリポジトリファイルホスティングを使用してスクリーンショットを保存し、以下の利点があります：

### Benefits / 利点

- **No Size Limits** / **サイズ制限なし**: Overcome GitHub comment 65,536 character limit / GitHubコメントの65,536文字制限を回避
- **Permanent Storage** / **永続保存**: Images are stored permanently in your repository / 画像はリポジトリに永続的に保存
- **Fast Loading** / **高速読み込み**: Images load faster than Base64 embedded data / Base64埋め込みデータより高速読み込み
- **Version Control** / **バージョン管理**: Screenshots are version controlled with your code / スクリーンショットもコードと一緒にバージョン管理

### How it works / 動作原理

1. Screenshots are captured using Playwright / Playwrightでスクリーンショットを撮影
2. Images are uploaded to `screenshots/` directory in your repository / 画像はリポジトリの`screenshots/`ディレクトリにアップロード
3. PR comments reference the GitHub raw URLs / PRコメントはGitHubのrawURLを参照
4. Images display properly without size limitations / サイズ制限なしで画像が正常表示

## Troubleshooting / トラブルシューティング

### Common Issues / よくある問題

**Q: "Configuration file not found" error / "設定ファイルが見つかりません" エラー**
```bash
# Run initial setup / 初期設定を実行してください
npx claude-pr-screenshot init
```

**Q: GitHub API Error / GitHub API エラー**
- Check Personal Access Token permissions / Personal Access Tokenの権限を確認
- Verify token expiration / トークンの有効期限を確認
- Confirm repository name and owner / リポジトリ名・オーナー名を確認

**Q: Screenshot capture failure / スクリーンショット撮影失敗**
- Ensure development server is running / 開発サーバーが起動しているか確認
- Verify URL is correct / URLが正しいか確認
- Check network connection / ネットワーク接続を確認

**Q: TypeScript errors / TypeScriptエラー**
```bash
# Install type definitions / 型定義をインストール
npm install --save-dev @types/node
```

## Requirements / 要件

- Node.js >= 18.0.0
- Git repository / Gitリポジトリ
- GitHub repository / GitHubリポジトリ
- Development server (for screenshots) / 開発サーバー（スクリーンショット用）

## License / ライセンス

MIT License