/**
 * Kembang Merdeka — kembang api fullscreen, nyala provinsi, kartu momen
 */
class FireworksShow {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rockets = [];
        this.particles = [];
        this.sparks = [];
        this.active = false;
        this.raf = null;
        this.intensity = 'normal';
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start(intensity = 'normal') {
        this.intensity = intensity;
        this.rockets = [];
        this.particles = [];
        this.sparks = [];
        this.active = true;
        this.canvas.classList.add('active');

        const bursts = intensity === 'mega' ? 14 : 8;
        const gap = intensity === 'mega' ? 220 : 340;

        for (let i = 0; i < bursts; i++) {
            setTimeout(() => this.launchRocket(), i * gap);
        }

        if (intensity === 'mega') {
            setTimeout(() => this.confettiRain(160), bursts * gap * 0.6);
        }

        if (!this.raf) this.tick();
    }

    launchRocket() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.rockets.push({
            x: w * (0.15 + Math.random() * 0.7),
            y: h + 10,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -(7 + Math.random() * 4),
            targetY: h * (0.12 + Math.random() * 0.28),
            hue: Math.random() > 0.45 ? '#ce1126' : '#ffffff',
            trail: []
        });
        window.hutri81Mobile?.haptic(6);
    }

    explode(x, y, hue) {
        const count = this.intensity === 'mega' ? 90 : 60;
        const colors = [hue, '#ffffff', '#ffd700', '#ff4455', '#ffaaaa'];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.012 + Math.random() * 0.01,
                size: 2 + Math.random() * 2.5,
                color: colors[i % colors.length]
            });
        }

        for (let i = 0; i < 12; i++) {
            this.sparks.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                decay: 0.04,
                size: 1 + Math.random() * 2,
                color: '#ffd700'
            });
        }
    }

    confettiRain(count) {
        const colors = ['#ce1126', '#ffffff', '#ffd700', '#ff6666'];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -20 - Math.random() * 200,
                vx: (Math.random() - 0.5) * 3,
                vy: 2 + Math.random() * 4,
                life: 1,
                decay: 0.004,
                size: 4 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.05,
                isConfetti: true
            });
        }
    }

    tick() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Rockets
        this.rockets = this.rockets.filter((r) => {
            r.trail.push({ x: r.x, y: r.y });
            if (r.trail.length > 12) r.trail.shift();
            r.x += r.vx;
            r.y += r.vy;
            r.vy += 0.08;

            r.trail.forEach((t, i) => {
                ctx.globalAlpha = (i / r.trail.length) * 0.7;
                ctx.fillStyle = r.hue;
                ctx.beginPath();
                ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            if (r.y <= r.targetY || r.vy >= 0) {
                this.explode(r.x, r.y, r.hue);
                return false;
            }

            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
            ctx.fill();
            return true;
        });

        // Particles
        let alive = this.rockets.length;
        this.particles = this.particles.filter((p) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.isConfetti) {
                p.vy += p.gravity || 0.05;
            } else {
                p.vy += 0.04;
                p.vx *= 0.98;
            }
            p.life -= p.decay;
            if (p.life <= 0) return false;
            alive++;

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            if (p.isConfetti) {
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 4, p.size, p.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            }
            return true;
        });

        // Sparks
        this.sparks = this.sparks.filter((s) => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= s.decay;
            if (s.life <= 0) return false;
            alive++;
            ctx.globalAlpha = s.life;
            ctx.fillStyle = s.color;
            ctx.fillRect(s.x, s.y, s.size, s.size);
            return true;
        });

        ctx.globalAlpha = 1;

        if (alive > 0 || this.active) {
            this.raf = requestAnimationFrame(() => this.tick());
        } else {
            this.raf = null;
            this.canvas.classList.remove('active');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    stop() {
        this.active = false;
        setTimeout(() => {
            if (this.rockets.length === 0 && this.particles.length === 0) {
                this.canvas.classList.remove('active');
            }
        }, 5000);
    }
}

class CelebrateMerdeka {
    constructor() {
        this.storageKey = 'hutri81_celebrate';
        this.litProvinces = this.loadLit();
        this.momentIndex = 0;
        this.launchCount = parseInt(localStorage.getItem('hutri81_launches') || '0', 10);

        this.elements = {
            panel: document.getElementById('celebrate-panel'),
            toggle: document.getElementById('celebrate-toggle'),
            close: document.getElementById('celebrate-close'),
            launchBtn: document.getElementById('celebrate-launch'),
            megaBtn: document.getElementById('celebrate-mega'),
            provinceGrid: document.getElementById('celebrate-province-grid'),
            progress: document.getElementById('celebrate-progress'),
            progressFill: document.getElementById('celebrate-progress-fill'),
            launchCount: document.getElementById('celebrate-count'),
            momentCard: document.getElementById('moment-card'),
            momentEmoji: document.getElementById('moment-emoji'),
            momentTitle: document.getElementById('moment-title'),
            momentFact: document.getElementById('moment-fact'),
            momentPrev: document.getElementById('moment-prev'),
            momentNext: document.getElementById('moment-next'),
            flash: document.getElementById('celebration-flash'),
            toast: document.getElementById('celebration-toast')
        };

        const canvas = document.getElementById('confetti-canvas');
        this.fireworks = canvas ? new FireworksShow(canvas) : null;

        this.renderProvinceGrid();
        this.renderMoment();
        this.updateProgress();
        this.bindEvents();
    }

