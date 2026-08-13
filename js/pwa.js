const DISMISS_KEY = 'car-pwa-dismissed';

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.matchMedia('(display-mode: fullscreen)').matches
        || window.navigator.standalone === true;
}

function isIos() {
    const ua = window.navigator.userAgent;
    const iOS = /iphone|ipad|ipod/i.test(ua);
    const iPadOs = ua.includes('Mac') && 'ontouchend' in document;
    return iOS || iPadOs;
}

function wasDismissed() {
    try {
        return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
        return false;
    }
}

function dismissSheet() {
    try {
        localStorage.setItem(DISMISS_KEY, '1');
    } catch {
        /* ignore quota */
    }
    hideSheet();
}

function hideSheet() {
    const sheet = document.getElementById('install-sheet');
    if (sheet) sheet.hidden = true;
}

function showSheet() {
    const sheet = document.getElementById('install-sheet');
    if (!sheet || isStandalone() || wasDismissed()) return;
    sheet.hidden = false;
}

if (isStandalone()) {
    document.documentElement.classList.add('standalone');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(() => {});
}

let deferredPrompt = null;
const installBtn = document.getElementById('btn-install-app');
const dismissBtn = document.getElementById('btn-install-dismiss');
const iosHint = document.getElementById('ios-install-hint');
const androidHint = document.getElementById('android-install-hint');

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (androidHint) androidHint.hidden = false;
    if (iosHint) iosHint.hidden = true;
    if (installBtn) installBtn.hidden = false;
    showSheet();
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    dismissSheet();
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => {});
        deferredPrompt = null;
        hideSheet();
    });
}

if (dismissBtn) {
    dismissBtn.addEventListener('click', dismissSheet);
}

if (isIos() && !isStandalone() && !wasDismissed()) {
    if (androidHint) androidHint.hidden = true;
    if (installBtn) installBtn.hidden = true;
    if (iosHint) iosHint.hidden = false;
    window.setTimeout(showSheet, 1800);
}
