// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
        antialias: true,
        alpha: true
    });

    // Configure renderer
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    
    // Enable shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Set camera position
    camera.position.setZ(40);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Dynamic point lights with different colors
    const pointLight1 = new THREE.PointLight(0x00d4ff, 3, 150);
    pointLight1.position.set(30, 20, 30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 2.5, 150);
    pointLight2.position.set(-30, -15, 20);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x9b59ff, 2, 120);
    pointLight3.position.set(0, 40, -20);
    scene.add(pointLight3);
    
    // Variables to store references (keeping these for compatibility with the rest of the code)
    let goldenTextMesh = null;
    let goldenParticles = [];
    
    // Create Earth
    const earthRadius = 20;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // Load Earth textures
    const textureLoader = new THREE.TextureLoader();
    
    const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    const earthBumpMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg');
    const earthSpecMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg');
    const earthCloudTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png');
    
    // Create Earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: earthBumpMap,
        bumpScale: 0.05,
        specularMap: earthSpecMap,
        specular: new THREE.Color('grey'),
        shininess: 5
    });
    
    // Create Earth mesh
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.z = 0.2; // Tilt the Earth slightly
    scene.add(earth);
    
    // Create cloud layer
    const cloudGeometry = new THREE.SphereGeometry(earthRadius + 0.2, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: earthCloudTexture,
        transparent: true,
        opacity: 0.6
    });
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earth.add(clouds);

    // Atmospheric glow around Earth
    const atmosphereGeometry = new THREE.SphereGeometry(earthRadius + 1.5, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
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
                float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.0, 0.83, 1.0, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earth.add(atmosphere);

    // Orbital ring
    const ringGeometry = new THREE.TorusGeometry(earthRadius + 4, 0.05, 8, 128);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.3
    });
    const orbitRing = new THREE.Mesh(ringGeometry, ringMaterial);
    orbitRing.rotation.x = Math.PI / 2.5;
    scene.add(orbitRing);

    const ringGeometry2 = new THREE.TorusGeometry(earthRadius + 6, 0.03, 8, 128);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.2
    });
    const orbitRing2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    orbitRing2.rotation.x = Math.PI / 3;
    orbitRing2.rotation.z = 0.5;
    scene.add(orbitRing2);

    // Create stars with varied sizes and colors
    const starColors = [0xffffff, 0x00d4ff, 0xff6b9d, 0xffdd57, 0x9b59ff];
    function addStar() {
        const size = Math.random() * 0.3 + 0.05;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: Math.random() * 0.5 + 0.5
        });
        const star = new THREE.Mesh(geometry, material);

        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(300));
        star.position.set(x, y, z);
        star.userData = {
            twinkleSpeed: Math.random() * 3 + 1,
            twinklePhase: Math.random() * Math.PI * 2,
            baseOpacity: material.opacity
        };
        scene.add(star);
        return star;
    }

    const stars = Array(400).fill().map(addStar);

    // Shooting stars
    const shootingStars = [];
    function spawnShootingStar() {
        const geometry = new THREE.SphereGeometry(0.15, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(geometry, material);

        const startX = THREE.MathUtils.randFloatSpread(200);
        const startY = THREE.MathUtils.randFloatSpread(100) + 50;
        const startZ = THREE.MathUtils.randFloatSpread(100) - 50;
        star.position.set(startX, startY, startZ);

        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = new Float32Array(6);
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.6
        });
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        star.add(trail);

        scene.add(star);
        shootingStars.push({
            mesh: star,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 3 - 1,
                -Math.random() * 2 - 1,
                (Math.random() - 0.5) * 2
            ),
            life: 1.0
        });
    }

    // Nebula particles (background dust)
    const nebulaParticles = [];
    for (let i = 0; i < 60; i++) {
        const size = Math.random() * 2 + 0.5;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const nebulaColors = [0x1a0a3e, 0x0a1a3e, 0x3e0a2a, 0x0a3e2a];
        const material = new THREE.MeshBasicMaterial({
            color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
            transparent: true,
            opacity: Math.random() * 0.08 + 0.02
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(
            THREE.MathUtils.randFloatSpread(400),
            THREE.MathUtils.randFloatSpread(400),
            THREE.MathUtils.randFloatSpread(400) - 100
        );
        scene.add(particle);
        nebulaParticles.push({
            mesh: particle,
            driftSpeed: Math.random() * 0.02 + 0.005,
            driftPhase: Math.random() * Math.PI * 2
        });
    }

    // Section-specific marker colors
    const sectionColors = [
        0x00d4ff, // header - cyan
        0xff6b9d, // about - pink
        0xffdd57, // experience - gold
        0x2ecc71, // education - green
        0x9b59ff, // skills - purple
        0xe67e22, // technical - orange
        0x1abc9c  // interests - teal
    ];

    // Create a group for all content fragments
    const fragmentsGroup = new THREE.Group();
    earth.add(fragmentsGroup);

    // Create a modal for displaying detailed information
    function createInfoModal() {
        const modal = document.createElement('div');
        modal.id = 'info-modal';
        modal.className = 'info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">Title</h2>
                    <span class="close-button">&times;</span>
                </div>
                <div class="modal-body">
                    <p id="modal-text">Content</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close button functionality
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            modal.classList.remove('active');
            // Resume auto-rotation when modal is closed
            isPaused = false;
        });
        
        return modal;
    }

    // Function to create content fragments on Earth surface
    function createContentFragmentsOnEarth() {
        // Hide original content
        document.querySelectorAll('section, header').forEach(section => {
            section.style.visibility = 'hidden';
        });
        
        const fragments = [];
        const sections = Array.from(document.querySelectorAll('section, header'));
        
        // Define distribution points on the globe
        // We'll use spherical coordinates to place fragments evenly
        const numSections = sections.length;
        
        // Process each section to create 3D fragments
        sections.forEach((section, sectionIndex) => {
            // Get the section title
            const sectionTitle = section.querySelector('h1, h2, h3, h4')?.textContent || 'Information';
            
            // Get content without the title to avoid repetition
            let sectionContent = section.textContent.trim();
            
            // Remove the title from the content to avoid repetition
            sectionContent = sectionContent.replace(sectionTitle, '').trim();
            
            // Replace education section content with the specified text
            if (sectionTitle.toLowerCase().includes('education') || 
                sectionTitle.toLowerCase().includes('pendidikan')) {
                sectionContent = "Magister Manajemen Telkom University, Institut Teknologi Bandung, SMA Negeri Plus Cisarua - Bandung";
            }
            
            // Create multiple fragments from each section
            const numFragments = Math.min(3, Math.floor(sectionContent.length / 100) + 1); // Limit fragments per section
            
            for (let i = 0; i < numFragments; i++) {
                // Calculate position on the globe using spherical distribution
                // This distributes points more evenly on a sphere
                const phi = Math.acos(-1 + (2 * (sectionIndex * numFragments + i)) / (numSections * numFragments));
                const theta = Math.sqrt(numSections * numFragments) * Math.PI * (1 - Math.cos(phi));
                
                // Convert to Cartesian coordinates
                const x = earthRadius * Math.sin(phi) * Math.cos(theta);
                const y = earthRadius * Math.sin(phi) * Math.sin(theta);
                const z = earthRadius * Math.cos(phi);
                
                // Create a canvas for the text fragment
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                // Set canvas size
                canvas.width = 256;
                canvas.height = 256;
                
                // Fill background with semi-transparent color
                context.fillStyle = 'rgba(44, 62, 80, 0.9)';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add border
                context.strokeStyle = '#3498db';
                context.lineWidth = 4;
                context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
                
                // Configure text
                context.fillStyle = '#ecf0f1';
                context.font = 'bold 18px Poppins, sans-serif';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                
                // Draw section title
                context.fillText(sectionTitle, canvas.width / 2, 30);
                
                // Draw divider
                context.strokeStyle = '#3498db';
                context.beginPath();
                context.moveTo(40, 50);
                context.lineTo(canvas.width - 40, 50);
                context.stroke();
                
                // Configure text for content
                context.font = '16px Poppins, sans-serif';
                
                // Get a fragment of the text
                const startIndex = Math.floor(i * (sectionContent.length / numFragments));
                const endIndex = Math.floor((i + 1) * (sectionContent.length / numFragments));
                let fragmentText = sectionContent.substring(startIndex, endIndex);
                
                // Limit text length and add ellipsis if needed
                if (fragmentText.length > 200) {
                    fragmentText = fragmentText.substring(0, 200) + '...';
                }
                
                // Wrap text to fit canvas
                const words = fragmentText.split(' ');
                const lines = [];
                let currentLine = '';
                
                words.forEach(word => {
                    const testLine = currentLine + word + ' ';
                    const metrics = context.measureText(testLine);
                    
                    if (metrics.width > canvas.width - 40) {
                        lines.push(currentLine);
                        currentLine = word + ' ';
                    } else {
                        currentLine = testLine;
                    }
                });
                
                lines.push(currentLine);
                
                // Draw text lines
                const lineHeight = 20;
                const startY = 70;
                
                lines.forEach((line, index) => {
                    context.fillText(line, canvas.width / 2, startY + index * lineHeight);
                });
                
                // Create texture from canvas
                const texture = new THREE.CanvasTexture(canvas);
                
                // Create material with the texture - Modified to ensure text is always visible
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide,
                    depthTest: false, // Disable depth testing so text is always visible
                    depthWrite: false // Don't write to depth buffer
                });
                
                // Create plane geometry for the fragment
                const geometry = new THREE.PlaneGeometry(5, 5);
                const fragment = new THREE.Mesh(geometry, material);
                
                // Position fragment at the calculated point on the Earth's surface
                fragment.position.set(x, y, z);
                
                // Make the fragment face outward from the center of the Earth
                fragment.lookAt(0, 0, 0);
                // Then rotate it 180 degrees so it faces outward, not inward
                fragment.rotateY(Math.PI);
                
                // Set a high renderOrder to ensure it renders on top of other objects
                fragment.renderOrder = 1000;
                
                // Create a glowing marker at the fragment position
                const markerColor = sectionColors[sectionIndex % sectionColors.length];
                createGlowingMarker(x, y, z, fragmentsGroup, markerColor);
                
                // Add to fragments group
                fragmentsGroup.add(fragment);
                
                // Store fragment data
                fragments.push({
                    mesh: fragment,
                    originalPosition: new THREE.Vector3(x, y, z),
                    sectionIndex: sectionIndex,
                    fragmentIndex: i,
                    title: sectionTitle,
                    content: sectionContent,
                    fragmentText: fragmentText
                });
            }
        });
        
        return fragments;
    }

    // Function to create a realistic glowing marker for information points
    function createGlowingMarker(x, y, z, parent, color = 0x00d4ff) {
        const coreGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        
        const surfaceNormal = new THREE.Vector3(x, y, z).normalize();
        const corePosition = surfaceNormal.clone().multiplyScalar(earthRadius + 0.05);
        core.position.copy(corePosition);
        
        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.35,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(corePosition);
        
        const pulseLight = new THREE.PointLight(color, 1.2, 3);
        pulseLight.position.copy(corePosition);
        
        const markerGroup = new THREE.Group();
        markerGroup.add(core);
        markerGroup.add(glow);
        markerGroup.add(pulseLight);
        
        markerGroup.userData = {
            initialScale: 1.0,
            pulseSpeed: 0.8 + Math.random() * 1.2,
            pulsePhase: Math.random() * Math.PI * 2,
            color: color
        };
        
        parent.add(markerGroup);
        
        return markerGroup;
    }

    // Create explosion particles
    function createExplosionParticles(position, color = 0x3498db, count = 30, scale = 1.0) {
        const particles = [];
        const particleGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            const size = (Math.random() * 0.4 + 0.1) * scale;
            const geometry = new THREE.SphereGeometry(size, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.5
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // Set initial position at the explosion center
            particle.position.set(0, 0, 0);
            
            // Random velocity direction
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(Math.random() * 2 + 1);
            
            particleGroup.add(particle);
            particles.push({
                mesh: particle,
                velocity: velocity,
                life: 1.0  // Life from 1.0 to 0.0
            });
        }
        
        particleGroup.position.copy(position);
        scene.add(particleGroup);
        
        return {
            group: particleGroup,
            particles: particles
        };
    }

    // Array to store active explosions
    const explosions = [];

    // Function to trigger explosion at a position
    function triggerExplosion(position, color, count = 30, scale = 1.0) {
        const explosion = createExplosionParticles(position, color, count, scale);
        explosions.push(explosion);
        
        // Add a point light at explosion position
        const explosionLight = new THREE.PointLight(color, 2 * scale, 10 * scale);
        explosionLight.position.copy(position);
        scene.add(explosionLight);
        
        // Remove light after animation
        setTimeout(() => {
            scene.remove(explosionLight);
        }, 1000);
    }

    // Update explosions
    function updateExplosions(deltaTime) {
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            let allDead = true;
            
            for (const particle of explosion.particles) {
                // Update position based on velocity
                particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime * 10));
                
                // Reduce life
                particle.life -= deltaTime * 2;
                
                // Scale and opacity based on life
                const scale = particle.life * 0.5 + 0.5;
                particle.mesh.scale.set(scale, scale, scale);
                particle.mesh.material.opacity = particle.life;
                
                if (particle.life > 0) {
                    allDead = false;
                }
            }
            
            // Remove explosion if all particles are dead
            if (allDead) {
                scene.remove(explosion.group);
                explosions.splice(i, 1);
            }
        }
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Variables for Earth rotation control
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };
    let currentRotation = { x: 0, y: 0 };
    const rotationSpeed = 0.01;
    const dampingFactor = 0.05;
    const autoRotationSpeed = 0.001;
    let isPaused = false;
    let shootingStarTimer = 0;
    let hoveredFragment = null;

    // Add event listeners for Earth rotation
    function addEarthControls() {
        // Mouse down event
        window.addEventListener('mousedown', (event) => {
            // Don't start dragging if clicking on the modal
            if (event.target.closest('.info-modal')) return;
            
            isDragging = true;
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        });
        
        // Mouse move event
        window.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const deltaMove = {
                    x: event.clientX - previousMousePosition.x,
                    y: event.clientY - previousMousePosition.y
                };
                
                // Update target rotation
                targetRotation.y += deltaMove.x * rotationSpeed;
                targetRotation.x += deltaMove.y * rotationSpeed;
                
                // Limit vertical rotation to avoid flipping
                targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x));
                
                previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        });
        
        // Mouse up event
        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Mouse leave event
        window.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        // Touch events for mobile
        window.addEventListener('touchstart', (event) => {
            // Don't start dragging if touching the modal
            if (event.target.closest('.info-modal')) return;
            
            if (event.touches.length === 1) {
                isDragging = true;
                previousMousePosition = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        });
        
        window.addEventListener('touchmove', (event) => {
            if (isDragging && event.touches.length === 1) {
                const deltaMove = {
                    x: event.touches[0].clientX - previousMousePosition.x,
                    y: event.touches[0].clientY - previousMousePosition.y
                };
                
                // Update target rotation
                targetRotation.y += deltaMove.x * rotationSpeed;
                targetRotation.x += deltaMove.y * rotationSpeed;
                
                // Limit vertical rotation
                targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x));
                
                previousMousePosition = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            }
        });
        
        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // Add raycaster for fragment interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Add event listeners for fragment interaction
    function addFragmentInteraction(fragments, modal) {
        // Mouse move event for hover effects
        window.addEventListener('mousemove', (event) => {
            // Update mouse position for raycaster
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update raycaster
            raycaster.setFromCamera(mouse, camera);
            
            // Find intersected objects
            const intersects = raycaster.intersectObjects(fragmentsGroup.children);
            
            // Reset all hover states
            fragments.forEach(fragment => {
                if (fragment.mesh.userData.hovered) {
                    fragment.mesh.userData.hovered = false;
                    fragment.mesh.scale.set(1, 1, 1);
                }
            });
            hoveredFragment = null;
            
            // Handle intersected objects
            if (intersects.length > 0 && !isDragging) {
                const intersectedObject = intersects[0].object;
                const fragment = fragments.find(f => f.mesh === intersectedObject);
                
                if (fragment) {
                    fragment.mesh.userData.hovered = true;
                    fragment.mesh.scale.set(1.3, 1.3, 1.3);
                    hoveredFragment = fragment;
                    document.body.style.cursor = 'pointer';
                    
                    if (Math.random() > 0.92) {
                        const worldPosition = new THREE.Vector3();
                        fragment.mesh.getWorldPosition(worldPosition);
                        const color = sectionColors[fragment.sectionIndex % sectionColors.length];
                        triggerExplosion(worldPosition, color, 12, 0.6);
                    }
                }
            } else if (!isDragging) {
                document.body.style.cursor = 'grab';
            }
        });
        
        // Click event
        window.addEventListener('click', (event) => {
            // Don't process click if it's on the modal
            if (event.target.closest('.info-modal')) return;
            
            if (isDragging) return; // Don't trigger click if dragging
            
            // Update mouse position for raycaster
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update raycaster
            raycaster.setFromCamera(mouse, camera);
            
            // Find intersected objects
            const intersects = raycaster.intersectObjects(fragmentsGroup.children);
            
            if (intersects.length > 0) {
                const intersectedObject = intersects[0].object;
                
                // Find the fragment this mesh belongs to
                const fragment = fragments.find(f => f.mesh === intersectedObject);
                
                if (fragment) {
                    // Get world position for the explosion
                    const worldPosition = new THREE.Vector3();
                    fragment.mesh.getWorldPosition(worldPosition);
                    
                    const color = sectionColors[fragment.sectionIndex % sectionColors.length];
                    triggerExplosion(worldPosition, color, 30, 1.0);
                    
                    // Rotate Earth to center this fragment
                    const direction = fragment.originalPosition.clone().normalize();
                    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
                        new THREE.Vector3(0, 0, 1), // Forward direction
                        direction.negate() // We want to look at the fragment
                    );
                    
                    // Convert quaternion to Euler angles
                    const targetEuler = new THREE.Euler().setFromQuaternion(targetQuaternion);
                    
                    // Set target rotation
                    targetRotation.x = targetEuler.x;
                    targetRotation.y = targetEuler.y;
                    
                    // Show the modal with fragment content
                    showInfoModal(modal, fragment);
                }
            }
        });
        
        // Touch event for mobile
        window.addEventListener('touchend', (event) => {
            // Don't process touch if it's on the modal
            if (event.target.closest('.info-modal')) return;
            
            if (isDragging) return; // Don't trigger if dragging
            
            // Get touch position
            const touch = event.changedTouches[0];
            mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            // Update raycaster
            raycaster.setFromCamera(mouse, camera);
            
            // Find intersected objects
            const intersects = raycaster.intersectObjects(fragmentsGroup.children);
            
            if (intersects.length > 0) {
                const intersectedObject = intersects[0].object;
                
                // Find the fragment this mesh belongs to
                const fragment = fragments.find(f => f.mesh === intersectedObject);
                
                if (fragment) {
                    // Get world position for the explosion
                    const worldPosition = new THREE.Vector3();
                    fragment.mesh.getWorldPosition(worldPosition);
                    
                    const color = sectionColors[fragment.sectionIndex % sectionColors.length];
                    triggerExplosion(worldPosition, color, 30, 1.0);
                    
                    // Rotate Earth to center this fragment
                    const direction = fragment.originalPosition.clone().normalize();
                    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
                        new THREE.Vector3(0, 0, 1),
                        direction.negate()
                    );
                    
                    // Convert quaternion to Euler angles
                    const targetEuler = new THREE.Euler().setFromQuaternion(targetQuaternion);
                    
                    // Set target rotation
                    targetRotation.x = targetEuler.x;
                    targetRotation.y = targetEuler.y;
                    
                    // Show the modal with fragment content
                    showInfoModal(modal, fragment);
                }
            }
        });
    }
    
    // Function to show the info modal with fragment content
    function showInfoModal(modal, fragment) {
        // Pause auto-rotation when modal is open
        isPaused = true;
        
        // Set modal content
        const modalTitle = modal.querySelector('#modal-title');
        const modalText = modal.querySelector('#modal-text');
        
        modalTitle.textContent = fragment.title;
        
        // Format the content - get the full section content
        const formattedContent = fragment.content
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .trim();
        
        modalText.textContent = formattedContent;
        
        // Show the modal
        modal.classList.add('active');
    }

    // Animation loop
    let lastTime = 0;
    function animate(currentTime, fragments) {
        requestAnimationFrame((time) => animate(time, fragments));
        
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
        lastTime = currentTime;
        const timeSec = currentTime / 1000;
        
        if (!isDragging && !isPaused) {
            targetRotation.y += autoRotationSpeed;
        }
        
        currentRotation.x += (targetRotation.x - currentRotation.x) * dampingFactor;
        currentRotation.y += (targetRotation.y - currentRotation.y) * dampingFactor;
        
        earth.rotation.x = currentRotation.x;
        earth.rotation.y = currentRotation.y;
        
        // Independent cloud rotation
        clouds.rotation.y += 0.0003;
        
        // Orbit rings animation
        orbitRing.rotation.z += 0.002;
        orbitRing2.rotation.z -= 0.001;
        
        // Dynamic lights orbit
        pointLight1.position.x = Math.sin(timeSec * 0.3) * 40;
        pointLight1.position.z = Math.cos(timeSec * 0.3) * 40;
        pointLight2.position.x = Math.cos(timeSec * 0.2) * 35;
        pointLight2.position.y = Math.sin(timeSec * 0.4) * 25;
        pointLight3.position.x = Math.sin(timeSec * 0.15) * 30;
        pointLight3.position.z = Math.cos(timeSec * 0.25) * 30;
        
        // Camera subtle float
        camera.position.x = Math.sin(timeSec * 0.1) * 2;
        camera.position.y = Math.cos(timeSec * 0.15) * 1.5;
        camera.lookAt(0, 0, 0);
        
        // Twinkle stars
        stars.forEach(star => {
            const twinkle = star.userData.baseOpacity * (0.5 + 0.5 * Math.sin(timeSec * star.userData.twinkleSpeed + star.userData.twinklePhase));
            star.material.opacity = twinkle;
            const scale = 0.8 + Math.sin(timeSec * star.userData.twinkleSpeed + star.userData.twinklePhase) * 0.3;
            star.scale.setScalar(scale);
        });
        
        // Nebula drift
        nebulaParticles.forEach(p => {
            p.mesh.position.y += Math.sin(timeSec * p.driftSpeed + p.driftPhase) * 0.01;
            p.mesh.material.opacity = 0.02 + Math.sin(timeSec * 0.5 + p.driftPhase) * 0.03;
        });
        
        // Shooting stars
        shootingStarTimer += deltaTime;
        if (shootingStarTimer > 2 + Math.random() * 3) {
            spawnShootingStar();
            shootingStarTimer = 0;
        }
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            ss.mesh.position.add(ss.velocity.clone().multiplyScalar(deltaTime * 60));
            ss.life -= deltaTime * 0.8;
            ss.mesh.material.opacity = ss.life;
            if (ss.life <= 0) {
                scene.remove(ss.mesh);
                shootingStars.splice(i, 1);
            }
        }
        
        // Animate glowing markers
        fragmentsGroup.children.forEach(child => {
            if (child.userData && child.userData.pulseSpeed) {
                const pulseValue = 0.6 + 0.8 * Math.sin(timeSec * child.userData.pulseSpeed + child.userData.pulsePhase);
                child.scale.set(pulseValue, pulseValue, pulseValue);
                
                child.children.forEach(element => {
                    if (element instanceof THREE.PointLight) {
                        element.intensity = 0.8 + pulseValue * 0.6;
                    }
                    if (element instanceof THREE.Mesh && element.material.opacity < 0.5) {
                        element.material.opacity = 0.15 + pulseValue * 0.2;
                    }
                });
            }
        });
        
        // Hovered fragment extra glow
        if (hoveredFragment) {
            hoveredFragment.mesh.material.opacity = 0.9 + Math.sin(timeSec * 5) * 0.1;
        }
        
        if (deltaTime < 0.2) {
            updateExplosions(deltaTime);
        }
        
        renderer.render(scene, camera);
    }

    // Hide loading screen and start animation
    function init() {
        // Create info modal
        const modal = createInfoModal();
        
        // Create content fragments on Earth
        const fragments = createContentFragmentsOnEarth();
        
        // Add Earth rotation controls
        addEarthControls();
        
        // Add fragment interaction
        addFragmentInteraction(fragments, modal);
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
        
        // Start animation loop
        animate(0, fragments);
    }

    // Start after a short delay to ensure everything is loaded
    setTimeout(init, 1500);
}); 