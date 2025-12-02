# 🔧 Stigmergy CLI - マルチエージェントAI CLIツール協働システム

> **⚠️ 重要なご注意：これは単体のCLIツールではなく、拡張システムです！**
>
> Stigmergy CLIは、既存のAI CLIツールがプラグインシステムを通じて相互に協働できるようにするもので、それらを置き換えるものではありません。

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![ライセンス](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![プラットフォーム](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 クイックスタート

### ワンクリックデプロイ（推奨）

```bash
# 完全な協働システムのワンクリックデプロイ（検出＋インストール＋設定）
npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy
```

または、すでにstigmergy-cliをグローバルにインストールしている場合：

```bash
# インストール済みのCLI経由で実行
npx stigmergy-cli quick-deploy
```

### 手動インストール

```bash
# NPM経由でグローバルインストール
npm install -g stigmergy-cli

# プロジェクト初期化
stigmergy-cli init

# インテリジェントデプロイ（環境スキャン＋プロンプト＋自動インストール）
stigmergy-cli deploy

# またはnpxを使用（インストール不要）
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ コア機能

### 🎯 CLI間直接協働
- **自然言語呼び出し**: サポートされているCLIで他のAIツールを直接呼び出し
- **シームレス統合**: 既存のCLIツールの使用方法を変更しない
- **スマートルーティング**: 協働意図を自動的に識別し、適切なツールに委任

### 📋 サポートされるCLIツール

#### コアツール（必須）
- **Claude CLI** - Anthropic Claude CLIツール
- **Gemini CLI** - Google Gemini CLIツール

#### 拡張ツール（オプション）
- **QwenCode CLI** - アリババクラウド QwenCode CLIツール
- **iFlow CLI** - iFlowワークフロー CLIツール
- **Qoder CLI** - Qoderコード生成 CLIツール
- **CodeBuddy CLI** - CodeBuddyプログラミングアシスタント CLIツール
- **GitHub Copilot CLI** - GitHub Copilot CLIツール
- **Codex CLI** - OpenAI Codexコード分析 CLIツール

### 🧩 インテリジェントデプロイシステム

```bash
# インテリジェントデプロイ（推奨）
stigmergy-cli deploy

# 出力例：
🔍 システムCLIツール状態をスキャン中...

  🔴 ❌ Claude CLI           | CLI: 未インストール | 統合: 未インストール
  🟢 ✅ Gemini CLI          | CLI: 利用可能 | 統合: インストール済み
  🔴 ❌ QwenCode CLI       | CLI: 未インストール | 統合: 未インストール

📋 以下の未インストールツールを検出:

🔴 未インストールのCLIツール:
  - Claude CLI (必須) - Anthropic Claude CLIツール
  - QwenCode CLI (オプション) - アリババクラウド QwenCode CLIツール

2つのCLIツールの自動インストールを試みますか？ (Y/n): Y
```

## 🎯 CLI間協働例

インストール後、サポートされているCLIで他のツールを直接呼び出すことができます：

### Claude CLIで
```bash
# 他のAIツールを呼び出し
geminiを使ってこのコードの翻訳を手伝ってください
qwenを呼び出してこの要件を分析してください
iflowを使ってワークフローを作成してください
qoderにPythonコードを生成させてください
codebuddyアシスタントを起動してください
```

### Gemini CLIで
```bash
# ツール間協働
claudeを使ってコード品質をチェックしてください
qwenにドキュメント作成を手伝ってもらいましょう
copilotを使ってコードスニペットを生成してください
```

## 🛠️ 完全コマンドリスト

```bash
# 基本コマンド
stigmergy-cli init          # プロジェクト初期化
stigmergy-cli status        # 状態表示
stigmergy-cli scan          # 環境スキャン

# デプロイコマンド
stigmergy-cli deploy        # インテリジェントデプロイ（デフォルト）
stigmergy-cli deploy-all    # 完全デプロイ

# プロジェクト管理
stigmergy-cli check-project # プロジェクトチェック
stigmergy-cli validate      # 設定検証
stigmergy-cli clean         # 環境クリーンアップ

# 開発コマンド
npm run build              # プロジェクトビルド
npm run publish-to-npm     # NPMに公開
npm run test               # テスト実行
```

## 📁 プロジェクト構造

```
stigmergy-CLI-Multi-Agents/
├── package.json          # NPMパッケージ設定
├── src/
│   ├── main.js          # メインエントリーファイル
│   ├── deploy.js        # インテリジェントデプロイスクリプト
│   ├── adapters/        # CLIアダプター
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwencode/
│   │   └── ...
│   └── core/            # コアモジュール
├── adapters/            # CLIインストールスクリプト
│   ├── claude/install_claude_integration.py
│   ├── gemini/install_gemini_integration.py
│   └── ...
└── templates/           # 設定テンプレート
```

## 🔧 CLIツールの自動インストール

インテリジェントデプロイスクリプトは、すべてのCLIツールの自動インストールをサポート：

### コアツール
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

### 拡張ツール
```bash
npm install -g @qwen-code/qwen-code@latest
npm install -g @iflow-ai/iflow-cli@latest
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @github/copilot
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

## 🎯 利用シーン

### シナリオ1：個人開発者環境
```bash
# 新しい開発環境のクイックセットアップ
git clone my-project
cd my-project
stigmergy-cli deploy

# これでどのCLIでもツール間協働が可能に
claude-cli "geminiを使ってこのコードのパフォーマンスを最適化するのを手伝ってください"
```

### シナリオ2：チーム協働
```bash
# チーム共有プロジェクト設定
git clone team-project
cd team-project
stigmergy-cli init

# 全チームメンバーが同じ協働コンテキストを使用
gemini-cli "claudeを使ってこのモジュールのデザインパターンをチェックしてください"
```

### シナリオ3：多言語開発
```bash
# 異なるAIツールの専門性を補完
qwen-cli "copilotを使ってフロントエンドコンポーネントを生成してください"
iflow-cli "geminiにAPIドキュメントを作成させましょう"
```

## 🔧 開発環境設定

```bash
# プロジェクトクローン
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 依存関係インストール
npm install

# 開発モードで実行
npm run start
npm run status
npm run scan

# ビルドと公開
npm run build
npm run publish-to-npm
```

## 🚀 新バージョンリリース

```bash
# バージョン番号更新
npm version patch    # パッチバージョン
npm version minor    # マイナーバージョン
npm version major    # メジャーバージョン

# NPMに公開
npm run publish-to-npm

# 公開確認
npx stigmergy-cli --version
```

## 🛠️ トラブルシューティング

### 一般的な問題

1. **Node.jsバージョン非互換**
   ```bash
   # Node.js 16+を使用していることを確認
   node --version
   ```

2. **権限エラー**
   ```bash
   # 管理者権限を使用
   sudo npm install -g stigmergy-cli
   ```

3. **ネットワーク接続問題**
   ```bash
   # NPMミラー設定
   npm config set registry https://registry.npmmirror.com
   ```

4. **CLIツールインストール失敗**
   ```bash
   # 特定ツールを手動インストール
   npm install -g @anthropic-ai/claude-code
   ```

### デバッグモード

```bash
# 詳細デバッグ出力
DEBUG=stigmergy:* stigmergy-cli deploy

# ステータススキャンのみ
stigmergy-cli scan
```

## 📚 詳細情報

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM**: https://www.npmjs.com/package/stigmergy-cli
- **ドキュメント**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **問題フィードバック**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

## 🤝 貢献

プルリクエストとイシューの提出を歓迎します！

1. プロジェクトをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルをご覧ください。

---

**🎯 Stigmergy CLI - 真のCLI間協働により、各AIツールが最大の価値を発揮できるように！**