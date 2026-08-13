import * as THREE from 'three';

const DEG = Math.PI / 180;

export const PAINT_COLORS = [
    { name: 'Rosso', hex: 0xc41e3a },
    { name: 'Nero', hex: 0x111111 },
    { name: 'Bianco', hex: 0xf2f2f0 },
    { name: 'Giallo', hex: 0xf5c400 },
    { name: 'Blu', hex: 0x1a4fd6 },
    { name: 'Verde', hex: 0x1f7a4d },
    { name: 'Arancio', hex: 0xff6a00 },
    { name: 'Argento', hex: 0x9aa3ad },
    { name: 'Midnight', hex: 0x1a2744 },
    { name: 'Candy', hex: 0xff2d6a }
];

export const RIM_COLORS = [
    { name: 'Chrome', hex: 0xd8dce2 },
    { name: 'Gunmetal', hex: 0x4a4e55 },
    { name: 'Black', hex: 0x1a1a1a },
    { name: 'Gold', hex: 0xc9a227 },
    { name: 'Bronze', hex: 0x8a5a2b },
    { name: 'Ice', hex: 0xb9d4ff }
];

export const RIM_STYLES = [
    { id: 'star5', name: 'Star 5', spokes: 5, wide: false },
    { id: 'y6', name: 'Y-Spoke', spokes: 6, wide: true },
    { id: 'turbine', name: 'Turbine', spokes: 8, wide: false },
    { id: 'mesh', name: 'Mesh', spokes: 12, wide: false },
    { id: 'classic', name: 'Classic', spokes: 3, wide: true }
];

export const CAR_MODELS = [
    {
        id: 'aero-gt',
        name: 'AERO GT',
        tagline: 'Supercar wedge',
        style: 'supercar',
        length: 4.55,
        width: 2.02,
        height: 1.18,
        wheelbase: 2.62,
        track: 1.88,
        wheelRadius: 0.37,
        wheelWidth: 0.32,
        ground: 0.12,
        spoiler: true,
        splitter: true,
        defaultPaint: 0xc41e3a
    },
    {
        id: 'veloce',
        name: 'VELOCE',
        tagline: 'Sports coupe',
        style: 'coupe',
        length: 4.42,
        width: 1.86,
        height: 1.28,
        wheelbase: 2.55,
        track: 1.72,
        wheelRadius: 0.34,
        wheelWidth: 0.26,
        ground: 0.14,
        spoiler: false,
        splitter: false,
        defaultPaint: 0x1a4fd6
    },
    {
        id: 'strada',
        name: 'STRADA',
        tagline: 'Executive sedan',
        style: 'sedan',
        length: 4.85,
        width: 1.84,
        height: 1.42,
        wheelbase: 2.88,
        track: 1.7,
        wheelRadius: 0.33,
        wheelWidth: 0.24,
        ground: 0.15,
        spoiler: false,
        splitter: false,
        defaultPaint: 0x1a2744
    },
    {
        id: 'cima',
        name: 'CIMA',
        tagline: 'Urban crossover',
        style: 'suv',
        length: 4.58,
        width: 1.92,
        height: 1.68,
        wheelbase: 2.7,
        track: 1.78,
        wheelRadius: 0.36,
        wheelWidth: 0.26,
        ground: 0.22,
        spoiler: false,
        splitter: false,
        defaultPaint: 0x1f7a4d
    },
    {
        id: 'pulsar',
        name: 'PULSAR',
        tagline: 'City hatch',
        style: 'hatch',
        length: 4.05,
        width: 1.76,
        height: 1.44,
        wheelbase: 2.48,
        track: 1.62,
        wheelRadius: 0.31,
        wheelWidth: 0.22,
        ground: 0.15,
        spoiler: true,
        splitter: false,
        defaultPaint: 0xff6a00
    },
    {
        id: 'nocturne',
        name: 'NOCTURNE',
        tagline: 'Grand tourer',
        style: 'gt',
        length: 4.72,
        width: 1.94,
        height: 1.24,
        wheelbase: 2.78,
        track: 1.8,
        wheelRadius: 0.35,
        wheelWidth: 0.28,
        ground: 0.13,
        spoiler: false,
        splitter: true,
        defaultPaint: 0x111111
    }
];

