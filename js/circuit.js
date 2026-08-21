import * as THREE from 'three';

const HALF = 8.6;
const SEGMENTS = 280;
const LIMIT = HALF - 1.65;

const CONTROL = [
    [0, 0],
    [70, 0],
    [150, 2],
    [230, 8],
    [300, 42],
    [345, 110],
    [350, 185],
    [310, 250],
    [230, 285],
    [145, 278],
    [85, 240],
    [55, 185],
    [58, 130],
    [30, 85],
    [-35, 62],
    [-110, 78],
    [-170, 130],
    [-195, 210],
    [-165, 290],
    [-80, 340],
    [20, 355],
    [120, 335],
    [200, 285],
    [250, 215],
    [255, 140],
    [215, 75],
    [140, 22],
    [65, 4]
];

function catmull(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        (2 * p1)
        + (-p0 + p2) * t
        + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
        + (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}

function wrap(i, n) {
    return ((i % n) + n) % n;
}

function rawSpline(t) {
    const n = CONTROL.length;
    const u = ((t % 1) + 1) % 1;
    const scaled = u * n;
    const i = Math.floor(scaled);
    const f = scaled - i;
    const x = catmull(
        CONTROL[wrap(i - 1, n)][0],
        CONTROL[i][0],
        CONTROL[wrap(i + 1, n)][0],
        CONTROL[wrap(i + 2, n)][0],
        f
    );
    const z = catmull(
        CONTROL[wrap(i - 1, n)][1],
        CONTROL[i][1],
        CONTROL[wrap(i + 1, n)][1],
        CONTROL[wrap(i + 2, n)][1],
        f
    );
    const climb = 2.4 * Math.sin(u * Math.PI * 2) + 1.1 * Math.sin(u * Math.PI * 4 + 0.6);
    return { x, y: Math.max(0, climb), z };
}

function sampleLoop() {
    const dense = [];
    const steps = CONTROL.length * 24;
    let length = 0;
    for (let i = 0; i <= steps; i += 1) {
        const p = rawSpline(i / steps);
        if (i > 0) {
            const q = dense[i - 1];
            length += Math.hypot(p.x - q.x, p.z - q.z);
        }
        dense.push({ ...p, s: length });
    }
    const peri = dense[dense.length - 1].s;
    const pts = [];
    let j = 0;
    for (let i = 0; i < SEGMENTS; i += 1) {
        const target = (i / SEGMENTS) * peri;
        while (j < dense.length - 2 && dense[j + 1].s < target) j += 1;
        const a = dense[j];
        const b = dense[j + 1];
        const span = Math.max(1e-4, b.s - a.s);
        const f = (target - a.s) / span;
        const x = a.x + (b.x - a.x) * f;
        const y = a.y + (b.y - a.y) * f;
        const z = a.z + (b.z - a.z) * f;
        pts.push({ x, y, z, s: target, peri });
    }
    for (let i = 0; i < SEGMENTS; i += 1) {
        const p = pts[i];
        const n = pts[(i + 1) % SEGMENTS];
        const tx = n.x - p.x;
        const tz = n.z - p.z;
        const len = Math.hypot(tx, tz) || 1;
        p.tx = tx / len;
        p.tz = tz / len;
        p.nx = -p.tz;
        p.nz = p.tx;
        const prev = pts[(i - 1 + SEGMENTS) % SEGMENTS];
        p.curve = Math.abs(p.tx * prev.tz - p.tz * prev.tx);
    }
    pts.peri = peri;
    return pts;
}

function offset(pts, innerOff, outerOff, yLift = 0) {
    const inner = [];
    const outer = [];
    pts.forEach((p) => {
        inner.push({
            x: p.x + p.nx * innerOff,
            y: p.y + yLift,
            z: p.z + p.nz * innerOff
        });
        outer.push({
            x: p.x + p.nx * outerOff,
            y: p.y + yLift,
            z: p.z + p.nz * outerOff
        });
    });
    inner.push(inner[0]);
    outer.push(outer[0]);
    return { inner, outer };
}

function ribbon(inner, outer) {
    const positions = [];
    const uvs = [];
    const indices = [];
    const n = inner.length;
    for (let i = 0; i < n; i += 1) {
        const a = inner[i];
        const b = outer[i];
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
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

function noiseTexture(size, base, specks, extra) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, size, size);
    extra?.(g, size);
    for (let i = 0; i < specks; i += 1) {
        const lum = (Math.random() * 56) | 0;
        g.fillStyle = `rgba(${lum},${lum},${lum},${Math.random() * 0.28})`;
        g.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 1 + ((Math.random() * 2) | 0), 1);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
}

function kerbTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 2;
    const g = canvas.getContext('2d');
    g.fillStyle = '#e10f24';
    g.fillRect(0, 0, 4, 2);
    g.fillStyle = '#f4f7fb';
    g.fillRect(4, 0, 4, 2);
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.magFilter = THREE.NearestFilter;
    map.repeat.set(90, 1);
    return map;
}

