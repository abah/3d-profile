import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { REAL_MODELS, loadRealCar, disposeLoadedCar } from './real-cars.js';
import { CAR_MODELS, createCar, disposeCar } from './cars.js';
import { createCircuit } from './circuit.js';
import './pwa.js';

const keys = { up: false, down: false, left: false, right: false };
const state = {
    x: 0,
    z: 0,
    heading: 0,
    speed: 0,
    yawOffset: Math.PI / 2,
    car: null,
    camReady: false
};

const stage = document.getElementById('stage');
const loadingEl = document.getElementById('loading');
const speedNum = document.getElementById('speed-num');
const carNameEl = document.getElementById('car-name');
const carSelect = document.getElementById('car-select');
const touchEl = document.getElementById('touch');

if (window.matchMedia('(pointer: coarse)').matches) {
    touchEl.hidden = false;
    document.getElementById('hint').textContent = 'GAS maju · ◀ ▶ belok · REM ngerem — tidak bisa mundur';
}

const catalog = [...REAL_MODELS, ...CAR_MODELS.slice(0, 3)];
catalog.forEach((spec) => {
    const opt = document.createElement('option');
    opt.value = spec.id;
    opt.textContent = spec.name;
    carSelect.appendChild(opt);
});

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
stage.appendChild(renderer.domElement);

const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b14);
scene.fog = new THREE.Fog(0x070b14, 55, 240);
scene.environment = envMap;

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.3, 480);
scene.add(new THREE.HemisphereLight(0x7ad7ff, 0x1a1018, 0.62));
const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(18, 42, 10);
scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff, 0.22));

const circuit = createCircuit(scene);
state.x = circuit.start.x;
state.z = circuit.start.z;
state.heading = circuit.start.heading;
camera.position.set(state.x - 12, 6, state.z);

function sitOnGround(root) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const lift = Number.isFinite(box.min.y) ? root.position.y - box.min.y : 0;
    root.userData.groundY = lift + 0.04;
    root.position.y = root.userData.groundY;
}

function inferNoseYaw(root) {
    root.updateMatrixWorld(true);
    const pairs = [
        ['wheel_fl', 'wheel_rl'],
        ['WheelFrontL', 'WheelRearL'],
        ['wheel_fr', 'wheel_rr'],
        ['WheelFrontR', 'WheelRearR']
    ];
    const f = new THREE.Vector3();
    const r = new THREE.Vector3();
    for (const [frontName, rearName] of pairs) {
        const front = root.getObjectByName(frontName);
        const rear = root.getObjectByName(rearName);
        if (!front || !rear) continue;
        front.getWorldPosition(f);
        rear.getWorldPosition(r);
        return Math.atan2(f.x - r.x, f.z - r.z);
    }
    return Math.PI / 2;
}

async function spawnCar(id) {
    const spec = catalog.find((item) => item.id === id) || catalog[0];
    carNameEl.textContent = spec.name;
    carSelect.value = spec.id;
    const next = spec.url
        ? await loadRealCar(spec, { paint: spec.defaultPaint, envMap })
        : createCar(spec, { paint: spec.defaultPaint, rimColor: 0xd8dce2, envMap });
    if (state.car) {
        scene.remove(state.car.root);
        if (state.car.spec.url) disposeLoadedCar(state.car);
        else disposeCar(state.car);
    }
    state.car = next;
    next.root.rotation.y = 0;
    scene.add(next.root);
    sitOnGround(next.root);
    state.yawOffset = inferNoseYaw(next.root);
    placeCar();
}

function placeCar() {
    if (!state.car) return;
    const y = state.car.root.userData.groundY || 0.04;
    state.car.root.position.set(state.x, y, state.z);
    state.car.root.rotation.y = state.heading - state.yawOffset;
}

function chaseCamera() {
    const back = 11.2;
    const height = 4.8;
    const camX = state.x - Math.sin(state.heading) * back;
    const camZ = state.z - Math.cos(state.heading) * back;
    const target = new THREE.Vector3(camX, height, camZ);
    if (!state.camReady) {
        camera.position.copy(target);
        state.camReady = true;
    } else {
        camera.position.lerp(target, 0.14);
    }
    camera.lookAt(state.x, 1.15, state.z);
    const nextFov = 56 + Math.min(12, state.speed * 0.32);
    if (Math.abs(camera.fov - nextFov) > 0.05) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
    }
}

function bindHold(id, key) {
    const el = document.getElementById(id);
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

const driveKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD']);
window.addEventListener('keydown', (event) => {
    if (driveKeys.has(event.code)) event.preventDefault();
    if (['ArrowUp', 'KeyW'].includes(event.code)) keys.up = true;
    if (['ArrowDown', 'KeyS'].includes(event.code)) keys.down = true;
    if (['ArrowLeft', 'KeyA'].includes(event.code)) keys.left = true;
    if (['ArrowRight', 'KeyD'].includes(event.code)) keys.right = true;
});
window.addEventListener('keyup', (event) => {
    if (['ArrowUp', 'KeyW'].includes(event.code)) keys.up = false;
    if (['ArrowDown', 'KeyS'].includes(event.code)) keys.down = false;
    if (['ArrowLeft', 'KeyA'].includes(event.code)) keys.left = false;
    if (['ArrowRight', 'KeyD'].includes(event.code)) keys.right = false;
});

carSelect.addEventListener('change', () => {
    spawnCar(carSelect.value).catch(console.error);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let last = performance.now();
function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (keys.up) state.speed += 18 * dt;
    if (keys.down) state.speed -= 32 * dt;
    else if (!keys.up) state.speed -= 7.5 * dt;
    state.speed = Math.max(0, Math.min(38, state.speed));

    const steer = Number(keys.left) - Number(keys.right);
    const grip = Math.min(1, state.speed / 4.5);
    state.heading += steer * grip * 1.35 * dt;
    state.x += Math.sin(state.heading) * state.speed * dt;
    state.z += Math.cos(state.heading) * state.speed * dt;
    const held = circuit.keepOnTrack(state);
    state.x = held.x;
    state.z = held.z;
    if (held.hit) state.speed *= 0.82;
    placeCar();

    if (state.car) {
        const spin = (state.speed * dt) / 0.34;
        state.car.wheels.forEach((wheel) => {
            if (wheel.userData.axle) wheel.rotateOnAxis(wheel.userData.axle, spin);
        });
    }

    circuit.update(dt);
    chaseCamera();
    speedNum.textContent = String(Math.round(state.speed * 3.6));
    renderer.render(scene, camera);
}

(async () => {
    try {
        await spawnCar(CAR_MODELS[0].id);
        loadingEl.classList.add('hide');
        spawnCar('ferrari-458').catch(() => {});
    } catch (err) {
        console.error(err);
        loadingEl.classList.add('hide');
    }
})();

animate(performance.now());