function paintMaterial(color, envMap) {
    return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.68,
        roughness: 0.32,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMap,
        envMapIntensity: 1.35
    });
}

function glassMaterial(envMap) {
    return new THREE.MeshPhysicalMaterial({
        color: 0x6f88a3,
        metalness: 0.2,
        roughness: 0.08,
        transparent: true,
        opacity: 0.62,
        envMap,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide
    });
}

function rubberMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.92,
        metalness: 0.05
    });
}

function metalMaterial(envMap, color, roughness = 0.2) {
    return new THREE.MeshStandardMaterial({
        color,
        metalness: 1,
        roughness,
        envMap,
        envMapIntensity: 1.7
    });
}

function darkTrimMaterial() {
    return new THREE.MeshStandardMaterial({
        color: 0x151515,
        roughness: 0.55,
        metalness: 0.25
    });
}

function lightMaterial(color, intensity = 2) {
    return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: intensity,
        roughness: 0.3,
        metalness: 0.4
    });
}

function shadow(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function silhouette(spec) {
    const L = spec.length;
    const H = spec.height;
    const g = spec.ground;
    const half = L / 2;
    const pts = {
        rearX: -half,
        frontX: half,
        rocker: spec.wheelRadius * 0.42,
        rearBumper: g + H * 0.24,
        frontBumper: g + H * 0.22,
        deck: g + H * 0.5,
        hood: g + H * 0.44,
        roof: g + H * 0.98,
        cabinRear: -half + L * 0.28,
        cabinFront: half - L * 0.38,
        hoodEnd: half - L * 0.16,
        trunk: -half + L * 0.18
    };

    if (spec.style === 'supercar') {
        pts.rearBumper = g + H * 0.28;
        pts.frontBumper = g + H * 0.2;
        pts.deck = g + H * 0.42;
        pts.hood = g + H * 0.36;
        pts.roof = g + H * 0.9;
        pts.cabinRear = -half + L * 0.22;
        pts.cabinFront = half - L * 0.48;
        pts.hoodEnd = half - L * 0.12;
        pts.trunk = -half + L * 0.12;
    } else if (spec.style === 'sedan') {
        pts.deck = g + H * 0.54;
        pts.hood = g + H * 0.5;
        pts.cabinRear = -half + L * 0.34;
        pts.cabinFront = half - L * 0.34;
        pts.trunk = -half + L * 0.22;
    } else if (spec.style === 'suv') {
        pts.rearBumper = g + H * 0.3;
        pts.frontBumper = g + H * 0.3;
        pts.deck = g + H * 0.64;
        pts.hood = g + H * 0.58;
        pts.cabinRear = -half + L * 0.16;
        pts.cabinFront = half - L * 0.28;
        pts.hoodEnd = half - L * 0.14;
        pts.trunk = -half + L * 0.1;
        pts.rocker = spec.wheelRadius * 0.55;
    } else if (spec.style === 'hatch') {
        pts.deck = g + H * 0.72;
        pts.hood = g + H * 0.5;
        pts.cabinRear = -half + L * 0.12;
        pts.cabinFront = half - L * 0.36;
        pts.trunk = -half + L * 0.08;
    } else if (spec.style === 'gt') {
        pts.deck = g + H * 0.45;
        pts.hood = g + H * 0.4;
        pts.roof = g + H * 0.94;
        pts.cabinRear = -half + L * 0.26;
        pts.cabinFront = half - L * 0.44;
        pts.hoodEnd = half - L * 0.18;
        pts.trunk = -half + L * 0.16;
    }

    return pts;
}

function extrude(shape, width, material) {
    const geo = new THREE.ExtrudeGeometry(shape, {
        steps: 1,
        depth: width,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.045,
        bevelSegments: 2
    });
    geo.translate(0, 0, -width / 2);
    geo.computeVertexNormals();
    return shadow(new THREE.Mesh(geo, material));
}

function createBody(spec, paintMat) {
    const p = silhouette(spec);
    const belt = Math.max(p.hood, p.deck * 0.92);
    const s = new THREE.Shape();
    s.moveTo(p.rearX, p.rocker);
    s.lineTo(p.frontX, p.rocker);
    s.lineTo(p.frontX, p.frontBumper);
    s.lineTo(p.hoodEnd, p.hood);
    s.lineTo(p.cabinFront, belt);
    s.lineTo(p.cabinRear, belt);
    s.lineTo(p.trunk, p.deck);
    s.lineTo(p.rearX, p.rearBumper);
    s.closePath();
    return extrude(s, spec.width * 0.7, paintMat);
}

function createCabin(spec, paintMat) {
    const p = silhouette(spec);
    const belt = Math.max(p.hood, p.deck * 0.92);
    const rearTop = spec.style === 'hatch' ? p.cabinRear - 0.05 : p.cabinRear + 0.18;
    const s = new THREE.Shape();
    s.moveTo(p.cabinRear + 0.06, belt);
    s.lineTo(p.cabinFront - 0.05, belt);
    s.lineTo(p.cabinFront - 0.32, p.roof);
    s.lineTo(rearTop, spec.style === 'hatch' ? p.roof * 0.9 : p.roof);
    s.closePath();
    return extrude(s, spec.width * 0.56, paintMat);
}

function createFenders(spec, paintMat) {
    const group = new THREE.Group();
    const radius = spec.wheelRadius * 1.12;
    const tube = 0.11;
    const xs = [spec.wheelbase / 2, -spec.wheelbase / 2];

    xs.forEach((x) => {
        [-1, 1].forEach((side) => {
            const arch = new THREE.Mesh(
                new THREE.TorusGeometry(radius, tube, 8, 18, Math.PI),
                paintMat
            );
            arch.position.set(x, spec.wheelRadius, side * (spec.track / 2));
            group.add(shadow(arch));
        });
    });
    return group;
}

function createGlass(spec, glassMat) {
    const p = silhouette(spec);
    const group = new THREE.Group();
    const cabinW = spec.width * 0.7;
    const glassH = Math.max(0.2, p.roof - p.deck - 0.12);
    const cabinLen = Math.max(0.85, p.cabinFront - p.cabinRear - 0.2);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.82, glassH, cabinW * 0.96), glassMat);
    windshield.position.set(p.cabinFront + 0.02, p.deck + glassH * 0.55, 0);
    windshield.rotation.z = -36 * DEG;
    group.add(windshield);

    const rear = new THREE.Mesh(
        new THREE.BoxGeometry(spec.style === 'sedan' ? 0.5 : 0.68, glassH * 0.85, cabinW * 0.96),
        glassMat
    );
    rear.position.set(p.cabinRear - 0.02, p.deck + glassH * 0.5, 0);
    rear.rotation.z = spec.style === 'hatch' ? 46 * DEG : 30 * DEG;
    group.add(rear);

    [-1, 1].forEach((side) => {
        const sideWin = new THREE.Mesh(new THREE.BoxGeometry(cabinLen * 0.82, glassH * 0.7, 0.04), glassMat);
        sideWin.position.set((p.cabinFront + p.cabinRear) / 2, p.deck + glassH * 0.48, side * (cabinW / 2));
        group.add(sideWin);
    });

    return group;
}

