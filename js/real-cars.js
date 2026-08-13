import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const THREE_CDN = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf';
const KHRONOS_CDN = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models';

export const REAL_MODELS = [
    {
        id: 'ferrari-458',
        name: '458 ITALIA',
        tagline: 'Sports car · sample three.js',
        url: `${THREE_CDN}/ferrari.glb`,
        kind: 'ferrari',
        targetLength: 4.55,
        defaultPaint: 0xc41e3a,
        canRecolorRims: true,
        credit: 'Ferrari 458 Italia by vicent091036 (CC-BY) via three.js — bukan afiliasi merek.',
        creditUrl: 'https://sketchfab.com/3d-models/ferrari-458-italia-57bf6cc56931426e87494f554df1dab6'
    },
    {
        id: 'car-concept',
        name: 'CONCEPT GT',
        tagline: 'Khronos concept car',
        url: `${KHRONOS_CDN}/CarConcept/glTF-Binary/CarConcept.glb`,
        kind: 'concept',
        targetLength: 4.7,
        defaultPaint: 0xc41e3a,
        canRecolorRims: true,
        credit: 'Car Concept by Eric Chadwick / Darmstadt Graphics Group (CC-BY 4.0), based on Unity Fan CC0.',
        creditUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept'
    },
    {
        id: 'toy-car',
        name: 'DIECAST GT',
        tagline: 'Khronos ToyCar',
        url: `${KHRONOS_CDN}/ToyCar/glTF-Binary/ToyCar.glb`,
        kind: 'toycar',
        targetLength: 4.4,
        defaultPaint: 0x1a4fd6,
        canRecolorRims: false,
        credit: 'Toy Car by Guido Odendahl & Eric Chadwick (CC0).',
        creditUrl: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ToyCar'
    }
];

function makeLoader() {
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/libs/draco/gltf/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    return loader;
}

const sharedLoader = makeLoader();

function paintMaterial(color, envMap) {
    return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.9,
        roughness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMap,
        envMapIntensity: 1.4
    });
}

function chromeMaterial(color, envMap) {
    return new THREE.MeshStandardMaterial({
        color,
        metalness: 1,
        roughness: 0.18,
        envMap,
        envMapIntensity: 1.8
    });
}

function uniqueMaterials(root, test) {
    const found = [];
    root.traverse((obj) => {
        if (!obj.isMesh) return;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
            if (mat && test(mat) && !found.includes(mat)) found.push(mat);
        });
    });
    return found;
}

function fitToGround(root, targetLength) {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const length = Math.max(size.x, size.z) || 1;
    root.scale.multiplyScalar(targetLength / length);
    const fitted = new THREE.Box3().setFromObject(root);
    const center = fitted.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= fitted.min.y;
}

function pruneDisplayProps(root) {
    const drop = [];
    root.traverse((obj) => {
        const name = obj.name || '';
        if (obj.isCamera || /^Camera\d*/.test(name) || name === 'Fabric') {
            drop.push(obj);
        }
    });
    drop.forEach((obj) => {
        if (obj.parent) obj.parent.remove(obj);
    });
}

function enableShadows(root) {
    root.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });
}

function inferLocalAxle(obj) {
    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3();
    const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
    const local = new THREE.Matrix4();
    const v = new THREE.Vector3();
    obj.traverse((child) => {
        const pos = child.isMesh && child.geometry && child.geometry.attributes.position;
        if (!pos) return;
        local.copy(child.matrixWorld).premultiply(inv);
        const step = Math.max(1, Math.floor(pos.count / 64));
        for (let i = 0; i < pos.count; i += step) {
            v.fromBufferAttribute(pos, i).applyMatrix4(local);
            box.expandByPoint(v);
        }
    });
    const size = box.getSize(new THREE.Vector3());
    if (size.x <= size.y && size.x <= size.z) return new THREE.Vector3(1, 0, 0);
    if (size.z <= size.x && size.z <= size.y) return new THREE.Vector3(0, 0, 1);
    return new THREE.Vector3(0, 1, 0);
}