    loadLit() {
        try {
            return new Set(JSON.parse(localStorage.getItem(this.storageKey)) || []);
        } catch {
            return new Set();
        }
    }

    saveLit() {
        localStorage.setItem(this.storageKey, JSON.stringify([...this.litProvinces]));
    }

    bindEvents() {
        this.elements.toggle?.addEventListener('click', () => this.toggle(true));
        this.elements.close?.addEventListener('click', () => this.toggle(false));
        document.getElementById('btn-open-celebrate')?.addEventListener('click', () => this.toggle(true));

        this.elements.launchBtn?.addEventListener('click', () => this.launch('normal'));
        this.elements.megaBtn?.addEventListener('click', () => this.launchMegaAll());

        this.elements.momentPrev?.addEventListener('click', () => this.cycleMoment(-1));
        this.elements.momentNext?.addEventListener('click', () => this.cycleMoment(1));

        document.addEventListener('hutri:celebration-launched', () => {
            this.launchCount++;
            localStorage.setItem('hutri81_launches', String(this.launchCount));
            if (this.elements.launchCount) {
                this.elements.launchCount.textContent = this.launchCount;
            }
        });
    }

    toggle(force) {
        const open = force !== undefined ? force : !this.elements.panel?.classList.contains('open');
        this.elements.panel?.classList.toggle('open', open);
        window.hutri81Mobile?.setMobileNavTab(open ? 'celebrate' : 'explore');
    }

    showToast(message) {
        const toast = this.elements.toast;
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
    }

    flashScreen() {
        const flash = this.elements.flash;
        if (!flash) return;
        flash.classList.remove('pulse');
        void flash.offsetWidth;
        flash.classList.add('pulse');
    }

    launch(intensity) {
        // Tutup panel agar kembang api terlihat di globe
        this.toggle(false);
        document.getElementById('milestone-modal')?.classList.remove('active');
        window.hutri81Mobile?.setMobileNavTab('explore');
        window.hutri81Scene?.setPaused(false);

        this.flashScreen();
        this.fireworks?.start(intensity);
        window.hutri81Scene?.launchMerdekaShow(intensity);

        const msg = intensity === 'mega' ? '🇮🇩 Mega Dirgahayu!' : '🎆 Dirgahayu Merdeka!';
        this.showToast(msg);
        window.hutri81Mobile?.haptic(intensity === 'mega' ? [20, 40, 20] : [15, 30]);

        this.elements.launchBtn?.classList.add('fired');
        setTimeout(() => this.elements.launchBtn?.classList.remove('fired'), 700);
    }

    launchMegaAll() {
        HUTRI81_PROVINCES.forEach((p) => this.litProvinces.add(p.id));
        this.saveLit();
        this.renderProvinceGrid();
        this.updateProgress();
        this.launch('mega');
    }

    renderProvinceGrid() {
        if (!this.elements.provinceGrid) return;
        this.elements.provinceGrid.innerHTML = HUTRI81_PROVINCES.map((p) => {
            const lit = this.litProvinces.has(p.id);
            return `<button type="button" class="celebrate-province ${lit ? 'lit' : ''}" data-id="${p.id}" data-lat="${p.lat}" data-lon="${p.lon}" title="${p.name}">
                <span class="prov-dot"></span>
                <span class="prov-name">${p.name}</span>
            </button>`;
        }).join('');

        this.elements.provinceGrid.querySelectorAll('.celebrate-province').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (this.litProvinces.has(id)) return;
                this.litProvinces.add(id);
                btn.classList.add('lit');
                this.saveLit();
                this.updateProgress();
                window.hutri81Scene?.launchProvinceSpark(parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lon));
                this.fireworks?.launchRocket();
                window.hutri81Mobile?.haptic(8);
                if (this.litProvinces.size === HUTRI81_PROVINCES.length) {
                    setTimeout(() => this.launch('mega'), 500);
                }
            });
        });
    }

    updateProgress() {
        const n = this.litProvinces.size;
        const total = HUTRI81_PROVINCES.length;
        const pct = (n / total) * 100;
        if (this.elements.progress) {
            this.elements.progress.textContent = `Nyala Nusantara: ${n}/${total} provinsi`;
        }
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${pct}%`;
        }
        if (this.elements.launchCount) {
            this.elements.launchCount.textContent = this.launchCount;
        }
    }

    renderMoment() {
        const m = CELEBRATION_MOMENTS[this.momentIndex];
        if (!m) return;
        if (this.elements.momentEmoji) this.elements.momentEmoji.textContent = m.emoji;
        if (this.elements.momentTitle) this.elements.momentTitle.textContent = m.title;
        if (this.elements.momentFact) this.elements.momentFact.textContent = m.fact;
        this.elements.momentCard?.classList.remove('slide-in');
        void this.elements.momentCard?.offsetWidth;
        this.elements.momentCard?.classList.add('slide-in');
    }

    cycleMoment(dir) {
        this.momentIndex = (this.momentIndex + dir + CELEBRATION_MOMENTS.length) % CELEBRATION_MOMENTS.length;
        this.renderMoment();
        window.hutri81Mobile?.haptic(6);
    }
}
