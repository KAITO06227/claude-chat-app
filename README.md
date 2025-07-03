# Claude Chat Web App

ClaudeとのシンプルなチャットコミュニケーションができるWebアプリケーションです。Dockerを使用してプロキシサーバーを簡単に起動できます。

## 機能

- リアルタイムチャットUI
- レスポンシブデザイン
- タイピングインジケータ
- 日本語対応
- Docker対応プロキシサーバー
- 実際のClaude API統合

## ファイル構成

```
├── index.html           # メインHTMLファイル
├── style.css            # スタイルシート
├── script.js            # JavaScript機能
├── server.js            # Express.jsプロキシサーバー
├── package.json         # Node.js依存関係
├── Dockerfile           # Dockerイメージ設定
├── docker-compose.yml   # Docker Compose設定
├── .env.example         # 環境変数テンプレート
└── README.md            # このファイル
```

## セットアップ

### 1. 環境変数の設定

`.env.example`を`.env`にコピーし、Claude APIキーを設定：

```bash
cp .env.example .env
```

`.env`ファイルを編集してAPIキーを設定：
```
CLAUDE_API_KEY=your_actual_api_key_here
```

### 2. Dockerを使用した起動

```bash
# Docker Composeでアプリケーションを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

### 3. ローカル開発（Node.jsを直接使用）

```bash
# 依存関係をインストール
npm install

# サーバーを起動
npm start

# または開発モードで起動
npm run dev
```

## 使用方法

1. ブラウザで `http://localhost:3000` を開く
2. メッセージを入力してEnterキーまたは送信ボタンをクリック
3. Claudeからの応答を待つ

## Docker コマンド

```bash
# アプリケーションを起動
docker-compose up -d

# 開発モードで起動
docker-compose --profile dev up -d

# アプリケーションを停止
docker-compose down

# ログを確認
docker-compose logs -f

# イメージを再ビルド
docker-compose build --no-cache
```

## API エンドポイント

- `GET /` - チャットアプリケーション
- `POST /api/claude` - Claude APIプロキシ
- `GET /health` - ヘルスチェック

## 技術仕様

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **バックエンド**: Node.js, Express.js
- **API統合**: Anthropic Claude API
- **コンテナ**: Docker, Docker Compose
- **セキュリティ**: CORS対応、非rootユーザー実行

## トラブルシューティング

### APIキーエラー
- `.env`ファイルが存在し、正しいAPIキーが設定されていることを確認
- Anthropic Console (https://console.anthropic.com/) でAPIキーを確認

### プロキシエラー
- Docker Composeサービスが起動していることを確認: `docker-compose ps`
- ログを確認: `docker-compose logs claude-chat`

### ポートエラー
- ポート3000が他のアプリケーションで使用されていないことを確認
- `docker-compose.yml`でポート番号を変更可能