function hubSpinner(wheel, hubWorld, axleWorld) {
    const parent = wheel.parent;
    const spinner = new THREE.Group();
    spinner.name = `${wheel.name || 'wheel'}Spin`;
    parent.add(spinner);
    spinner.position.copy(hubWorld);
    parent.worldToLocal(spinner.position);
    spinner.attach(wheel);
    const inv = new THREE.Matrix4().copy(spinner.matrixWorld).invert();
    spinner.userData.axle = axleWorld.clone().transformDirection(inv).normalize();
    return spinner;
}

function sampleWorldPoints(mesh, maxSamples = 256) {
    const pos = mesh.geometry && mesh.geometry.attributes && mesh.geometry.attributes.position;
    if (!pos || !pos.count) return [];
    mesh.updateWorldMatrix(true, false);
    const step = Math.max(1, Math.floor(pos.count / maxSamples));
    const points = [];
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += step) {
        points.push(v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).clone());
    }
    return points;
}

function covarianceThinAxis(points) {
    const n = points.length;
    const c = new THREE.Vector3();
    for (let i = 0; i < n; i += 1) c.add(points[i]);
    c.multiplyScalar(1 / n);

    let cxx = 0;
    let cxy = 0;
    let cxz = 0;
    let cyy = 0;
    let cyz = 0;
    let czz = 0;
    for (let i = 0; i < n; i += 1) {
        const dx = points[i].x - c.x;
        const dy = points[i].y - c.y;
        const dz = points[i].z - c.z;
        cxx += dx * dx;
        cxy += dx * dy;
        cxz += dx * dz;
        cyy += dy * dy;
        cyz += dy * dz;
        czz += dz * dz;
    }

    const a = [
        [cxx / n, cxy / n, cxz / n],
        [cxy / n, cyy / n, cyz / n],
        [cxz / n, cyz / n, czz / n]
    ];
    const v = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];

    for (let iter = 0; iter < 24; iter += 1) {
        let p = 0;
        let q = 1;
        let max = Math.abs(a[0][1]);
        if (Math.abs(a[0][2]) > max) {
            p = 0;
            q = 2;
            max = Math.abs(a[0][2]);
        }
        if (Math.abs(a[1][2]) > max) {
            p = 1;
            q = 2;
            max = Math.abs(a[1][2]);
        }
        if (max < 1e-12) break;

        const app = a[p][p];
        const aqq = a[q][q];
        const apq = a[p][q];
        const theta = 0.5 * Math.atan2(2 * apq, aqq - app);
        const co = Math.cos(theta);
        const si = Math.sin(theta);

        for (let i = 0; i < 3; i += 1) {
            if (i === p || i === q) continue;
            const aip = a[i][p];
            const aiq = a[i][q];
            a[i][p] = a[p][i] = co * aip - si * aiq;
            a[i][q] = a[q][i] = si * aip + co * aiq;
        }
        a[p][p] = co * co * app - 2 * si * co * apq + si * si * aqq;
        a[q][q] = si * si * app + 2 * si * co * apq + co * co * aqq;
        a[p][q] = a[q][p] = 0;

        for (let i = 0; i < 3; i += 1) {
            const vip = v[i][p];
            const viq = v[i][q];
            v[i][p] = co * vip - si * viq;
            v[i][q] = si * vip + co * viq;
        }
    }

    let minI = 0;
    if (a[1][1] < a[minI][minI]) minI = 1;
    if (a[2][2] < a[minI][minI]) minI = 2;
    return {
        center: c,
        axis: new THREE.Vector3(v[0][minI], v[1][minI], v[2][minI]).normalize()
    };
}

function namedChild(wheel, pattern) {
    let found = null;
    wheel.traverse((obj) => {
        if (obj.isMesh && pattern.test(obj.name || '')) found = obj;
    });
    return found;
}

