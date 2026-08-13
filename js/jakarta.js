import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createGlobal6000 } from './global6000.js';
import { createJakartaGround } from './jakarta-tiles.js';
import './pwa.js';

const keys = { up: false, down: false, left: false, right: false, climb: false, dive: false };
const state = {
    x: 0,
    y: 148,
    z: 0,
    heading: 0,
    pitch: 0.04,
    bank: 0,
    speed: 48,
    camReady: false
};

const stage = document.getElementById('stage');
const loadingEl = document.getElementById('loading');
const speedNum = document.getElementById('speed-num');
const altNum = document.getElementById('alt-num');
const hint = document.getElementById('hint');
const touchEl = document.getElementById('touch');

if (window.matchMedia('(pointer: coarse)').matches) {
    touchEl.hidden = false;
    hint.textContent = 'GAS maju · ◀ ▶ belok · NAIK / TURUN · tidak bisa mundur';
}

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ec4e8);
scene.fog = new THREE.Fog(0xb7d3ea, 420, 2100);
scene.environment = envMap;

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 1, 2800);
scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x5a4a3a, 0.95));
const sun = new THREE.DirectionalLight(0xfff3dc, 1.45);
sun.position.set(80, 140, 40);
scene.add(sun);

const ground = createJakartaGround(scene);
const jet = createGlobal6000({ envMap });
jet.root.rotation.order = 'YXZ';
scene.add(jet.root);

const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(16, 28),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.8;
scene.add(shadow);

function bindHold(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    const on = () => { keys[key] = true; };
    const off = () => { keys[key] = false; };
    el.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        el.setPointerCapture(event.pointerId);
        on();
    });
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
}

bindHold('btn-gas', 'up');
bindHold('btn-brake', 'down');
bindHold('btn-left', 'left');
bindHold('btn-right', 'right');
bindHold('btn-climb', 'climb');
bindHold('btn-dive', 'dive');

const flyKeys = new Set([
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'KeyF'
]);
window.addEventListener('keydown', (event) => {
    if (flyKeys.has(event.code)) event.preventDefault();
    if (['ArrowUp', 'KeyW'].includes(event.code)) keys.up = true;
    if (['ArrowDown', 'KeyS'].includes(event.code)) keys.down = true;
    if (['ArrowLeft', 'KeyA'].includes(event.code)) keys.left = true;
    if (['ArrowRight', 'KeyD'].includes(event.code)) keys.right = true;
    if (event.code === 'KeyR') keys.climb = true;
    if (event.code === 'KeyF') keys.dive = true;
});
window.addEventListener('keyup', (event) => {
    if (['ArrowUp', 'KeyW'].includes(event.code)) keys.up = false;
    if (['ArrowDown', 'KeyS'].includes(event.code)) keys.down = false;
    if (['ArrowLeft', 'KeyA'].includes(event.code)) keys.left = false;
    if (['ArrowRight', 'KeyD'].includes(event.code)) keys.right = false;
    if (event.code === 'KeyR') keys.climb = false;
    if (event.code === 'KeyF') keys.dive = false;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function placeJet() {
    jet.root.position.set(state.x, state.y, state.z);
    jet.root.rotation.y = state.heading - Math.PI / 2;
    jet.root.rotation.x = state.pitch;
    jet.root.rotation.z = state.bank;
    shadow.position.set(state.x, 0.8, state.z);
    const s = THREE.MathUtils.clamp(14 + state.y * 0.04, 14, 28);
    shadow.scale.setScalar(s / 16);
    shadow.material.opacity = THREE.MathUtils.clamp(0.32 - state.y * 0.0007, 0.08, 0.32);
}

function chaseCamera() {
    const back = 46 + state.speed * 0.12;
    const lift = 13;
    const hx = Math.sin(state.heading) * Math.cos(state.pitch);
    const hz = Math.cos(state.heading) * Math.cos(state.pitch);
    const target = new THREE.Vector3(
        state.x - hx * back,
        state.y - Math.sin(state.pitch) * back + lift,
        state.z - hz * back
    );
    if (!state.camReady) {
        camera.position.copy(target);
        state.camReady = true;
    } else {
        camera.position.lerp(target, 0.11);
    }
    camera.lookAt(state.x, state.y + 1.2, state.z);
}

let last = performance.now();
let tileClock = 0;
function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (keys.up) state.speed += 22 * dt;
    if (keys.down) state.speed -= 28 * dt;
    else if (!keys.up) state.speed -= 4 * dt;
    state.speed = Math.max(18, Math.min(92, state.speed));

    const steer = Number(keys.left) - Number(keys.right);
    state.heading += steer * 0.72 * dt;
    const wantBank = -steer * 0.42;
    state.bank += (wantBank - state.bank) * Math.min(1, dt * 3.2);

    if (keys.climb) state.pitch += 0.38 * dt;
    if (keys.dive) state.pitch -= 0.38 * dt;
    if (!keys.climb && !keys.dive) state.pitch += (0.02 - state.pitch) * dt * 0.7;
    state.pitch = Math.max(-0.32, Math.min(0.28, state.pitch));

    const horiz = Math.cos(state.pitch) * state.speed;
    state.x += Math.sin(state.heading) * horiz * dt;
    state.z += Math.cos(state.heading) * horiz * dt;
    state.y += Math.sin(state.pitch) * state.speed * dt;
    state.y = Math.max(48, Math.min(280, state.y));

    placeJet();
    jet.spin(dt, state.speed);
    chaseCamera();

    tileClock += dt;
    if (tileClock > 0.35) {
        tileClock = 0;
        ground.update(state.x, state.z);
    }

    speedNum.textContent = String(Math.round(state.speed * 3.6));
    altNum.textContent = String(Math.round(state.y));
    renderer.render(scene, camera);
}

placeJet();
loadingEl.classList.add('hide');
animate(performance.now());
