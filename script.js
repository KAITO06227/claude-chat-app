class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // ユーザーメッセージを表示
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.sendButton.disabled = true;

        // タイピングインジケータを表示
        const typingIndicator = this.addTypingIndicator();

        try {
            // Claude APIにメッセージを送信
            const response = await this.sendToClaude(message);
            
            // タイピングインジケータを削除
            this.removeTypingIndicator(typingIndicator);
            
            // Claude の応答を表示
            this.addMessage(response, 'assistant');
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator(typingIndicator);
            this.addMessage('申し訳ございません。エラーが発生しました。', 'assistant');
        }

        this.sendButton.disabled = false;
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // スクロールを下に移動
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.textContent = 'Claude が入力中...';
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        return typingDiv;
    }

    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async sendToClaude(message) {
        try {
            const response = await fetch('/api/claude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Claude API エラー:', error);
            
            // エラーの種類に応じてメッセージを変更
            if (error.message.includes('API キーが無効')) {
                return 'APIキーが無効です。設定を確認してください。';
            } else if (error.message.includes('レート制限')) {
                return 'APIレート制限に達しました。少し待ってからもう一度お試しください。';
            } else {
                return '申し訳ございません。エラーが発生しました。プロキシサーバーが起動していることを確認してください。';
            }
        }
    }
}

// アプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});