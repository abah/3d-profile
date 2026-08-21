import * as THREE from 'three';

const STRAIGHT = 92;
const RADIUS = 48;
const HALF = 8.4;
const HW = STRAIGHT / 2;
const ARC = Math.PI * RADIUS;
const PERI = 2 * STRAIGHT + 2 * ARC;
const SEGMENTS = 180;

function stadiumAt(s) {
    let d = ((s % PERI) + PERI) % PERI;

    if (d <= STRAIGHT) {
        return { x: -HW + d, z: -RADIUS, tx: 1, tz: 0, nx: 0, nz: -1 };
    }
    d -= STRAIGHT;

    if (d <= ARC) {
        const a = -Math.PI / 2 + (d / ARC) * Math.PI;
        return {
            x: HW + RADIUS * Math.cos(a),
            z: RADIUS * Math.sin(a),
            tx: -Math.sin(a),
            tz: Math.cos(a),
            nx: Math.cos(a),
            nz: Math.sin(a)
        };
    }
    d -= ARC;

    if (d <= STRAIGHT) {
        return { x: HW - d, z: RADIUS, tx: -1, tz: 0, nx: 0, nz: 1 };
    }
    d -= STRAIGHT;

    const a = Math.PI / 2 + (d / ARC) * Math.PI;
    return {
        x: -HW + RADIUS * Math.cos(a),
        z: RADIUS * Math.sin(a),
        tx: -Math.sin(a),
        tz: Math.cos(a),
        nx: Math.cos(a),
        nz: Math.sin(a)
    };
}

function sampleLoop() {
    const pts = [];
    for (let i = 0; i <= SEGMENTS; i += 1) {
        pts.push(stadiumAt((i / SEGMENTS) * PERI));
    }
    return pts;
}

function ribbon(inner, outer, y) {
    const positions = [];
    const uvs = [];
    const indices = [];
    const n = inner.length;
    for (let i = 0; i < n; i += 1) {
        const a = inner[i];
        const b = outer[i];
        positions.push(a.x, y, a.z, b.x, y, b.z);
        uvs.push(i / (n - 1), 0, i / (n - 1), 1);
    }
    for (let i = 0; i < n - 1; i += 1) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
}

function offsetLoop(pts, innerOff, outerOff) {
    const inner = [];
    const outer = [];
    pts.forEach((p) => {
        inner.push({ x: p.x + p.nx * innerOff, z: p.z + p.nz * innerOff });
        outer.push({ x: p.x + p.nx * outerOff, z: p.z + p.nz * outerOff });
    });
    return { inner, outer };
}

function noiseTexture(size, base, specks) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < specks; i += 1) {
        const lum = (Math.random() * 48) | 0;
        g.fillStyle = `rgba(${lum},${lum},${lum},${Math.random() * 0.3})`;
        g.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1 + (Math.random() * 2) | 0, 1);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
}

