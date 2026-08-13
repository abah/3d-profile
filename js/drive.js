import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { REAL_MODELS, loadRealCar, disposeLoadedCar } from './real-cars.js';
import { CAR_MODELS, createCar, disposeCar } from './cars.js';

const ORIGIN = { lng: 106.82315, lat: -6.2018 };
const DEG = Math.PI / 180;
const TILE_Z = 18;
const TILE_RADIUS = 5;

const keys = { up: false, down: false, left: false, right: false };
const state = {
    x: 0,
    z: 0,
    heading: 0.12,
    speed: 0,
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
    document.getElementById('hint').textContent = 'GAS untuk jalan · ◀ ▶ belok';
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
scene.background = new THREE.Color(0x8ec4e8);
scene.fog = new THREE.Fog(0x9dcae8, 90, 480);
scene.environment = envMap;

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.35, 800);
camera.position.set(-2, 8, -14);

scene.add(new THREE.HemisphereLight(0xe7f3ff, 0x4a3828, 1.05));
const sun = new THREE.DirectionalLight(0xfff1dc, 1.7);
sun.position.set(60, 90, 30);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

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
    for (let dy = -TILE_RADIUS; dy <= TILE_RADIUS; dy += 1) {
        for (let dx = -TILE_RADIUS; dx <= TILE_RADIUS; dx += 1) {
            const tx = originTile.x + dx;
            const ty = originTile.y + dy;
            const b = tileBounds(tx, ty, TILE_Z);
            const sw = toLocal(b.west, b.south);
            const ne = toLocal(b.east, b.north);
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(Math.abs(ne.x - sw.x), Math.abs(ne.z - sw.z)),
                new THREE.MeshBasicMaterial({ color: 0x5a5a5a })
            );
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set((sw.x + ne.x) / 2, 0, (sw.z + ne.z) / 2);
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

function makeFacadeTexture(seed) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const g = canvas.getContext('2d');
    g.fillStyle = seed ? '#3d4a58' : '#2b3340';
    g.fillRect(0, 0, 128, 256);
    for (let y = 6; y < 250; y += 16) {
        for (let x = 6; x < 122; x += 14) {
            const lit = ((x * 13 + y * 7 + seed) % 10) > 3;
            g.fillStyle = lit ? '#cfe4ff' : '#151b24';
            g.fillRect(x, y, 9, 11);
        }
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
}

const facadeA = makeFacadeTexture(1);
const facadeB = makeFacadeTexture(4);
const wallA = new THREE.MeshStandardMaterial({
    map: facadeA,
    roughness: 0.42,
    metalness: 0.22,
    envMap,
    envMapIntensity: 0.7
});
const wallB = new THREE.MeshStandardMaterial({
    map: facadeB,
    roughness: 0.38,
    metalness: 0.35,
    envMap,
    envMapIntensity: 0.9
});
const roofMat = new THREE.MeshStandardMaterial({
    color: 0x6d737a,
    roughness: 0.9,
    metalness: 0.05
});

function buildingHeight(tags = {}) {
    if (tags.height) {
        const n = parseFloat(String(tags.height).replace(/m/i, ''));
        if (Number.isFinite(n) && n > 1) return Math.min(n, 260);
    }
    if (tags['building:levels']) {
        const n = parseFloat(tags['building:levels']);
        if (Number.isFinite(n) && n > 0) return Math.min(n * 3.3, 260);
    }
    return 12;
}

function addBuildings(elements) {
    const group = new THREE.Group();
    elements.forEach((way) => {
        const geom = way.geometry;
        if (!geom || geom.length < 4) return;
        const pts = geom.map((node) => toLocal(node.lon, node.lat));
        let minX = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        pts.forEach((p) => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minZ = Math.min(minZ, p.z);
            maxZ = Math.max(maxZ, p.z);
        });
        const span = Math.max(maxX - minX, maxZ - minZ);
        if (span < 5 || span > 140) return;
        if (minX < 12 && maxX > -12 && minZ < 12 && maxZ > -12) return;

        const shape = new THREE.Shape();
        shape.moveTo(pts[0].x, -pts[0].z);
        for (let i = 1; i < pts.length; i += 1) shape.lineTo(pts[i].x, -pts[i].z);
        const h = buildingHeight(way.tags);
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
        const uv = geometry.attributes.uv;
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i += 1) {
            uv.setXY(i, pos.getX(i) * 0.12, pos.getZ(i) * 0.18);
        }
        uv.needsUpdate = true;
        const wall = h > 40 ? wallB : wallA;
        const mesh = new THREE.Mesh(geometry, wall);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0.01;
        group.add(mesh);
    });
    scene.add(group);
}

async function loadBuildings() {
    const query = `[out:json][timeout:25];way["building"](around:380,${ORIGIN.lat},${ORIGIN.lng});out geom;`;
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
            /* next */
        }
    }
}

const marker = new THREE.Mesh(
    new THREE.RingGeometry(2.4, 2.85, 48),
    new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
);
marker.rotation.x = -Math.PI / 2;
marker.position.y = 0.08;
scene.add(marker);

function sitOnGround(root) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const lift = Number.isFinite(box.min.y) ? root.position.y - box.min.y : 0;
    root.userData.groundY = lift + 0.06;
    root.position.y = root.userData.groundY;
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
    scene.add(next.root);
    const lamp = new THREE.SpotLight(0xfff3d0, 18, 28, Math.PI / 5, 0.45, 1);
    lamp.position.set(0, 0.7, 2.2);
    lamp.target.position.set(0, 0, 12);
    next.root.add(lamp);
    next.root.add(lamp.target);
    sitOnGround(next.root);
    placeCar();
}

function placeCar() {
    if (!state.car) return;
    const y = state.car.root.userData.groundY || 0.06;
    state.car.root.position.set(state.x, y, state.z);
    state.car.root.rotation.y = state.heading;
    marker.position.set(state.x, 0.08, state.z);
}

function chaseCamera() {
    const back = 11.5;
    const height = 5.4;
    const camX = state.x - Math.sin(state.heading) * back;
    const camZ = state.z - Math.cos(state.heading) * back;
    const target = new THREE.Vector3(camX, height, camZ);
    if (!state.camReady) {
        camera.position.copy(target);
        state.camReady = true;
    } else {
        camera.position.lerp(target, 0.14);
    }
    camera.lookAt(state.x, 1.05, state.z);
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

    if (keys.up) state.speed += 16 * dt;
    const drag = keys.down ? 30 : (keys.up ? 3.5 : 9);
    state.speed -= Math.sign(state.speed || 1) * drag * dt;
    if (!keys.up && Math.abs(state.speed) < 0.35) state.speed = 0;
    if (keys.down && state.speed < 0.4) state.speed -= 10 * dt;
    state.speed = Math.max(-10, Math.min(34, state.speed));

    const steer = Number(keys.left) - Number(keys.right);
    const grip = Math.min(1, Math.abs(state.speed) / 4.5);
    state.heading += steer * grip * 1.35 * dt * Math.sign(state.speed || 1);
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
    marker.rotation.z += dt * 0.8;
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