function createLights(spec) {
    const group = new THREE.Group();
    const halfL = spec.length / 2;
    const z = spec.width * 0.32;
    const y = spec.ground + spec.height * 0.34;
    const headMat = lightMaterial(0xf7f1d4, 3.4);
    const tailMat = lightMaterial(0xff2424, 2.6);
    const headW = spec.style === 'supercar' ? 0.48 : 0.3;

    [-1, 1].forEach((side) => {
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, headW), headMat);
        head.position.set(halfL - 0.01, y, side * z);
        group.add(shadow(head));
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, headW * 0.9), tailMat);
        tail.position.set(-halfL + 0.02, y + 0.03, side * z);
        group.add(shadow(tail));
    });

    if (spec.style === 'supercar' || spec.style === 'gt') {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, spec.width * 0.7), tailMat);
        strip.position.set(-halfL + 0.03, y + 0.12, 0);
        group.add(strip);
    }
    return group;
}

function createDetails(spec, paintMat, chromeMat, trimMat) {
    const group = new THREE.Group();
    const halfL = spec.length / 2;
    const p = silhouette(spec);

    [-1, 1].forEach((side) => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.12), trimMat);
        arm.position.set(p.cabinFront - 0.15, p.deck + 0.12, side * spec.width * 0.4);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.16), trimMat);
        glass.position.copy(arm.position);
        glass.position.z += side * 0.12;
        group.add(shadow(arm), shadow(glass));
    });

    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.05, spec.height * 0.14, spec.width * 0.4), trimMat);
    grille.position.set(halfL - 0.01, spec.ground + spec.height * 0.24, 0);
    group.add(shadow(grille));

    [-0.1, 0.1].forEach((z) => {
        const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 16), chromeMat);
        exhaust.rotation.z = 90 * DEG;
        exhaust.position.set(-halfL + 0.03, spec.ground + 0.16, z);
        group.add(shadow(exhaust));
    });

    if (spec.spoiler) {
        const y = spec.style === 'hatch' ? p.roof - 0.04 : p.deck + 0.12;
        const posts = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, spec.width * 0.46), paintMat);
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, spec.width * 0.76), paintMat);
        posts.position.set(-halfL + 0.22, y, 0);
        wing.position.set(-halfL + 0.18, y + 0.08, 0);
        group.add(shadow(posts), shadow(wing));
    }

    if (spec.splitter) {
        const split = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, spec.width * 0.82), trimMat);
        split.position.set(halfL - 0.04, spec.ground + 0.05, 0);
        group.add(shadow(split));
    }

    if (spec.style === 'suv') {
        [-1, 1].forEach((side) => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(spec.length * 0.4, 0.03, 0.04), trimMat);
            rail.position.set(0.08, p.roof + 0.03, side * spec.width * 0.26);
            group.add(shadow(rail));
        });
    }

    const plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.11, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xf2f0e6, roughness: 0.65 })
    );
    plate.position.set(-halfL + 0.01, spec.ground + 0.28, 0);
    group.add(plate);

    const under = new THREE.Mesh(
        new THREE.BoxGeometry(spec.length * 0.78, 0.06, spec.width * 0.7),
        trimMat
    );
    under.position.set(0, spec.wheelRadius * 0.45, 0);
    group.add(under);

    return group;
}

