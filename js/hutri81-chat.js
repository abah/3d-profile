/**
 * Merdeka Talk — AI Host HUT RI 81
 * Mendukung Gemini API (opsional) + knowledge base lokal
 */
class MerdekaTalk {
    constructor() {
        this.messages = [];
        this.apiKey = localStorage.getItem('hutri81_gemini_key') || '';
        this.isOpen = false;
        this.isTyping = false;

        this.elements = {
            toggle: document.getElementById('chat-toggle'),
            panel: document.getElementById('chat-panel'),
            close: document.getElementById('chat-close'),
            messages: document.getElementById('chat-messages'),
            input: document.getElementById('chat-input'),
            send: document.getElementById('chat-send'),
            voice: document.getElementById('chat-voice'),
            settings: document.getElementById('chat-settings-btn'),
            settingsPanel: document.getElementById('chat-settings'),
            apiKeyInput: document.getElementById('gemini-api-key'),
            saveKey: document.getElementById('save-api-key')
        };

        this.bindEvents();
        this.addBotMessage(
            'Selamat datang! Saya MC Merdeka Talk 🇮🇩 — tanya sejarah, Pancasila, trivia HUT RI, atau minta ucapan Dirgahayu. Ketik pertanyaan Anda!'
        );
    }

    bindEvents() {
        this.elements.toggle?.addEventListener('click', () => this.toggle());
        this.elements.close?.addEventListener('click', () => this.toggle(false));
        this.elements.send?.addEventListener('click', () => this.send());
        this.elements.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.send();
            }
        });
        this.elements.voice?.addEventListener('click', () => this.toggleVoice());
        this.elements.settings?.addEventListener('click', () => {
            this.elements.settingsPanel?.classList.toggle('open');
            if (this.elements.apiKeyInput) {
                this.elements.apiKeyInput.value = this.apiKey;
            }
        });
        this.elements.saveKey?.addEventListener('click', () => {
            this.apiKey = this.elements.apiKeyInput?.value.trim() || '';
            if (this.apiKey) {
                localStorage.setItem('hutri81_gemini_key', this.apiKey);
            } else {
                localStorage.removeItem('hutri81_gemini_key');
            }
            this.elements.settingsPanel?.classList.remove('open');
            this.addBotMessage(
                this.apiKey
                    ? 'Kunci API Gemini disimpan untuk mode lokal.'
                    : 'Merdeka Talk siap. Tanya sejarah, Pancasila, atau trivia HUT RI!'
            );
        });

        document.querySelectorAll('.chat-quick-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.elements.input.value = btn.dataset.question || '';
                this.send();
            });
        });
    }

    toggle(force) {
        this.isOpen = force !== undefined ? force : !this.isOpen;
        this.elements.panel?.classList.toggle('open', this.isOpen);
        if (this.isOpen) this.elements.input?.focus();
    }

    addMessage(text, role) {
        const div = document.createElement('div');
        div.className = `chat-msg chat-msg-${role}`;
        div.innerHTML = role === 'bot'
            ? `<div class="chat-avatar">🇮🇩</div><div class="chat-bubble">${this.escapeHtml(text)}</div>`
            : `<div class="chat-bubble">${this.escapeHtml(text)}</div>`;
        this.elements.messages?.appendChild(div);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        this.messages.push({ role, text });
    }

    addBotMessage(text) {
        this.addMessage(text, 'bot');
    }

    addUserMessage(text) {
        this.addMessage(text, 'user');
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    showTyping(show) {
        this.isTyping = show;
        let el = document.getElementById('chat-typing');
        if (show && !el) {
            el = document.createElement('div');
            el.id = 'chat-typing';
            el.className = 'chat-msg chat-msg-bot chat-typing';
            el.innerHTML = '<div class="chat-avatar">🇮🇩</div><div class="chat-bubble"><span></span><span></span><span></span></div>';
            this.elements.messages?.appendChild(el);
        } else if (!show && el) {
            el.remove();
        }
        if (this.elements.messages) {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    }

    localAnswer(query) {
        const q = query.toLowerCase();
        for (const entry of MERDEKA_TALK_KB) {
            if (entry.keywords.some((kw) => q.includes(kw))) {
                return entry.answer;
            }
        }
        if (q.includes('halo') || q.includes('hai') || q.includes('selamat')) {
            return 'Dirgahayu! 🇮🇩 Selamat HUT Republik Indonesia ke-81. Ada yang ingin Anda tanyakan tentang sejarah, Pancasila, atau Indonesia?';
        }
        return 'Maaf, saya belum punya jawaban spesifik untuk itu. Coba tanya tentang: Proklamasi 1945, Pancasila, Bendera Merah-Putih, Garuda Pancasila, IKN, atau minta ucapan HUT RI. Atur kunci API Gemini di ⚙️ untuk jawaban AI lebih lengkap.';
    }

    async askCloudflareApi(query) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.answer) {
            return { answer: data.answer, source: 'cloudflare' };
        }

        if (data.useLocal) {
            return { answer: this.localAnswer(query), source: 'local', note: data.error };
        }

        throw new Error(data.error || 'API chat gagal');
    }

    async askGemini(query) {
        const systemPrompt = `Kamu adalah MC virtual Merdeka Talk untuk HUT Republik Indonesia ke-81 (17 Agustus 2026). 
Jawab dalam Bahasa Indonesia, hangat, patriotik tapi tidak berlebihan. 
Fokus: sejarah kemerdekaan, Pancasila, budaya Nusantara, capaian teknologi Indonesia, dan trivia HUT RI.
Jawaban maksimal 3 paragraf pendek.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nPertanyaan pengguna: ${query}` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 512
                }
            })
        });

        if (!response.ok) throw new Error('Gemini API error');
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || this.localAnswer(query);
    }

    async send() {
        const text = this.elements.input?.value.trim();
        if (!text || this.isTyping) return;

        this.addUserMessage(text);
        this.elements.input.value = '';
        this.showTyping(true);

        try {
            let answer;
            let usedLocal = false;

            try {
                const result = await this.askCloudflareApi(text);
                answer = result.answer;
                usedLocal = result.source === 'local';
            } catch {
                if (this.apiKey) {
                    try {
                        answer = await this.askGemini(text);
                    } catch {
                        answer = this.localAnswer(text);
                        usedLocal = true;
                    }
                } else {
                    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
                    answer = this.localAnswer(text);
                    usedLocal = true;
                }
            }

            this.showTyping(false);
            if (usedLocal && this.apiKey) {
                answer += '\n\n_(Menggunakan knowledge base lokal)_';
            }
            this.addBotMessage(answer);
            this.speak(answer.split('\n')[0].replace(/_/g, ''));
        } catch {
            this.showTyping(false);
            this.addBotMessage('Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    toggleVoice() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.addBotMessage('Browser Anda tidak mendukung input suara. Gunakan ketikan saja.');
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.onresult = (e) => {
            this.elements.input.value = e.results[0][0].transcript;
            this.send();
        };
        recognition.onerror = () => {
            this.addBotMessage('Tidak dapat mendengar suara. Periksa izin mikrofon.');
        };
        recognition.start();
        this.elements.voice?.classList.add('listening');
        recognition.onend = () => this.elements.voice?.classList.remove('listening');
    }

    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text.replace(/[_*#]/g, ''));
        utter.lang = 'id-ID';
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
    }
}
