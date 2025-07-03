# Claude Chat Web App

ClaudeとのシンプルなチャットコミュニケーションができるWebアプリケーションです。Dockerを使用してプロキシサーバーを簡単に起動できます。

## 機能

- リアルタイムチャットUI
- レスポンシブデザイン
- タイピングインジケータ
- 日本語対応
- Docker対応プロキシサーバー
- 実際のClaude API統合
- 複数セッション管理
- セッションの永続化（localStorage）
- セッション作成・削除・名前変更

## ファイル構成

```
├── home.html            # ホームページ（セッション一覧）
├── home.css             # ホームページスタイル
├── home.js              # ホームページ機能
├── chat.html            # チャットページ
├── chat.js              # チャット機能
├── style.css            # チャットページスタイル
├── server.js            # Express.jsプロキシサーバー
├── package.json         # Node.js依存関係
├── Dockerfile           # Dockerイメージ設定
├── docker-compose.yml   # Docker Compose設定
├── .env.example         # 環境変数テンプレート
├── index.html           # 旧チャットページ（互換性のため）
├── script.js            # 旧チャット機能（互換性のため）
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

1. ブラウザで `http://localhost:3000` を開く（ホームページが表示されます）
2. 「新しいセッション」ボタンをクリックしてセッションを作成
3. セッション名と説明を入力して「作成」をクリック
4. チャットページでClaude と会話
5. 「ホーム」ボタンでセッション一覧に戻る

### セッション管理
- **新規作成**: ホームページで「新しいセッション」をクリック
- **会話開始**: セッションカードをクリック
- **名前変更**: セッションカードの「⋮」メニューから「名前を変更」
- **削除**: セッションカードの「⋮」メニューから「削除」

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

- `GET /` - ホームページ（セッション一覧）
- `GET /chat` - チャットページ
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