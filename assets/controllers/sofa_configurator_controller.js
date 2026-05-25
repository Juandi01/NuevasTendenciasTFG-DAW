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
    orion:     { label: 'Orión',     celestial: 'Constelación Orión',   type: 'Sofá 3 plazas',  icon: '🛋️', glb: 'orion',        proc: 'standard3', camZ: 5.5, camY: 1.8, lookY: 0.55, lookZ: 0    },
    sirio:     { label: 'Sirio',     celestial: 'Estrella Sirio',        type: 'Sofá 3 plazas',  icon: '🛋️', glb: 'sirio',        proc: 'standard3', camZ: 5.5, camY: 1.8, lookY: 0.55, lookZ: 0    },
    vega:      { label: 'Vega',      celestial: 'Estrella Vega',         type: 'Sofá 2 plazas',  icon: '🛋️', glb: 'vega',         proc: 'standard2', camZ: 4.8, camY: 1.7, lookY: 0.55, lookZ: 0    },
    andromeda: { label: 'Andrómeda', celestial: 'Galaxia Andrómeda',     type: 'Rinconera izq.', icon: '🔲', glb: 'andromeda',    proc: 'corner',    camZ: 6.5, camY: 2.5, lookY: 0.55, lookZ: 0.55 },
    cassiopea: { label: 'Cassiopea', celestial: 'Constelación Casiopea', type: 'Rinconera der.', icon: '🔲', glb: 'cassiopea',    proc: 'corner',    camZ: 6.5, camY: 2.5, lookY: 0.55, lookZ: 0.55 },
    nebula:    { label: 'Nebula',    celestial: 'Nebulosa Cefálica',     type: 'Rinconera',      icon: '🔲', glb: 'nebula',       proc: 'corner',    camZ: 6.5, camY: 2.5, lookY: 0.55, lookZ: 0.55 },
    altair:    { label: 'Altair',    celestial: 'Estrella Altair',       type: 'Chaise longue',  icon: '🛁', glb: 'orion-chaise', proc: 'chaise',    camZ: 5.8, camY: 1.9, lookY: 0.50, lookZ: 0.40 },
    lyra:      { label: 'Lyra',      celestial: 'Constelación Lyra',     type: 'Chaise longue',  icon: '🛁', glb: 'lyra',         proc: 'chaise',    camZ: 5.8, camY: 1.9, lookY: 0.50, lookZ: 0.40 },
    perseo:    { label: 'Perseo',    celestial: 'Constelación Perseo',   type: 'Chaise longue',  icon: '🛁', glb: null,           proc: 'chaise',    camZ: 5.8, camY: 1.9, lookY: 0.50, lookZ: 0.40 },
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
    { title: 'Tu modelo',  sub: 'Elige el tipo de sofá que se adapta a tu espacio' },
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
        step:       { type: Number, default: 1 },
        model:      { type: String, default: 'orion' },
        upholstery: { type: String, default: 'tela' },
        color:      { type: String, default: '#c4a882' },
        legs:       { type: String, default: 'natural' },
    };

    // Three.js private state
    #renderer; #scene; #camera; #controls; #group;
    #matFabric; #matCushion; #matLegs; #matFrame;
    #clock; #bumpFabric; #bumpLeather;
    #rafId; #resizeObserver;

    // Immersive extras
    #particles; #particles2;          // star dust systems
    #pointLight; #pointLightAngle = 0; // orbiting warm spotlight
    #floorLight;                       // neon floor bounce
    #tooltip;                          // DOM tooltip el
    #spinnerEl;                        // loading overlay
    #raycaster = new THREE.Raycaster();
    #mouseNDC  = new THREE.Vector2(-99, -99); // far off-screen initially
    #groupFadeIn = 1;                  // 0→1 fade when model changes

    // Smooth camera transition targets
    #camTgtPos  = new THREE.Vector3(0, 1.7, 4.8);
    #camTgtLook = new THREE.Vector3(0, 0.55, 0);
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
        this.#clock = new THREE.Clock();
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

        requestAnimationFrame(() => this.#resize());
        this.#syncAllHighlights();
    }

    disconnect() {
        cancelAnimationFrame(this.#rafId);
        this.#resizeObserver?.disconnect();
        this.#controls?.dispose();
        this.#renderer?.dispose();
        this.#tooltip?.remove();
        this.#spinnerEl?.remove();
    }

    // ── Value changed callbacks ────────────────────────────────────────────

    stepValueChanged(step) { this.#updateWizardUI(step); }

    modelValueChanged(model) {
        // Guard only the Three.js call — scene is null before connect() runs.
        // #highlightSelected is pure DOM and safe to call at any time.
        if (this.#scene) this.#rebuildGeometry();
        this.#highlightSelected('model', model);
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

    nextStep() {
        if (this.stepValue < 5) {
            this.stepValue++;
            if (this.stepValue === 5) this.#populateSummary();
        }
    }

    prevStep() {
        if (this.stepValue > 1) this.stepValue--;
    }

    resetWizard() {
        this.modelValue      = 'orion';
        this.upholsteryValue = 'tela';
        this.colorValue      = '#c4a882';
        this.legsValue       = 'natural';
        this.stepValue       = 1;
    }

    // ── Wizard UI helpers ──────────────────────────────────────────────────

    #updateWizardUI(step) {
        const meta = STEPS[step - 1];

        if (this.hasStepTitleTarget) this.stepTitleTarget.textContent = meta.title;
        if (this.hasStepSubTarget)   this.stepSubTarget.textContent   = meta.sub;
        if (this.hasStepNumTarget)   this.stepNumTarget.textContent   = step <= 4 ? `${step} / 4` : '✓';

        this.stepPanelTargets.forEach(p => {
            p.style.display = Number(p.dataset.step) === step ? '' : 'none';
        });

        this.progressDotTargets.forEach(dot => {
            const n = Number(dot.dataset.dot);
            dot.dataset.state = n < step ? 'done' : n === step ? 'active' : 'idle';
        });

        if (this.hasProgressFillTarget) {
            const pct = step >= 5 ? 100 : ((step - 1) / 3) * 100;
            this.progressFillTarget.style.width = pct + '%';
        }

        if (this.hasPrevBtnTarget) {
            this.prevBtnTarget.style.visibility = (step === 1 || step === 5) ? 'hidden' : '';
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
        this.#highlightSelected('upholstery', this.upholsteryValue);
        this.#highlightSelected('color',      this.colorValue);
        this.#highlightSelected('legs',       this.legsValue);
        this.#updateWizardUI(this.stepValue);
    }

    #populateSummary() {
        const M = PRODUCTS[this.modelValue];
        const U = UPHOLSTERY[this.upholsteryValue];
        const L = LEGS[this.legsValue];

        if (this.hasSummaryModelTarget)      this.summaryModelTarget.textContent      = M?.label ?? this.modelValue;
        if (this.hasSummaryUpholsteryTarget) this.summaryUpholsteryTarget.textContent = U?.label ?? this.upholsteryValue;
        if (this.hasSummaryLegsTarget)       this.summaryLegsTarget.textContent       = L?.label ?? this.legsValue;
        if (this.hasSummaryColorTarget) {
            this.summaryColorTarget.style.background = this.colorValue;
            this.summaryColorTarget.title = this.colorValue;
        }
    }

    // ── Three.js ──────────────────────────────────────────────────────────

    #initRenderer() {
        this.#renderer = new THREE.WebGLRenderer({ canvas: this.canvasTarget, antialias: true, alpha: true });
        this.#renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.#renderer.setClearAlpha(0);
        this.#renderer.shadowMap.enabled = true;
        this.#renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
        this.#resize();
    }

    #initScene() {
        this.#scene = new THREE.Scene();
        // Use getBoundingClientRect for reliable dimensions at connect() time;
        // fall back to 16:9 if layout hasn't happened yet (fixed by ResizeObserver later).
        const r = this.canvasTarget.parentElement.getBoundingClientRect();
        const aspect = r.width && r.height ? r.width / r.height : 16 / 9;
        this.#camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 50);
        this.#camera.position.set(0, 1.7, 4.8);
        this.#camera.lookAt(0, 0.55, 0);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 14),
            new THREE.MeshStandardMaterial({ color: 0x060618, roughness: 1 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.#scene.add(floor);

        const grid = new THREE.GridHelper(12, 24, 0x001a33, 0x000d22);
        grid.position.y = 0.002;
        this.#scene.add(grid);
    }

    #initMaterials() {
        this.#bumpFabric  = this.#makeFabricBumpMap();
        this.#bumpLeather = this.#makeLeatherBumpMap();

        // MeshPhysicalMaterial: enables sheen (fabric/velvet) and clearcoat (leather).
        // sheen and clearcoat start at non-zero so their shader variants are always
        // compiled — smooth lerp never needs needsUpdate.
        const physBase = {
            roughness: 0.97, metalness: 0.00,
            sheen: 0.06, sheenRoughness: 0.96,
            clearcoat: 0.01, clearcoatRoughness: 0.95,
            bumpMap: this.#bumpFabric, bumpScale: 0.058,
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
        this.#matLegs  = new THREE.MeshStandardMaterial({ color: 0x9b7050, roughness: 0.88, metalness: 0.04 });
        this.#matFrame = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.75, metalness: 0.08 });
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
        this.#controls.minDistance     = 2.5;
        this.#controls.maxDistance     = 9;
        this.#controls.target.set(0, 0.55, 0);
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
            this.#scene.remove(this.#group);
            this.#group.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
            this.#fitGlbToScene(glbScene);
            this.#applyGlbMaterials(glbScene);
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
                new GLTFLoader().load(`/models/${modelKey}.glb`, g => resolve(g.scene), null, () => resolve(null))
            );
        } catch {
            return null;
        }
    }

    #addLights() {
        // Bluish ambient — space feel
        this.#scene.add(new THREE.AmbientLight(0x7799cc, 0.38));

        // Warm directional key — main shadow caster
        const key = new THREE.DirectionalLight(0xfff5e8, 1.6);
        key.position.set(3, 7, 5);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.near   = 1;
        key.shadow.camera.far    = 22;
        key.shadow.camera.left   = key.shadow.camera.bottom = -5;
        key.shadow.camera.right  = key.shadow.camera.top   =  5;
        this.#scene.add(key);

        // Cyan rim — accentuates edges (space neon)
        const rim = new THREE.DirectionalLight(0x00f5ff, 0.42);
        rim.position.set(-4, 5, -3);
        this.#scene.add(rim);

        // Violet fill — subtle depth from below
        const fill = new THREE.DirectionalLight(0x7b2fff, 0.20);
        fill.position.set(4, -1, -2);
        this.#scene.add(fill);

        // Orbiting warm point light — makes clearcoat/sheen glitter dynamically
        // decay=2 keeps it local to the sofa; updated in #tickLighting()
        this.#pointLight = new THREE.PointLight(0xffe8c0, 1.1, 7, 2);
        this.#pointLight.position.set(3, 2.5, 3);
        this.#scene.add(this.#pointLight);

        // Floor neon bounce — low-placed cyan for showroom atmosphere
        this.#floorLight = new THREE.PointLight(0x00f5ff, 0.28, 5, 2);
        this.#floorLight.position.set(0, 0.1, 2);
        this.#scene.add(this.#floorLight);
    }

    #bindResize() {
        this.#resizeObserver = new ResizeObserver(() => this.#resize());
        this.#resizeObserver.observe(this.canvasTarget.parentElement);
    }

    #resize() {
        const { clientWidth: w, clientHeight: h } = this.canvasTarget.parentElement;
        if (!w || !h) return;
        this.#renderer.setSize(w, h);
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
        const delta = this.#clock.getDelta();
        const elapsed = this.#clock.getElapsedTime();
        const alpha = 1 - Math.exp(-delta * 7);

        this.#controls?.update();
        this.#advanceMaterialTween(alpha);
        this.#tickGroupFade(delta);
        this.#tickCameraSmooth(alpha);
        this.#tickLighting(delta, elapsed);
        this.#tickParticles(delta);
        this.#renderer.render(this.#scene, this.#camera);
    }

    // ── Geometry fade-in when model changes ───────────────────────────────

    #tickGroupFade(delta) {
        if (this.#groupFadeIn >= 1) return;
        this.#groupFadeIn = Math.min(1, this.#groupFadeIn + delta * 4); // ~0.25 s
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
        // Floor-bounce light pulses very gently with a 3-second period
        if (this.#floorLight) {
            this.#floorLight.intensity = 0.22 + Math.sin(elapsed * 2.1) * 0.06;
        }
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

    // Center + scale the loaded GLB so it sits on the floor at a consistent size.
    #fitGlbToScene(scene) {
        const box    = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());

        // Translate: center X/Z, bottom to y=0
        scene.position.x -= center.x;
        scene.position.z -= center.z;
        scene.position.y -= box.min.y;

        // Scale to target height ~1.8 units, cap at 2× to avoid oversized models
        const targetH = 1.8;
        const maxDim  = Math.max(size.x, size.y, size.z, 0.01);
        const scale   = Math.min(targetH / Math.max(size.y, 0.01), 1.6 / maxDim);
        scene.scale.setScalar(scale);

        // Re-seat after scale
        const box2 = new THREE.Box3().setFromObject(scene);
        scene.position.y -= box2.min.y;
    }

    // Assign shared materials to all meshes in the loaded GLB.
    // Leg/structural parts get #matLegs; everything else gets #matFabric.
    #applyGlbMaterials(scene) {
        const legKeywords = ['leg', 'foot', 'paw', 'support', 'base', 'metal',
                             'wood', 'pata', 'pie', 'frame', 'struct', 'struc'];
        scene.traverse(obj => {
            if (!obj.isMesh) return;
            const name  = (obj.name ?? '').toLowerCase();
            const isLeg = legKeywords.some(k => name.includes(k));
            obj.material      = isLeg ? this.#matLegs : this.#matFabric;
            obj.castShadow    = true;
            obj.receiveShadow = true;
        });
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
