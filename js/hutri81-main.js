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
    const timelineLabel = document.getElementById('timeline-label');

    let scene = null;

    function showMilestoneModal(milestone) {
        document.getElementById('modal-year').textContent = milestone.year;
        document.getElementById('modal-tahun-ke').textContent = `HUT ke-${milestone.tahunKe}`;
        document.getElementById('modal-title').textContent = milestone.title;
        document.getElementById('modal-place').textContent = milestone.place;
        document.getElementById('modal-category').textContent =
            HUTRI81_CATEGORY_LABELS[milestone.category] || HUTRI81_CATEGORY_LABELS.default;
        document.getElementById('modal-description').textContent = milestone.description;

        if (timelineSlider) timelineSlider.value = milestone.year;
        updateTimelineUI(milestone.year);

        modal?.classList.add('active');
        scene?.setPaused(true);
    }

    function hideModal() {
        modal?.classList.remove('active');
        scene?.setPaused(false);
    }

    modalClose?.addEventListener('click', hideModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    function updateTimelineUI(year) {
        const m = HUTRI81_MILESTONES.find((x) => x.year === year);
        if (timelineYear) timelineYear.textContent = year;
        if (timelineLabel && m) timelineLabel.textContent = m.title;
    }

    if (timelineSlider) {
        timelineSlider.min = 1945;
        timelineSlider.max = 2025;
        timelineSlider.value = 1945;
        updateTimelineUI(1945);

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
    document.getElementById('btn-open-chat')?.addEventListener('click', () => {
        window.merdekaTalk?.toggle(true);
    });

    // Init modules
    setTimeout(() => {
        scene = new Hutri81Scene(canvas, showMilestoneModal);
        window.hutri81Scene = scene;
        window.patriotismDashboard = new PatriotismDashboard();
        window.merdekaTalk = new MerdekaTalk();

        loading.style.opacity = '0';
        setTimeout(() => { loading.style.display = 'none'; }, 800);
    }, 1200);
});