function createSpokeRim(radius, width, style, rimMat, hubMat) {
    const group = new THREE.Group();
    const innerR = radius * 0.6;

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.13, radius * 0.15, width * 0.5, 24), hubMat);
    hub.rotation.x = 90 * DEG;
    group.add(hub);

    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(innerR, innerR, width * 0.62, 32, 1, true),
        rimMat
    );
    barrel.rotation.x = 90 * DEG;
    group.add(barrel);

    const lip = new THREE.Mesh(new THREE.TorusGeometry(innerR, 0.016, 8, 28), rimMat);
    group.add(lip);

    for (let i = 0; i < style.spokes; i++) {
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(innerR * 0.9, style.wide ? 0.055 : 0.026, width * 0.18),
            rimMat
        );
        const angle = (i / style.spokes) * Math.PI * 2;
        spoke.position.set(Math.cos(angle) * innerR * 0.36, Math.sin(angle) * innerR * 0.36, 0);
        spoke.rotation.z = angle;
        group.add(spoke);
    }

    if (style.id === 'mesh') {
        for (let i = 0; i < style.spokes; i++) {
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(innerR * 0.68, 0.014, width * 0.14),
                rimMat
            );
            const angle = (i / style.spokes) * Math.PI * 2 + Math.PI / style.spokes;
            spoke.position.set(Math.cos(angle) * innerR * 0.3, Math.sin(angle) * innerR * 0.3, 0);
            spoke.rotation.z = angle;
            group.add(spoke);
        }
    }

    return group;
}

