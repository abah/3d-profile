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

function enableShadows(root) {
    root.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
        if (obj.isCamera || /^Camera\d*/.test(obj.name || '')) {
            obj.visible = false;
        }
    });
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
                        wheel.userData.spinAxis = 'x';
                        wheels.push(wheel);
                    });
                } else if (spec.kind === 'concept') {
                    paintTargets = uniqueMaterials(root, (m) => /paint/i.test(m.name || ''));
                    paintTargets.forEach((mat) => mat.color.setHex(paintHex));
                    rimTargets = uniqueMaterials(root, (m) => /^rim/i.test(m.name || ''));
                    rimTargets.forEach((mat) => mat.color.setHex(rimHex));
                    ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'].forEach((name) => {
                        const wheel = root.getObjectByName(name);
                        if (wheel) {
                            wheel.userData.spinAxis = 'x';
                            wheels.push(wheel);
                        }
                    });
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
                    onProgress(Math.round((event.loaded / event.total) * 100));
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
