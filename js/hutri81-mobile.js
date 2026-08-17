/**
 * Mobile-native UX — PWA feel, bottom nav, safe areas, touch polish
 */
(function initHutri81Mobile() {
    const MOBILE_BP = 768;
    const isMobile = () => window.innerWidth <= MOBILE_BP;
    const isStandalone = () =>
        window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;

    function setViewportHeight() {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }

    function haptic(ms = 12) {
        if (navigator.vibrate) navigator.vibrate(ms);
    }

    function setMobileNavTab(tab) {
        document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
    }

    function closeAllPanels() {
        window.patriotismDashboard?.toggle(false);
        window.celebrateMerdeka?.toggle(false);
        document.getElementById('milestone-modal')?.classList.remove('active');
        window.hutri81Scene?.setPaused(false);
    }

    function initBottomNav() {
        const nav = document.getElementById('mobile-nav');
        if (!nav) return;

        nav.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                haptic(10);
                const tab = btn.dataset.tab;
                setMobileNavTab(tab);

                if (tab === 'explore') {
                    closeAllPanels();
                    document.getElementById('timeline-bar')?.classList.remove('expanded');
                    return;
                }

                if (tab === 'timeline') {
                    closeAllPanels();
                    const bar = document.getElementById('timeline-bar');
                    bar?.classList.add('expanded');
                    bar?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    document.getElementById('timeline-slider')?.focus({ preventScroll: true });
                    return;
                }

                if (tab === 'celebrate') {
                    document.getElementById('timeline-bar')?.classList.remove('expanded');
                    window.patriotismDashboard?.toggle(false);
                    window.celebrateMerdeka?.toggle(true);
                    return;
                }

                if (tab === 'dashboard') {
                    document.getElementById('timeline-bar')?.classList.remove('expanded');
                    window.celebrateMerdeka?.toggle(false);
                    window.patriotismDashboard?.toggle(true);
                }
            });
        });

        document.getElementById('dashboard-close')?.addEventListener('click', () => {
            setMobileNavTab('explore');
        });
        document.getElementById('celebrate-close')?.addEventListener('click', () => {
            setMobileNavTab('explore');
        });
        document.getElementById('modal-close')?.addEventListener('click', () => {
            setMobileNavTab('explore');
        });
    }

    function initInstructions() {
        const el = document.getElementById('instructions');
        if (!el) return;

        const hide = () => {
            el.classList.add('hidden');
        };

        setTimeout(hide, 8000);
        ['touchstart', 'click'].forEach((evt) => {
            document.addEventListener(evt, hide, { once: true, passive: true });
        });
    }

    function initModalSwipe() {
        const modal = document.getElementById('milestone-modal');
        const card = modal?.querySelector('.modal-card');
        if (!modal || !card) return;

        let startY = 0;
        let currentY = 0;

        card.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            currentY = startY;
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const dy = Math.max(0, currentY - startY);
            if (dy > 0) card.style.transform = `translateY(${dy}px)`;
        }, { passive: true });

        card.addEventListener('touchend', () => {
            const dy = currentY - startY;
            card.style.transform = '';
            if (dy > 80) {
                modal.classList.remove('active');
                window.hutri81Scene?.setPaused(false);
                setMobileNavTab('explore');
                haptic(8);
            }
        });
    }

    function initStandaloneBanner() {
        if (!isMobile() || isStandalone()) return;

        const dismissed = sessionStorage.getItem('hutri81_install_dismissed');
        if (dismissed) return;

        const banner = document.getElementById('install-banner');
        if (!banner) return;

        banner.hidden = false;
        banner.querySelector('.install-dismiss')?.addEventListener('click', () => {
            banner.hidden = true;
            sessionStorage.setItem('hutri81_install_dismissed', '1');
        });
    }

    function applyDeviceClasses() {
        document.documentElement.classList.toggle('is-mobile', isMobile());
        document.documentElement.classList.toggle('is-standalone', isStandalone());
    }

    document.addEventListener('DOMContentLoaded', () => {
        setViewportHeight();
        applyDeviceClasses();
        initBottomNav();
        initInstructions();
        initModalSwipe();
        initStandaloneBanner();

        window.addEventListener('resize', () => {
            setViewportHeight();
            applyDeviceClasses();
        });

        document.addEventListener('hutri:year-selected', () => haptic(15));
        document.addEventListener('hutri:milestone-flash', () => {
            if (isMobile()) setMobileNavTab('explore');
        });
    });

    window.hutri81Mobile = { haptic, setMobileNavTab, isMobile };
})();
