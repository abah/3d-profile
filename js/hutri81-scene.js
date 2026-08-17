/**
 * Three.js scene — Indonesia 81: Perjalanan Nusantara
 * Enhanced visuals: orbital particles, marker beams, camera fly-to, shockwave bursts
 */
class Hutri81Scene {
    constructor(canvas, onMilestoneSelect) {
        this.canvas = canvas;
        this.onMilestoneSelect = onMilestoneSelect;
        this.milestones = HUTRI81_MILESTONES;
        this.earthRadius = 20;
        this.isDragging = false;
        this.isPaused = false;
        this.previousMouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0.3, y: 2.8 };
        this.currentRotation = { x: 0.3, y: 2.8 };
        this.rotationSpeed = 0.008;
        this.dampingFactor = 0.06;
        this.autoRotationSpeed = 0.0008;
        this.hoveredMarker = null;
        this.explosions = [];
        this.markerMeshes = [];
        this.selectedYear = null;
        this.cameraTargetZ = 42;
        this.cameraCurrentZ = 42;
        this.shootingStars = [];
        this.travelArc = null;
        this.travelArcProgress = 1;
        this.lastMilestonePos = null;
        this.dragDistance = 0;
        this.touchTapThreshold = 12;
        this.celebrationBoost = 0;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x050510, 1);
        this.renderer.shadowMap.enabled = true;

        this.camera.position.set(0, 5, 42);

        this.setupLights();
        this.createEarth();
        this.createFloatingMotto();
        this.createStars();
        this.createOrbitalRing();
        this.createMilestoneMarkers();
        this.setupControls();
        this.setupRaycaster();

        window.addEventListener('resize', () => this.onResize());
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0x442222, 0.5));
        const sun = new THREE.DirectionalLight(0xffeedd, 1.1);
        sun.position.set(5, 3, 5);
        this.scene.add(sun);

        this.redLight = new THREE.PointLight(0xff2222, 2.5, 120);
        this.redLight.position.set(25, 15, 25);
        this.scene.add(this.redLight);

        this.whiteLight = new THREE.PointLight(0xffffff, 1.8, 120);
        this.whiteLight.position.set(-25, -10, 20);
        this.scene.add(this.whiteLight);

        this.rimLight = new THREE.PointLight(0xff4444, 0.6, 200);
        this.rimLight.position.set(0, 0, -40);
        this.scene.add(this.rimLight);
    }

    createEarth() {
        const loader = new THREE.TextureLoader();
        const earthTexture = loader.load(
            'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
        );
        const bumpMap = loader.load(
            'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
        );
        const cloudTexture = loader.load(
            'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
        );

        this.earth = new THREE.Mesh(
            new THREE.SphereGeometry(this.earthRadius, 64, 64),
            new THREE.MeshPhongMaterial({
                map: earthTexture,
                bumpMap,
                bumpScale: 0.05,
                specular: new THREE.Color(0x333333),
                shininess: 8
            })
        );
        this.earth.rotation.z = 0.15;
        this.scene.add(this.earth);

        this.clouds = new THREE.Mesh(
            new THREE.SphereGeometry(this.earthRadius + 0.15, 64, 64),
            new THREE.MeshPhongMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.45
            })
        );
        this.earth.add(this.clouds);

        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.earthRadius + 1.2, 64, 64),
            new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vNormal;
                    uniform float uTime;
                    void main() {
                        float fresnel = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
                        float pulse = 0.85 + 0.15 * sin(uTime * 1.5);
                        vec3 red = vec3(0.92, 0.12, 0.15);
                        vec3 white = vec3(1.0, 0.95, 0.95);
                        vec3 color = mix(red, white, sin(uTime * 0.8 + vNormal.y * 3.0) * 0.5 + 0.5);
                        gl_FragColor = vec4(color * pulse, 1.0) * fresnel;
                    }
                `,
                uniforms: { uTime: { value: 0 } },
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true
            })
        );
        this.atmosphere = atmosphere;
        this.earth.add(atmosphere);

        this.markersGroup = new THREE.Group();
        this.earth.add(this.markersGroup);
    }

    createFloatingMotto() {
        const canvas = document.createElement('canvas');
        const w = 1024;
        const h = 280;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, w, h);

        const pillGrad = ctx.createLinearGradient(0, 0, w, 0);
        pillGrad.addColorStop(0, 'rgba(180, 0, 0, 0.55)');
        pillGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
        pillGrad.addColorStop(1, 'rgba(180, 0, 0, 0.55)');
        ctx.fillStyle = pillGrad;
        ctx.beginPath();
        ctx.roundRect(40, 30, w - 80, h - 60, 36);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        const drawLine = (text, y, size) => {
            ctx.font = `bold ${size}px "Segoe UI", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(255, 40, 40, 0.9)';
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, w / 2, y);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff2222';
            ctx.fillText(text, w / 2, y - 1);
        };

        drawLine('Indonesia Berdaulat', h * 0.38, 56);
        drawLine('Adil dan Makmur', h * 0.62, 48);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            opacity: 0.95
        });
        this.mottoSprite = new THREE.Sprite(spriteMat);
        this.mottoSprite.scale.set(30, 8.2, 1);
        this.mottoSprite.renderOrder = 10;

        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 256;
        glowCanvas.height = 64;
        const gctx = glowCanvas.getContext('2d');
        const radial = gctx.createRadialGradient(128, 32, 0, 128, 32, 128);
        radial.addColorStop(0, 'rgba(255, 80, 80, 0.55)');
        radial.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        radial.addColorStop(1, 'rgba(255, 40, 40, 0)');
        gctx.fillStyle = radial;
        gctx.fillRect(0, 0, 256, 64);
        const glowTex = new THREE.CanvasTexture(glowCanvas);
        this.mottoGlow = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: glowTex,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                opacity: 0.7
            })
        );
        this.mottoGlow.scale.set(34, 10, 1);
        this.mottoGlow.position.z = -0.5;

        const haloPositions = new Float32Array(24 * 3);
        const haloColors = new Float32Array(24 * 3);
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const r = 14 + Math.sin(i * 1.7) * 1.5;
            haloPositions[i * 3] = Math.cos(angle) * r;
            haloPositions[i * 3 + 1] = Math.sin(angle * 0.5) * 2;
            haloPositions[i * 3 + 2] = Math.sin(angle) * r;
            const isRed = i % 2 === 0;
            haloColors[i * 3] = 1;
            haloColors[i * 3 + 1] = isRed ? 0.2 : 1;
            haloColors[i * 3 + 2] = isRed ? 0.25 : 1;
        }
        const haloGeo = new THREE.BufferGeometry();
        haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
        haloGeo.setAttribute('color', new THREE.BufferAttribute(haloColors, 3));
        this.mottoHalo = new THREE.Points(
            haloGeo,
            new THREE.PointsMaterial({
                size: 0.45,
                vertexColors: true,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );

        this.mottoGroup = new THREE.Group();
        this.mottoGroup.add(this.mottoGlow, this.mottoHalo, this.mottoSprite);
        this.mottoBaseY = this.earthRadius + 9;
        this.mottoGroup.position.set(0, this.mottoBaseY, 0);
        this.earth.add(this.mottoGroup);
    }

    updateFloatingMotto(t) {
        if (!this.mottoGroup) return;

        const boost = this.celebrationBoost || 0;
        const bob = Math.sin(t * (0.85 + boost * 0.5)) * (1.4 + boost * 1.8);
        const swayX = Math.sin(t * (0.42 + boost * 0.3)) * (1.1 + boost);
        const swayZ = Math.cos(t * (0.38 + boost * 0.3)) * (1.1 + boost);
        this.mottoGroup.position.set(swayX, this.mottoBaseY + bob, swayZ);

        const pulse = 1 + Math.sin(t * 1.15) * 0.045;
        this.mottoSprite.scale.set(30 * pulse, 8.2 * pulse, 1);
        this.mottoSprite.material.opacity = 0.82 + Math.sin(t * 1.4) * 0.12;

        if (this.mottoGlow) {
            this.mottoGlow.scale.set(34 * pulse, 10 * pulse, 1);
            this.mottoGlow.material.opacity = 0.55 + Math.sin(t * 1.8) * 0.2;
        }

        if (this.mottoHalo) {
            this.mottoHalo.rotation.y = t * 0.25;
            this.mottoHalo.rotation.x = Math.sin(t * 0.5) * 0.15;
            this.mottoHalo.material.opacity = 0.5 + Math.sin(t * 2) * 0.25;
        }
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < 500; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(Math.random() * 0.18 + 0.02, 6, 6),
                new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.75 ? 0xff6666 : 0xffffff,
                    transparent: true,
                    opacity: Math.random() * 0.7 + 0.2
                })
            );
            const dist = 120 + Math.random() * 180;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            star.position.set(
                dist * Math.sin(phi) * Math.cos(theta),
                dist * Math.sin(phi) * Math.sin(theta),
                dist * Math.cos(phi)
            );
            star.userData.phase = Math.random() * Math.PI * 2;
            star.userData.speed = 0.5 + Math.random() * 2;
            this.scene.add(star);
            this.stars.push(star);
        }
    }

    createOrbitalRing() {
        const count = 120;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const r = this.earthRadius + 3.5 + Math.sin(i * 0.7) * 0.4;
            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = Math.sin(i * 0.3) * 0.8;
            positions[i * 3 + 2] = Math.sin(angle) * r;
            const isRed = i % 2 === 0;
            colors[i * 3] = isRed ? 1 : 1;
            colors[i * 3 + 1] = isRed ? 0.15 : 1;
            colors[i * 3 + 2] = isRed ? 0.2 : 1;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.orbitalRing = new THREE.Points(
            geo,
            new THREE.PointsMaterial({
                size: 0.35,
                vertexColors: true,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        this.orbitalRing.rotation.x = 0.4;
        this.earth.add(this.orbitalRing);
    }

    spawnShootingStar() {
        const star = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
        );
        const start = new THREE.Vector3(
            THREE.MathUtils.randFloat(-120, 120),
            THREE.MathUtils.randFloat(30, 80),
            THREE.MathUtils.randFloat(-80, 80)
        );
        const vel = new THREE.Vector3(
            THREE.MathUtils.randFloat(-2, -0.5),
            THREE.MathUtils.randFloat(-1.5, -0.3),
            THREE.MathUtils.randFloat(-1, 1)
        ).normalize().multiplyScalar(80);
        star.position.copy(start);
        this.scene.add(star);
        this.shootingStars.push({ mesh: star, vel, life: 1, trail: [] });
    }

    latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    getMarkerLatLon(milestone, stackIndex) {
        if (!stackIndex) {
            return { lat: milestone.lat, lon: milestone.lon };
        }
        const angle = stackIndex * 1.05;
        const spread = 0.55;
        return {
            lat: milestone.lat + Math.sin(angle) * spread,
            lon: milestone.lon + Math.cos(angle) * spread
        };
    }

    createMilestoneMarkers() {
        const locationCounts = {};
        this.milestones.forEach((milestone) => {
            const locKey = `${milestone.lat.toFixed(4)},${milestone.lon.toFixed(4)}`;
            const stackIndex = locationCounts[locKey] || 0;
            locationCounts[locKey] = stackIndex + 1;

            const { lat, lon } = this.getMarkerLatLon(milestone, stackIndex);
            milestone.displayLat = lat;
            milestone.displayLon = lon;

            const color = HUTRI81_CATEGORY_COLORS[milestone.category] || HUTRI81_CATEGORY_COLORS.default;
            const pos = this.latLonToVector3(lat, lon, this.earthRadius);
            const normal = pos.clone().normalize();
            const surfacePos = normal.clone().multiplyScalar(this.earthRadius + 0.08);

            const markerGroup = new THREE.Group();
            const isKeyEvent = !!HUTRI81_KEY_EVENTS[milestone.year];

            const core = new THREE.Mesh(
                new THREE.SphereGeometry(isKeyEvent ? 0.16 : 0.1, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            core.position.copy(surfacePos);

            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(isKeyEvent ? 0.45 : 0.3, 12, 12),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.BackSide
                })
            );
            glow.position.copy(surfacePos);

            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.25, 0.38, 24),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.55,
                    side: THREE.DoubleSide
                })
            );
            ring.position.copy(surfacePos.clone().add(normal.clone().multiplyScalar(0.02)));
            ring.lookAt(surfacePos.clone().add(normal));

            const beamHeight = isKeyEvent ? 2.2 : 1.2;
            const beam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.06, beamHeight, 8, 1, true),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.35,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                })
            );
            const beamCenter = surfacePos.clone().add(normal.clone().multiplyScalar(beamHeight * 0.5));
            beam.position.copy(beamCenter);
            beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

            const light = new THREE.PointLight(color, isKeyEvent ? 1.2 : 0.6, 3.5);
            light.position.copy(surfacePos);

            markerGroup.add(core, glow, ring, beam, light);
            markerGroup.userData = {
                milestone,
                pulseSpeed: 0.6 + Math.random() * 0.8,
                pulsePhase: Math.random() * Math.PI * 2,
                color,
                isKeyEvent,
                ring,
                beam,
                surfacePos: surfacePos.clone()
            };

            this.markersGroup.add(markerGroup);
            this.markerMeshes.push(markerGroup);
        });
    }

    setupControls() {
        const onDown = (x, y) => {
            this.isDragging = true;
            this.dragDistance = 0;
            this.previousMouse = { x, y };
        };
        const onMove = (x, y) => {
            if (!this.isDragging) return;
            const dx = x - this.previousMouse.x;
            const dy = y - this.previousMouse.y;
            this.dragDistance += Math.abs(dx) + Math.abs(dy);
            this.targetRotation.y += dx * this.rotationSpeed;
            this.targetRotation.x += dy * this.rotationSpeed;
            this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));
            this.previousMouse = { x, y };
        };
        const onUp = () => { this.isDragging = false; };

        window.addEventListener('mousedown', (e) => {
            if (e.target.closest('.hutri-panel, .hutri-modal, .celebrate-panel, .mobile-nav')) return;
            onDown(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', onUp);

        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('.hutri-panel, .hutri-modal, .celebrate-panel, .mobile-nav')) return;
            if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        window.addEventListener('touchend', onUp);
    }

    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        const updateHover = (clientX, clientY) => {
            this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);

            const hits = this.raycaster.intersectObjects(this.markersGroup.children, true);
            this.hoveredMarker = null;
            document.body.style.cursor = this.isDragging ? 'grabbing' : 'grab';

            if (hits.length > 0 && !this.isDragging) {
                let obj = hits[0].object;
                while (obj.parent && !obj.userData.milestone) obj = obj.parent;
                if (obj.userData.milestone) {
                    this.hoveredMarker = obj;
                    document.body.style.cursor = 'pointer';
                }
            }
        };

        window.addEventListener('mousemove', (e) => updateHover(e.clientX, e.clientY));

        const handleSelect = (clientX, clientY) => {
            if (this.dragDistance > this.touchTapThreshold) return;
            this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const hits = this.raycaster.intersectObjects(this.markersGroup.children, true);
            if (hits.length === 0) return;

            let obj = hits[0].object;
            while (obj.parent && !obj.userData.milestone) obj = obj.parent;
            if (!obj.userData.milestone) return;

            const milestone = obj.userData.milestone;
            this.selectMilestone(milestone, obj.userData.color);
        };

        window.addEventListener('click', (e) => {
            if (e.target.closest('.hutri-panel, .hutri-modal, .celebrate-panel, .mobile-nav')) return;
            handleSelect(e.clientX, e.clientY);
        });

        window.addEventListener('touchend', (e) => {
            if (e.target.closest('.hutri-panel, .hutri-modal, .celebrate-panel, .mobile-nav')) return;
            const t = e.changedTouches[0];
            handleSelect(t.clientX, t.clientY);
        });
    }

    selectMilestone(milestone, color) {
        this.selectedYear = milestone.year;
        this.isPaused = true;
        this.cameraTargetZ = 32;
        this.focusOnLatLon(milestone.displayLat ?? milestone.lat, milestone.displayLon ?? milestone.lon);

        const localPos = this.latLonToVector3(
            milestone.displayLat ?? milestone.lat,
            milestone.displayLon ?? milestone.lon,
            this.earthRadius + 1
        );
        const worldPos = localPos.clone();
        this.earth.localToWorld(worldPos);

        if (this.lastMilestonePos) {
            this.createTravelArc(this.lastMilestonePos.clone(), localPos.clone(), color || 0xff3333);
        }
        this.lastMilestonePos = localPos.clone();

        this.triggerExplosion(worldPos, color || 0xff3333, milestone.category === 'sejarah' || !!HUTRI81_KEY_EVENTS[milestone.year]);
        if (this.onMilestoneSelect) this.onMilestoneSelect(milestone);
        document.dispatchEvent(new CustomEvent('hutri:year-selected', { detail: milestone }));
        document.dispatchEvent(new CustomEvent('hutri:milestone-flash', { detail: { year: milestone.year } }));
    }

    createTravelArc(fromLocal, toLocal, color) {
        if (this.travelArc) {
            this.earth.remove(this.travelArc);
            this.travelArc.geometry.dispose();
            this.travelArc.material.dispose();
        }
        const from = fromLocal.clone().normalize().multiplyScalar(this.earthRadius + 2);
        const to = toLocal.clone().normalize().multiplyScalar(this.earthRadius + 2);
        const mid = from.clone().add(to).normalize().multiplyScalar(this.earthRadius + 6);
        const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
        const points = curve.getPoints(40);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        this.travelArc = new THREE.Line(
            geo,
            new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            })
        );
        this.travelArcProgress = 0;
        this.earth.add(this.travelArc);
    }

    focusOnLatLon(lat, lon) {
        const pos = this.latLonToVector3(lat, lon, 1).normalize();
        this.targetRotation.y = Math.atan2(pos.x, pos.z);
        this.targetRotation.x = Math.asin(Math.max(-1, Math.min(1, pos.y)));
    }

    goToYear(year) {
        const milestone = this.milestones.find((m) => m.year === year);
        if (milestone) {
            const color = HUTRI81_CATEGORY_COLORS[milestone.category] || HUTRI81_CATEGORY_COLORS.default;
            this.selectMilestone(milestone, color);
        }
    }

    setPaused(paused) {
        this.isPaused = paused;
        if (!paused) {
            this.cameraTargetZ = 42;
            this.selectedYear = null;
            this.celebrationBoost = 0;
        }
    }

    launchMerdekaShow(intensity = 'normal') {
        const isMega = intensity === 'mega';
        const count = isMega ? 14 : 7;
        const picks = [...HUTRI81_MILESTONES].sort(() => Math.random() - 0.5).slice(0, count);

        this.isPaused = false;
        this.celebrationBoost = isMega ? 1 : 0.6;
        this.cameraTargetZ = isMega ? 28 : 34;

        picks.forEach((m, i) => {
            setTimeout(() => {
                const localPos = this.latLonToVector3(m.lat, m.lon, this.earthRadius + 1);
                const worldPos = localPos.clone();
                this.earth.localToWorld(worldPos);
                const color = HUTRI81_CATEGORY_COLORS[m.category] || 0xff3333;
                this.triggerExplosion(worldPos, color, true);
                if (i % 2 === 0) this.focusOnLatLon(m.lat, m.lon);
            }, i * (isMega ? 180 : 280));
        });

        setTimeout(() => {
            this.celebrationBoost = 0;
            this.cameraTargetZ = 42;
        }, isMega ? 3500 : 2500);

        document.dispatchEvent(new CustomEvent('hutri:celebration-launched', { detail: { intensity } }));
    }

    launchProvinceSpark(lat, lon) {
        const localPos = this.latLonToVector3(lat, lon, this.earthRadius + 0.5);
        const worldPos = localPos.clone();
        this.earth.localToWorld(worldPos);
        this.triggerExplosion(worldPos, 0xff3333, false);
    }

    triggerExplosion(position, color, big = false) {
        const group = new THREE.Group();
        group.position.copy(position);
        const particles = [];
        const count = big ? 55 : 30;

        for (let i = 0; i < count; i++) {
            const isRed = i % 3 !== 0;
            const p = new THREE.Mesh(
                new THREE.SphereGeometry(big ? 0.1 : 0.07, 6, 6),
                new THREE.MeshBasicMaterial({
                    color: isRed ? 0xff2222 : 0xffffff,
                    transparent: true,
                    opacity: 1
                })
            );
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(Math.random() * (big ? 2.5 : 1.5) + 0.5);
            group.add(p);
            particles.push({ mesh: p, velocity: vel, life: 1 });
        }

        const shockwave = new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.15, 32),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        shockwave.lookAt(this.camera.position);
        group.add(shockwave);
        particles.push({ mesh: shockwave, velocity: new THREE.Vector3(), life: 1, isRing: true });

        this.scene.add(group);
        this.explosions.push({ group, particles });

        const flash = new THREE.PointLight(color, big ? 5 : 3, big ? 14 : 8);
        flash.position.copy(position);
        this.scene.add(flash);
        setTimeout(() => this.scene.remove(flash), big ? 900 : 600);
    }

    updateExplosions(dt) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            let dead = true;
            exp.particles.forEach((p) => {
                if (p.isRing) {
                    p.life -= dt * 1.8;
                    const s = (1 - p.life) * 8 + 0.1;
                    p.mesh.scale.set(s, s, s);
                    p.mesh.material.opacity = p.life * 0.7;
                } else {
                    p.mesh.position.add(p.velocity.clone().multiplyScalar(dt * 10));
                    p.life -= dt * 1.6;
                    p.mesh.material.opacity = p.life;
                    p.mesh.scale.setScalar(0.5 + p.life * 0.5);
                }
                if (p.life > 0) dead = false;
            });
            if (dead) {
                this.scene.remove(exp.group);
                this.explosions.splice(i, 1);
            }
        }
    }

    updateShootingStars(dt) {
        if (Math.random() < 0.008) this.spawnShootingStar();
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            s.mesh.position.add(s.vel.clone().multiplyScalar(dt));
            s.life -= dt * 0.8;
            s.mesh.material.opacity = s.life;
            if (s.life <= 0) {
                this.scene.remove(s.mesh);
                this.shootingStars.splice(i, 1);
            }
        }
    }

    updateTravelArc(dt) {
        if (!this.travelArc || this.travelArcProgress >= 1) return;
        this.travelArcProgress = Math.min(1, this.travelArcProgress + dt * 1.5);
        const total = this.travelArc.geometry.attributes.position.count;
        const visible = Math.floor(total * this.travelArcProgress);
        this.travelArc.geometry.setDrawRange(0, visible);
        this.travelArc.material.opacity = 0.9 * (1 - this.travelArcProgress * 0.5);
        if (this.travelArcProgress >= 1) {
            setTimeout(() => {
                if (this.travelArc) {
                    this.earth.remove(this.travelArc);
                    this.travelArc.geometry.dispose();
                    this.travelArc.material.dispose();
                    this.travelArc = null;
                }
            }, 400);
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(time) {
        requestAnimationFrame(this.animate);
        const dt = Math.min((time - this.lastTime) / 1000, 0.05);
        this.lastTime = time;
        const t = time / 1000;

        if (this.atmosphere?.material?.uniforms) {
            this.atmosphere.material.uniforms.uTime.value = t;
        }

        if (!this.isDragging && !this.isPaused) {
            this.targetRotation.y += this.autoRotationSpeed + (this.celebrationBoost || 0) * 0.004;
        }
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * this.dampingFactor;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * this.dampingFactor;
        this.earth.rotation.x = this.currentRotation.x;
        this.earth.rotation.y = this.currentRotation.y;
        this.clouds.rotation.y += 0.00025;

        if (this.orbitalRing) {
            this.orbitalRing.rotation.y += 0.0012;
            this.orbitalRing.rotation.z = Math.sin(t * 0.3) * 0.08;
        }

        this.redLight.position.x = Math.sin(t * 0.25) * 35;
        this.redLight.position.z = Math.cos(t * 0.25) * 35;
        this.whiteLight.position.x = Math.cos(t * 0.2) * 30;
        this.rimLight.intensity = 0.5 + Math.sin(t * 1.2) * 0.2;

        this.stars.forEach((s) => {
            s.material.opacity = 0.25 + 0.55 * Math.sin(t * s.userData.speed + s.userData.phase);
        });

        this.markersGroup.children.forEach((marker) => {
            const pulse = 0.75 + 0.55 * Math.sin(t * marker.userData.pulseSpeed + marker.userData.pulsePhase);
            const isSelected = this.selectedYear && marker.userData.milestone.year === this.selectedYear;
            const isHovered = this.hoveredMarker === marker;
            const scale = isSelected ? pulse * 1.6 : isHovered ? pulse * 1.25 : pulse;
            marker.scale.setScalar(scale);

            if (marker.userData.ring) {
                marker.userData.ring.rotation.z += 0.02;
                marker.userData.ring.material.opacity = 0.35 + 0.35 * Math.sin(t * 3 + marker.userData.pulsePhase);
            }
            if (marker.userData.beam) {
                marker.userData.beam.material.opacity = 0.2 + 0.25 * Math.sin(t * 2 + marker.userData.pulsePhase);
            }
        });

        this.cameraCurrentZ += (this.cameraTargetZ - this.cameraCurrentZ) * 0.04;
        this.camera.position.x = Math.sin(t * 0.08) * 1.8;
        this.camera.position.y = 5 + Math.cos(t * 0.1) * 1.0;
        this.camera.position.z = this.cameraCurrentZ;
        this.camera.lookAt(0, 0, 0);

        this.updateFloatingMotto(t);

        if (dt < 0.2) {
            this.updateExplosions(dt);
            this.updateShootingStars(dt);
            this.updateTravelArc(dt);
        }
        this.renderer.render(this.scene, this.camera);
    }
}
