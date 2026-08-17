/**
 * Dashboard Patriotisme Real-Time — HUT RI 81
 */
class PatriotismDashboard {
    constructor() {
        this.storageKey = 'hutri81_dashboard';
        this.data = this.loadData();
        this.elements = {
            panel: document.getElementById('dashboard-panel'),
            toggle: document.getElementById('dashboard-toggle'),
            close: document.getElementById('dashboard-close'),
            totalGreetings: document.getElementById('stat-greetings'),
            totalVisitors: document.getElementById('stat-visitors'),
            hashtagCount: document.getElementById('stat-hashtag'),
            provinceGrid: document.getElementById('province-grid'),
            greetingForm: document.getElementById('greeting-form'),
            greetingName: document.getElementById('greeting-name'),
            greetingProvince: document.getElementById('greeting-province'),
            greetingMessage: document.getElementById('greeting-message'),
            feed: document.getElementById('greeting-feed'),
            liveIndicator: document.getElementById('live-indicator')
        };

        this.initProvinces();
        this.bindEvents();
        this.render();
        this.startLiveSimulation();
        this.trackVisitor();
    }

    loadData() {
        const defaults = {
            greetings: [],
            provinceCounts: {},
            visitors: 1247,
            hashtagPosts: 8432
        };
        try {
            const saved = JSON.parse(localStorage.getItem(this.storageKey));
            return { ...defaults, ...saved };
        } catch {
            return defaults;
        }
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    initProvinces() {
        HUTRI81_PROVINCES.forEach((p) => {
            if (!this.data.provinceCounts[p.id]) {
                this.data.provinceCounts[p.id] = Math.floor(Math.random() * 80) + 20;
            }
        });
        if (this.elements.greetingProvince) {
            this.elements.greetingProvince.innerHTML = HUTRI81_PROVINCES.map(
                (p) => `<option value="${p.id}">${p.name}</option>`
            ).join('');
        }
    }

    bindEvents() {
        this.elements.toggle?.addEventListener('click', () => this.toggle());
        this.elements.close?.addEventListener('click', () => this.toggle(false));
        this.elements.greetingForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitGreeting();
        });

        document.addEventListener('hutri:year-selected', () => {
            this.pulseLive();
        });
    }

    toggle(force) {
        const open = force !== undefined ? force : !this.elements.panel?.classList.contains('open');
        this.elements.panel?.classList.toggle('open', open);
    }

    trackVisitor() {
        const visited = sessionStorage.getItem('hutri81_visited');
        if (!visited) {
            this.data.visitors += 1;
            sessionStorage.setItem('hutri81_visited', '1');
            this.saveData();
        }
    }

    submitGreeting() {
        const name = this.elements.greetingName?.value.trim() || 'Warga Indonesia';
        const provinceId = this.elements.greetingProvince?.value || 'jakarta';
        const message = this.elements.greetingMessage?.value.trim()
            || 'Dirgahayu Republik Indonesia ke-81! Merdeka!';

        const province = HUTRI81_PROVINCES.find((p) => p.id === provinceId);
        const greeting = {
            id: Date.now(),
            name,
            province: province?.name || provinceId,
            message,
            time: new Date().toISOString()
        };

        this.data.greetings.unshift(greeting);
        if (this.data.greetings.length > 50) this.data.greetings.pop();
        this.data.provinceCounts[provinceId] = (this.data.provinceCounts[provinceId] || 0) + 1;
        this.data.hashtagPosts += 1;
        this.saveData();
        this.render();
        this.pulseLive();

        this.elements.greetingForm?.reset();
        document.dispatchEvent(new CustomEvent('hutri:greeting-added', { detail: greeting }));
    }

    startLiveSimulation() {
        setInterval(() => {
            if (Math.random() > 0.6) {
                const province = HUTRI81_PROVINCES[Math.floor(Math.random() * HUTRI81_PROVINCES.length)];
                this.data.provinceCounts[province.id] = (this.data.provinceCounts[province.id] || 0) + 1;
                this.data.hashtagPosts += Math.floor(Math.random() * 3) + 1;
                this.data.visitors += Math.random() > 0.7 ? 1 : 0;
                this.saveData();
                this.renderStats();
                this.renderProvinceGrid();
            }
        }, 4000);

        setInterval(() => this.pulseLive(), 2000);
    }

    pulseLive() {
        this.elements.liveIndicator?.classList.add('pulse');
        setTimeout(() => this.elements.liveIndicator?.classList.remove('pulse'), 800);
    }

    renderStats() {
        const totalGreetings = Object.values(this.data.provinceCounts).reduce((a, b) => a + b, 0);
        this.animateNumber(this.elements.totalGreetings, totalGreetings);
        this.animateNumber(this.elements.totalVisitors, this.data.visitors);
        this.animateNumber(this.elements.hashtagCount, this.data.hashtagPosts);
    }

    animateNumber(el, target) {
        if (!el) return;
        const current = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
        const step = Math.max(1, Math.ceil(Math.abs(target - current) / 10));
        if (current < target) {
            el.textContent = this.formatNumber(Math.min(current + step, target));
            requestAnimationFrame(() => this.animateNumber(el, target));
        } else if (current > target) {
            el.textContent = this.formatNumber(Math.max(current - step, target));
        } else {
            el.textContent = this.formatNumber(target);
        }
    }

    formatNumber(n) {
        return n.toLocaleString('id-ID');
    }

    renderProvinceGrid() {
        if (!this.elements.provinceGrid) return;
        const max = Math.max(...Object.values(this.data.provinceCounts), 1);

        this.elements.provinceGrid.innerHTML = HUTRI81_PROVINCES.map((p) => {
            const count = this.data.provinceCounts[p.id] || 0;
            const intensity = count / max;
            const heat = intensity > 0.7 ? 'hot' : intensity > 0.4 ? 'warm' : 'cool';
            return `
                <div class="province-cell ${heat}" title="${p.name}: ${count} ucapan" data-province="${p.id}">
                    <span class="province-abbr">${p.name.substring(0, 3).toUpperCase()}</span>
                    <span class="province-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    renderFeed() {
        if (!this.elements.feed) return;
        const items = this.data.greetings.slice(0, 8);
        if (items.length === 0) {
            this.elements.feed.innerHTML = '<p class="feed-empty">Jadilah yang pertama mengirim ucapan Dirgahayu! 🇮🇩</p>';
            return;
        }
        this.elements.feed.innerHTML = items.map((g) => `
            <div class="feed-item">
                <div class="feed-meta">
                    <strong>${this.escapeHtml(g.name)}</strong>
                    <span>${this.escapeHtml(g.province)}</span>
                    <time>${this.formatTime(g.time)}</time>
                </div>
                <p>${this.escapeHtml(g.message)}</p>
            </div>
        `).join('');
    }

    formatTime(iso) {
        try {
            return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    render() {
        this.renderStats();
        this.renderProvinceGrid();
        this.renderFeed();
    }
}
