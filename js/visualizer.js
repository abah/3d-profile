import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CAR_MODELS, PAINT_COLORS, RIM_COLORS, RIM_STYLES, createCar, disposeCar } from './cars.js';

const stage = document.getElementById('stage');
const loading = document.getElementById('loading');
const modelList = document.getElementById('model-list');
const paintSwatches = document.getElementById('paint-swatches');
const rimSwatches = document.getElementById('rim-swatches');
const rimStylesEl = document.getElementById('rim-styles');
const statsEl = document.getElementById('stats');
const titleEl = document.getElementById('car-title');
const taglineEl = document.getElementById('car-tagline');

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07090f);
scene.fog = new THREE.Fog(0x07090f, 12, 28);

const pmrem = new THREE.PMREMGenerator(renderer);
const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envMap;

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(5.4, 2.1, 5.8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4.2;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 0.7, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;

const hemi = new THREE.HemisphereLight(0xb9d4ff, 0x1a120c, 0.55);
scene.add(hemi);

const key = new THREE.SpotLight(0xffffff, 80, 30, Math.PI / 5, 0.35, 1);
key.position.set(6, 8, 4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0002;
scene.add(key);

const fill = new THREE.SpotLight(0x88c8ff, 28, 24, Math.PI / 4, 0.5, 1);
fill.position.set(-6, 5, -2);
scene.add(fill);

const rimLight = new THREE.SpotLight(0xffc4a8, 22, 20, Math.PI / 5, 0.45, 1);
rimLight.position.set(-2, 4, 7);
scene.add(rimLight);

const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 72),
    new THREE.MeshStandardMaterial({
        color: 0x12151c,
        metalness: 0.72,
        roughness: 0.22,
        envMapIntensity: 1.1
    })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const ring = new THREE.Mesh(
    new THREE.RingGeometry(3.15, 3.22, 80),
    new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.01;
scene.add(ring);

const ring2 = ring.clone();
ring2.geometry = new THREE.RingGeometry(4.35, 4.4, 80);
ring2.material = new THREE.MeshBasicMaterial({ color: 0xff6b9d, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
ring2.position.y = 0.012;
scene.add(ring2);

const grid = new THREE.PolarGridHelper(8, 16, 8, 64, 0x1d2433, 0x141821);
grid.position.y = 0.002;
scene.add(grid);

function makeBackdrop() {
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0c1018,
        roughness: 0.9,
        metalness: 0.05
    });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 10.5, 5.2, 48, 1, true), wallMat);
    wall.position.y = 2.4;
    wall.receiveShadow = true;
    scene.add(wall);

    for (let i = 0; i < 8; i++) {
        const lamp = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.06, 0.18),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 2.2
            })
        );
        const a = (i / 8) * Math.PI * 2;
        lamp.position.set(Math.cos(a) * 7.2, 4.4, Math.sin(a) * 7.2);
        lamp.lookAt(0, 4.4, 0);
        scene.add(lamp);
    }
}
makeBackdrop();

const state = {
    modelId: CAR_MODELS[0].id,
    paint: CAR_MODELS[0].defaultPaint,
    rimColor: RIM_COLORS[0].hex,
    rimStyle: RIM_STYLES[0],
    car: null
};

function spawnCar() {
    const spec = CAR_MODELS.find((m) => m.id === state.modelId);
    if (state.car) {
        scene.remove(state.car.root);
        disposeCar(state.car);
    }
    state.car = createCar(spec, {
        envMap,
        paint: state.paint,
        rimColor: state.rimColor,
        rimStyle: state.rimStyle
    });
    scene.add(state.car.root);
    titleEl.textContent = spec.name;
    taglineEl.textContent = spec.tagline;
    key.target = state.car.root;
    fill.target = state.car.root;
    rimLight.target = state.car.root;
}

function setActive(container, selector, el) {
    container.querySelectorAll(selector).forEach((node) => node.classList.remove('active'));
    el.classList.add('active');
}

function buildUI() {
    CAR_MODELS.forEach((model, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'model-btn' + (index === 0 ? ' active' : '');
        btn.innerHTML = `${model.name}<small>${model.tagline}</small>`;
        btn.addEventListener('click', () => {
            state.modelId = model.id;
            state.paint = model.defaultPaint;
            spawnCar();
            setActive(modelList, '.model-btn', btn);
            paintSwatches.querySelectorAll('.swatch').forEach((sw) => {
                sw.classList.toggle('active', Number(sw.dataset.hex) === state.paint);
            });
        });
        modelList.appendChild(btn);
    });

    PAINT_COLORS.forEach((color) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (color.hex === state.paint ? ' active' : '');
        sw.title = color.name;
        sw.dataset.hex = String(color.hex);
        sw.style.background = `#${color.hex.toString(16).padStart(6, '0')}`;
        sw.addEventListener('click', () => {
            state.paint = color.hex;
            state.car.setPaint(color.hex);
            setActive(paintSwatches, '.swatch', sw);
        });
        paintSwatches.appendChild(sw);
    });

    RIM_STYLES.forEach((style, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rim-btn' + (index === 0 ? ' active' : '');
        btn.textContent = style.name;
        btn.addEventListener('click', () => {
            state.rimStyle = style;
            state.car.rebuildRims(style, state.rimColor);
            setActive(rimStylesEl, '.rim-btn', btn);
        });
        rimStylesEl.appendChild(btn);
    });

    RIM_COLORS.forEach((color, index) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (index === 0 ? ' active' : '');
        sw.title = color.name;
        sw.style.background = `#${color.hex.toString(16).padStart(6, '0')}`;
        sw.addEventListener('click', () => {
            state.rimColor = color.hex;
            state.car.setRimColor(color.hex);
            setActive(rimSwatches, '.swatch', sw);
        });
        rimSwatches.appendChild(sw);
    });
}

document.getElementById('cam-auto').addEventListener('click', (e) => {
    controls.autoRotate = true;
    document.getElementById('cam-auto').classList.add('active');
    document.getElementById('cam-free').classList.remove('active');
});

document.getElementById('cam-free').addEventListener('click', () => {
    controls.autoRotate = false;
    document.getElementById('cam-free').classList.add('active');
    document.getElementById('cam-auto').classList.remove('active');
});

document.getElementById('btn-fullscreen').addEventListener('click', async () => {
    if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
    } else {
        await document.exitFullscreen();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let frames = 0;
let lastFps = performance.now();
let last = performance.now();

function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (state.car) {
        const spin = dt * 6;
        state.car.wheels.forEach((wheel) => {
            wheel.rotateZ(-spin);
        });
    }

    ring.rotation.z += dt * 0.15;
    controls.update();
    renderer.render(scene, camera);

    frames += 1;
    if (now - lastFps >= 500) {
        const fps = Math.round((frames * 1000) / (now - lastFps));
        statsEl.textContent = `${fps} FPS`;
        frames = 0;
        lastFps = now;
    }
}

buildUI();
spawnCar();
animate(performance.now());
setTimeout(() => loading.classList.add('hide'), 500);
