/**
 * Three.js scene — Indonesia 81: Perjalanan Nusantara
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
        this.createStars();
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
                    void main() {
                        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                        gl_FragColor = vec4(0.9, 0.15, 0.15, 1.0) * intensity;
                    }
                `,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true
            })
        );
        this.earth.add(atmosphere);

        this.markersGroup = new THREE.Group();
        this.earth.add(this.markersGroup);
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < 300; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(Math.random() * 0.15 + 0.03, 6, 6),
                new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.7 ? 0xff6666 : 0xffffff,
                    transparent: true,
                    opacity: Math.random() * 0.6 + 0.3
                })
            );
            star.position.set(
                THREE.MathUtils.randFloatSpread(250),
                THREE.MathUtils.randFloatSpread(250),
                THREE.MathUtils.randFloatSpread(250)
            );
            star.userData.phase = Math.random() * Math.PI * 2;
            this.scene.add(star);
            this.stars.push(star);
        }
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

    createMilestoneMarkers() {
        this.milestones.forEach((milestone) => {
            const color = HUTRI81_CATEGORY_COLORS[milestone.category] || HUTRI81_CATEGORY_COLORS.default;
            const pos = this.latLonToVector3(milestone.lat, milestone.lon, this.earthRadius);

            const markerGroup = new THREE.Group();
            const normal = pos.clone().normalize();
            const surfacePos = normal.clone().multiplyScalar(this.earthRadius + 0.08);

            const core = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            core.position.copy(surfacePos);

            const glow = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 12, 12),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.35,
                    side: THREE.BackSide
                })
            );
            glow.position.copy(surfacePos);

            const light = new THREE.PointLight(color, 0.8, 2.5);
            light.position.copy(surfacePos);

            markerGroup.add(core, glow, light);
            markerGroup.userData = {
                milestone,
                pulseSpeed: 0.6 + Math.random() * 0.8,
                pulsePhase: Math.random() * Math.PI * 2,
                color
            };

            this.markersGroup.add(markerGroup);
            this.markerMeshes.push(markerGroup);
        });
    }

    setupControls() {
        const onDown = (x, y) => {
            this.isDragging = true;
            this.previousMouse = { x, y };
        };
        const onMove = (x, y) => {
            if (!this.isDragging) return;
            const dx = x - this.previousMouse.x;
            const dy = y - this.previousMouse.y;
            this.targetRotation.y += dx * this.rotationSpeed;
            this.targetRotation.x += dy * this.rotationSpeed;
            this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));
            this.previousMouse = { x, y };
        };
        const onUp = () => { this.isDragging = false; };

        window.addEventListener('mousedown', (e) => {
            if (e.target.closest('.hutri-panel, .hutri-modal, .hutri-chat')) return;
            onDown(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', onUp);

        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('.hutri-panel, .hutri-modal, .hutri-chat')) return;
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
            if (this.isDragging) return;
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
            if (e.target.closest('.hutri-panel, .hutri-modal, .hutri-chat')) return;
            handleSelect(e.clientX, e.clientY);
        });

        window.addEventListener('touchend', (e) => {
            if (e.target.closest('.hutri-panel, .hutri-modal, .hutri-chat')) return;
            const t = e.changedTouches[0];
            handleSelect(t.clientX, t.clientY);
        });
    }

    selectMilestone(milestone, color) {
        this.selectedYear = milestone.year;
        this.isPaused = true;
        this.focusOnLatLon(milestone.lat, milestone.lon);
        const localPos = this.latLonToVector3(milestone.lat, milestone.lon, this.earthRadius + 1);
        const worldPos = localPos.clone();
        this.earth.localToWorld(worldPos);
        this.triggerExplosion(worldPos, color || 0xff3333);
        if (this.onMilestoneSelect) this.onMilestoneSelect(milestone);
        document.dispatchEvent(new CustomEvent('hutri:year-selected', { detail: milestone }));
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
    }

    triggerExplosion(position, color) {
        const group = new THREE.Group();
        group.position.copy(position);
        const particles = [];

        for (let i = 0; i < 25; i++) {
            const p = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 6),
                new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xff2222 : 0xffffff })
            );
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(Math.random() * 1.5 + 0.5);
            group.add(p);
            particles.push({ mesh: p, velocity: vel, life: 1 });
        }

        this.scene.add(group);
        this.explosions.push({ group, particles });

        const flash = new THREE.PointLight(color, 3, 8);
        flash.position.copy(position);
        this.scene.add(flash);
        setTimeout(() => this.scene.remove(flash), 600);
    }

    updateExplosions(dt) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            let dead = true;
            exp.particles.forEach((p) => {
                p.mesh.position.add(p.velocity.clone().multiplyScalar(dt * 8));
                p.life -= dt * 2;
                p.mesh.material.opacity = p.life;
                p.mesh.scale.setScalar(p.life);
                if (p.life > 0) dead = false;
            });
            if (dead) {
                this.scene.remove(exp.group);
                this.explosions.splice(i, 1);
            }
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

        if (!this.isDragging && !this.isPaused) {
            this.targetRotation.y += this.autoRotationSpeed;
        }
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * this.dampingFactor;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * this.dampingFactor;
        this.earth.rotation.x = this.currentRotation.x;
        this.earth.rotation.y = this.currentRotation.y;
        this.clouds.rotation.y += 0.0002;

        this.redLight.position.x = Math.sin(t * 0.25) * 35;
        this.redLight.position.z = Math.cos(t * 0.25) * 35;
        this.whiteLight.position.x = Math.cos(t * 0.2) * 30;

        this.stars.forEach((s) => {
            s.material.opacity = 0.3 + 0.4 * Math.sin(t * 2 + s.userData.phase);
        });

        this.markersGroup.children.forEach((marker) => {
            const pulse = 0.7 + 0.5 * Math.sin(t * marker.userData.pulseSpeed + marker.userData.pulsePhase);
            marker.scale.setScalar(pulse);
            if (this.selectedYear && marker.userData.milestone.year === this.selectedYear) {
                marker.scale.setScalar(pulse * 1.4);
            }
        });

        this.camera.position.x = Math.sin(t * 0.08) * 1.5;
        this.camera.position.y = 5 + Math.cos(t * 0.1) * 0.8;
        this.camera.lookAt(0, 0, 0);

        if (dt < 0.2) this.updateExplosions(dt);
        this.renderer.render(this.scene, this.camera);
    }
}
