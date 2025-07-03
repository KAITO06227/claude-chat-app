class SessionManager {
    constructor() {
        this.sessions = JSON.parse(localStorage.getItem('claudeSessions') || '[]');
        this.initializeEventListeners();
        this.loadSessions();
    }

    initializeEventListeners() {
        // 新しいセッションボタン
        document.getElementById('newSessionBtn').addEventListener('click', () => {
            this.showNewSessionModal();
        });

        // モーダル関連
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideNewSessionModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideNewSessionModal();
        });

        document.getElementById('newSessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewSession();
        });

        // モーダル外クリックで閉じる
        document.getElementById('newSessionModal').addEventListener('click', (e) => {
            if (e.target.id === 'newSessionModal') {
                this.hideNewSessionModal();
            }
        });
    }

    showNewSessionModal() {
        const modal = document.getElementById('newSessionModal');
        modal.classList.add('show');
        document.getElementById('sessionName').focus();
    }

    hideNewSessionModal() {
        const modal = document.getElementById('newSessionModal');
        modal.classList.remove('show');
        document.getElementById('newSessionForm').reset();
    }

    createNewSession() {
        const name = document.getElementById('sessionName').value.trim();
        const description = document.getElementById('sessionDescription').value.trim();

        if (!name) {
            alert('セッション名を入力してください');
            return;
        }

        const session = {
            id: this.generateSessionId(),
            name: name,
            description: description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 0,
            messages: []
        };

        this.sessions.unshift(session);
        this.saveSessions();
        this.loadSessions();
        this.hideNewSessionModal();

        // 新しいセッションに移動
        this.openSession(session.id);
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveSessions() {
        localStorage.setItem('claudeSessions', JSON.stringify(this.sessions));
    }

    loadSessions() {
        const sessionsList = document.getElementById('sessionsList');
        
        if (this.sessions.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-state">
                    <h3>セッションがありません</h3>
                    <p>新しいセッションを作成してClaudeと会話を始めましょう</p>
                </div>
            `;
            return;
        }

        sessionsList.innerHTML = this.sessions.map(session => {
            const createdDate = new Date(session.createdAt).toLocaleDateString('ja-JP');
            const updatedDate = new Date(session.updatedAt).toLocaleDateString('ja-JP');
            
            return `
                <div class="session-card" data-session-id="${session.id}">
                    <div class="session-header">
                        <h3 class="session-name">${this.escapeHtml(session.name)}</h3>
                        <div class="dropdown">
                            <button class="session-menu" onclick="this.nextElementSibling.classList.toggle('show')">⋮</button>
                            <div class="dropdown-menu">
                                <button class="dropdown-item" onclick="sessionManager.renameSession('${session.id}')">
                                    名前を変更
                                </button>
                                <button class="dropdown-item danger" onclick="sessionManager.deleteSession('${session.id}')">
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                    ${session.description ? `<p class="session-description">${this.escapeHtml(session.description)}</p>` : ''}
                    <div class="session-meta">
                        <span class="session-date">📅 ${createdDate}</span>
                        <span class="session-messages">💬 ${session.messageCount}件</span>
                    </div>
                </div>
            `;
        }).join('');

        // セッションカードのクリックイベントを追加
        document.querySelectorAll('.session-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // ドロップダウンメニューのクリックは無視
                if (e.target.closest('.dropdown')) return;
                
                const sessionId = card.dataset.sessionId;
                this.openSession(sessionId);
            });
        });

        // ドロップダウンメニューの外側クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
    }

    openSession(sessionId) {
        // セッションIDをURLパラメータに設定してチャットページに移動
        window.location.href = `chat.html?session=${sessionId}`;
    }

    renameSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const newName = prompt('新しいセッション名を入力してください:', session.name);
        if (newName && newName.trim() !== session.name) {
            session.name = newName.trim();
            session.updatedAt = new Date().toISOString();
            this.saveSessions();
            this.loadSessions();
        }
    }

    deleteSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        if (confirm(`セッション「${session.name}」を削除してもよろしいですか？`)) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.saveSessions();
            this.loadSessions();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// セッションマネージャーを初期化
const sessionManager = new SessionManager();