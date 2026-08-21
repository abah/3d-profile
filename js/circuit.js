import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const TRACK_URL = new URL('../models/race-track/race-track.fbx', import.meta.url).href;
const TEXTURE_PATH = new URL('../models/race-track/Textures/', import.meta.url).href;

export const TRACK_CREDIT = {
    title: 'Small Race Track',
    author: 'Lucian Pavel',
    license: 'CC0',
    url: 'https://opengameart.org/content/small-race-track'
};

const down = new THREE.Vector3(0, -1, 0);
const origin = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
raycaster.far = 400;
const _n = new THREE.Vector3();

function faceUp(hit) {
    if (!hit.face) return 0;
    _n.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
    return _n.y;
}

function floorHit(hits) {
    let best = null;
    for (const hit of hits) {
        if (faceUp(hit) < 0.45) continue;
        if (!best || hit.distance < best.distance) best = hit;
    }
    return best;
}

function sampleFloor(ground, x, z, ceiling) {
    origin.set(x, ceiling, z);
    raycaster.set(origin, down);
    return floorHit(raycaster.intersectObjects(ground, false));
}

export async function loadTrack(scene) {
    const loader = new FBXLoader();
    loader.setResourcePath(TEXTURE_PATH);
    const root = await loader.loadAsync(TRACK_URL);
    root.name = 'oga-race-track';

    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const span = Math.max(size.x, size.z) || 1;
    root.scale.setScalar(180 / span);
    root.updateMatrixWorld(true);

    const scaled = new THREE.Box3().setFromObject(root);
    const center = scaled.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.position.y -= scaled.min.y;
    root.updateMatrixWorld(true);

    const tex = new THREE.TextureLoader();
    function mapOf(file, srgb) {
        const texture = tex.load(new URL(file, TEXTURE_PATH).href);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 8;
        texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        return texture;
    }
    const roadColor = mapOf('Road.jpg', true);
    const roadNormal = mapOf('Road_NRM.png', false);
    const wallColor = mapOf('Walls.jpg', true);
    const wallNormal = mapOf('Walls_NRM.png', false);

    const ground = [];
    root.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
            if (!mat) return;
            const name = `${mat.name || ''} ${obj.name || ''}`.toLowerCase();
            if (obj.geometry && !obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            const bb = obj.geometry.boundingBox;
            const h = bb ? bb.max.y - bb.min.y : 0;
            const xz = bb ? Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) : 1;
            const isWall = /wall|barrier|curb/.test(name) || h > xz * 0.08;
            mat.map = isWall ? wallColor : roadColor;
            mat.normalMap = isWall ? wallNormal : roadNormal;
            mat.side = THREE.FrontSide;
            if ('roughness' in mat) mat.roughness = isWall ? 0.82 : 0.55;
            if ('metalness' in mat) mat.metalness = 0.04;
            mat.needsUpdate = true;
        });
        ground.push(obj);
    });
    scene.add(root);

    const placed = new THREE.Box3().setFromObject(root);
    const ceiling = placed.max.y + 40;
    const lastGood = { x: 0, z: 0 };
    let start = { x: 0, z: 0, heading: Math.PI / 2 };

    const candidates = [];
    for (let i = 0; i < 48; i += 1) {
        const t = i / 48;
        const x = placed.min.x + (placed.max.x - placed.min.x) * t;
        const z = (placed.min.z + placed.max.z) * 0.5;
        const hit = sampleFloor(ground, x, z, ceiling);
        if (hit) candidates.push(hit.point);
    }
    for (let i = 0; i < 48; i += 1) {
        const t = i / 48;
        const z = placed.min.z + (placed.max.z - placed.min.z) * t;
        const x = (placed.min.x + placed.max.x) * 0.5;
        const hit = sampleFloor(ground, x, z, ceiling);
        if (hit) candidates.push(hit.point);
    }

    if (candidates.length) {
        const mid = candidates[Math.floor(candidates.length * 0.35)];
        const ahead = candidates[Math.min(candidates.length - 1, Math.floor(candidates.length * 0.35) + 3)] || mid;
        start = {
            x: mid.x,
            z: mid.z,
            heading: Math.atan2(ahead.x - mid.x, ahead.z - mid.z)
        };
        lastGood.x = start.x;
        lastGood.z = start.z;
    }

    return {
        start,
        sampleHeight(x, z, fallback) {
            const hit = sampleFloor(ground, x, z, ceiling);
            return hit ? hit.point.y : fallback;
        },
        keepOnTrack(pos) {
            const hit = sampleFloor(ground, pos.x, pos.z, ceiling);
            if (hit) {
                lastGood.x = pos.x;
                lastGood.z = pos.z;
                return { x: pos.x, z: pos.z, hit: false };
            }
            return { x: lastGood.x, z: lastGood.z, hit: true };
        },
        update() {}
    };
}
