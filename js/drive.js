import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { REAL_MODELS, loadRealCar, disposeLoadedCar } from './real-cars.js';
import { CAR_MODELS, createCar, disposeCar } from './cars.js';
import { loadTrack } from './circuit.js';
import { attachJoystick, isTouchUi } from './joystick.js';
import './pwa.js';

const keys = { up: false, down: false, left: false, right: false };
const state = {
    x: 0,
    y: 0.75,
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
const idleStick = () => ({ x: 0, y: 0, active: false });
let stickL = idleStick();
let stickR = idleStick();

if (isTouchUi() && touchEl) {
    touchEl.hidden = false;
    document.getElementById('hint').hidden = true;
    stickL = attachJoystick(document.getElementById('stick-left'), { axes: 'x' });
    stickR = attachJoystick(document.getElementById('stick-right'), { axes: 'y' });
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c4e6);
scene.fog = new THREE.Fog(0x87c4e6, 220, 900);
scene.environment = envMap;

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.3, 1800);
scene.add(new THREE.HemisphereLight(0xd7ecff, 0x3d5a32, 0.9));
const sun = new THREE.DirectionalLight(0xfff3dc, 1.7);
sun.position.set(220, 180, 40);
sun.target.position.set(80, 0, 180);
scene.add(sun.target);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.near = 8;
sun.shadow.camera.far = 720;
sun.shadow.camera.left = -380;
sun.shadow.camera.right = 380;
sun.shadow.camera.top = 380;
sun.shadow.camera.bottom = -380;
sun.shadow.bias = -0.00025;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.22));

let circuit = {
    start: { x: 0, z: -48, heading: Math.PI / 2 },
    sampleHeight: () => 0,
    keepOnTrack(pos) { return { x: pos.x, z: pos.z, hit: false }; },
    update() {}
};

state.x = circuit.start.x;
state.z = circuit.start.z;
state.heading = circuit.start.heading;
camera.position.set(state.x - 12, 8, state.z);

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

function resetToStart() {
    state.x = circuit.start.x;
    state.z = circuit.start.z;
    state.heading = circuit.start.heading;
    state.speed = 0;
    state.y = circuit.sampleHeight(state.x, state.z, 0.75);
    state.camReady = false;
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
    next.root.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
    scene.add(next.root);
    sitOnGround(next.root);
    state.yawOffset = inferNoseYaw(next.root);
    placeCar();
}

function placeCar() {
    if (!state.car) return;
    const lift = state.car.root.userData.groundY || 0.04;
    state.car.root.position.set(state.x, state.y + lift, state.z);
    state.car.root.rotation.y = state.heading - state.yawOffset;
}

function chaseCamera() {
    const back = 11.2;
    const height = 4.8;
    const camX = state.x - Math.sin(state.heading) * back;
    const camZ = state.z - Math.cos(state.heading) * back;
    const target = new THREE.Vector3(camX, state.y + height, camZ);
    if (!state.camReady) {
        camera.position.copy(target);
        state.camReady = true;
    } else {
        camera.position.lerp(target, 0.14);
    }
    camera.lookAt(state.x, state.y + 1.15, state.z);
    const nextFov = 56 + Math.min(12, state.speed * 0.32);
    if (Math.abs(camera.fov - nextFov) > 0.05) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
    }
}

const driveKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD']);
window.addEventListener('keydown', (event) => {
    if (driveKeys.has(event.code)) event.preventDefault();
    if (['ArrowUp', 'KeyW'].includes(event.code)) keys.up = true;
    if (['ArrowDown', 'KeyS'].includes(event.code)) keys.down = true;
    if (['ArrowLeft', 'KeyA'].includes(event.code)) keys.left = true;
    if (['ArrowRight', 'KeyD'].includes(event.code)) keys.right = true;
    if (event.code === 'KeyR') resetToStart();
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

    const gas = stickR.active ? Math.max(0, stickR.y) : Number(keys.up);
    const brake = stickR.active ? Math.max(0, -stickR.y) : Number(keys.down);
    if (gas > 0.12) state.speed += 18 * dt * gas;
    if (brake > 0.12) state.speed -= 32 * dt * brake;
    else if (gas <= 0.12) state.speed -= 7.5 * dt;
    state.speed = Math.max(0, Math.min(38, state.speed));

    const steer = stickL.active
        ? -stickL.x
        : Number(keys.left) - Number(keys.right);
    const grip = Math.min(1, state.speed / 4.5);
    state.heading += steer * grip * 1.35 * dt;
    state.x += Math.sin(state.heading) * state.speed * dt;
    state.z += Math.cos(state.heading) * state.speed * dt;
    const held = circuit.keepOnTrack(state);
    state.x = held.x;
    state.z = held.z;
    if (held.hit) state.speed *= 0.84;
    state.y = circuit.sampleHeight(state.x, state.z, state.y);
    if (state.y < -8) resetToStart();
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
        circuit = await loadTrack(scene);
        resetToStart();
        await spawnCar(CAR_MODELS[0].id);
        loadingEl.classList.add('hide');
        spawnCar('ferrari-458').catch(() => {});
    } catch (err) {
        console.error(err);
        const copy = loadingEl.querySelector('p');
        if (copy) copy.textContent = 'Gagal memuat sirkuit. Refresh halaman.';
    }
})();

animate(performance.now());
