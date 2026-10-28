import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static values = {
        src:  String,
        name: { type: String, default: '' },
    };

    connect() {
        this.element.style.position = 'relative';
        this.element.style.overflow = 'hidden';
        this.element.style.cursor   = 'default';

        this._running = false;
        this._animId  = null;
        this._model   = null;

        this._addSpinner();

        // Sin modelo disponible → placeholder inmediato
        if (!this.srcValue) {
            this._spinner?.remove();
            this._spinner = null;
            this._fallback();
            return;
        }

        // Boot only when element enters the viewport
        this._io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                this._io.disconnect();
                this._boot();
            }
        }, { threshold: 0.1 });
        this._io.observe(this.element);
    }

    disconnect() {
        this._running = false;
        this._io?.disconnect();
        if (this._animId) cancelAnimationFrame(this._animId);
        this._ro?.disconnect();
        this._renderer?.dispose();
    }

    // ── Private ────────────────────────────────────────────────

    _addSpinner() {
        this._spinner = document.createElement('div');
        this._spinner.className = 'mv-spinner';
        this._spinner.innerHTML =
            '<div class="mv-spinner-ring"></div>' +
            '<span class="mv-spinner-text">Cargando</span>';
        this.element.appendChild(this._spinner);
    }

    async _boot() {
        const THREE      = await import('three');
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');

        const el = this.element;
        const W  = el.clientWidth  || 400;
        const H  = el.clientHeight || 300;

        // ── Renderer ──────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const cvs = renderer.domElement;
        cvs.style.cssText = 'position:absolute;inset:0;width:100%!important;height:100%!important;display:block;';
        el.appendChild(cvs);
        this._renderer = renderer;

        // ── Scene ─────────────────────────────────────────────
        const scene = new THREE.Scene();
        this._scene = scene;

        // ── Camera ────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100);
        camera.position.set(0, 0.9, 3.8);
        camera.lookAt(0, 0.25, 0);
        this._camera = camera;

        // ── Lights ────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x6688cc, 1.6));

        const key = new THREE.DirectionalLight(0xffffff, 3.2);
        key.position.set(4, 6, 4);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0x00f5ff, 0.9);
        fill.position.set(-4, 2, -2);
        scene.add(fill);

        const rim = new THREE.DirectionalLight(0x9955ff, 0.55);
        rim.position.set(0, 3, -5);
        scene.add(rim);

        // ── Resize ────────────────────────────────────────────
        this._ro = new ResizeObserver(() => {
            const w = el.clientWidth, h = el.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });
        this._ro.observe(el);

        // ── Load model ────────────────────────────────────────
        new GLTFLoader().load(
            this.srcValue,
            (gltf) => {
                const model = gltf.scene;

                // Center + fit to ≈2.2 units
                const box    = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size   = box.getSize(new THREE.Vector3());
                const s      = 2.2 / Math.max(size.x, size.y, size.z);
                model.scale.setScalar(s);
                model.position.set(-center.x * s, -center.y * s + 0.05, -center.z * s);

                scene.add(model);
                this._model = model;

                this._spinner?.remove();
                this._spinner = null;
            },
            undefined,
            () => this._fallback()
        );

        // ── Render loop ───────────────────────────────────────
        this._running = true;
        const tick = () => {
            if (!this._running) return;
            this._animId = requestAnimationFrame(tick);
            if (this._model) this._model.rotation.y += 0.005;
            renderer.render(scene, camera);
        };
        tick();
    }

    _fallback() {
        this._spinner?.remove();
        if (this._renderer) this._renderer.domElement.style.display = 'none';
        this._running = false;

        const fb = document.createElement('div');
        fb.className = 'mv-fallback';
        fb.innerHTML =
            `<span class="mv-fallback-icon">🛋️</span>` +
            `<span class="mv-fallback-name">${this.nameValue}</span>`;
        this.element.appendChild(fb);
    }
}
