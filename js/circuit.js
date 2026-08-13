import * as THREE from 'three';

const STRAIGHT = 78;
const RADIUS = 42;
const HALF = 8.2;
const HW = STRAIGHT / 2;
const ARC = Math.PI * RADIUS;
const PERI = 2 * STRAIGHT + 2 * ARC;
const SEGMENTS = 200;

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
        const lum = (Math.random() * 40) | 0;
        g.fillStyle = `rgba(${lum},${lum},${lum},${Math.random() * 0.28})`;
        g.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1 + (Math.random() * 2) | 0, 1);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
}

function windowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const g = canvas.getContext('2d');
    g.fillStyle = '#10141c';
    g.fillRect(0, 0, 64, 128);
    for (let y = 5; y < 122; y += 9) {
        for (let x = 4; x < 60; x += 8) {
            const on = ((x * 3 + y * 5) % 11) > 3;
            g.fillStyle = on ? (y % 18 < 9 ? '#7fe9ff' : '#ffd18a') : '#161c26';
            g.fillRect(x, y, 5, 6);
        }
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
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

export function createCircuit(scene) {
    const asphaltMap = noiseTexture(256, '#1c2028', 5200);
    asphaltMap.repeat.set(40, 3);

    const grassMap = noiseTexture(128, '#0c1810', 1800);
    grassMap.repeat.set(18, 10);

    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(260, 64),
        new THREE.MeshStandardMaterial({ color: 0x07090f, roughness: 0.95, metalness: 0.04 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.08;
    scene.add(ground);

    const pts = sampleLoop();
    const road = offsetLoop(pts, -HALF, HALF);
    scene.add(new THREE.Mesh(
        ribbon(road.inner, road.outer, 0),
        new THREE.MeshStandardMaterial({
            color: 0x9aa3b0,
            map: asphaltMap,
            roughness: 0.42,
            metalness: 0.28
        })
    ));

    const runoff = offsetLoop(pts, HALF, HALF + 6);
    scene.add(new THREE.Mesh(
        ribbon(runoff.inner, runoff.outer, -0.02),
        new THREE.MeshStandardMaterial({ color: 0x141820, roughness: 0.9, metalness: 0.08 })
    ));

    const infieldGeo = new THREE.ShapeGeometry(stadiumShape(HW, RADIUS - HALF - 0.35), 48);
    const infield = new THREE.Mesh(
        infieldGeo,
        new THREE.MeshStandardMaterial({ color: 0x6f8a62, map: grassMap, roughness: 0.92, metalness: 0.05 })
    );
    infield.rotation.x = -Math.PI / 2;
    infield.position.y = -0.01;
    scene.add(infield);

    const cyan = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const pink = new THREE.MeshBasicMaterial({ color: 0xff6b9d });
    const white = new THREE.MeshBasicMaterial({ color: 0xf4f7fb });

    for (let i = 0; i < SEGMENTS; i += 2) {
        const a = pts[i];
        const b = pts[Math.min(i + 2, SEGMENTS)];
        const inner = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 5.1), i % 4 ? cyan : pink);
        inner.position.set(a.x + a.nx * (-HALF + 0.22), 0.04, a.z + a.nz * (-HALF + 0.22));
        inner.lookAt(b.x + b.nx * (-HALF + 0.22), 0.04, b.z + b.nz * (-HALF + 0.22));
        scene.add(inner);
        const outer = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 5.1), i % 4 ? pink : cyan);
        outer.position.set(a.x + a.nx * (HALF - 0.22), 0.04, a.z + a.nz * (HALF - 0.22));
        outer.lookAt(b.x + b.nx * (HALF - 0.22), 0.04, b.z + b.nz * (HALF - 0.22));
        scene.add(outer);
    }

    const dash = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.35, metalness: 0.12 });
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
        color: 0x151a22,
        roughness: 0.32,
        metalness: 0.62,
        emissive: 0x041820,
        emissiveIntensity: 0.55
    });
    for (let i = 0; i < SEGMENTS; i += 2) {
        const p = pts[i];
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.2, 3.6), wallMat);
        wall.position.set(p.x + p.nx * (HALF + 1.05), 0.6, p.z + p.nz * (HALF + 1.05));
        wall.lookAt(p.x, 0.6, p.z);
        scene.add(wall);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 3.6), i % 4 ? cyan : pink);
        rail.position.set(p.x + p.nx * (HALF + 1.05), 1.22, p.z + p.nz * (HALF + 1.05));
        rail.lookAt(p.x, 1.22, p.z);
        scene.add(rail);
    }

    const postMat = new THREE.MeshStandardMaterial({ color: 0x0c1016, metalness: 0.75, roughness: 0.28 });
    const glowCyan = new THREE.MeshBasicMaterial({ color: 0x7aefff });
    const glowPink = new THREE.MeshBasicMaterial({ color: 0xff9ec0 });
    for (let i = 0; i < 18; i += 1) {
        const p = stadiumAt((i / 18) * PERI);
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7.4, 8), postMat);
        lamp.position.set(p.x + p.nx * (HALF + 2.4), 3.7, p.z + p.nz * (HALF + 2.4));
        scene.add(lamp);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), i % 2 ? glowCyan : glowPink);
        bulb.position.set(lamp.position.x, 7.15, lamp.position.z);
        scene.add(bulb);
    }

    const archMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const col = new THREE.BoxGeometry(0.45, 8.2, 0.45);
    const left = new THREE.Mesh(col, archMat);
    const right = new THREE.Mesh(col, archMat);
    left.position.set(start.x + start.nx * (HALF + 0.2), 4.1, start.z + start.nz * (HALF + 0.2));
    right.position.set(start.x - start.nx * (HALF + 0.2), 4.1, start.z - start.nz * (HALF + 0.2));
    const beam = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + 1.2, 0.55, 0.55), new THREE.MeshBasicMaterial({ color: 0xff6b9d }));
    beam.position.set(start.x, 8.2, start.z);
    scene.add(left, right, beam);

    const seatMat = new THREE.MeshStandardMaterial({
        color: 0x1a2230,
        roughness: 0.48,
        metalness: 0.22,
        emissive: 0x112233,
        emissiveIntensity: 0.4
    });
    for (let row = 0; row < 5; row += 1) {
        const stand = new THREE.Mesh(new THREE.BoxGeometry(STRAIGHT * 0.72, 2.2 + row * 1.4, 4.2), seatMat);
        stand.position.set(0, 1.1 + row * 1.15, RADIUS + HALF + 8 + row * 3.1);
        scene.add(stand);
    }
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(STRAIGHT * 0.76, 0.35, 18),
        new THREE.MeshStandardMaterial({ color: 0x0e141c, metalness: 0.55, roughness: 0.35, emissive: 0x003344, emissiveIntensity: 0.5 })
    );
    roof.position.set(0, 8.4, RADIUS + HALF + 14);
    scene.add(roof);

    const facade = windowTexture();
    const towerMat = new THREE.MeshStandardMaterial({
        map: facade,
        roughness: 0.48,
        metalness: 0.2,
        emissive: 0x0a2030,
        emissiveIntensity: 0.45
    });
    for (let i = 0; i < 16; i += 1) {
        const ang = (i / 16) * Math.PI * 2 + 0.2;
        const dist = 168 + (i % 5) * 10;
        const h = 22 + ((i * 13) % 36);
        const tower = new THREE.Mesh(new THREE.BoxGeometry(9 + (i % 3) * 3, h, 9), towerMat);
        tower.position.set(Math.cos(ang) * dist, h / 2, Math.sin(ang) * dist);
        scene.add(tower);
    }

    const ring = new THREE.Mesh(
        new THREE.RingGeometry(14, 14.18, 72),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    scene.add(ring);
    const ring2 = new THREE.Mesh(
        new THREE.RingGeometry(20, 20.16, 72),
        new THREE.MeshBasicMaterial({ color: 0xff6b9d, side: THREE.DoubleSide, transparent: true, opacity: 0.32 })
    );
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.06;
    scene.add(ring2);

    scene.add(new THREE.PointLight(0x00d4ff, 12, 48, 2).translateX(0).translateY(10).translateZ(-RADIUS));
    scene.add(new THREE.PointLight(0xff6b9d, 8, 40, 2).translateX(0).translateY(9).translateZ(RADIUS + 8));
    scene.add(new THREE.PointLight(0xffffff, 6, 36, 2).translateX(HW + RADIUS).translateY(8).translateZ(0));

    return {
        start: { x: start.x, z: start.z, heading: Math.PI / 2 },
        keepOnTrack(pos) {
            const c = closestCenter(pos.x, pos.z);
            const side = (pos.x - c.x) * c.nx + (pos.z - c.z) * c.nz;
            const limit = HALF - 1.7;
            if (Math.abs(side) <= limit) return { x: pos.x, z: pos.z, hit: false };
            const clamped = Math.sign(side) * limit;
            return { x: c.x + c.nx * clamped, z: c.z + c.nz * clamped, hit: true };
        },
        update(dt) {
            ring.rotation.z += dt * 0.14;
            ring2.rotation.z -= dt * 0.09;
        }
    };
}
