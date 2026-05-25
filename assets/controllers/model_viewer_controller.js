import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['canvas', 'overlay', 'label', 'spinner'];

    #renderer; #scene; #camera; #animId;
    #isDragging = false; #prevX = 0; #prevY = 0;
    #rotY = 0; #rotX = 0;
    #distance = 3;

    // ── Public actions ────────────────────────────────────────

    async open({ params: { url, name } }) {
        this.overlayTarget.style.display = 'flex';
        if (this.hasLabelTarget) this.labelTarget.textContent = name ?? '';
        this.#spinnerTarget()?.style && (this.#spinnerTarget().style.display = 'block');
        this.#reset();
        await this.#boot(url);
    }

    close() {
        this.overlayTarget.style.display = 'none';
        this.#teardown();
    }

    // ── Private ───────────────────────────────────────────────

    #spinnerTarget() {
        return this.hasSpinnerTarget ? this.spinnerTarget : null;
    }

    #reset() {
        this.#rotY = 0.3; this.#rotX = 0.15; this.#distance = 3;
        this.#teardown();
    }

    #teardown() {
        if (this.#animId) { cancelAnimationFrame(this.#animId); this.#animId = null; }
        if (this.#renderer) { this.#renderer.dispose(); this.#renderer = null; }
        this.#scene = null; this.#camera = null;
        const c = this.canvasTarget;
        while (c.firstChild) c.removeChild(c.firstChild);
    }

    async #boot(url) {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');

        const canvas = this.canvasTarget;
        const W = canvas.clientWidth  || canvas.offsetWidth  || 800;
        const H = canvas.clientHeight || canvas.offsetHeight || 600;

        // Renderer
        this.#renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.#renderer.setSize(W, H);
        this.#renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        canvas.appendChild(this.#renderer.domElement);

        // Scene
        this.#scene = new THREE.Scene();

        // Camera
        this.#camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 1000);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.#scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffffff, 1.8);
        key.position.set(3, 6, 4);
        key.castShadow = true;
        this.#scene.add(key);

        const fill = new THREE.DirectionalLight(0x8090ff, 0.6);
        fill.position.set(-4, 2, -3);
        this.#scene.add(fill);

        const rim = new THREE.DirectionalLight(0x00f5ff, 0.4);
        rim.position.set(0, -2, -6);
        this.#scene.add(rim);

        // Grid helper
        const grid = new THREE.GridHelper(6, 12, 0x1e1e4a, 0x1e1e4a);
        grid.position.y = -0.01;
        this.#scene.add(grid);

        // Load model
        const loader = new GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                this.#spinnerTarget()?.style && (this.#spinnerTarget().style.display = 'none');
                const model = gltf.scene;

                // Auto-fit
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));

                // Enable shadows
                model.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.#scene.add(model);
                this.#distance = 3;
                this.#updateCamera();
            },
            undefined,
            (err) => {
                console.error('GLTFLoader error:', err);
                this.#spinnerTarget()?.style && (this.#spinnerTarget().style.display = 'none');
            }
        );

        this.#bindEvents();
        this.#loop();
    }

    #updateCamera() {
        const x = this.#distance * Math.sin(this.#rotY) * Math.cos(this.#rotX);
        const y = this.#distance * Math.sin(this.#rotX);
        const z = this.#distance * Math.cos(this.#rotY) * Math.cos(this.#rotX);
        this.#camera.position.set(x, y, z);
        this.#camera.lookAt(0, 0, 0);
    }

    #loop() {
        this.#animId = requestAnimationFrame(() => this.#loop());
        if (!this.#isDragging) this.#rotY += 0.004;
        this.#updateCamera();
        this.#renderer?.render(this.#scene, this.#camera);
    }

    #bindEvents() {
        const el = this.#renderer.domElement;

        el.addEventListener('mousedown',  e => { this.#isDragging = true;  this.#prevX = e.clientX; this.#prevY = e.clientY; });
        el.addEventListener('mousemove',  e => {
            if (!this.#isDragging) return;
            this.#rotY += (e.clientX - this.#prevX) * 0.008;
            this.#rotX += (e.clientY - this.#prevY) * 0.005;
            this.#rotX = Math.max(-1.2, Math.min(1.2, this.#rotX));
            this.#prevX = e.clientX; this.#prevY = e.clientY;
        });
        window.addEventListener('mouseup', () => { this.#isDragging = false; });

        el.addEventListener('wheel', e => {
            e.preventDefault();
            this.#distance = Math.max(0.5, Math.min(12, this.#distance + e.deltaY * 0.005));
        }, { passive: false });

        // Touch
        let lastTouchDist = 0;
        el.addEventListener('touchstart', e => {
            if (e.touches.length === 1) { this.#isDragging = true; this.#prevX = e.touches[0].clientX; this.#prevY = e.touches[0].clientY; }
            if (e.touches.length === 2) { lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
        }, { passive: true });
        el.addEventListener('touchmove', e => {
            if (e.touches.length === 1 && this.#isDragging) {
                this.#rotY += (e.touches[0].clientX - this.#prevX) * 0.008;
                this.#rotX += (e.touches[0].clientY - this.#prevY) * 0.005;
                this.#rotX = Math.max(-1.2, Math.min(1.2, this.#rotX));
                this.#prevX = e.touches[0].clientX; this.#prevY = e.touches[0].clientY;
            }
            if (e.touches.length === 2) {
                const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                this.#distance = Math.max(0.5, Math.min(12, this.#distance - (d - lastTouchDist) * 0.02));
                lastTouchDist = d;
            }
        }, { passive: true });
        el.addEventListener('touchend', () => { this.#isDragging = false; });

        // Resize
        new ResizeObserver(() => {
            if (!this.#renderer) return;
            const c = this.canvasTarget;
            this.#renderer.setSize(c.clientWidth, c.clientHeight);
            if (this.#camera) { this.#camera.aspect = c.clientWidth / c.clientHeight; this.#camera.updateProjectionMatrix(); }
        }).observe(this.canvasTarget);

        // Esc to close
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); }, { once: false });
    }
}