function dummyMatrix(x, y, z, tx, tz, sx, sy, sz) {
    const dummy = new THREE.Object3D();
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, sy, sz);
    dummy.lookAt(x + tx, y, z + tz);
    dummy.updateMatrix();
    return dummy.matrix.clone();
}

function addInstanced(scene, geo, mat, matrices, shadows = true) {
    const mesh = new THREE.InstancedMesh(geo, mat, matrices.length);
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = shadows;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

function closestIndex(pts, x, z) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < pts.length; i += 1) {
        const dx = x - pts[i].x;
        const dz = z - pts[i].z;
        const d = dx * dx + dz * dz;
        if (d < bestD) {
            bestD = d;
            best = i;
        }
    }
    return best;
}

function offAsphalt(pts, x, z, margin) {
    const p = pts[closestIndex(pts, x, z)];
    const side = (x - p.x) * p.nx + (z - p.z) * p.nz;
    return Math.abs(side) > HALF + margin;
}

function createCircuit(scene) {
    const pts = sampleLoop();
    const start = pts[8];

    const grassMap = noiseTexture(256, '#4f8a3c', 3800, (g, size) => {
        g.fillStyle = '#3f7430';
        for (let i = 0; i < 80; i += 1) {
            g.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 18, 10);
        }
    });
    grassMap.repeat.set(72, 72);

    const asphaltMap = noiseTexture(512, '#2c3038', 9000, (g, size) => {
        g.fillStyle = 'rgba(10, 11, 13, 0.32)';
        g.fillRect(size * 0.34, 0, size * 0.32, size);
        g.strokeStyle = 'rgba(0,0,0,0.18)';
        g.lineWidth = 2;
        for (let i = 0; i < 28; i += 1) {
            g.beginPath();
            g.moveTo(size * (0.28 + Math.random() * 0.44), 0);
            g.lineTo(size * (0.28 + Math.random() * 0.44), size);
            g.stroke();
        }
    });
    asphaltMap.repeat.set(64, 1);

    const gravelMap = noiseTexture(128, '#b59a6a', 2600);
    gravelMap.repeat.set(36, 4);

    const grass = new THREE.Mesh(
        new THREE.CircleGeometry(520, 72),
        new THREE.MeshStandardMaterial({ color: 0x6aa34a, map: grassMap, roughness: 0.95, metalness: 0.02 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.12;
    grass.receiveShadow = true;
    scene.add(grass);

    const road = offset(pts, -HALF, HALF, 0.02);
    const roadMesh = new THREE.Mesh(
        ribbon(road.inner, road.outer),
        new THREE.MeshStandardMaterial({
            color: 0xa8b0ba,
            map: asphaltMap,
            roughness: 0.42,
            metalness: 0.16
        })
    );
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    const lineMat = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.45, metalness: 0.04 });
    scene.add(new THREE.Mesh(ribbon(...Object.values(offset(pts, -HALF + 0.18, -HALF + 0.42, 0.035))), lineMat));
    scene.add(new THREE.Mesh(ribbon(...Object.values(offset(pts, HALF - 0.42, HALF - 0.18, 0.035))), lineMat));

    const dashMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f7, roughness: 0.4, metalness: 0.05 });
    const dashGeo = new THREE.BoxGeometry(0.16, 0.03, 3.1);
    const dashes = [];
    for (let i = 0; i < SEGMENTS; i += 5) {
        const p = pts[i];
        dashes.push(dummyMatrix(p.x, p.y + 0.04, p.z, p.tx, p.tz, 1, 1, 1));
    }
    addInstanced(scene, dashGeo, dashMat, dashes, false);

    const kerbMat = new THREE.MeshStandardMaterial({
        map: kerbTexture(),
        roughness: 0.35,
        metalness: 0.08
    });
    const kInner = offset(pts, -HALF - 0.05, -HALF + 1.05, 0.05);
    const kOuter = offset(pts, HALF - 1.05, HALF + 0.05, 0.05);
    scene.add(new THREE.Mesh(ribbon(kInner.inner, kInner.outer), kerbMat));
    scene.add(new THREE.Mesh(ribbon(kOuter.inner, kOuter.outer), kerbMat));

    const runoff = offset(pts, HALF + 0.1, HALF + 9.5, -0.03);
    const runoffMesh = new THREE.Mesh(
        ribbon(runoff.inner, runoff.outer),
        new THREE.MeshStandardMaterial({ color: 0xc2a56c, map: gravelMap, roughness: 0.92, metalness: 0.03 })
    );
    runoffMesh.receiveShadow = true;
    scene.add(runoffMesh);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.38, metalness: 0.55 });
    const wallGeo = new THREE.BoxGeometry(0.22, 1.05, 4.4);
    const walls = [];
    for (let i = 0; i < SEGMENTS; i += 2) {
        const p = pts[i];
        walls.push(dummyMatrix(
            p.x + p.nx * (HALF + 2.4),
            p.y + 0.55,
            p.z + p.nz * (HALF + 2.4),
            p.tx,
            p.tz,
            1,
            1,
            1
        ));
    }
    addInstanced(scene, wallGeo, wallMat, walls);

    const railMat = new THREE.MeshStandardMaterial({ color: 0xc9ced4, roughness: 0.28, metalness: 0.72 });
    const railGeo = new THREE.BoxGeometry(0.08, 0.08, 4.4);
    const rails = [];
    walls.forEach((m) => {
        const top = m.clone();
        const p = new THREE.Vector3();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3();
        top.decompose(p, q, s);
        p.y += 0.42;
        top.compose(p, q, s);
        rails.push(top);
    });
    addInstanced(scene, railGeo, railMat, rails, false);

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.86, metalness: 0.05 });
    const tireGeo = new THREE.TorusGeometry(0.42, 0.16, 8, 14);
    tireGeo.rotateX(Math.PI / 2);
    const tires = [];
    [48, 118, 190].forEach((idx) => {
        const p = pts[idx];
        for (let k = 0; k < 10; k += 1) {
            tires.push(dummyMatrix(
                p.x + p.nx * (HALF + 3.6) + p.tx * (k - 4.5) * 0.9,
                p.y + 0.42,
                p.z + p.nz * (HALF + 3.6) + p.tz * (k - 4.5) * 0.9,
                p.tx,
                p.tz,
                1,
                1,
                1
            ));
        }
    });
    addInstanced(scene, tireGeo, tireMat, tires);

    const white = new THREE.MeshBasicMaterial({ color: 0xf4f7fb });
    const black = new THREE.MeshBasicMaterial({ color: 0x12141a });
    for (let i = -7; i <= 7; i += 1) {
        for (let k = 0; k < 5; k += 1) {
            const tile = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.02, 0.58), (i + k) % 2 ? white : black);
            tile.position.set(
                start.x + start.tx * (k * 0.6 - 1.2) + start.nx * i * 0.55,
                start.y + 0.045,
                start.z + start.tz * (k * 0.6 - 1.2) + start.nz * i * 0.55
            );
            scene.add(tile);
        }
    }

    const gantry = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.4, metalness: 0.55 });
    [-HALF - 1.2, HALF + 1.2].forEach((side) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.2, 0.35), steel);
        post.position.set(start.x + start.nx * side, start.y + 3.6, start.z + start.nz * side);
        post.castShadow = true;
        gantry.add(post);
    });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + 3.2, 0.35, 0.55), steel);
    beam.position.set(start.x, start.y + 7.05, start.z);
    beam.lookAt(start.x + start.tx, start.y + 7.05, start.z + start.tz);
    gantry.add(beam);
    [-2, -1, 0, 1, 2].forEach((slot, n) => {
        const lamp = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 10, 8),
            new THREE.MeshStandardMaterial({
                color: n === 2 ? 0x1fd17a : 0x111318,
                emissive: n === 2 ? 0x17c46a : 0x000000,
                emissiveIntensity: n === 2 ? 2.4 : 0
            })
        );
        lamp.position.set(
            start.x + start.nx * slot * 1.15,
            start.y + 6.55,
            start.z + start.nz * slot * 1.15
        );
        gantry.add(lamp);
    });
    scene.add(gantry);

    const pitX = start.x + start.nx * (HALF + 16);
    const pitZ = start.z + start.nz * (HALF + 16);
    const pit = new THREE.Group();
    pit.position.set(pitX, start.y, pitZ);
    pit.lookAt(start.x, start.y, start.z);
    pit.rotateY(Math.PI);
    const garage = new THREE.Mesh(
        new THREE.BoxGeometry(52, 6.2, 14),
        new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.55, metalness: 0.12 })
    );
    garage.position.set(0, 3.1, 0);
    garage.castShadow = true;
    garage.receiveShadow = true;
    pit.add(garage);
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(54, 0.35, 16),
        new THREE.MeshStandardMaterial({ color: 0xc81e2b, roughness: 0.4, metalness: 0.2 })
    );
    roof.position.set(0, 6.35, 0);
    pit.add(roof);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x15181e, roughness: 0.35, metalness: 0.4 });
    for (let i = 0; i < 8; i += 1) {
        const door = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.4, 0.2), doorMat);
        door.position.set(-21 + i * 6, 1.8, 7.1);
        pit.add(door);
    }
    const tower = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 11, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x1f242c, roughness: 0.45, metalness: 0.25 })
    );
    tower.position.set(28, 5.5, 0);
    tower.castShadow = true;
    pit.add(tower);
    scene.add(pit);

    const standMat = new THREE.MeshStandardMaterial({ color: 0xcfd5dc, roughness: 0.5, metalness: 0.12 });
    const seatColors = [0xc81e2b, 0x1a4b8c, 0xf4f7fb, 0x22262e];
    const crowdGeo = new THREE.BoxGeometry(0.32, 0.62, 0.32);
    const crowdMat = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.05 });
    const crowd = new THREE.InstancedMesh(crowdGeo, crowdMat, 720);
    const color = new THREE.Color();
    let crowdI = 0;
    function addStand(anchor, side, length, rows) {
        const group = new THREE.Group();
        const cx = anchor.x + anchor.nx * side;
        const cz = anchor.z + anchor.nz * side;
        group.position.set(cx, anchor.y, cz);
        group.rotation.y = Math.atan2(anchor.nx, anchor.nz);
        for (let r = 0; r < rows; r += 1) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(length, 0.7, 2.2), standMat);
            step.position.set(0, 0.4 + r * 0.72, (side > 0 ? 1 : -1) * (2.4 + r * 1.7));
            step.receiveShadow = true;
            step.castShadow = true;
            group.add(step);
            for (let s = 0; s < 28 && crowdI < 720; s += 1) {
                const dummy = new THREE.Object3D();
                dummy.position.set(
                    cx + anchor.tx * ((s / 27) - 0.5) * length + anchor.nx * (side > 0 ? 1 : -1) * (2.4 + r * 1.7),
                    anchor.y + 0.85 + r * 0.72,
                    cz + anchor.tz * ((s / 27) - 0.5) * length + anchor.nz * (side > 0 ? 1 : -1) * (2.4 + r * 1.7)
                );
                dummy.updateMatrix();
                crowd.setMatrixAt(crowdI, dummy.matrix);
                crowd.setColorAt(crowdI, color.setHex(seatColors[(s + r) % seatColors.length]));
                crowdI += 1;
            }
        }
        scene.add(group);
    }
    addStand(pts[10], -(HALF + 14), 48, 6);
    addStand(pts[18], -(HALF + 12), 32, 5);
    addStand(pts[210], -(HALF + 13), 36, 5);
    crowd.instanceMatrix.needsUpdate = true;
    if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;
    crowd.count = crowdI;
    crowd.castShadow = true;
    scene.add(crowd);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a4048, roughness: 0.4, metalness: 0.45 });
    const lightMat = new THREE.MeshStandardMaterial({
        color: 0xf2f0e4,
        emissive: 0xfff1c8,
        emissiveIntensity: 0.55,
        roughness: 0.3
    });
    [16, 70, 130, 175, 230].forEach((idx) => {
        const p = pts[idx];
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 14, 8), poleMat);
        pole.position.set(p.x + p.nx * (HALF + 8), p.y + 7, p.z + p.nz * (HALF + 8));
        pole.castShadow = true;
        scene.add(pole);
        const head = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 1.1), lightMat);
        head.position.set(p.x + p.nx * (HALF + 6.2), p.y + 13.6, p.z + p.nz * (HALF + 6.2));
        head.lookAt(p.x, p.y + 4, p.z);
        scene.add(head);
    });

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.9, metalness: 0.02 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6b2a, roughness: 0.82, metalness: 0.02 });
    const trunks = [];
    const leaves = [];
    const mid = { x: 0, z: 0 };
    pts.forEach((p) => {
        mid.x += p.x;
        mid.z += p.z;
    });
    mid.x /= pts.length;
    mid.z /= pts.length;
    const TREE_CLEAR = 16;
    for (let i = 0; i < SEGMENTS; i += 4) {
        const p = pts[i];
        const ox = p.x - mid.x;
        const oz = p.z - mid.z;
        const len = Math.hypot(ox, oz) || 1;
        const ux = ox / len;
        const uz = oz / len;
        for (let d = HALF + TREE_CLEAR; d <= HALF + 46; d += 4) {
            const x = p.x + ux * d;
            const z = p.z + uz * d;
            if (!offAsphalt(pts, x, z, TREE_CLEAR)) continue;
            const scale = 0.9 + (i % 5) * 0.1;
            trunks.push(dummyMatrix(x, p.y + 1.6 * scale, z, 0, 1, scale, 1.6 * scale, scale));
            leaves.push(dummyMatrix(x, p.y + 5.4 * scale, z, 0, 1, 2.4 * scale, 2.8 * scale, 2.4 * scale));
            break;
        }
    }
    addInstanced(scene, new THREE.CylinderGeometry(0.28, 0.38, 3.2, 6), trunkMat, trunks);
    addInstanced(scene, new THREE.SphereGeometry(1.15, 8, 6), leafMat, leaves);

    const hillMat = new THREE.MeshLambertMaterial({ color: 0x4d7a3a });
    [[-280, 80, 90], [90, 420, 120], [380, 40, 100], [-60, -160, 70], [300, 360, 85]].forEach(([x, z, s]) => {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), hillMat);
        hill.position.set(x, -s * 0.28, z);
        hill.scale.set(s * 1.6, s * 0.42, s * 1.2);
        hill.receiveShadow = true;
        scene.add(hill);
    });

    const lake = new THREE.Mesh(
        new THREE.CircleGeometry(28, 28),
        new THREE.MeshStandardMaterial({
            color: 0x3c8fbf,
            roughness: 0.08,
            metalness: 0.65,
            envMapIntensity: 1.2
        })
    );
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(40, 0.02, 200);
    if (offAsphalt(pts, 40, 200, 22)) scene.add(lake);

    const markerMat = new THREE.MeshStandardMaterial({ color: 0xf0c400, roughness: 0.4, metalness: 0.1 });
    [30, 60, 110].forEach((idx) => {
        const p = pts[idx];
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 1.4), markerMat);
        board.position.set(p.x + p.nx * (HALF + 3.8), p.y + 1.1, p.z + p.nz * (HALF + 3.8));
        board.lookAt(p.x, p.y + 1.1, p.z);
        scene.add(board);
    });

    const sky = new THREE.Mesh(
        new THREE.SphereGeometry(640, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0x8ec8ee, side: THREE.BackSide, fog: true })
    );
    scene.add(sky);

    return {
        start: {
            x: start.x,
            z: start.z,
            heading: Math.atan2(start.tx, start.tz)
        },
        sampleHeight(x, z, fallback) {
            const p = pts[closestIndex(pts, x, z)];
            return Number.isFinite(p.y) ? p.y : fallback;
        },
        keepOnTrack(pos) {
            const p = pts[closestIndex(pts, pos.x, pos.z)];
            const side = (pos.x - p.x) * p.nx + (pos.z - p.z) * p.nz;
            if (Math.abs(side) <= LIMIT) return { x: pos.x, z: pos.z, hit: false };
            const clamped = Math.sign(side) * LIMIT;
            return { x: p.x + p.nx * clamped, z: p.z + p.nz * clamped, hit: true };
        },
        update() {}
    };
}

export async function loadTrack(scene) {
    return createCircuit(scene);
}