function setupConceptWheels(root) {
    const names = ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'];
    return names.map((name) => {
        const wheel = root.getObjectByName(name);
        if (!wheel) return null;

        const pad = namedChild(wheel, /BrakePad/i);
        if (pad && pad.parent) {
            wheel.parent.attach(pad);
        }

        const rim = namedChild(wheel, /Rim/i);
        const disc = namedChild(wheel, /BrakeDisc/i);
        const axisMesh = disc || rim;
        const hubMesh = rim || disc;
        const fallbackHub = () => new THREE.Box3().setFromObject(wheel).getCenter(new THREE.Vector3());
        const fallbackAxle = () => {
            const local = inferLocalAxle(wheel);
            return local.transformDirection(wheel.matrixWorld).normalize();
        };
        if (!axisMesh || !hubMesh) return hubSpinner(wheel, fallbackHub(), fallbackAxle());

        const axisPts = sampleWorldPoints(axisMesh);
        const hubPts = hubMesh === axisMesh ? axisPts : sampleWorldPoints(hubMesh);
        if (axisPts.length < 8 || hubPts.length < 8) {
            return hubSpinner(wheel, fallbackHub(), fallbackAxle());
        }

        const { axis } = covarianceThinAxis(axisPts);
        const { center } = covarianceThinAxis(hubPts);
        if (axis.x < 0 || (Math.abs(axis.x) < 0.08 && axis.z < 0)) {
            axis.negate();
        }
        return hubSpinner(wheel, center, axis);
    }).filter(Boolean);
}

function collectNamed(root, names) {
    return names.map((name) => root.getObjectByName(name)).filter(Boolean);
}

export function loadRealCar(spec, options = {}) {
    const envMap = options.envMap || null;
    const paintHex = options.paint ?? spec.defaultPaint;
    const rimHex = options.rimColor ?? 0xd8dce2;
    const onProgress = options.onProgress || (() => {});
    const loader = options.loader || sharedLoader;

    return new Promise((resolve, reject) => {
        loader.load(
            spec.url,
            (gltf) => {
                const root = new THREE.Group();
                root.name = spec.id;
                root.add(gltf.scene);
                pruneDisplayProps(root);
                enableShadows(root);
                fitToGround(root, spec.targetLength);

                const paintMat = paintMaterial(paintHex, envMap);
                const rimMat = chromeMaterial(rimHex, envMap);
                const wheels = [];
                let paintTargets = [];
                let rimTargets = [];

                if (spec.kind === 'ferrari') {
                    const body = root.getObjectByName('body');
                    if (body) {
                        body.material = paintMat;
                        paintTargets = [paintMat];
                    }
                    ['rim_fl', 'rim_fr', 'rim_rl', 'rim_rr', 'trim'].forEach((name) => {
                        const mesh = root.getObjectByName(name);
                        if (mesh) {
                            mesh.material = rimMat;
                            rimTargets.push(mesh);
                        }
                    });
                    collectNamed(root, ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr']).forEach((wheel) => {
                        wheel.userData.axle = inferLocalAxle(wheel);
                        wheels.push(wheel);
                    });
                } else if (spec.kind === 'concept') {
                    paintTargets = uniqueMaterials(root, (m) => /paint/i.test(m.name || ''));
                    paintTargets.forEach((mat) => mat.color.setHex(paintHex));
                    rimTargets = uniqueMaterials(root, (m) => /^rim/i.test(m.name || ''));
                    rimTargets.forEach((mat) => mat.color.setHex(rimHex));
                    wheels.push(...setupConceptWheels(root));
                } else {
                    paintTargets = uniqueMaterials(root, (m) => /toycar|paint|body/i.test(m.name || ''));
                    if (!paintTargets.length) {
                        paintTargets = uniqueMaterials(root, (m) => !/glass|fabric|tire/i.test(m.name || ''));
                    }
                    paintTargets.forEach((mat) => mat.color.setHex(paintHex));
                }

                resolve({
                    spec,
                    root,
                    wheels,
                    setPaint(hex) {
                        if (spec.kind === 'ferrari') {
                            paintMat.color.setHex(hex);
                        } else {
                            paintTargets.forEach((mat) => mat.color.setHex(hex));
                        }
                    },
                    setRimColor(hex) {
                        if (!spec.canRecolorRims) return;
                        if (spec.kind === 'ferrari') {
                            rimMat.color.setHex(hex);
                        } else {
                            rimTargets.forEach((mat) => mat.color.setHex(hex));
                        }
                    },
                    rebuildRims() {}
                });
            },
            (event) => {
                if (event.total) {
                    onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
                }
            },
            reject
        );
    });
}

export function disposeLoadedCar(car) {
    if (!car) return;
    car.root.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        const mats = [].concat(child.material || []);
        mats.forEach((mat) => {
            if (!mat) return;
            ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'clearcoatMap', 'clearcoatNormalMap'].forEach((key) => {
                if (mat[key] && mat[key].isTexture) mat[key].dispose();
            });
        });
    });
}
