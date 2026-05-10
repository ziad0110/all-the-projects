/**
 * Bloch Sphere Visualization
 * Three.js-based 3D Bloch sphere for single-qubit state visualization
 */

class BlochSphere {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stateArrow = null;
        this.trail = [];
        this.maxTrailLength = 30;
        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };
        this.rotation = { x: -0.3, y: 0.5 };

        this.init();
        this.animate();
    }

    init() {
        const width = this.container.clientWidth;
        const height = 250;

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 3.5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        // Sphere group (for rotation)
        this.sphereGroup = new THREE.Group();
        this.scene.add(this.sphereGroup);

        // Main sphere (wireframe)
        const sphereGeom = new THREE.SphereGeometry(1, 32, 24);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x1a1a4e,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        this.sphere = new THREE.Mesh(sphereGeom, sphereMat);
        this.sphereGroup.add(this.sphere);

        // Equator circle
        this.addCircle(1, 0x00d4ff, 0.3, 'x');
        // Meridian circles
        this.addCircle(1, 0xa855f7, 0.15, 'y');
        this.addCircle(1, 0xa855f7, 0.15, 'z');

        // Axes
        this.addAxis(new THREE.Vector3(0, 1.3, 0), new THREE.Vector3(0, -1.3, 0), 0x00d4ff, '|0⟩', '|1⟩');
        this.addAxis(new THREE.Vector3(1.3, 0, 0), new THREE.Vector3(-1.3, 0, 0), 0x06d6a0, '|+⟩', '|-⟩');
        this.addAxis(new THREE.Vector3(0, 0, 1.3), new THREE.Vector3(0, 0, -1.3), 0xf472b6, '|i⟩', '|-i⟩');

        // State vector arrow
        const arrowDir = new THREE.Vector3(0, 1, 0);
        const arrowOrigin = new THREE.Vector3(0, 0, 0);
        this.stateArrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, 1, 0x00ff88, 0.12, 0.08);
        this.sphereGroup.add(this.stateArrow);

        // State dot at arrow tip
        const dotGeom = new THREE.SphereGeometry(0.05, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
        this.stateDot = new THREE.Mesh(dotGeom, dotMat);
        this.stateDot.position.set(0, 1, 0);
        this.sphereGroup.add(this.stateDot);

        // Glow effect for state dot
        const glowGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.2
        });
        this.stateGlow = new THREE.Mesh(glowGeom, glowMat);
        this.stateGlow.position.set(0, 1, 0);
        this.sphereGroup.add(this.stateGlow);

        // Trail line
        this.trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.4
        });
        this.trailLine = new THREE.Line(this.trailGeometry, trailMaterial);
        this.sphereGroup.add(this.trailLine);

        // Mouse controls
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => { this.isDragging = false; });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.previousMouse.x;
            const dy = e.clientY - this.previousMouse.y;
            this.rotation.y += dx * 0.01;
            this.rotation.x += dy * 0.01;
            this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            const w = this.container.clientWidth;
            this.camera.aspect = w / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, height);
        });
        resizeObserver.observe(this.container);

        // Initial rotation
        this.sphereGroup.rotation.x = this.rotation.x;
        this.sphereGroup.rotation.y = this.rotation.y;
    }

    addCircle(radius, color, opacity, plane) {
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(64);
        const geom = new THREE.BufferGeometry().setFromPoints(
            points.map(p => {
                if (plane === 'x') return new THREE.Vector3(p.x, 0, p.y);
                if (plane === 'y') return new THREE.Vector3(p.x, p.y, 0);
                return new THREE.Vector3(0, p.x, p.y);
            })
        );
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
        this.sphereGroup.add(new THREE.Line(geom, mat));
    }

    addAxis(from, to, color, labelFrom, labelTo) {
        const points = [from, to];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineDashedMaterial({
            color,
            transparent: true,
            opacity: 0.4,
            dashSize: 0.05,
            gapSize: 0.05
        });
        const line = new THREE.Line(geom, mat);
        line.computeLineDistances();
        this.sphereGroup.add(line);

        // Labels using sprites
        this.addLabel(labelFrom, from, color);
        this.addLabel(labelTo, to, color);
    }

    addLabel(text, position, color) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 32;
        ctx.font = '18px JetBrains Mono, monospace';
        ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 32, 16);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(0.5, 0.25, 1);
        this.sphereGroup.add(sprite);
    }

    updateState(coords) {
        if (!this.stateArrow) return;

        const { x, y, z } = coords;
        const dir = new THREE.Vector3(x, z, y).normalize();

        // Update arrow
        this.stateArrow.setDirection(dir);
        this.stateArrow.setLength(Math.sqrt(x * x + y * y + z * z), 0.12, 0.08);

        // Update dot position
        const tipPos = dir.clone().multiplyScalar(Math.sqrt(x * x + y * y + z * z));
        this.stateDot.position.copy(tipPos);
        this.stateGlow.position.copy(tipPos);

        // Color based on state
        const hue = (Math.atan2(y, x) / (2 * Math.PI) + 0.5) % 1;
        const stateColor = new THREE.Color().setHSL(hue, 0.8, 0.5);
        this.stateArrow.setColor(stateColor);
        this.stateDot.material.color = stateColor;
        this.stateGlow.material.color = stateColor;

        // Add to trail
        this.trail.push(new THREE.Vector3(tipPos.x, tipPos.y, tipPos.z));
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Update trail line
        if (this.trail.length > 1) {
            this.trailGeometry.setFromPoints(this.trail);
            this.trailLine.material.color = stateColor;
        }

        // Pulse glow
        this.stateGlow.material.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;
    }

    clearTrail() {
        this.trail = [];
        this.trailGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Apply rotation
        this.sphereGroup.rotation.x += (this.rotation.x - this.sphereGroup.rotation.x) * 0.1;
        this.sphereGroup.rotation.y += (this.rotation.y - this.sphereGroup.rotation.y) * 0.1;

        // Auto-rotate when not dragging (subtle)
        if (!this.isDragging) {
            this.rotation.y += 0.001;
        }

        // Pulse glow
        if (this.stateGlow) {
            this.stateGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.2);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.BlochSphere = BlochSphere;
