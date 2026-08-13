import * as THREE from 'three';

const DEG = Math.PI / 180;
export const ORIGIN = { lng: 106.8272, lat: -6.1754 };
export const TILE_Z = 17;
const RADIUS = 4;

export function toLocal(lng, lat) {
    return {
        x: (lng - ORIGIN.lng) * 111320 * Math.cos(ORIGIN.lat * DEG),
        z: -(lat - ORIGIN.lat) * 110540
    };
}

export function toLngLat(x, z) {
    return {
        lng: ORIGIN.lng + x / (111320 * Math.cos(ORIGIN.lat * DEG)),
        lat: ORIGIN.lat - z / 110540
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

export function createJakartaGround(scene) {
    const group = new THREE.Group();
    group.name = 'jakarta-ground';
    scene.add(group);
    const loaded = new Map();
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    function ensureTile(tx, ty) {
        const key = `${tx},${ty}`;
        if (loaded.has(key)) return;
        const b = tileBounds(tx, ty, TILE_Z);
        const sw = toLocal(b.west, b.south);
        const ne = toLocal(b.east, b.north);
        const w = Math.abs(ne.x - sw.x);
        const d = Math.abs(ne.z - sw.z);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshBasicMaterial({ color: 0x2a3328 })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set((sw.x + ne.x) / 2, 0, (sw.z + ne.z) / 2);
        group.add(mesh);
        loaded.set(key, mesh);
        loader.load(
            `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${TILE_Z}/${ty}/${tx}`,
            (map) => {
                map.colorSpace = THREE.SRGBColorSpace;
                map.anisotropy = 4;
                mesh.material.map = map;
                mesh.material.color.set(0xffffff);
                mesh.material.needsUpdate = true;
            }
        );
    }

    function update(x, z) {
        const { lng, lat } = toLngLat(x, z);
        const tile = lngLatToTile(lng, lat, TILE_Z);
        const keep = new Set();
        for (let dy = -RADIUS; dy <= RADIUS; dy += 1) {
            for (let dx = -RADIUS; dx <= RADIUS; dx += 1) {
                const tx = tile.x + dx;
                const ty = tile.y + dy;
                keep.add(`${tx},${ty}`);
                ensureTile(tx, ty);
            }
        }
        for (const [key, mesh] of loaded) {
            if (keep.has(key)) continue;
            group.remove(mesh);
            mesh.geometry.dispose();
            if (mesh.material.map) mesh.material.map.dispose();
            mesh.material.dispose();
            loaded.delete(key);
        }
    }

    update(0, 0);
    return { update };
}
