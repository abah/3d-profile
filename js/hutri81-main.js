/**
 * HUT RI 81 — Main orchestrator
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hutri-canvas');
    const loading = document.getElementById('loading');
    const modal = document.getElementById('milestone-modal');
    const modalClose = document.getElementById('modal-close');
    const timelineSlider = document.getElementById('timeline-slider');
    const timelineYear = document.getElementById('timeline-year');
    const timelineHut = document.getElementById('timeline-hut');
    const timelineLabel = document.getElementById('timeline-label');
    const floatingMotto = document.getElementById('floating-motto');

    let scene = null;
    let mottoCelebrateTimer = null;

    function showMilestoneModal(milestone) {
        document.getElementById('modal-year').textContent = milestone.year;
        document.getElementById('modal-tahun-ke').textContent = formatHutLabel(milestone.year);
        document.getElementById('modal-title').textContent = milestone.title;
        document.getElementById('modal-place').textContent = milestone.place;
        document.getElementById('modal-category').textContent =
            HUTRI81_CATEGORY_LABELS[milestone.category] || HUTRI81_CATEGORY_LABELS.default;
        document.getElementById('modal-description').textContent = milestone.description;

        if (timelineSlider) timelineSlider.value = milestone.year;
        updateTimelineUI(milestone.year);

        modal?.classList.add('active');
        floatingMotto?.classList.add('is-dimmed');
        scene?.setPaused(true);
        window.hutri81Mobile?.haptic(12);
        window.hutri81Mobile?.setMobileNavTab('explore');
    }

    function hideModal() {
        modal?.classList.remove('active');
        floatingMotto?.classList.remove('is-dimmed');
        scene?.setPaused(false);
    }

    modalClose?.addEventListener('click', hideModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    function updateTimelineUI(year) {
        const m = HUTRI81_MILESTONES.find((x) => x.year === year);
        if (timelineYear) timelineYear.textContent = year;
        if (timelineHut) timelineHut.textContent = formatHutLabel(year);
        if (timelineLabel && m) timelineLabel.textContent = m.title;
    }

    if (timelineSlider) {
        timelineSlider.min = HUTRI81_PROCLAMATION_YEAR;
        timelineSlider.max = HUTRI81_ANNIVERSARY_YEAR;
        timelineSlider.value = HUTRI81_ANNIVERSARY_YEAR;
        updateTimelineUI(HUTRI81_ANNIVERSARY_YEAR);

        timelineSlider.addEventListener('input', (e) => {
            updateTimelineUI(parseInt(e.target.value, 10));
        });

        timelineSlider.addEventListener('change', (e) => {
            const year = parseInt(e.target.value, 10);
            scene?.goToYear(year);
        });
    }

    document.querySelectorAll('.timeline-jump').forEach((btn) => {
        btn.addEventListener('click', () => {
            const year = parseInt(btn.dataset.year, 10);
            scene?.goToYear(year);
            if (timelineSlider) timelineSlider.value = year;
            updateTimelineUI(year);
        });
    });

    // Panel toggles
    document.getElementById('btn-open-dashboard')?.addEventListener('click', () => {
        window.patriotismDashboard?.toggle(true);
    });
    document.getElementById('btn-open-celebrate')?.addEventListener('click', () => {
        window.celebrateMerdeka?.toggle(true);
    });

    document.addEventListener('hutri:milestone-flash', (e) => {
        timelineYear?.classList.remove('flash');
        void timelineYear?.offsetWidth;
        timelineYear?.classList.add('flash');
    });

    document.addEventListener('hutri:celebration-launched', (e) => {
        if (!floatingMotto) return;
        floatingMotto.classList.add('celebrating');
        clearTimeout(mottoCelebrateTimer);
        const duration = e.detail?.intensity === 'mega' ? 3500 : 2500;
        mottoCelebrateTimer = setTimeout(() => {
            floatingMotto.classList.remove('celebrating');
        }, duration);
    });

    // Init modules
    setTimeout(() => {
        scene = new Hutri81Scene(canvas, showMilestoneModal);
        window.hutri81Scene = scene;
        window.patriotismDashboard = new PatriotismDashboard();
        window.celebrateMerdeka = new CelebrateMerdeka();

        scene.goToYear(HUTRI81_ANNIVERSARY_YEAR);

        loading.style.opacity = '0';
        setTimeout(() => { loading.style.display = 'none'; }, 800);
    }, 1200);
});