function createWheel(spec, rimStyle, rimMat, rubberMat, hubMat) {
    const group = new THREE.Group();
    const spinner = new THREE.Group();
    spinner.userData.axle = new THREE.Vector3(0, 0, 1);
    const R = spec.wheelRadius;
    const W = spec.wheelWidth;

    const tire = new THREE.Mesh(new THREE.TorusGeometry(R * 0.72, R * 0.28, 12, 36), rubberMat);
    spinner.add(shadow(tire));

    const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(R * 0.46, R * 0.46, 0.028, 24),
        new THREE.MeshStandardMaterial({ color: 0x6e6e6e, metalness: 0.85, roughness: 0.32 })
    );
    disc.rotation.x = 90 * DEG;
    spinner.add(disc);

    const caliper = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xb11212, metalness: 0.4, roughness: 0.4 })
    );
    caliper.position.set(0, R * 0.26, 0);
    group.add(caliper);

    const rim = createSpokeRim(R, W, rimStyle, rimMat, hubMat);
    spinner.add(rim);
    spinner.userData.rim = rim;
    group.add(spinner);
    group.userData.spinner = spinner;
    group.userData.rim = rim;
    return group;
}

function placeWheels(spec, rimStyle, rimMat, rubberMat, hubMat) {
    const group = new THREE.Group();
    const wheels = [];
    const z = spec.track / 2;
    const positions = [
        { x: spec.wheelbase / 2, z },
        { x: spec.wheelbase / 2, z: -z },
        { x: -spec.wheelbase / 2, z },
        { x: -spec.wheelbase / 2, z: -z }
    ];

    positions.forEach((pos) => {
        const wheel = createWheel(spec, rimStyle, rimMat, rubberMat, hubMat);
        wheel.position.set(pos.x, spec.wheelRadius, pos.z);
        if (pos.z < 0) wheel.rotation.y = Math.PI;
        group.add(wheel);
        wheels.push(wheel.userData.spinner);
    });

    return { group, wheels };
}

export function createCar(spec, options = {}) {
    const envMap = options.envMap || null;
    const paintHex = options.paint ?? spec.defaultPaint;
    const rimHex = options.rimColor ?? 0xd8dce2;
    const rimStyle = options.rimStyle || RIM_STYLES[0];

    const paintMat = paintMaterial(paintHex, envMap);
    const glassMat = glassMaterial(envMap);
    const rimMat = metalMaterial(envMap, rimHex, 0.18);
    const hubMat = metalMaterial(envMap, 0xeeeeee, 0.12);
    const chromeMat = metalMaterial(envMap, 0xcfd5dc, 0.16);
    const rubberMat = rubberMaterial();
    const trimMat = darkTrimMaterial();

    const root = new THREE.Group();
    root.name = spec.id;
    root.add(createBody(spec, paintMat));
    root.add(createCabin(spec, paintMat));
    root.add(createFenders(spec, paintMat));
    root.add(createGlass(spec, glassMat));
    root.add(createLights(spec));
    root.add(createDetails(spec, paintMat, chromeMat, trimMat));

    const { group: wheelGroup, wheels } = placeWheels(spec, rimStyle, rimMat, rubberMat, hubMat);
    root.add(wheelGroup);

    return {
        spec,
        root,
        wheels,
        setPaint(hex) {
            paintMat.color.setHex(hex);
        },
        setRimColor(hex) {
            rimMat.color.setHex(hex);
        },
        rebuildRims(style, hex) {
            rimMat.color.setHex(hex);
            wheels.forEach((wheel) => {
                if (wheel.userData.rim) {
                    wheel.remove(wheel.userData.rim);
                    wheel.userData.rim.traverse((child) => {
                        if (child.geometry) child.geometry.dispose();
                    });
                }
                const rim = createSpokeRim(spec.wheelRadius, spec.wheelWidth, style, rimMat, hubMat);
                wheel.add(rim);
                wheel.userData.rim = rim;
            });
        }
    };
}

export function disposeCar(car) {
    if (!car) return;
    car.root.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
    });
}