function stadiumShape(hw, radius) {
    const shape = new THREE.Shape();
    shape.absarc(hw, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    shape.absarc(-hw, 0, radius, Math.PI / 2, (3 * Math.PI) / 2, false);
    shape.closePath();
    return shape;
}

function closestCenter(x, z) {
    if (x > HW) {
        const dx = x - HW;
        const len = Math.hypot(dx, z) || 1;
        return { x: HW + RADIUS * (dx / len), z: RADIUS * (z / len), nx: dx / len, nz: z / len };
    }
    if (x < -HW) {
        const dx = x + HW;
        const len = Math.hypot(dx, z) || 1;
        return { x: -HW + RADIUS * (dx / len), z: RADIUS * (z / len), nx: dx / len, nz: z / len };
    }
    if (z >= 0) return { x, z: RADIUS, nx: 0, nz: 1 };
    return { x, z: -RADIUS, nx: 0, nz: -1 };
}

function createCircuit(scene) {
    const asphaltMap = noiseTexture(256, '#1c2028', 5200);
    asphaltMap.repeat.set(48, 3);
    const sandMap = noiseTexture(128, '#c4a574', 2200);
    sandMap.repeat.set(22, 22);

    const sand = new THREE.Mesh(
        new THREE.CircleGeometry(280, 64),
        new THREE.MeshStandardMaterial({ color: 0xcbb48a, map: sandMap, roughness: 0.95, metalness: 0.02 })
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -0.08;
    scene.add(sand);

    const pts = sampleLoop();
    const road = offsetLoop(pts, -HALF, HALF);
    scene.add(new THREE.Mesh(
        ribbon(road.inner, road.outer, 0),
        new THREE.MeshStandardMaterial({
            color: 0x9aa3b0,
            map: asphaltMap,
            roughness: 0.48,
            metalness: 0.18
        })
    ));

    const runoff = offsetLoop(pts, HALF, HALF + 7);
    scene.add(new THREE.Mesh(
        ribbon(runoff.inner, runoff.outer, -0.02),
        new THREE.MeshStandardMaterial({ color: 0x6e5a3c, roughness: 0.92, metalness: 0.04 })
    ));

    const infield = new THREE.Mesh(
        new THREE.ShapeGeometry(stadiumShape(HW, RADIUS - HALF - 0.4), 48),
        new THREE.MeshStandardMaterial({ color: 0xb89a62, roughness: 0.9, metalness: 0.03 })
    );
    infield.rotation.x = -Math.PI / 2;
    infield.position.y = -0.01;
    scene.add(infield);

    const red = new THREE.MeshBasicMaterial({ color: 0xd3122a });
    const white = new THREE.MeshBasicMaterial({ color: 0xf4f7fb });
    for (let i = 0; i < SEGMENTS; i += 2) {
        const a = pts[i];
        const b = pts[Math.min(i + 2, SEGMENTS)];
        const inner = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 5.2), i % 4 ? red : white);
        inner.position.set(a.x + a.nx * (-HALF + 0.22), 0.04, a.z + a.nz * (-HALF + 0.22));
        inner.lookAt(b.x + b.nx * (-HALF + 0.22), 0.04, b.z + b.nz * (-HALF + 0.22));
        scene.add(inner);
        const outer = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 5.2), i % 4 ? white : red);
        outer.position.set(a.x + a.nx * (HALF - 0.22), 0.04, a.z + a.nz * (HALF - 0.22));
        outer.lookAt(b.x + b.nx * (HALF - 0.22), 0.04, b.z + b.nz * (HALF - 0.22));
        scene.add(outer);
    }

    const dash = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.4, metalness: 0.08 });
    for (let i = 0; i < SEGMENTS; i += 4) {
        const p = pts[i];
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 2.8), dash);
        mark.position.set(p.x, 0.025, p.z);
        mark.lookAt(p.x + p.tx, 0.025, p.z + p.tz);
        scene.add(mark);
    }

    const start = stadiumAt(STRAIGHT / 2);
    for (let i = -8; i <= 8; i += 1) {
        for (let k = 0; k < 4; k += 1) {
            const tile = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.02, 0.55),
                (i + k) % 2 ? white : new THREE.MeshBasicMaterial({ color: 0x111318 })
            );
            tile.position.set(
                start.x + start.tx * (k * 0.56 - 0.9) + start.nx * i * 0.52,
                0.03,
                start.z + start.tz * (k * 0.56 - 0.9) + start.nz * i * 0.52
            );
            scene.add(tile);
        }
    }

    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x4a4e56,
        roughness: 0.45,
        metalness: 0.35
    });
    for (let i = 0; i < SEGMENTS; i += 2) {
        const p = pts[i];
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.15, 3.7), wallMat);
        wall.position.set(p.x + p.nx * (HALF + 1.05), 0.58, p.z + p.nz * (HALF + 1.05));
        wall.lookAt(p.x, 0.58, p.z);
        scene.add(wall);
    }

    return {
        start: { x: start.x, z: start.z, heading: Math.PI / 2 },
        sampleHeight() {
            return 0;
        },
        keepOnTrack(pos) {
            const c = closestCenter(pos.x, pos.z);
            const side = (pos.x - c.x) * c.nx + (pos.z - c.z) * c.nz;
            const limit = HALF - 1.7;
            if (Math.abs(side) <= limit) return { x: pos.x, z: pos.z, hit: false };
            const clamped = Math.sign(side) * limit;
            return { x: c.x + c.nx * clamped, z: c.z + c.nz * clamped, hit: true };
        },
        update() {}
    };
}

export async function loadTrack(scene) {
    return createCircuit(scene);
}
