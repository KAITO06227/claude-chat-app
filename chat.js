class ChatApp {
    constructor() {
        this.currentSessionId = this.getSessionIdFromUrl();
        this.sessions = JSON.parse(localStorage.getItem('claudeSessions') || '[]');
        this.currentSession = this.getCurrentSession();
        
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.sessionTitle = document.getElementById('sessionTitle');
        this.backButton = document.getElementById('backButton');
        
        this.initializeEventListeners();
        this.loadSessionMessages();
        this.updateSessionTitle();
    }

    getSessionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('session');
    }

    getCurrentSession() {
        if (!this.currentSessionId) {
            // セッションIDがない場合は新しいセッションを作成
            this.createDefaultSession();
            return this.sessions[0];
        }
        
        const session = this.sessions.find(s => s.id === this.currentSessionId);
        if (!session) {
            // セッションが見つからない場合はホームに戻る
            window.location.href = 'home.html';
            return null;
        }
        
        return session;
    }

    createDefaultSession() {
        const session = {
            id: this.generateSessionId(),
            name: 'クイックチャット',
            description: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 0,
            messages: []
        };
        
        this.sessions.unshift(session);
        this.saveSessions();
        this.currentSessionId = session.id;
        
        // URLを更新
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('session', session.id);
        window.history.replaceState({}, '', newUrl);
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveSessions() {
        localStorage.setItem('claudeSessions', JSON.stringify(this.sessions));
    }

    updateSessionTitle() {
        if (this.currentSession) {
            this.sessionTitle.textContent = this.currentSession.name;
        }
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        this.backButton.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }

    loadSessionMessages() {
        if (!this.currentSession || !this.currentSession.messages) return;

        // 既存のメッセージをクリア（初期メッセージ以外）
        this.chatMessages.innerHTML = `
            <div class="message assistant-message">
                <div class="message-content">
                    こんにちは！Claude です。何でもお聞きください。
                </div>
            </div>
        `;

        // セッションのメッセージを復元
        this.currentSession.messages.forEach(message => {
            this.addMessageToUI(message.content, message.sender);
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // ユーザーメッセージを表示
        this.addMessageToUI(message, 'user');
        this.addMessageToSession(message, 'user');
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
            this.addMessageToUI(response, 'assistant');
            this.addMessageToSession(response, 'assistant');
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator(typingIndicator);
            this.addMessageToUI('申し訳ございません。エラーが発生しました。', 'assistant');
        }

        this.sendButton.disabled = false;
        this.updateSessionMetadata();
    }

    addMessageToUI(content, sender) {
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

    addMessageToSession(content, sender) {
        if (!this.currentSession) return;

        const message = {
            id: Date.now(),
            content: content,
            sender: sender,
            timestamp: new Date().toISOString()
        };

        if (!this.currentSession.messages) {
            this.currentSession.messages = [];
        }

        this.currentSession.messages.push(message);
        this.saveSessions();
    }

    updateSessionMetadata() {
        if (!this.currentSession) return;

        this.currentSession.messageCount = this.currentSession.messages ? this.currentSession.messages.length : 0;
        this.currentSession.updatedAt = new Date().toISOString();
        this.saveSessions();
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