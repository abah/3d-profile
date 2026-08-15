export function attachJoystick(root, { axes = 'xy' } = {}) {
    const knob = root.querySelector('.stick-knob');
    const value = { x: 0, y: 0, active: false };
    let pointerId = null;

    function pad() {
        const box = root.getBoundingClientRect();
        return {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
            max: Math.min(box.width, box.height) * 0.32
        };
    }

    function apply(clientX, clientY) {
        const c = pad();
        let dx = clientX - c.x;
        let dy = clientY - c.y;
        if (axes === 'x') dy = 0;
        if (axes === 'y') dx = 0;
        const len = Math.hypot(dx, dy);
        if (len > c.max && len > 0) {
            dx *= c.max / len;
            dy *= c.max / len;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        value.x = c.max ? dx / c.max : 0;
        value.y = c.max ? -dy / c.max : 0;
    }

    function reset() {
        pointerId = null;
        value.x = 0;
        value.y = 0;
        value.active = false;
        knob.style.transform = 'translate(0px, 0px)';
    }

    root.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        root.setPointerCapture(event.pointerId);
        pointerId = event.pointerId;
        value.active = true;
        apply(event.clientX, event.clientY);
    });

    root.addEventListener('pointermove', (event) => {
        if (pointerId !== event.pointerId) return;
        event.preventDefault();
        apply(event.clientX, event.clientY);
    });

    root.addEventListener('pointerup', (event) => {
        if (pointerId !== event.pointerId) return;
        reset();
    });
    root.addEventListener('pointercancel', reset);
    root.addEventListener('contextmenu', (event) => event.preventDefault());
    root.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });

    return value;
}

export function isTouchUi() {
    return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches;
}
