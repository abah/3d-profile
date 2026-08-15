import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const TRACK_URL = 'https://cdn.jsdelivr.net/gh/pmndrs/racing-game@main/public/models/track-draco.glb';

export const TRACK_CREDIT = {
    title: 'Desert Race Game Prototype Map V2',
    author: 'Batuhan13',
    license: 'CC-BY 4.0',
    url: 'https://sketchfab.com/3d-models/desert-race-game-prototype-map-v2-2ccd3dcbd197415d9f1b97c30b1248c5'
};

const START = {
    x: -110,
    z: 220,
    heading: Math.PI / 2 + 0.35
};

const down = new THREE.Vector3(0, -1, 0);
const origin = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
raycaster.far = 220;

function makeLoader() {
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/libs/draco/gltf/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    return loader;
}

function isSkyProp(name) {
    return /cloud|bird|blade/i.test(name);
}

export async function loadTrack(scene) {
    const gltf = await makeLoader().loadAsync(TRACK_URL);
    const root = gltf.scene;
    root.name = 'desert-race';
    scene.add(root);

    const ground = [];
    const birds = [];
    const clouds = [];
    const blades = [];

    root.traverse((obj) => {
        const name = obj.name || '';
        if (/^bird/i.test(name)) birds.push(obj);
        if (/^cloud/i.test(name)) clouds.push(obj);
        if (/^blade/i.test(name)) blades.push(obj);
        if (!obj.isMesh) return;
        const mat = obj.material;
        if (mat && 'roughness' in mat) mat.roughness = 1;
        if (!isSkyProp(name)) {
            ground.push(obj);
            obj.receiveShadow = true;
        }
    });

    function sampleHeight(x, z, fallback) {
        origin.set(x, 90, z);
        raycaster.set(origin, down);
        const hits = raycaster.intersectObjects(ground, false);
        if (!hits.length) return fallback;
        return hits[0].point.y;
    }

    return {
        start: { ...START },
        sampleHeight,
        keepOnTrack(pos) {
            return { x: pos.x, z: pos.z, hit: false };
        },
        update(dt) {
            birds.forEach((bird, index) => {
                bird.rotation.y += dt / Math.max(1, index);
            });
            clouds.forEach((cloud, index) => {
                cloud.rotation.y += dt / 25 / Math.max(1, index);
            });
            blades.forEach((blade) => {
                blade.rotation.z += dt * 1.8;
            });
        }
    };
}
