import * as THREE from 'three';

const GOLD = 0xc4a056;
const WHITE = 0xf3f5f8;
const GLASS = 0x141c28;
const METAL = 0xb9c0c8;

function paint(color, envMap, extra = {}) {
    return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.38,
        roughness: 0.26,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        envMap,
        envMapIntensity: 1.15,
        ...extra
    });
}

function tailDecal() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const g = canvas.getContext('2d');
    g.fillStyle = '#c4a056';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#f4f6f8';
    g.textAlign = 'center';
    g.font = 'bold 44px Helvetica, Arial, sans-serif';
    g.fillText('GLOBAL', 128, 58);
    g.font = 'bold 34px Helvetica, Arial, sans-serif';
    g.fillText('6000', 128, 102);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
}

function addShadow(mesh) {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
}

export function createGlobal6000({ envMap } = {}) {
    const bodyMat = paint(WHITE, envMap);
    const goldMat = paint(GOLD, envMap, { metalness: 0.55, roughness: 0.32 });
    const glassMat = paint(GLASS, envMap, { metalness: 0.9, roughness: 0.08, transparent: true, opacity: 0.92 });
    const metalMat = paint(METAL, envMap, { metalness: 0.85, roughness: 0.22 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.45, metalness: 0.4 });

    const root = new THREE.Group();
    root.name = 'global-6000';

    const fuse = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 18.4, 28), bodyMat));
    fuse.rotation.z = Math.PI / 2;
    root.add(fuse);

    const nose = addShadow(new THREE.Mesh(new THREE.SphereGeometry(1.28, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2), bodyMat));
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 9.2;
    nose.scale.set(1.35, 1, 1);
    root.add(nose);

    const cockpit = addShadow(new THREE.Mesh(new THREE.SphereGeometry(1.18, 16, 12, 0, Math.PI * 2, 0, 1.1), glassMat));
    cockpit.rotation.z = -Math.PI / 2;
    cockpit.position.set(8.15, 0.22, 0);
    cockpit.scale.set(0.7, 0.72, 0.9);
    root.add(cockpit);

    const tailCone = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 1.28, 4.2, 20), bodyMat));
    tailCone.rotation.z = Math.PI / 2;
    tailCone.position.x = -11.2;
    root.add(tailCone);

    for (let i = 0; i < 10; i += 1) {
        const wx = 6.2 - i * 1.22;
        [-1, 1].forEach((side) => {
            const win = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.06), glassMat));
            win.position.set(wx, 0.22, side * 1.28);
            root.add(win);
        });
    }

    [-1, 1].forEach((side) => {
        const stripe = addShadow(new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.07, 0.04), goldMat));
        stripe.position.set(0.4, -0.08, side * 1.29);
        root.add(stripe);
    });

    const wing = addShadow(new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.22, 26.8), bodyMat));
    wing.position.set(-0.8, -0.55, 0);
    root.add(wing);

    [-1, 1].forEach((side) => {
        const letFin = addShadow(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.85, 0.16), goldMat));
        letFin.position.set(-3.15, 0.42, side * 12.9);
        root.add(letFin);
    });

    const fin = addShadow(new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.4, 0.22), goldMat));
    fin.position.set(-12.1, 2.9, 0);
    root.add(fin);
    const decal = tailDecal();
    [-1, 1].forEach((side) => {
        const plate = addShadow(new THREE.Mesh(
            new THREE.PlaneGeometry(3.1, 1.55),
            new THREE.MeshBasicMaterial({ map: decal, side: THREE.DoubleSide })
        ));
        plate.position.set(-12.05, 3.15, side * 0.13);
        if (side < 0) plate.rotation.y = Math.PI;
        root.add(plate);
    });

    const hstab = addShadow(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 8.4), bodyMat));
    hstab.position.set(-12.4, 5.05, 0);
    root.add(hstab);

    const fans = [];
    [-1, 1].forEach((side) => {
        const nacelle = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.62, 3.3, 18), metalMat));
        nacelle.rotation.z = Math.PI / 2;
        nacelle.position.set(-8.3, -0.15, side * 2.15);
        root.add(nacelle);
        const intake = addShadow(new THREE.Mesh(new THREE.CircleGeometry(0.58, 18), darkMat));
        intake.rotation.y = Math.PI / 2;
        intake.position.set(-6.62, -0.15, side * 2.15);
        root.add(intake);
        const fan = new THREE.Group();
        fan.position.set(-6.7, -0.15, side * 2.15);
        for (let b = 0; b < 7; b += 1) {
            const blade = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 0.18), metalMat));
            blade.rotation.z = (b / 7) * Math.PI;
            fan.add(blade);
        }
        root.add(fan);
        fans.push(fan);
    });

    root.traverse((obj) => {
        if (obj.isMesh) obj.castShadow = false;
    });

    return {
        root,
        fans,
        spin(dt, speed) {
            const spin = dt * (8 + speed * 0.45);
            fans.forEach((fan) => {
                fan.rotation.x += spin;
            });
        }
    };
}
