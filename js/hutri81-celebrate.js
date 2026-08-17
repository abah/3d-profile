/**
 * Kembang Merdeka — interaksi rayakan: kembang api 3D, nyala provinsi, kartu momen
 */
class ConfettiBurst {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.active = false;
        this.raf = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    burst(count = 120) {
        const colors = ['#ce1126', '#ffffff', '#ff4455', '#ffd700', '#ff6666'];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -20 - Math.random() * 100,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 4 + 2,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.2,
                life: 1
            });
        }
        if (!this.active) {
            this.active = true;
            this.tick();
        }
    }

    tick() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let alive = 0;
        this.particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.rot += p.spin;
            p.life -= 0.006;
            if (p.life <= 0) return;
            alive++;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rot);
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            this.ctx.restore();
        });
        this.particles = this.particles.filter((p) => p.life > 0);
        if (alive > 0) {
            this.raf = requestAnimationFrame(() => this.tick());
        } else {
            this.active = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
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
            momentNext: document.getElementById('moment-next')
        };

        const confettiCanvas = document.getElementById('confetti-canvas');
        this.confetti = confettiCanvas ? new ConfettiBurst(confettiCanvas) : null;

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
        this.elements.megaBtn?.addEventListener('click', () => this.launch('mega'));

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

    launch(intensity) {
        window.hutri81Scene?.launchMerdekaShow(intensity);
        this.confetti?.burst(intensity === 'mega' ? 200 : 100);
        window.hutri81Mobile?.haptic(intensity === 'mega' ? 25 : 15);
        this.elements.launchBtn?.classList.add('fired');
        setTimeout(() => this.elements.launchBtn?.classList.remove('fired'), 600);
    }

    renderProvinceGrid() {
        if (!this.elements.provinceGrid) return;
        this.elements.provinceGrid.innerHTML = HUTRI81_PROVINCES.map((p) => {
            const lit = this.litProvinces.has(p.id);
            return `<button type="button" class="celebrate-province ${lit ? 'lit' : ''}" data-id="${p.id}" data-lat="${p.lat}" data-lon="${p.lon}" title="${p.name}">
                <span class="prov-abbr">${p.name.slice(0, 3).toUpperCase()}</span>
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
                window.hutri81Mobile?.haptic(8);
                if (this.litProvinces.size === HUTRI81_PROVINCES.length) {
                    setTimeout(() => this.launch('mega'), 400);
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
