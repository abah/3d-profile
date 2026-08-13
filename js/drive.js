import * as THREE from 'three';
import { REAL_MODELS, loadRealCar, disposeLoadedCar } from './real-cars.js';
import { CAR_MODELS, createCar, disposeCar } from './cars.js';

const START = { lng: 106.82325, lat: -6.2088, heading: 348 };
const DEG = Math.PI / 180;
const HEADING_OFFSET = Math.PI;

const keys = { up: false, down: false, left: false, right: false };
const state = {
    lng: START.lng,
    lat: START.lat,
    heading: START.heading,
    speed: 0,
    car: null,
    last: performance.now()
};

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

const map = new maplibregl.Map({
    container: 'map',
    antialias: true,
    keyboard: false,
    dragPan: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    style: {
        version: 8,
        glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
        light: {
            anchor: 'viewport',
            intensity: 0.55,
            position: [1.15, 210, 30]
        },
        sources: {
            satellite: {
                type: 'raster',
                tiles: [
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                ],
                tileSize: 256,
                attribution: 'Tiles © Esri, Maxar, Earthstar Geographics'
            },
            openmaptiles: {
                type: 'vector',
                url: 'https://tiles.openfreemap.org/planet'
            }
        },
        layers: [
            {
                id: 'sky',
                type: 'background',
                paint: { 'background-color': '#7eb6d9' }
            },
            { id: 'satelit', type: 'raster', source: 'satellite' },
            {
                id: 'road',
                type: 'line',
                source: 'openmaptiles',
                'source-layer': 'transportation',
                minzoom: 13,
                filter: [
                    'in',
                    'class',
                    'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'
                ],
                paint: {
                    'line-color': 'rgba(255, 245, 220, 0.32)',
                    'line-width': [
                        'interpolate', ['linear'], ['zoom'],
                        14, 1.2,
                        18, 10
                    ]
                }
            },
            {
                id: 'building-3d',
                type: 'fill-extrusion',
                source: 'openmaptiles',
                'source-layer': 'building',
                minzoom: 14,
                paint: {
                    'fill-extrusion-vertical-gradient': true,
                    'fill-extrusion-color': [
                        'interpolate', ['linear'],
                        ['coalesce', ['get', 'render_height'], 12],
                        0, '#cbb89a',
                        18, '#b7c2cc',
                        55, '#8ea6bb',
                        140, '#d5e4f0'
                    ],
                    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 10],
                    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                    'fill-extrusion-opacity': 0.94
                }
            }
        ]
    },
    center: [START.lng, START.lat],
    zoom: 17.55,
    pitch: 68,
    bearing: START.heading,
    maxPitch: 80,
    minZoom: 15,
    maxZoom: 18.5
});

const modelTransform = {
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: Math.PI / 2,
    rotateY: 0,
    rotateZ: 0,
    scale: 1
};

function syncTransform() {
    const merc = maplibregl.MercatorCoordinate.fromLngLat(
        [state.lng, state.lat],
        0.4
    );
    modelTransform.translateX = merc.x;
    modelTransform.translateY = merc.y;
    modelTransform.translateZ = merc.z;
    modelTransform.scale = merc.meterInMercatorCoordinateUnits();
    modelTransform.rotateZ = -state.heading * DEG + HEADING_OFFSET;
}

function matrixFromArgs(args) {
    if (!args) return null;
    if (args.defaultProjectionData && args.defaultProjectionData.mainMatrix) {
        return args.defaultProjectionData.mainMatrix;
    }
    if (args.modelViewProjectionMatrix) return args.modelViewProjectionMatrix;
    return args;
}

const carLayer = {
    id: 'drive-car',
    type: 'custom',
    renderingMode: '3d',
    onAdd(mapInst, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
        const sun = new THREE.DirectionalLight(0xfff4e5, 1.35);
        sun.position.set(40, 80, 20);
        this.scene.add(sun);
        const fill = new THREE.DirectionalLight(0x9ecbff, 0.45);
        fill.position.set(-30, 20, -40);
        this.scene.add(fill);

        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1.3, 24),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.32,
                depthWrite: false
            })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.02;
        this.scene.add(shadow);

        this.map = mapInst;
        this.renderer = new THREE.WebGLRenderer({
            canvas: mapInst.getCanvas(),
            context: gl,
            antialias: true
        });
        this.renderer.autoClear = false;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    },
    render(gl, args) {
        step(performance.now());
        const raw = matrixFromArgs(args);
        if (!raw) return;
        const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
        const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
        const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);
        const m = new THREE.Matrix4().fromArray(raw);
        const l = new THREE.Matrix4()
            .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
            .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
};

function step(now) {
    const dt = Math.min(0.05, (now - state.last) / 1000);
    state.last = now;

    const accel = keys.up ? 18 : 0;
    const brake = keys.down ? 28 : 7;
    if (keys.up) state.speed += accel * dt;
    state.speed -= Math.sign(state.speed || 1) * brake * dt * (keys.down || !keys.up ? 1 : 0.15);
    if (!keys.up && Math.abs(state.speed) < 0.35) state.speed = 0;
    if (keys.down && state.speed < 0.4) state.speed -= 11 * dt;
    state.speed = Math.max(-12, Math.min(38, state.speed));

    const steer = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
    const grip = Math.min(1, Math.abs(state.speed) / 6);
    state.heading += steer * grip * 78 * dt * Math.sign(state.speed || 1);

    const rad = state.heading * DEG;
    const dist = state.speed * dt;
    const north = Math.cos(rad) * dist;
    const east = Math.sin(rad) * dist;
    state.lat += north / 110540;
    state.lng += east / (111320 * Math.cos(state.lat * DEG));

    if (state.car) {
        const spin = (state.speed * dt) / 0.34;
        state.car.wheels.forEach((wheel) => {
            const axle = wheel.userData.axle;
            if (axle) wheel.rotateOnAxis(axle, spin);
        });
    }

    syncTransform();
    map.jumpTo({
        center: [state.lng, state.lat],
        bearing: state.heading,
        pitch: 68
    });
    speedNum.textContent = String(Math.round(Math.abs(state.speed) * 3.6));
}

async function spawnCar(id) {
    const spec = catalog.find((item) => item.id === id) || catalog[0];
    carNameEl.textContent = spec.name;
    carSelect.value = spec.id;
    const next = spec.url
        ? await loadRealCar(spec, { paint: spec.defaultPaint })
        : createCar(spec, { paint: spec.defaultPaint, rimColor: 0xd8dce2 });

    if (!carLayer.scene) return;

    if (state.car) {
        carLayer.scene.remove(state.car.root);
        if (state.car.spec.url) disposeLoadedCar(state.car);
        else disposeCar(state.car);
    }
    state.car = next;
    carLayer.scene.add(next.root);
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
    el.addEventListener('lostpointercapture', off);
}

bindHold('btn-gas', 'up');
bindHold('btn-brake', 'down');
bindHold('btn-left', 'left');
bindHold('btn-right', 'right');

window.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' || event.code === 'KeyW') keys.up = true;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') keys.down = true;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = true;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = true;
});
window.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowUp' || event.code === 'KeyW') keys.up = false;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') keys.down = false;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = false;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = false;
});

carSelect.addEventListener('change', () => {
    spawnCar(carSelect.value).catch(console.error);
});

map.on('style.load', async () => {
    map.addLayer(carLayer);
    try {
        await spawnCar('ferrari-458');
    } catch (err) {
        console.error(err);
        await spawnCar(CAR_MODELS[0].id);
    }
    syncTransform();
    loadingEl.classList.add('hide');
});
