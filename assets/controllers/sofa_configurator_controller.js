import { Controller } from '@hotwired/stimulus';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const D2R = v => THREE.MathUtils.degToRad(v);

// ── Data tables (module-level so they're accessible without this.constructor) ──
// Stimulus may dynamically subclass the controller, which breaks private-static
// field access via this.constructor.#FIELD on anonymous classes. Plain consts
// are module-private (not globally exposed) and always resolve correctly.

const PROC_MODELS = {
    standard2: {
        label: 'Sofá 2 Plazas', icon: '🛋️', celestial: 'Nebula Seraph',
        hint: 'Compacto · Ideal para salones medianos',
        camZ: 4.8, camY: 1.7, lookY: 0.55, lookZ: 0,
        parts: [
            // Structural base
            { m:'e',                    name:'frame',       s:[2.14, 0.42, 0.92], p:[    0, 0.21,     0] },
            // Armrests
            { m:'f',                    name:'arm-l',       s:[0.14, 0.42, 0.92], p:[-1.00, 0.63,     0] },
            { m:'f',                    name:'arm-r',       s:[0.14, 0.42, 0.92], p:[ 1.00, 0.63,     0] },
            { m:'c', geom:'rbox', r:0.04, name:'arm-pad-l', s:[0.18, 0.10, 0.94], p:[-0.97, 0.89,     0] },
            { m:'c', geom:'rbox', r:0.04, name:'arm-pad-r', s:[0.18, 0.10, 0.94], p:[ 0.97, 0.89,     0] },
            // Back
            { m:'f',                    name:'back-struct', s:[2.14, 0.72, 0.13], p:[    0, 0.84, -0.38], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-cush-l', s:[0.94, 0.60, 0.11], p:[-0.47, 0.80, -0.29], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-cush-r', s:[0.94, 0.60, 0.11], p:[ 0.47, 0.80, -0.29], rx:7 },
            // Seat cushions
            { m:'c', geom:'rbox', r:0.06, name:'seat-l',   s:[0.96, 0.16, 0.78], p:[-0.47, 0.50,  0.04] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-r',   s:[0.96, 0.16, 0.78], p:[ 0.47, 0.50,  0.04] },
            // Round legs
            { m:'l', geom:'cyl',  name:'leg-fl', s:[0.035, 0.30], p:[-0.90, 0.15,  0.37] },
            { m:'l', geom:'cyl',  name:'leg-fr', s:[0.035, 0.30], p:[ 0.90, 0.15,  0.37] },
            { m:'l', geom:'cyl',  name:'leg-bl', s:[0.035, 0.30], p:[-0.90, 0.15, -0.37] },
            { m:'l', geom:'cyl',  name:'leg-br', s:[0.035, 0.30], p:[ 0.90, 0.15, -0.37] },
        ],
    },
    standard3: {
        label: 'Sofá 3 Plazas', icon: '🛋️', celestial: 'Galaxia Andrómeda',
        hint: 'Espacioso · Para familias y reuniones',
        camZ: 5.5, camY: 1.7, lookY: 0.55, lookZ: 0,
        parts: [
            // Structural base
            { m:'e',                    name:'frame',         s:[2.90, 0.42, 0.92], p:[    0, 0.21,     0] },
            // Armrests
            { m:'f',                    name:'arm-l',         s:[0.14, 0.42, 0.92], p:[-1.43, 0.63,     0] },
            { m:'f',                    name:'arm-r',         s:[0.14, 0.42, 0.92], p:[ 1.43, 0.63,     0] },
            { m:'c', geom:'rbox', r:0.04, name:'arm-pad-l',   s:[0.18, 0.10, 0.94], p:[-1.40, 0.89,     0] },
            { m:'c', geom:'rbox', r:0.04, name:'arm-pad-r',   s:[0.18, 0.10, 0.94], p:[ 1.40, 0.89,     0] },
            // Back
            { m:'f',                    name:'back-struct',   s:[2.90, 0.72, 0.13], p:[    0, 0.84, -0.38], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-cush-l', s:[0.82, 0.60, 0.11], p:[-0.90, 0.80, -0.29], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-cush-m', s:[0.82, 0.60, 0.11], p:[    0, 0.80, -0.29], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-cush-r', s:[0.82, 0.60, 0.11], p:[ 0.90, 0.80, -0.29], rx:7 },
            // Seat cushions (3 plazas)
            { m:'c', geom:'rbox', r:0.06, name:'seat-l',      s:[0.82, 0.16, 0.78], p:[-0.90, 0.50,  0.04] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-m',      s:[0.82, 0.16, 0.78], p:[    0, 0.50,  0.04] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-r',      s:[0.82, 0.16, 0.78], p:[ 0.90, 0.50,  0.04] },
            // Round legs
            { m:'l', geom:'cyl',  name:'leg-fl', s:[0.035, 0.30], p:[-1.30, 0.15,  0.37] },
            { m:'l', geom:'cyl',  name:'leg-fr', s:[0.035, 0.30], p:[ 1.30, 0.15,  0.37] },
            { m:'l', geom:'cyl',  name:'leg-bl', s:[0.035, 0.30], p:[-1.30, 0.15, -0.37] },
            { m:'l', geom:'cyl',  name:'leg-br', s:[0.035, 0.30], p:[ 1.30, 0.15, -0.37] },
        ],
    },
    chaise: {
        label: 'Chaise Longue', icon: '🛁', celestial: 'Estrella Polar',
        hint: 'Con reposapiés · Para el máximo relax',
        camZ: 5.8, camY: 1.9, lookY: 0.50, lookZ: 0.40,
        parts: [
            // Base frames — L-shape: main seat + extended chaise section
            { m:'e', name:'frame-main',   s:[1.58, 0.42, 0.92], p:[-0.65, 0.21,  0.00] },
            { m:'e', name:'frame-chaise', s:[1.22, 0.42, 1.60], p:[ 0.71, 0.21,  0.38] },
            // Left armrest (tall, upright)
            { m:'f',                    name:'arm-l',       s:[0.14, 0.42, 0.92], p:[-1.42, 0.63,  0.00] },
            { m:'c', geom:'rbox', r:0.04, name:'arm-pad-l', s:[0.18, 0.10, 0.94], p:[-1.39, 0.89,  0.00] },
            // Right side wall running the length of the chaise section
            { m:'f', name:'arm-r',        s:[0.14, 0.42, 1.62], p:[ 1.28, 0.63,  0.38] },
            // Back (main section only — chaise section is open)
            { m:'f',                    name:'back-struct', s:[1.58, 0.72, 0.13], p:[-0.65, 0.84, -0.38], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-cush', s:[1.34, 0.60, 0.11], p:[-0.65, 0.80, -0.29], rx:7 },
            // Seat cushions — main + two chaise cushions
            { m:'c', geom:'rbox', r:0.06, name:'seat-main',  s:[1.26, 0.16, 0.78], p:[-0.65, 0.50,  0.04] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-ch-1',  s:[1.10, 0.16, 0.72], p:[ 0.71, 0.50, -0.02] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-ch-2',  s:[1.10, 0.16, 0.72], p:[ 0.71, 0.50,  0.76] },
            // Small bolster at the open end of the chaise
            { m:'c', geom:'rbox', r:0.06, name:'bolster',    s:[0.90, 0.22, 0.20], p:[ 0.71, 0.63,  1.08] },
            // Round legs (6 — both sections)
            { m:'l', geom:'cyl', name:'leg-fl',  s:[0.035, 0.30], p:[-1.34, 0.15,  0.37] },
            { m:'l', geom:'cyl', name:'leg-bl',  s:[0.035, 0.30], p:[-1.34, 0.15, -0.37] },
            { m:'l', geom:'cyl', name:'leg-jl',  s:[0.035, 0.30], p:[ 0.12, 0.15, -0.37] },
            { m:'l', geom:'cyl', name:'leg-jr',  s:[0.035, 0.30], p:[ 1.22, 0.15, -0.37] },
            { m:'l', geom:'cyl', name:'leg-cf',  s:[0.035, 0.30], p:[ 1.22, 0.15,  1.14] },
            { m:'l', geom:'cyl', name:'leg-cbf', s:[0.035, 0.30], p:[ 0.12, 0.15,  1.14] },
        ],
    },
    corner: {
        label: 'Rinconera', icon: '🔲', celestial: 'Constelación Orión',
        hint: 'En L · Aprovecha cada rincón',
        camZ: 6.5, camY: 2.6, lookY: 0.55, lookZ: 0.55,
        parts: [
            // Base frames — L/U shape: horizontal arm + corner block + vertical arm
            { m:'e', name:'frame-h',      s:[1.84, 0.42, 0.92], p:[-0.55, 0.21,  0.00] },
            { m:'e', name:'frame-corner', s:[0.88, 0.42, 0.88], p:[ 0.59, 0.21,  0.00] },
            { m:'e', name:'frame-v',      s:[0.88, 0.42, 1.64], p:[ 0.59, 0.21,  0.90] },
            // Left end armrest
            { m:'f',                    name:'arm-l',       s:[0.14, 0.42, 0.92], p:[-1.40, 0.63,  0.00] },
            { m:'c', geom:'rbox', r:0.04, name:'arm-pad-l', s:[0.18, 0.10, 0.94], p:[-1.37, 0.89,  0.00] },
            // Far-end armrest (vertical arm)
            { m:'f',                    name:'arm-top',     s:[0.90, 0.42, 0.14], p:[ 0.59, 0.63,  1.64] },
            { m:'c', geom:'rbox', r:0.04, name:'arm-pad-top', s:[0.92, 0.10, 0.18], p:[ 0.59, 0.89,  1.60] },
            // Back — horizontal section
            { m:'f',                    name:'back-h-str',  s:[1.84, 0.72, 0.13], p:[-0.55, 0.84, -0.38], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-h-c1', s:[0.82, 0.60, 0.11], p:[-0.93, 0.80, -0.29], rx:7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-h-c2', s:[0.82, 0.60, 0.11], p:[-0.12, 0.80, -0.29], rx:7 },
            // Back — vertical section (right wall)
            { m:'f',                    name:'back-v-str',  s:[0.13, 0.72, 1.64], p:[ 1.00, 0.84,  0.90], ry:-7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-v-c1', s:[0.11, 0.60, 0.72], p:[ 0.93, 0.80,  0.54], ry:-7 },
            { m:'c', geom:'rbox', r:0.04, name:'back-v-c2', s:[0.11, 0.60, 0.72], p:[ 0.93, 0.80,  1.26], ry:-7 },
            // Seat cushions — horizontal arm + corner + vertical arm
            { m:'c', geom:'rbox', r:0.06, name:'seat-h1',      s:[0.82, 0.16, 0.78], p:[-0.93, 0.50,  0.04] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-h2',      s:[0.82, 0.16, 0.78], p:[-0.12, 0.50,  0.04] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-corner',  s:[0.74, 0.16, 0.74], p:[ 0.59, 0.50,  0.04] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-v1',      s:[0.74, 0.16, 0.74], p:[ 0.59, 0.50,  0.58] },
            { m:'c', geom:'rbox', r:0.06, name:'seat-v2',      s:[0.74, 0.16, 0.74], p:[ 0.59, 0.50,  1.26] },
            // Round legs (7 — distributed across L-shape)
            { m:'l', geom:'cyl', name:'leg-1', s:[0.035, 0.30], p:[-1.34, 0.15,  0.37] },
            { m:'l', geom:'cyl', name:'leg-2', s:[0.035, 0.30], p:[-1.34, 0.15, -0.37] },
            { m:'l', geom:'cyl', name:'leg-3', s:[0.035, 0.30], p:[ 0.21, 0.15, -0.37] },
            { m:'l', geom:'cyl', name:'leg-4', s:[0.035, 0.30], p:[ 1.00, 0.15, -0.37] },
            { m:'l', geom:'cyl', name:'leg-5', s:[0.035, 0.30], p:[ 1.00, 0.15,  0.37] },
            { m:'l', geom:'cyl', name:'leg-6', s:[0.035, 0.30], p:[ 1.00, 0.15,  1.62] },
            { m:'l', geom:'cyl', name:'leg-7', s:[0.035, 0.30], p:[ 0.21, 0.15,  1.62] },
        ],
    },
};

// Named products — wizard Step 1 + GLB loading
const PRODUCTS = {
    orion:     { label: 'Orión',     celestial: 'Constelación Orión',   type: 'Sofá 3 plazas',  icon: '🛋️', glb: 'modern__sofa', proc: 'standard3', camZ: 5.5, camY: 1.8, lookY: 0.55, lookZ: 0    },
    sirio:     { label: 'Sirio',     celestial: 'Estrella Sirio',        type: 'Sofá 3 plazas',  icon: '🛋️', glb: 'sirio',        proc: 'standard3', camZ: 5.5, camY: 1.8, lookY: 0.55, lookZ: 0    },
    vega:      { label: 'Vega',      celestial: 'Estrella Vega',         type: 'Sofá 2 plazas',  icon: '🛋️', glb: 'modern__sofa', proc: 'standard2', camZ: 4.8, camY: 1.7, lookY: 0.55, lookZ: 0    },
    andromeda: { label: 'Andrómeda', celestial: 'Galaxia Andrómeda',     type: 'Rinconera izq.', icon: '🔲', glb: 'andromeda',    proc: 'corner',    camZ: 6.5, camY: 2.5, lookY: 0.55, lookZ: 0.55 },
    cassiopea: { label: 'Cassiopea', celestial: 'Constelación Casiopea', type: 'Rinconera der.', icon: '🔲', glb: 'cassiopea',    proc: 'corner',    camZ: 6.5, camY: 2.5, lookY: 0.55, lookZ: 0.55 },
    nebula:    { label: 'Nebula',    celestial: 'Nebulosa Cefálica',     type: 'Rinconera',      icon: '🔲', glb: 'nebula',       proc: 'corner',    camZ: 6.5, camY: 2.5, lookY: 0.55, lookZ: 0.55, rotY: Math.PI },
    altair:    { label: 'Altair',    celestial: 'Estrella Altair',       type: 'Chaise longue',  icon: '🛁', glb: 'orion-chaise', proc: 'chaise',    camZ: 5.8, camY: 1.9, lookY: 0.50, lookZ: 0.40 },
    lyra:      { label: 'Lyra',      celestial: 'Constelación Lyra',     type: 'Chaise longue',  icon: '🛁', glb: 'lyra',         proc: 'chaise',    camZ: 5.8, camY: 1.9, lookY: 0.50, lookZ: 0.40 },
    perseo:    { label: 'Perseo',    celestial: 'Constelación Perseo',   type: 'Chaise longue',  icon: '🛁', glb: 'perseo',       proc: 'chaise',    camZ: 5.8, camY: 1.9, lookY: 0.50, lookZ: 0.40 },
};

// Type + seats → product key
const MODEL_MAP = {
    'sofa-2':      'vega',
    'sofa-3':      'orion',
    'sofa-4':      'orion',
    'rinconera-3': 'andromeda',
    'rinconera-4': 'cassiopea',
    'chaise-2':    'lyra',
    'chaise-3':    'altair',
};

// MeshPhysicalMaterial presets per upholstery type.
// sheen/clearcoat are kept >= 0.01 so the shader variant stays compiled
// and the lerp transition never triggers a needsUpdate recompile.
const UPHOLSTERY = {
    tela: {
        roughness: 0.97, metalness: 0.00,
        sheen: 0.06, sheenRoughness: 0.96,
        clearcoat: 0.01, clearcoatRoughness: 0.95,
        bumpMap: 'fabric', bumpScale: 0.058,
        colorMult: 1.0,
        label: 'Tela',       hint: 'Suave · Transpirable · Fácil limpieza',
    },
    piel: {
        roughness: 0.15, metalness: 0.04,
        sheen: 0.03, sheenRoughness: 0.95,
        clearcoat: 0.62, clearcoatRoughness: 0.16,
        bumpMap: 'leather', bumpScale: 0.020,
        colorMult: 1.0,
        label: 'Piel',       hint: 'Resistente · Elegante · Duradera',
    },
    terciopelo: {
        roughness: 0.56, metalness: 0.00,
        sheen: 1.00, sheenRoughness: 0.10,
        clearcoat: 0.01, clearcoatRoughness: 0.90,
        bumpMap: null, bumpScale: 0,
        colorMult: 0.66,
        label: 'Terciopelo', hint: 'Lujoso · Cálido · Sofisticado',
    },
};

const LEGS = {
    natural:       { color: 0x9b7050, roughness: 0.88, metalness: 0.04, label: 'Madera Natural' },
    dark:          { color: 0x2a1a0e, roughness: 0.85, metalness: 0.04, label: 'Madera Oscura' },
    'metal-black': { color: 0x222222, roughness: 0.18, metalness: 0.88, label: 'Metal Negro' },
    'metal-gold':  { color: 0xd4a840, roughness: 0.22, metalness: 0.92, label: 'Metal Dorado' },
};

const STEPS = [
    { title: 'Tipo de sofá', sub: 'Elige la forma que mejor se adapta a tu espacio' },
    { title: 'Tapicería',  sub: 'Selecciona el material que más se ajusta a tu estilo' },
    { title: 'Color',      sub: 'Personaliza el color de la tapicería' },
    { title: 'Patas',      sub: 'El toque final — elige el acabado de las patas' },
    { title: '¡Listo!',    sub: 'Tu sofá personalizado está configurado' },
];

export default class extends Controller {
    static targets = [
        'canvas', 'stepPanel', 'progressDot', 'progressFill',
        'prevBtn', 'nextBtn', 'stepTitle', 'stepSub', 'stepNum',
        'selCard', 'summaryModel', 'summaryUpholstery', 'summaryColor', 'summaryLegs',
    ];
    static values = {
        step:        { type: Number,  default: 1 },
        sofaType:    { type: String,  default: 'sofa' },
        sofaSeats:   { type: String,  default: '3' },
        model:       { type: String,  default: 'sirio' },
        upholstery:  { type: String,  default: 'tela' },
        color:       { type: String,  default: '#c4a882' },
        legs:        { type: String,  default: 'natural' },
        baseUrl:     { type: String,  default: '/' },
        locked:      { type: Boolean, default: false },
        productName: { type: String,  default: '' },
    };

    // Three.js private state
    #renderer; #scene; #camera; #controls; #group;
    #matFabric; #matCushion; #matLegs; #matFrame;
    #clock; #bumpFabric; #bumpLeather;
    #rafId; #resizeObserver;
    #composer;                         // EffectComposer for post-processing

    // Immersive extras
    #particles; #particles2;          // star dust systems
    #pointLight; #pointLightAngle = 0; // orbiting warm spotlight
    #tooltip;                          // DOM tooltip el
    #spinnerEl;                        // loading overlay
    #raycaster = new THREE.Raycaster();
    #mouseNDC  = new THREE.Vector2(-99, -99); // far off-screen initially
    #groupFadeIn = 1;                  // 0→1 fade when model changes

    #step1Phase = 1;                   // 1 = type selection · 2 = seats selection

    // Smooth camera transition targets
    #camTgtPos  = new THREE.Vector3(0, 1.2, 5.0);
    #camTgtLook = new THREE.Vector3(0, 0.80, 0);
    #camTransitioning = false;         // true only while lerping to new model camera pos

    // Current lerped color multiplier (tracks #tgt.colorMult for smooth transitions)
    #colorMult = 1.0;

    // Smooth transition targets — lerped in #loop() every frame
    #tgt = {
        color:              new THREE.Color(0xc4a882),
        cushionColor:       new THREE.Color(0xcab48e),
        roughness:          0.97,
        metalness:          0.00,
        sheen:              0.06,
        sheenRoughness:     0.96,
        clearcoat:          0.01,
        clearcoatRoughness: 0.95,
        colorMult:          1.0,
    };

    connect() {
        this.#clock = new THREE.Timer();
        // DOM-only work runs immediately (value callbacks may already have fired)
        this.#syncAllHighlights();
        // Defer Three.js init until after the browser has resolved the canvas layout.
        // In Docker/prod, compiled assets arrive faster and Stimulus can fire before
        // the first paint; deferring one rAF guarantees clientWidth/clientHeight are set.
        requestAnimationFrame(() => this.#initThree());
    }

    #initThree() {
        this.#initRenderer();
        this.#initScene();
        this.#initMaterials();
        this.#initControls();
        this.#rebuildGeometry();
        this.#addLights();
        this.#initParticles();
        this.#initSpinner();
        this.#initTooltip();
        this.#bindHover();
        this.#bindResize();
        this.#loop();
        // We're already inside rAF so dimensions are available — sync immediately
        this.#resize();
        // Async quality upgrades — don't block the initial render
        this.#initEnvironment();
        this.#initPostProcessing();
    }

    disconnect() {
        cancelAnimationFrame(this.#rafId);
        this.#resizeObserver?.disconnect();
        this.#controls?.dispose();
        this.#composer?.dispose();
        this.#renderer?.dispose();
        this.#tooltip?.remove();
        this.#spinnerEl?.remove();
    }

    // ── Value changed callbacks ────────────────────────────────────────────

    stepValueChanged(step) { this.#updateWizardUI(step); }

    modelValueChanged(model) {
        if (this.#scene) this.#rebuildGeometry();
        this.#highlightSelected('model', model);
        const lbl = document.getElementById('viewer-model-label');
        if (lbl) {
            lbl.textContent = (this.lockedValue && this.productNameValue)
                ? this.productNameValue
                : (PRODUCTS[model]?.label ?? model);
        }
    }

    sofaTypeValueChanged(type) {
        this.#highlightSelected('sofa-type', type);
        this.#updateSeatsPanel();
        this.#resolveModel();
    }

    sofaSeatsValueChanged(seats) {
        this.#highlightSelected('sofa-seats', seats);
        this.#resolveModel();
    }

    upholsteryValueChanged(type) {
        const u = UPHOLSTERY[type] ?? UPHOLSTERY.tela;

        // Set lerp targets — #loop() eases toward them each frame
        this.#tgt.roughness          = u.roughness;
        this.#tgt.metalness          = u.metalness;
        this.#tgt.sheen              = u.sheen;
        this.#tgt.sheenRoughness     = u.sheenRoughness;
        this.#tgt.clearcoat          = u.clearcoat;
        this.#tgt.clearcoatRoughness = u.clearcoatRoughness;
        this.#tgt.colorMult          = u.colorMult ?? 1.0;

        // Bump map swap is instant (triggers needsUpdate once, imperceptible)
        const bumpTex = u.bumpMap === 'fabric'  ? this.#bumpFabric
                      : u.bumpMap === 'leather' ? this.#bumpLeather
                      : null;
        for (const mat of [this.#matFabric, this.#matCushion]) {
            if (!mat) continue;
            mat.bumpMap   = bumpTex;
            mat.bumpScale = u.bumpScale;
            mat.needsUpdate = true;
        }

        this.#highlightSelected('upholstery', type);
    }

    colorValueChanged(hex) {
        const c = new THREE.Color(hex);
        this.#tgt.color.copy(c);
        // Cushions lerp toward a slightly lighter shade
        this.#tgt.cushionColor.setRGB(
            Math.min(1, c.r * 1.08),
            Math.min(1, c.g * 1.08),
            Math.min(1, c.b * 1.08)
        );
        this.#highlightSelected('color', hex);
    }

    legsValueChanged(type) {
        const l = LEGS[type] ?? LEGS.natural;
        if (this.#matLegs) {
            this.#matLegs.color.set(l.color);
            this.#matLegs.roughness  = l.roughness;
            this.#matLegs.metalness  = l.metalness;
            this.#matLegs.needsUpdate = true;
        }
        this.#highlightSelected('legs', type);
    }

    // ── Wizard actions ─────────────────────────────────────────────────────

    pickModel({ currentTarget })      { this.modelValue      = currentTarget.dataset.model; }
    pickUpholstery({ currentTarget }) { this.upholsteryValue = currentTarget.dataset.upholstery; }
    pickColor({ currentTarget })      { this.colorValue      = currentTarget.dataset.color; }
    pickLegs({ currentTarget })       { this.legsValue       = currentTarget.dataset.legs; }

    pickType({ currentTarget }) {
        const defaults = { sofa: '3', rinconera: '3', chaise: '2' };
        this.sofaTypeValue  = currentTarget.dataset.type;
        this.sofaSeatsValue = defaults[this.sofaTypeValue] ?? '3';
    }

    pickSeats({ currentTarget }) {
        this.sofaSeatsValue = currentTarget.dataset.seats;
    }

    nextStep() {
        if (this.stepValue === 1) {
            if (this.#step1Phase === 1) {
                this.#step1Phase = 2;
                this.#updateStep1UI();
            } else {
                this.#resolveModel();
                this.stepValue = 2;
            }
            return;
        }
        if (this.stepValue < 5) {
            this.stepValue++;
            if (this.stepValue === 5) this.#populateSummary();
        }
    }

    prevStep() {
        if (this.lockedValue) {
            if (this.stepValue > 2) this.stepValue--;
            return;
        }
        if (this.stepValue === 1 && this.#step1Phase === 2) {
            this.#step1Phase = 1;
            this.#updateStep1UI();
            return;
        }
        if (this.stepValue === 2) {
            this.#step1Phase = 2;
            this.stepValue = 1;
            return;
        }
        if (this.stepValue > 1) this.stepValue--;
    }

    resetWizard() {
        this.upholsteryValue = 'tela';
        this.colorValue      = '#c4a882';
        this.legsValue       = 'natural';
        if (this.lockedValue) {
            this.stepValue = 2;
        } else {
            this.sofaTypeValue  = 'sofa';
            this.sofaSeatsValue = '3';
            this.#step1Phase    = 1;
            this.stepValue      = 1;
        }
    }

    // ── Wizard UI helpers ──────────────────────────────────────────────────

    #updateWizardUI(step) {
        const meta     = STEPS[step - 1];
        const isLocked = this.lockedValue;

        if (this.hasStepTitleTarget) this.stepTitleTarget.textContent = meta.title;
        if (this.hasStepSubTarget)   this.stepSubTarget.textContent   = meta.sub;

        if (this.hasStepNumTarget) {
            if (step <= 4) {
                const displayStep = isLocked ? step - 1 : step;
                const totalSteps  = isLocked ? 3 : 4;
                this.stepNumTarget.textContent = `${displayStep} / ${totalSteps}`;
            } else {
                this.stepNumTarget.textContent = '✓';
            }
        }

        this.stepPanelTargets.forEach(p => {
            p.style.display = Number(p.dataset.step) === step ? '' : 'none';
        });

        this.progressDotTargets.forEach(dot => {
            const n          = Number(dot.dataset.dot);
            const effective  = isLocked ? step - 1 : step;
            dot.dataset.state = n < effective ? 'done' : n === effective ? 'active' : 'idle';
        });

        if (this.hasProgressFillTarget) {
            let pct;
            if (step >= 5)      pct = 100;
            else if (isLocked)  pct = ((step - 2) / 2) * 100;
            else                pct = ((step - 1) / 3) * 100;
            this.progressFillTarget.style.width = pct + '%';
        }

        if (this.hasPrevBtnTarget) {
            const minStep = isLocked ? 2 : 1;
            this.prevBtnTarget.style.visibility = (step === minStep || step === 5) ? 'hidden' : '';
        }

        if (this.hasNextBtnTarget) {
            if (step === 4) {
                this.nextBtnTarget.textContent   = 'Finalizar ✓';
                this.nextBtnTarget.dataset.final = 'true';
            } else if (step === 5) {
                this.nextBtnTarget.style.display = 'none';
            } else {
                this.nextBtnTarget.textContent   = 'Siguiente →';
                this.nextBtnTarget.dataset.final = '';
                this.nextBtnTarget.style.display = '';
            }
        }

        if (step === 1) this.#updateStep1UI();
    }

    #highlightSelected(type, value) {
        this.selCardTargets.forEach(card => {
            if (card.dataset.selType !== type) return;
            card.classList.toggle('sel-active', card.dataset.selValue === value);
        });
    }

    // Called once at the end of connect() to ensure selection state matches
    // current values (value callbacks may have fired before targets were ready).
    #syncAllHighlights() {
        this.#highlightSelected('model',      this.modelValue);
        this.#highlightSelected('sofa-type',  this.sofaTypeValue);
        this.#highlightSelected('sofa-seats', this.sofaSeatsValue);
        this.#highlightSelected('upholstery', this.upholsteryValue);
        this.#highlightSelected('color',      this.colorValue);
        this.#highlightSelected('legs',       this.legsValue);
        this.#updateWizardUI(this.stepValue);
    }

    #populateSummary() {
        const U = UPHOLSTERY[this.upholsteryValue];
        const L = LEGS[this.legsValue];
        const TYPE_LABELS = { sofa: 'Sofá recto', rinconera: 'Rinconera', chaise: 'Chaise longue' };

        if (this.hasSummaryModelTarget) {
            if (this.lockedValue && this.productNameValue) {
                this.summaryModelTarget.textContent = this.productNameValue;
            } else {
                const typeLabel  = TYPE_LABELS[this.sofaTypeValue] ?? this.sofaTypeValue;
                const seatsLabel = this.sofaSeatsValue + ' plazas';
                this.summaryModelTarget.textContent = `${typeLabel} · ${seatsLabel}`;
            }
        }
        if (this.hasSummaryUpholsteryTarget) this.summaryUpholsteryTarget.textContent = U?.label ?? this.upholsteryValue;
        if (this.hasSummaryLegsTarget)       this.summaryLegsTarget.textContent       = L?.label ?? this.legsValue;
        if (this.hasSummaryColorTarget) {
            this.summaryColorTarget.style.background = this.colorValue;
            this.summaryColorTarget.title = this.colorValue;
        }
    }

    // ── Step 1 sub-phase helpers ───────────────────────────────────────────

    #resolveModel() {
        const key    = `${this.sofaTypeValue}-${this.sofaSeatsValue}`;
        const mapped = MODEL_MAP[key];
        if (mapped && mapped !== this.modelValue) this.modelValue = mapped;
    }

    #updateSeatsPanel() {
        const type = this.sofaTypeValue;
        this.element.querySelectorAll('[data-seats-for]').forEach(el => {
            el.style.display = el.dataset.seatsFor === type ? '' : 'none';
        });
    }

    #updateStep1UI() {
        if (this.stepValue !== 1) return;
        const isPhase1 = this.#step1Phase === 1;
        const meta = isPhase1
            ? { title: 'Tipo de sofá',  sub: 'Elige la forma que mejor se adapta a tu espacio' }
            : { title: 'Plazas',         sub: 'Selecciona cuántos asientos necesitas' };

        if (this.hasStepTitleTarget) this.stepTitleTarget.textContent = meta.title;
        if (this.hasStepSubTarget)   this.stepSubTarget.textContent   = meta.sub;

        const p1 = this.element.querySelector('[data-step1phase="1"]');
        const p2 = this.element.querySelector('[data-step1phase="2"]');
        if (p1) p1.style.display = isPhase1 ? '' : 'none';
        if (p2) p2.style.display = isPhase1 ? 'none' : '';

        if (!isPhase1) this.#updateSeatsPanel();

        if (this.hasPrevBtnTarget) {
            this.prevBtnTarget.style.visibility = isPhase1 ? 'hidden' : '';
        }
    }

    // ── Three.js ──────────────────────────────────────────────────────────

    #initRenderer() {
        this.#renderer = new THREE.WebGLRenderer({ canvas: this.canvasTarget, antialias: true });
        this.#renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.#renderer.shadowMap.enabled   = true;
        this.#renderer.shadowMap.type      = THREE.PCFSoftShadowMap;  // softer shadow edges
        this.#renderer.outputColorSpace    = THREE.SRGBColorSpace;
        this.#renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        this.#renderer.toneMappingExposure = 1.1;
        this.#resize();
    }

    #initScene() {
        this.#scene = new THREE.Scene();
        // Explicit background needed for EffectComposer (no canvas alpha required)
        this.#scene.background = new THREE.Color(0x0a0a1a);

        // Use getBoundingClientRect for reliable dimensions at connect() time;
        // fall back to 16:9 if layout hasn't happened yet (fixed by ResizeObserver later).
        const r = this.canvasTarget.parentElement.getBoundingClientRect();
        const aspect = r.width && r.height ? r.width / r.height : 16 / 9;
        this.#camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 50);
        this.#camera.position.set(0, 1.2, 5.0);
        this.#camera.lookAt(0, 0.80, 0);

        // Showroom floor: large dark plane with slight metallic reflection and shadow receive
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 14),
            new THREE.MeshStandardMaterial({
                color: 0x1a1a2e,
                roughness: 0.8,
                metalness: 0.1,
                envMapIntensity: 0.6,
            })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.#scene.add(floor);
    }

    #initMaterials() {
        this.#bumpFabric  = this.#makeFabricBumpMap();
        this.#bumpLeather = this.#makeLeatherBumpMap();

        // MeshPhysicalMaterial: enables sheen (fabric/velvet) and clearcoat (leather).
        // sheen and clearcoat start at non-zero so their shader variants are always
        // compiled — smooth lerp never needs needsUpdate.
        // envMapIntensity: 1.0 lets the PMREM environment reflect on all surfaces.
        const physBase = {
            roughness: 0.97, metalness: 0.00,
            sheen: 0.06, sheenRoughness: 0.96,
            clearcoat: 0.01, clearcoatRoughness: 0.95,
            bumpMap: this.#bumpFabric, bumpScale: 0.058,
            envMapIntensity: 1.0,
        };
        this.#matFabric  = new THREE.MeshPhysicalMaterial({
            ...physBase,
            color: 0xc4a882,
            sheenColor: new THREE.Color(0xc4a882),
        });
        this.#matCushion = new THREE.MeshPhysicalMaterial({
            ...physBase,
            color: 0xcab48e,
            roughness: 0.93,
            sheenColor: new THREE.Color(0xcab48e),
            bumpScale: 0.020,
        });
        this.#matLegs  = new THREE.MeshStandardMaterial({ color: 0x9b7050, roughness: 0.88, metalness: 0.04, envMapIntensity: 1.0 });
        this.#matFrame = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.75, metalness: 0.08, envMapIntensity: 1.0 });
    }

    // Woven-fabric normal map: regular grid + noise for thread texture
    #makeFabricBumpMap() {
        const sz = 128;
        const cv = document.createElement('canvas');
        cv.width = cv.height = sz;
        const ctx = cv.getContext('2d');

        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, sz, sz);

        // Warp threads (vertical) — slightly lighter
        ctx.strokeStyle = 'rgba(170,170,170,0.55)';
        ctx.lineWidth = 1.2;
        for (let x = 0; x < sz; x += 4) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, sz); ctx.stroke();
        }
        // Weft threads (horizontal) — slightly darker
        ctx.strokeStyle = 'rgba(90,90,90,0.45)';
        for (let y = 2; y < sz; y += 4) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(sz, y); ctx.stroke();
        }

        // Fine grain noise
        const img = ctx.getImageData(0, 0, sz, sz);
        for (let i = 0; i < img.data.length; i += 4) {
            const n = (Math.random() - 0.5) * 18;
            img.data[i] = img.data[i+1] = img.data[i+2] =
                Math.max(0, Math.min(255, img.data[i] + n));
        }
        ctx.putImageData(img, 0, 0);

        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(14, 14);
        return tex;
    }

    // Leather grain map: random noise + elongated pore ellipses
    #makeLeatherBumpMap() {
        const sz = 256;
        const cv = document.createElement('canvas');
        cv.width = cv.height = sz;
        const ctx = cv.getContext('2d');

        // Noisy base
        const img = ctx.createImageData(sz, sz);
        for (let i = 0; i < img.data.length; i += 4) {
            const v = 110 + Math.random() * 36;
            img.data[i] = img.data[i+1] = img.data[i+2] = v;
            img.data[i+3] = 255;
        }
        ctx.putImageData(img, 0, 0);

        // Pore marks: small dark ellipses scattered across the surface
        ctx.globalAlpha = 0.22;
        for (let k = 0; k < 280; k++) {
            const x  = Math.random() * sz;
            const y  = Math.random() * sz;
            const rx = 1 + Math.random() * 2.8;
            const ry = 0.4 + Math.random() * 1.2;
            const v  = Math.round(48 + Math.random() * 40);
            ctx.fillStyle = `rgb(${v},${v},${v})`;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI);
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.globalAlpha = 1;

        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(9, 9);
        return tex;
    }

    #initControls() {
        this.#controls = new OrbitControls(this.#camera, this.canvasTarget);
        this.#controls.enableDamping   = true;
        this.#controls.dampingFactor   = 0.06;
        this.#controls.autoRotate      = true;
        this.#controls.autoRotateSpeed = 0.6;
        this.#controls.maxPolarAngle   = Math.PI / 2.1;
        this.#controls.minDistance     = 2.0;
        this.#controls.maxDistance     = 10.0;
        this.#controls.target.set(0, 0.80, 0);
        this.#controls.update();
    }

    #getMat(tag) {
        switch (tag) {
            case 'l': return this.#matLegs;
            case 'e': return this.#matFrame;
            case 'c': return this.#matCushion;
            default:  return this.#matFabric;
        }
    }

    // Returns the appropriate THREE geometry for a part definition.
    // geom:'box'  (default) — BoxGeometry,         s:[w, h, d]
    // geom:'rbox'           — RoundedBoxGeometry,   s:[w, h, d], r = edge radius
    // geom:'cyl'            — CylinderGeometry,     s:[radius, height]
    #makeGeom({ geom = 'box', s, r = 0.04 }) {
        if (geom === 'rbox') return new RoundedBoxGeometry(s[0], s[1], s[2], 2, r);
        if (geom === 'cyl')  return new THREE.CylinderGeometry(s[0], s[0], s[1], 10);
        return new THREE.BoxGeometry(...s);
    }

    // Builds procedural placeholder, then loads the real .glb
    #rebuildGeometry() {
        const modelKey = this.modelValue;
        const prod = PRODUCTS[modelKey] ?? Object.values(PRODUCTS)[0];

        this.#buildProcedural(prod.proc);  // immediate placeholder

        // Update smooth camera targets — lerped in #loop()
        this.#camTgtPos.set(0, prod.camY ?? 1.7, prod.camZ ?? 4.8);
        this.#camTgtLook.set(0, prod.lookY ?? 0.55, prod.lookZ ?? 0);
        this.#camTransitioning = true;

        if (!prod.glb) return;             // Perseo: no GLB, procedural stays

        this.#showSpinner();
        this.#tryLoadGlb(prod.glb).then(glbScene => {
            this.#hideSpinner();
            if (!glbScene || this.modelValue !== modelKey) return;
            // Materials first — removes embedded floor planes before bbox is computed
            const hasMeshes = this.#applyGlbMaterials(glbScene);
            if (!hasMeshes) return;  // all meshes filtered out → keep procedural placeholder
            this.#scene.remove(this.#group);
            this.#group.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
            this.#fitGlbToScene(glbScene, prod.rotY ?? 0);
            this.#group = glbScene;
            this.#scene.add(this.#group);
            // Fade-in for the real model
            this.#groupFadeIn = 0;
            for (const mat of [this.#matFabric, this.#matCushion, this.#matLegs, this.#matFrame]) {
                if (!mat) continue;
                mat.transparent = true;
                mat.opacity = 0;
            }
        });
    }

    #buildProcedural(modelKey) {
        if (this.#group) {
            this.#scene.remove(this.#group);
            this.#group.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
        }
        const def = PROC_MODELS[modelKey] ?? PROC_MODELS.standard2;
        this.#group = new THREE.Group();
        for (const part of def.parts) {
            const { m, name, p, rx = 0, ry = 0 } = part;
            const mesh = new THREE.Mesh(this.#makeGeom(part), this.#getMat(m));
            if (name) mesh.name = name;
            mesh.position.set(...p);
            if (rx) mesh.rotation.x = D2R(rx);
            if (ry) mesh.rotation.y = D2R(ry);
            mesh.castShadow    = true;
            mesh.receiveShadow = true;
            this.#group.add(mesh);
        }
        this.#scene.add(this.#group);

        // Trigger fade-in: temporarily make all shared materials transparent
        this.#groupFadeIn = 0;
        for (const mat of [this.#matFabric, this.#matCushion, this.#matLegs, this.#matFrame]) {
            if (!mat) continue;
            mat.transparent = true;
            mat.opacity = 0;
        }
    }

    async #tryLoadGlb(modelKey) {
        try {
            const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
            return await new Promise(resolve =>
                new GLTFLoader().load(
                    `${this.baseUrlValue}models/${modelKey}.glb`,
                    gltf => {
                        const scene  = gltf.scene;
                        const box    = new THREE.Box3().setFromObject(scene);
                        const size   = box.getSize(new THREE.Vector3());
                        const center = box.getCenter(new THREE.Vector3());
                        console.log('=== DEBUG MODELO ===', modelKey);
                        console.log('Tamaño (w/h/d):', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));
                        console.log('Centro (x/y/z):', center.x.toFixed(3), center.y.toFixed(3), center.z.toFixed(3));
                        console.log('===================');
                        resolve(scene);
                    },
                    null,
                    () => resolve(null)
                )
            );
        } catch {
            return null;
        }
    }

    #addLights() {
        // HemisphereLight: realistic indoor ambient — blue sky / warm dark ground
        this.#scene.add(new THREE.HemisphereLight(0xb0d0ff, 0x2a1a0a, 1.2));

        // Key light: upper-left diagonal, main shadow caster
        const key = new THREE.DirectionalLight(0xfff5e8, 2.5);
        key.position.set(-2, 5, 3);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.camera.near   = 1;
        key.shadow.camera.far    = 18;
        key.shadow.camera.left   = key.shadow.camera.bottom = -4;
        key.shadow.camera.right  = key.shadow.camera.top   =  4;
        key.shadow.bias = -0.0005;
        this.#scene.add(key);

        // Orbiting warm point light — makes clearcoat/sheen glitter dynamically
        // decay=2 keeps it local to the sofa; updated in #tickLighting()
        this.#pointLight = new THREE.PointLight(0xffe8c0, 2.5, 7, 2);
        this.#pointLight.position.set(3, 2.5, 3);
        this.#scene.add(this.#pointLight);

        // RectAreaLight simulating studio window — loaded async (requires init lib)
        this.#initRectAreaLight();
    }

    async #initRectAreaLight() {
        try {
            const { RectAreaLightUniformsLib } = await import('three/addons/lights/RectAreaLightUniformsLib.js');
            RectAreaLightUniformsLib.init();
            const rect = new THREE.RectAreaLight(0xfff0e8, 3, 3, 2.5);
            rect.position.set(0, 1.5, 3.5);
            rect.lookAt(0, 0.8, 0);
            this.#scene.add(rect);
        } catch {
            // Fallback: front DirectionalLight if RectAreaLight unavailable
            const fill = new THREE.DirectionalLight(0xffeedd, 1.5);
            fill.position.set(0, 2, 4);
            this.#scene.add(fill);
        }
    }

    async #initEnvironment() {
        try {
            const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
            const pmrem = new THREE.PMREMGenerator(this.#renderer);
            const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
            this.#scene.environment = envTexture;
            pmrem.dispose();
        } catch {
            // No environment map — materials still look good without it
        }
    }

    async #initPostProcessing() {
        try {
            const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
                import('three/addons/postprocessing/EffectComposer.js'),
                import('three/addons/postprocessing/RenderPass.js'),
                import('three/addons/postprocessing/UnrealBloomPass.js'),
            ]);

            const { clientWidth: w, clientHeight: h } = this.canvasTarget.parentElement;
            const composer = new EffectComposer(this.#renderer);
            composer.addPass(new RenderPass(this.#scene, this.#camera));

            // Optional SSAO for corner/crease depth
            try {
                const { SSAOPass } = await import('three/addons/postprocessing/SSAOPass.js');
                const ssao = new SSAOPass(this.#scene, this.#camera, w || 1280, h || 720);
                ssao.kernelRadius = 16;
                ssao.minDistance  = 0.005;
                ssao.maxDistance  = 0.1;
                composer.addPass(ssao);
            } catch { /* SSAO unavailable — skip */ }

            // Subtle bloom: highlight edges under the studio lighting
            composer.addPass(new UnrealBloomPass(
                new THREE.Vector2(w || 1280, h || 720),
                0.3,  // strength
                0.4,  // radius
                0.8   // threshold
            ));

            this.#composer = composer;
            this.#resize(); // sync composer size to current canvas
        } catch {
            // Post-processing unavailable — plain renderer continues
        }
    }

    #bindResize() {
        this.#resizeObserver = new ResizeObserver(() => this.#resize());
        this.#resizeObserver.observe(this.canvasTarget.parentElement);
    }

    #resize() {
        const { clientWidth: w, clientHeight: h } = this.canvasTarget.parentElement;
        if (!w || !h) return;
        this.#renderer.setSize(w, h);
        this.#composer?.setSize(w, h);
        if (this.#camera) {
            this.#camera.aspect = w / h;
            this.#camera.updateProjectionMatrix();
        }
    }

    // Exponential smoothing: α = 1 − e^(−Δt × speed)
    // speed=7 → ~90 % of target reached in ~0.33 s
    #advanceMaterialTween(alpha) {
        if (!this.#matFabric) return;
        const t = this.#tgt;

        this.#colorMult += (t.colorMult - this.#colorMult) * alpha;
        const cm = this.#colorMult;

        // Apply per-upholstery color darkening (terciopelo gets deeper, richer tones)
        const fc  = new THREE.Color(t.color.r * cm,        t.color.g * cm,        t.color.b * cm);
        const fcc = new THREE.Color(t.cushionColor.r * cm, t.cushionColor.g * cm, t.cushionColor.b * cm);

        this.#matFabric.color.lerp(fc, alpha);
        this.#matCushion.color.lerp(fcc, alpha);
        this.#matFabric.sheenColor?.lerp(fc, alpha);
        this.#matCushion.sheenColor?.lerp(fcc, alpha);

        for (const [mat, rOff] of [[this.#matFabric, 0], [this.#matCushion, 0.05]]) {
            const tR = Math.min(1, t.roughness + rOff);
            mat.roughness          += (tR                   - mat.roughness)          * alpha;
            mat.metalness          += (t.metalness          - mat.metalness)          * alpha;
            mat.sheen              += (t.sheen              - mat.sheen)              * alpha;
            mat.sheenRoughness     += (t.sheenRoughness     - mat.sheenRoughness)     * alpha;
            mat.clearcoat          += (t.clearcoat          - mat.clearcoat)          * alpha;
            mat.clearcoatRoughness += (t.clearcoatRoughness - mat.clearcoatRoughness) * alpha;
        }
    }

    #loop() {
        this.#rafId = requestAnimationFrame(() => this.#loop());
        this.#clock.update();
        const delta   = this.#clock.getDelta();
        const elapsed = this.#clock.getElapsed();
        const alpha = 1 - Math.exp(-delta * 7);

        this.#controls?.update();
        this.#advanceMaterialTween(alpha);
        this.#tickGroupFade(delta);
        this.#tickCameraSmooth(alpha);
        this.#tickLighting(delta, elapsed);
        this.#tickParticles(delta);
        if (this.#composer) {
            this.#composer.render();
        } else {
            this.#renderer.render(this.#scene, this.#camera);
        }
    }

    // ── Geometry fade-in when model changes ───────────────────────────────

    #tickGroupFade(delta) {
        if (this.#groupFadeIn >= 1) return;
        this.#groupFadeIn = Math.min(1, this.#groupFadeIn + Math.max(delta, 0.008) * 4);
        const op = this.#groupFadeIn;
        for (const mat of [this.#matFabric, this.#matCushion, this.#matLegs, this.#matFrame]) {
            if (!mat) continue;
            mat.opacity = op;
            if (op >= 0.999) { mat.transparent = false; mat.opacity = 1; }
        }
    }

    // ── Smooth camera transition to new model position ────────────────────
    // Only active while #camTransitioning=true so autoRotate runs freely once settled.

    #tickCameraSmooth(alpha) {
        if (!this.#camera || !this.#controls || !this.#camTransitioning) return;
        this.#camera.position.lerp(this.#camTgtPos, alpha * 0.6);
        this.#controls.target.lerp(this.#camTgtLook, alpha * 0.6);
        // Stop once close enough — hand control back to OrbitControls autoRotate
        if (this.#camera.position.distanceTo(this.#camTgtPos) < 0.04 &&
            this.#controls.target.distanceTo(this.#camTgtLook) < 0.02) {
            this.#camTransitioning = false;
        }
    }

    // ── Orbiting warm point light ─────────────────────────────────────────

    #tickLighting(delta, elapsed) {
        if (!this.#pointLight) return;
        this.#pointLightAngle += delta * 0.4; // ~23°/s
        const r = 3.2;
        this.#pointLight.position.set(
            Math.cos(this.#pointLightAngle) * r,
            2.4 + Math.sin(elapsed * 0.5) * 0.4,   // subtle vertical bob
            Math.sin(this.#pointLightAngle) * r
        );
    }

    // ── Star dust particles — slow counter-rotation for parallax feel ─────

    #tickParticles(delta) {
        if (this.#particles)  this.#particles.rotation.y  += delta * 0.018;
        if (this.#particles2) this.#particles2.rotation.y -= delta * 0.011;
    }

    // ── Star dust particle system ─────────────────────────────────────────

    // Generates a soft circular star sprite as a CanvasTexture.
    // Result: white disc with radial gradient → transparent edge, no hard square corners.
    #makeStarSprite() {
        const sz  = 64;
        const cv  = document.createElement('canvas');
        cv.width  = sz;
        cv.height = sz;
        const ctx = cv.getContext('2d');
        const cx  = sz / 2;
        const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
        grad.addColorStop(0.00, 'rgba(255,255,255,1.00)');
        grad.addColorStop(0.30, 'rgba(255,255,255,0.90)');
        grad.addColorStop(0.65, 'rgba(255,255,255,0.35)');
        grad.addColorStop(1.00, 'rgba(255,255,255,0.00)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, sz, sz);
        return new THREE.CanvasTexture(cv);
    }

    #initParticles() {
        const COUNT    = 900;
        const starTex  = this.#makeStarSprite();

        const makeSystem = (color, size, opacity, seed, rMin, rMax) => {
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(COUNT * 3);
            const rng = mulberry32(seed);
            for (let i = 0; i < COUNT; i++) {
                const r     = rMin + rng() * (rMax - rMin);
                const theta = rng() * Math.PI * 2;
                const phi   = Math.acos(1 - 2 * rng());
                pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
                pos[i * 3 + 1] = r * Math.cos(phi);
                pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({
                color, size, map: starTex,
                sizeAttenuation: true,
                transparent: true, opacity,
                alphaTest: 0.01,   // discard near-transparent fragments (removes hard square edge)
                depthWrite: false,
            });
            return new THREE.Points(geo, mat);
        };

        // Seeded PRNG so positions are deterministic (no flicker on hot-reload)
        function mulberry32(seed) {
            return () => {
                seed |= 0; seed = seed + 0x6D2B79F5 | 0;
                let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        // Inner ring: bright cyan, closer, clearly visible
        this.#particles  = makeSystem(0xaaddff, 0.048, 0.88, 0x1a2b3c, 3.0, 7.0);
        // Outer ring: violet, larger spread, slightly dimmer
        this.#particles2 = makeSystem(0xddbbff, 0.034, 0.72, 0x4d5e6f, 5.0, 10.0);
        this.#scene.add(this.#particles);
        this.#scene.add(this.#particles2);
    }

    // ── Tooltip — raycasting on mousemove ─────────────────────────────────

    #initTooltip() {
        const el = document.createElement('div');
        el.style.cssText = [
            'position:absolute', 'pointer-events:none',
            'padding:8px 13px',
            'background:rgba(4,4,20,.88)',
            'border:1px solid rgba(0,245,255,.35)',
            'border-radius:10px',
            'backdrop-filter:blur(8px)',
            'font-size:12px', 'line-height:1.5',
            'color:#e8eaff',
            'opacity:0',
            'transition:opacity .18s',
            'white-space:nowrap',
            'z-index:8',
            'box-shadow:0 0 16px rgba(0,245,255,.18)',
            'font-family:inherit',
        ].join(';');
        this.canvasTarget.parentElement.appendChild(el);
        this.#tooltip = el;

        const canvas = this.canvasTarget;
        const parent = canvas.parentElement;

        canvas.addEventListener('mousemove', e => {
            if (!this.#group || !this.#camera) return;
            const rect = canvas.getBoundingClientRect();
            this.#mouseNDC.set(
                ((e.clientX - rect.left)  / rect.width)  * 2 - 1,
               -((e.clientY - rect.top)   / rect.height) * 2 + 1
            );
            this.#raycaster.setFromCamera(this.#mouseNDC, this.#camera);
            const hits = this.#raycaster.intersectObject(this.#group, true);
            if (hits.length > 0) {
                const def = PRODUCTS[this.modelValue] ?? Object.values(PRODUCTS)[0];
                el.innerHTML =
                    `<span style="color:#00f5ff;font-weight:700;font-size:11px;letter-spacing:.08em;">${def.celestial}</span>` +
                    `<br><span style="color:#9090b8;font-size:11px;">${def.type}</span>`;
                const px = e.clientX - parent.getBoundingClientRect().left + 16;
                const py = e.clientY - parent.getBoundingClientRect().top  - 10;
                el.style.left    = px + 'px';
                el.style.top     = py + 'px';
                el.style.opacity = '1';
            } else {
                el.style.opacity = '0';
            }
        });

        canvas.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
    }

    // ── Canvas hover → pause/resume auto-rotation ─────────────────────────

    #bindHover() {
        const canvas = this.canvasTarget;
        canvas.addEventListener('mouseenter', () => {
            if (this.#controls) this.#controls.autoRotate = false;
        });
        canvas.addEventListener('mouseleave', () => {
            if (this.#controls) this.#controls.autoRotate = true;
        });
    }

    // ── GLB helpers ───────────────────────────────────────────────────────

    // Normalize a loaded GLB: largest dimension → 2.5 units, centered, floor at Y=0.
    // rotY: pre-fit Y rotation (radians) for models loaded facing the wrong direction.
    // Uses per-mesh bounding boxes (not the full scene graph) to avoid camera/light
    // nodes inflating the bounds. Filters outlier meshes (> 5× median distance from
    // centroid) so detached shadow planes or stray vertices don't break the fit.
    #fitGlbToScene(scene, rotY = 0) {
        scene.updateMatrixWorld(true);
        if (rotY) { scene.rotation.y += rotY; scene.updateMatrixWorld(true); }

        // Per-mesh bounding boxes in world space
        const mboxes = [];
        scene.traverse(obj => {
            if (!obj.isMesh) return;
            const b = new THREE.Box3().setFromObject(obj);
            if (!b.isEmpty()) mboxes.push(b);
        });
        if (!mboxes.length) return;

        // Centroid of mesh centers
        const centroid = new THREE.Vector3();
        const centers  = mboxes.map(b => b.getCenter(new THREE.Vector3()));
        centers.forEach(c => centroid.add(c));
        centroid.divideScalar(mboxes.length);

        // Filter outliers: keep meshes within 5× median distance from centroid
        const dists  = centers.map(c => c.distanceTo(centroid));
        const sorted = [...dists].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)] || 0;
        const limit  = Math.max(median * 5, 0.5);

        const box = new THREE.Box3();
        mboxes.forEach((b, i) => { if (dists[i] <= limit) box.union(b); });
        if (box.isEmpty()) mboxes.forEach(b => box.union(b)); // fallback: use all

        const ctr   = box.getCenter(new THREE.Vector3());
        const size  = box.getSize(new THREE.Vector3());
        const scale = 2.5 / Math.max(size.x, size.y, size.z, 0.001);

        scene.scale.setScalar(scale);
        scene.position.set(-scale * ctr.x, -scale * box.min.y, -scale * ctr.z);

        this.#camTgtPos.set(0, 1.2, 5);
        this.#camTgtLook.set(0, 0.8, 0);
        this.#camTransitioning = true;
    }

    // Assign shared materials to all meshes in the loaded GLB and remove
    // embedded floor/shadow planes that would clash with our scene floor.
    // Must be called BEFORE #fitGlbToScene so the bounding box is computed
    // without the (now-removed) floor geometry.
    // Returns true if at least one mesh survived (false → caller should skip GLB).
    #applyGlbMaterials(scene) {
        const legKeywords    = ['leg', 'foot', 'paw', 'support', 'metal',
                                'pata', 'pie', 'struct', 'struc'];
        const groundKeywords = ['floor', 'ground', 'plane', 'shadow', 'surface',
                                'suelo', 'terrain', 'carpet', 'rug', 'decal'];

        // Scene bounds for relative floor detection (unscaled model units)
        const sceneBounds = new THREE.Box3();
        scene.traverse(o => { if (o.isMesh) sceneBounds.expandByObject(o); });
        const sceneSize  = sceneBounds.getSize(new THREE.Vector3());
        // Only remove geometry in the lowest 4% of the model height
        const floorLimit = sceneBounds.min.y + 0.04 * sceneSize.y;

        const toRemove = [];

        scene.traverse(obj => {
            if (!obj.isMesh) return;
            const name = (obj.name ?? '').toLowerCase();

            // 1. Remove by keyword match
            if (groundKeywords.some(k => name.includes(k))) {
                toRemove.push(obj);
                return;
            }

            // 2. Remove implicit floor planes: extremely flat (< 1.5% h/w) AND at the very bottom
            const mb = new THREE.Box3().setFromObject(obj);
            const ms = mb.getSize(new THREE.Vector3());
            const isVeryFlat = ms.y < 0.015 * Math.max(ms.x, ms.z, 0.001);
            const isAtBottom = mb.min.y <= floorLimit;
            if (isVeryFlat && isAtBottom) {
                toRemove.push(obj);
                return;
            }

            const isLeg = legKeywords.some(k => name.includes(k));
            obj.material      = isLeg ? this.#matLegs : this.#matFabric;
            obj.castShadow    = true;
            obj.receiveShadow = true;
        });

        toRemove.forEach(obj => obj.removeFromParent());

        // Safety: if everything was removed the model cannot be displayed
        let survived = 0;
        scene.traverse(o => { if (o.isMesh) survived++; });
        return survived > 0;
    }

    // ── Spatial loading spinner ───────────────────────────────────────────

    #initSpinner() {
        if (!document.getElementById('glb-spinner-kf')) {
            const s = document.createElement('style');
            s.id = 'glb-spinner-kf';
            s.textContent = '@keyframes glbSpin{to{transform:rotate(360deg)}}';
            document.head.appendChild(s);
        }
        const el = document.createElement('div');
        el.style.cssText = [
            'position:absolute', 'inset:0',
            'display:flex', 'flex-direction:column',
            'align-items:center', 'justify-content:center',
            'background:rgba(10,10,26,0.80)',
            'backdrop-filter:blur(6px)',
            'z-index:10',
            'opacity:0',
            'transition:opacity .22s',
            'pointer-events:none',
        ].join(';');
        el.innerHTML = `
            <div style="
                width:46px;height:46px;
                border:3px solid rgba(0,245,255,.18);
                border-top-color:#00f5ff;
                border-radius:50%;
                animation:glbSpin .75s linear infinite;
            "></div>
            <p style="
                margin:14px 0 0;
                color:#00f5ff;
                font-size:11px;
                letter-spacing:.14em;
                font-family:inherit;
                text-transform:uppercase;
            ">Cargando modelo</p>`;
        this.canvasTarget.parentElement.appendChild(el);
        this.#spinnerEl = el;
    }

    #showSpinner() {
        if (!this.#spinnerEl) return;
        this.#spinnerEl.style.pointerEvents = 'auto';
        this.#spinnerEl.style.opacity = '1';
    }

    #hideSpinner() {
        if (!this.#spinnerEl) return;
        this.#spinnerEl.style.pointerEvents = 'none';
        this.#spinnerEl.style.opacity = '0';
    }
}
