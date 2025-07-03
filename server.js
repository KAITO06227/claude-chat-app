const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Claude API プロキシエンドポイント
app.post('/api/claude', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'メッセージが必要です' });
    }

    // Claude API キーの確認
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Claude API キーが設定されていません。.env ファイルを確認してください。' 
      });
    }

    // Claude API に送信
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    // Claude からの応答を返す
    const claudeResponse = response.data.content[0].text;
    res.json({ response: claudeResponse });

  } catch (error) {
    console.error('Claude API エラー:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'API キーが無効です' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'API レート制限に達しました' });
    } else {
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 静的ファイルの提供
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 プロキシサーバーがポート ${PORT} で起動しました`);
  console.log(`📱 アプリケーション: http://localhost:${PORT}`);
  console.log(`🔧 ヘルスチェック: http://localhost:${PORT}/health`);
  
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('⚠️  CLAUDE_API_KEY が設定されていません。.env ファイルを作成してください。');
  }
});