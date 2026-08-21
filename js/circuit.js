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
raycaster.far = 500;
const _n = new THREE.Vector3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

function faceUp(hit) {
    if (!hit.face) return 0;
    _n.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
    return _n.y;
}

function floorHit(hits) {
    let best = null;
    for (const hit of hits) {
        if (faceUp(hit) < 0.35) continue;
        if (!best || hit.distance < best.distance) best = hit;
    }
    return best;
}

function sampleFloor(ground, x, z, ceiling) {
    origin.set(x, ceiling, z);
    raycaster.set(origin, down);
    return floorHit(raycaster.intersectObjects(ground, false));
}

function bboxOf(obj) {
    obj.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(obj);
}

function layFlatAndCenter(root, spanTarget) {
    let box = bboxOf(root);
    box.getSize(_size);
    if (_size.y > _size.x && _size.y > _size.z) {
        root.rotation.x = -Math.PI / 2;
        box = bboxOf(root);
        box.getSize(_size);
    }
    const span = Math.max(_size.x, _size.z) || 1;
    root.scale.multiplyScalar(spanTarget / span);

    box = bboxOf(root);
    box.getCenter(_center);
    root.position.x -= _center.x;
    root.position.z -= _center.z;

    box = bboxOf(root);
    root.position.y -= box.min.y;
    bboxOf(root);
}

export async function loadTrack(scene) {
    const loader = new FBXLoader();
    loader.setResourcePath(TEXTURE_PATH);
    const root = await loader.loadAsync(TRACK_URL);
    root.name = 'oga-race-track';
    layFlatAndCenter(root, 140);

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
        if (!obj.isMesh || !obj.geometry) return;
        obj.geometry.computeVertexNormals();
        obj.geometry.computeBoundingBox();
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        const bb = obj.geometry.boundingBox;
        const h = bb ? bb.max.y - bb.min.y : 0;
        const xz = bb ? Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) : 1;
        mats.forEach((mat) => {
            if (!mat) return;
            const name = `${mat.name || ''} ${obj.name || ''}`.toLowerCase();
            const isWall = /wall|barrier|curb/.test(name) || h > xz * 0.08;
            mat.map = isWall ? wallColor : roadColor;
            mat.normalMap = isWall ? wallNormal : roadNormal;
            mat.side = THREE.DoubleSide;
            if ('roughness' in mat) mat.roughness = isWall ? 0.82 : 0.55;
            if ('metalness' in mat) mat.metalness = 0.04;
            mat.needsUpdate = true;
        });
        ground.push(obj);
    });
    scene.add(root);

    const pad = new THREE.Mesh(
        new THREE.CircleGeometry(220, 48),
        new THREE.MeshStandardMaterial({ color: 0x6e7a70, roughness: 1, metalness: 0 })
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = -0.04;
    pad.receiveShadow = true;
    scene.add(pad);

    const placed = bboxOf(root);
    const ceiling = placed.max.y + 80;
    const cx = (placed.min.x + placed.max.x) * 0.5;
    const cz = (placed.min.z + placed.max.z) * 0.5;
    const span = Math.max(placed.max.x - placed.min.x, placed.max.z - placed.min.z);

    const samples = [];
    const grid = 36;
    for (let ix = 0; ix <= grid; ix += 1) {
        for (let iz = 0; iz <= grid; iz += 1) {
            const x = placed.min.x + (placed.max.x - placed.min.x) * (ix / grid);
            const z = placed.min.z + (placed.max.z - placed.min.z) * (iz / grid);
            const hit = sampleFloor(ground, x, z, ceiling);
            if (!hit) continue;
            const dist = Math.hypot(hit.point.x - cx, hit.point.z - cz);
            if (dist < span * 0.18) continue;
            samples.push(hit.point.clone());
        }
    }

    samples.sort((a, b) => a.y - b.y);
    const roadY = samples.length ? samples[Math.floor(samples.length * 0.25)].y : 0;
    const road = samples.filter((p) => Math.abs(p.y - roadY) < 1.2);
    const ring = road.length ? road : samples;

    ring.sort((a, b) => Math.atan2(a.z - cz, a.x - cx) - Math.atan2(b.z - cz, b.x - cx));

    let start = { x: cx, z: cz + span * 0.35, heading: 0 };
    if (ring.length >= 2) {
        let pick = 0;
        let bestZ = ring[0].z;
        ring.forEach((p, i) => {
            if (p.z > bestZ) {
                bestZ = p.z;
                pick = i;
            }
        });
        const a = ring[pick];
        const b = ring[(pick + 2) % ring.length];
        start = {
            x: a.x,
            z: a.z,
            heading: Math.atan2(b.x - a.x, b.z - a.z)
        };
    }

    const roadPoints = ring.length ? ring : [new THREE.Vector3(start.x, roadY, start.z)];

    return {
        start,
        sampleHeight(x, z, fallback) {
            const hit = sampleFloor(ground, x, z, ceiling);
            return hit ? hit.point.y : fallback;
        },
        keepOnTrack(pos) {
            const hit = sampleFloor(ground, pos.x, pos.z, ceiling);
            if (hit && Math.abs(hit.point.y - roadY) < 2.4) {
                return { x: pos.x, z: pos.z, hit: false };
            }
            let best = roadPoints[0];
            let bestD = Infinity;
            for (let i = 0; i < roadPoints.length; i += 1) {
                const p = roadPoints[i];
                const d = (p.x - pos.x) * (p.x - pos.x) + (p.z - pos.z) * (p.z - pos.z);
                if (d < bestD) {
                    bestD = d;
                    best = p;
                }
            }
            return { x: best.x, z: best.z, hit: true };
        },
        update() {}
    };
}
