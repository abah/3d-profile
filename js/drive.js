import * as THREE from 'three';
import { REAL_MODELS, loadRealCar, disposeLoadedCar } from './real-cars.js';
import { CAR_MODELS, createCar, disposeCar } from './cars.js';

const ORIGIN = { lng: 106.82325, lat: -6.2088 };
const DEG = Math.PI / 180;
const TILE_Z = 18;
const TILE_RADIUS = 4;

const keys = { up: false, down: false, left: false, right: false };
const state = {
    x: 0,
    z: 0,
    heading: 0,
    speed: 0,
    car: null
};

const stage = document.getElementById('stage');
const loadingEl = document.getElementById('loading');
const speedNum = document.getElementById('speed-num');
const carNameEl = document.getElementById('car-name');
const carSelect = document.getElementById('car-select');
const touchEl = document.getElementById('touch');

if (window.matchMedia('(pointer: coarse)').matches) {
    touchEl.hidden = false;
    document.getElementById('hint').textContent = 'GAS untuk jalan · ◀ ▶ untuk belok';
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
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7eb6d9);
scene.fog = new THREE.Fog(0x8ebfe0, 140, 620);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 900);
camera.position.set(0, 4.2, 10);

scene.add(new THREE.HemisphereLight(0xc8e4ff, 0x3d2a1a, 0.95));
const sun = new THREE.DirectionalLight(0xfff3dd, 1.35);
sun.position.set(40, 80, 20);
scene.add(sun);

const textures = new THREE.TextureLoader();
textures.crossOrigin = 'anonymous';

function toLocal(lng, lat) {
    return {
        x: (lng - ORIGIN.lng) * 111320 * Math.cos(ORIGIN.lat * DEG),
        z: -(lat - ORIGIN.lat) * 110540
    };
}

function lngLatToTile(lng, lat, z) {
    const n = 2 ** z;
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = lat * DEG;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y };
}

function tileBounds(x, y, z) {
    const n = 2 ** z;
    const west = (x / n) * 360 - 180;
    const east = ((x + 1) / n) * 360 - 180;
    const north = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180 / Math.PI;
    const south = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180 / Math.PI;
    return { west, east, north, south };
}

function addSatelliteTiles() {
    const originTile = lngLatToTile(ORIGIN.lng, ORIGIN.lat, TILE_Z);
    const group = new THREE.Group();
    group.name = 'jakarta-ground';
    for (let dy = -TILE_RADIUS; dy <= TILE_RADIUS; dy += 1) {
        for (let dx = -TILE_RADIUS; dx <= TILE_RADIUS; dx += 1) {
            const tx = originTile.x + dx;
            const ty = originTile.y + dy;
            const b = tileBounds(tx, ty, TILE_Z);
            const sw = toLocal(b.west, b.south);
            const ne = toLocal(b.east, b.north);
            const w = Math.abs(ne.x - sw.x);
            const d = Math.abs(ne.z - sw.z);
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(w, d),
                new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 1, metalness: 0 })
            );
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set((sw.x + ne.x) / 2, 0, (sw.z + ne.z) / 2);
            mesh.receiveShadow = true;
            group.add(mesh);
            textures.load(
                `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${TILE_Z}/${ty}/${tx}`,
                (map) => {
                    map.colorSpace = THREE.SRGBColorSpace;
                    map.anisotropy = 8;
                    mesh.material.map = map;
                    mesh.material.color.set(0xffffff);
                    mesh.material.needsUpdate = true;
                }
            );
        }
    }
    scene.add(group);
}

function buildingHeight(tags = {}) {
    if (tags.height) {
        const n = parseFloat(String(tags.height).replace(/m/i, ''));
        if (Number.isFinite(n) && n > 1) return Math.min(n, 280);
    }
    if (tags['building:levels']) {
        const n = parseFloat(tags['building:levels']);
        if (Number.isFinite(n) && n > 0) return Math.min(n * 3.2, 280);
    }
    return 9;
}

function addBuildings(elements) {
    const group = new THREE.Group();
    const tall = new THREE.MeshStandardMaterial({
        color: 0x9aafc2,
        roughness: 0.28,
        metalness: 0.55
    });
    const mid = new THREE.MeshStandardMaterial({
        color: 0xc4b49a,
        roughness: 0.62,
        metalness: 0.12
    });
    const low = new THREE.MeshStandardMaterial({
        color: 0xd7c8b0,
        roughness: 0.78,
        metalness: 0.04
    });

    elements.forEach((way) => {
        const geom = way.geometry;
        if (!geom || geom.length < 4) return;
        const pts = geom.map((node) => toLocal(node.lon, node.lat));
        const shape = new THREE.Shape();
        shape.moveTo(pts[0].x, -pts[0].z);
        for (let i = 1; i < pts.length; i += 1) shape.lineTo(pts[i].x, -pts[i].z);
        const h = buildingHeight(way.tags);
        const mesh = new THREE.Mesh(
            new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false }),
            h > 55 ? tall : h > 18 ? mid : low
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0.02;
        mesh.castShadow = true;
        group.add(mesh);
    });
    scene.add(group);
}

async function loadBuildings() {
    const query = `[out:json][timeout:25];way["building"](around:420,${ORIGIN.lat},${ORIGIN.lng});out geom;`;
    const endpoints = [
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`
    ];
    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            if (data.elements && data.elements.length) {
                addBuildings(data.elements);
                return;
            }
        } catch {
            /* try next mirror */
        }
    }
}

const blob = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false })
);
blob.rotation.x = -Math.PI / 2;
blob.position.y = 0.03;
scene.add(blob);

async function spawnCar(id) {
    const spec = catalog.find((item) => item.id === id) || catalog[0];
    carNameEl.textContent = spec.name;
    carSelect.value = spec.id;
    const next = spec.url
        ? await loadRealCar(spec, { paint: spec.defaultPaint })
        : createCar(spec, { paint: spec.defaultPaint, rimColor: 0xd8dce2 });
    if (state.car) {
        scene.remove(state.car.root);
        if (state.car.spec.url) disposeLoadedCar(state.car);
        else disposeCar(state.car);
    }
    state.car = next;
    next.root.position.set(state.x, 0, state.z);
    next.root.rotation.y = state.heading;
    scene.add(next.root);
}

function placeCar() {
    if (!state.car) return;
    state.car.root.position.set(state.x, 0, state.z);
    state.car.root.rotation.y = state.heading;
    blob.position.x = state.x;
    blob.position.z = state.z;
}

function chaseCamera() {
    const back = 8.6;
    const height = 3.4;
    const look = 1.05;
    const camX = state.x - Math.sin(state.heading) * back;
    const camZ = state.z - Math.cos(state.heading) * back;
    camera.position.lerp(new THREE.Vector3(camX, height, camZ), 0.12);
    camera.lookAt(state.x, look, state.z);
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

window.addEventListener('keydown', (event) => {
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
    const drag = keys.down ? 32 : (keys.up ? 4 : 10);
    state.speed -= Math.sign(state.speed || 1) * drag * dt;
    if (!keys.up && Math.abs(state.speed) < 0.4) state.speed = 0;
    if (keys.down && state.speed < 0.5) state.speed -= 12 * dt;
    state.speed = Math.max(-12, Math.min(36, state.speed));

    const steer = (Number(keys.left) - Number(keys.right));
    const grip = Math.min(1, Math.abs(state.speed) / 5);
    state.heading += steer * grip * 1.45 * dt * Math.sign(state.speed || 1);

    state.x += Math.sin(state.heading) * state.speed * dt;
    state.z += Math.cos(state.heading) * state.speed * dt;
    placeCar();

    if (state.car) {
        const spin = (state.speed * dt) / 0.34;
        state.car.wheels.forEach((wheel) => {
            if (wheel.userData.axle) wheel.rotateOnAxis(wheel.userData.axle, spin);
        });
    }

    chaseCamera();
    speedNum.textContent = String(Math.round(Math.abs(state.speed) * 3.6));
    renderer.render(scene, camera);
}

addSatelliteTiles();

(async () => {
    try {
        await spawnCar(CAR_MODELS[0].id);
        loadingEl.classList.add('hide');
        spawnCar('ferrari-458').catch(() => {});
        loadBuildings().catch(() => {});
    } catch (err) {
        console.error(err);
        loadingEl.classList.add('hide');
    }
})();

animate(performance.now());
