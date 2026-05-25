import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['canvas'];

    #stars    = [];
    #clouds   = [];
    #shooters = [];
    #pulses   = [];
    #raf;
    #t      = 0;
    #warpT  = 0;
    #mouse  = { x: 0.5, y: 0.5 };
    #ro;
    #ctx;

    connect() {
        this.#ctx = this.canvasTarget.getContext('2d');
        this.#resize();
        this.#seed();

        this.#ro = new ResizeObserver(() => { this.#resize(); this.#seed(); });
        this.#ro.observe(document.documentElement);

        window.addEventListener('mousemove', this.#onMouse);
        document.addEventListener('turbo:before-render', this.#onWarp);
        this.#raf = requestAnimationFrame(this.#tick);
    }

    disconnect() {
        cancelAnimationFrame(this.#raf);
        this.#ro?.disconnect();
        window.removeEventListener('mousemove', this.#onMouse);
        document.removeEventListener('turbo:before-render', this.#onWarp);
    }

    // ── Private ──────────────────────────────────────────────────────

    #resize() {
        const c = this.canvasTarget;
        c.width  = window.innerWidth;
        c.height = window.innerHeight;
    }

    #seed() {
        const W = this.canvasTarget.width;
        const H = this.canvasTarget.height;
        this.#stars  = [];
        this.#clouds = [];

        // Three parallax layers: far / mid (with constellation lines) / near
        const LAYERS = [
            { count: 220, rMin: .4, rMax: 1.1, speedX: .008, speedY: .004, alpha: .45, tinted: false, connect: false },
            { count: 110, rMin: .8, rMax: 1.6, speedX: .018, speedY: .010, alpha: .65, tinted: true,  connect: true  },
            { count:  55, rMin: 1.4, rMax: 2.4, speedX: .032, speedY: .018, alpha: .85, tinted: false, connect: false },
        ];

        const TINTS = ['rgba(0,245,255,', 'rgba(123,47,255,', 'rgba(255,192,77,', 'rgba(255,255,255,'];

        for (const layer of LAYERS) {
            for (let i = 0; i < layer.count; i++) {
                const tintIdx = layer.tinted && Math.random() < .38
                    ? Math.floor(Math.random() * 3)
                    : 3;
                this.#stars.push({
                    x:    Math.random() * W,
                    y:    Math.random() * H,
                    r:    layer.rMin + Math.random() * (layer.rMax - layer.rMin),
                    phase:     Math.random() * Math.PI * 2,
                    freq:      .3 + Math.random() * .7,
                    baseAlpha: layer.alpha * (.5 + Math.random() * .5),
                    speedX:    layer.speedX,
                    speedY:    layer.speedY,
                    tint:      TINTS[tintIdx],
                    connect:   layer.connect,
                });
            }
        }

        // Nebula cloud particle clusters — soft glowing accumulations
        const CLUSTERS = [
            { cx: W * .18, cy: H * .28, color: 'rgba(123,47,255,', r: Math.min(W,H) * .20, count: 55 },
            { cx: W * .78, cy: H * .62, color: 'rgba(0,245,255,',  r: Math.min(W,H) * .17, count: 45 },
            { cx: W * .52, cy: H * .12, color: 'rgba(255,192,77,', r: Math.min(W,H) * .10, count: 30 },
            { cx: W * .88, cy: H * .18, color: 'rgba(123,47,255,', r: Math.min(W,H) * .08, count: 22 },
        ];

        for (const cl of CLUSTERS) {
            for (let i = 0; i < cl.count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist  = Math.pow(Math.random(), .55) * cl.r;
                this.#clouds.push({
                    x:    cl.cx + Math.cos(angle) * dist,
                    y:    cl.cy + Math.sin(angle) * dist,
                    baseAlpha: .025 + Math.random() * .065,
                    phase:  Math.random() * Math.PI * 2,
                    freq:   .08 + Math.random() * .15,
                    speedX: .003 + Math.random() * .007,
                    speedY: .0015 + Math.random() * .004,
                    glow:   10 + Math.random() * 22,
                    color:  cl.color,
                });
            }
        }
    }

    #onMouse = (e) => {
        this.#mouse.x = e.clientX / window.innerWidth;
        this.#mouse.y = e.clientY / window.innerHeight;
    };

    // Turbo navigation triggers hyperspace
    #onWarp = () => { this.#warpT = 1.0; };

    #tick = () => {
        this.#t += .016;
        if (this.#warpT > 0) this.#warpT = Math.max(0, this.#warpT - .018);

        const W    = this.canvasTarget.width;
        const H    = this.canvasTarget.height;
        const ctx  = this.#ctx;
        const warp = this.#warpT;

        ctx.clearRect(0, 0, W, H);

        // ── Nebula cloud clusters ────────────────────────────────
        for (const c of this.#clouds) {
            c.x = (c.x + c.speedX + (this.#mouse.x - .5) * c.speedX * .5 + W) % W;
            c.y = (c.y + c.speedY * .4 + (this.#mouse.y - .5) * c.speedY * .3 + H) % H;

            const a  = c.baseAlpha * (.65 + .35 * Math.sin(this.#t * c.freq + c.phase));
            const gr = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.glow * 6);
            gr.addColorStop(0,   c.color + a + ')');
            gr.addColorStop(.35, c.color + (a * .35) + ')');
            gr.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.glow * 6, 0, Math.PI * 2);
            ctx.fillStyle = gr;
            ctx.fill();
        }

        // ── Constellation connections on mid-layer ───────────────
        if (warp < .35) {
            const conn = this.#stars.filter(s => s.connect);
            for (let i = 0; i < conn.length; i++) {
                const a = conn[i];
                for (let j = i + 1; j < conn.length; j++) {
                    const b = conn[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d < 92) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(100,140,255,${.06 * (1 - d / 92)})`;
                        ctx.lineWidth   = .4;
                        ctx.stroke();
                    }
                }
            }
        }

        // ── Stars ────────────────────────────────────────────────
        for (const s of this.#stars) {
            const mx = (this.#mouse.x - .5) * s.speedX * 60;
            const my = (this.#mouse.y - .5) * s.speedY * 60;
            const ws = 1 + warp * 18;

            s.x = (s.x + s.speedX * ws + mx * .003 + W) % W;
            s.y = (s.y + s.speedY * .5 * ws + my * .003 + H) % H;

            const alpha = s.baseAlpha * (.55 + .45 * Math.sin(this.#t * s.freq + s.phase));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * (1 + warp * .4), 0, Math.PI * 2);
            ctx.fillStyle = s.tint + alpha + ')';
            ctx.fill();

            // Glow halo for larger stars
            if (s.r > 1.5) {
                const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5);
                gr.addColorStop(0, s.tint + (alpha * .4) + ')');
                gr.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2);
                ctx.fillStyle = gr;
                ctx.fill();
            }

            // Hyperspace streaks
            if (warp > .08) {
                const len = warp * 72;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x + s.speedX * len, s.y + s.speedY * .5 * len);
                ctx.strokeStyle = s.tint + (alpha * warp * .75) + ')';
                ctx.lineWidth   = s.r * .55;
                ctx.stroke();
            }
        }

        // ── Shooting stars ───────────────────────────────────────
        const SHOOT_COLS = [
            'rgba(255,255,255,',
            'rgba(0,245,255,',
            'rgba(123,47,255,',
            'rgba(255,192,77,',
        ];

        if (Math.random() < .004 + warp * .06) {
            this.#shooters.push({
                x:    Math.random() * W * 1.2,
                y:    Math.random() * H * .55,
                vx:   -(5 + Math.random() * 9),
                vy:   1.5 + Math.random() * 3.5,
                len:  80 + Math.random() * 140,
                alpha: 1,
                col:  SHOOT_COLS[Math.floor(Math.random() * SHOOT_COLS.length)],
            });
        }

        for (let i = this.#shooters.length - 1; i >= 0; i--) {
            const sh = this.#shooters[i];
            sh.x += sh.vx * (1 + warp * 4);
            sh.y += sh.vy * (1 + warp * 2);
            sh.alpha -= .022;
            if (sh.alpha <= 0) { this.#shooters.splice(i, 1); continue; }

            const gr = ctx.createLinearGradient(
                sh.x, sh.y,
                sh.x - sh.vx * sh.len / 10,
                sh.y - sh.vy * sh.len / 10
            );
            gr.addColorStop(0, sh.col + sh.alpha + ')');
            gr.addColorStop(1, sh.col + '0)');

            ctx.beginPath();
            ctx.moveTo(sh.x, sh.y);
            ctx.lineTo(sh.x - sh.vx * sh.len / 10, sh.y - sh.vy * sh.len / 10);
            ctx.strokeStyle = gr;
            ctx.lineWidth   = 1.2 + sh.alpha * .8;
            ctx.stroke();

            // Sparkle head
            ctx.beginPath();
            ctx.arc(sh.x, sh.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = sh.col + sh.alpha + ')';
            ctx.fill();
        }

        // ── Pulse rings emanating from bright stars ───────────────
        if (Math.random() < .002) {
            const bright = this.#stars.filter(s => s.r > 1.3);
            if (bright.length) {
                const src = bright[Math.floor(Math.random() * bright.length)];
                this.#pulses.push({ x: src.x, y: src.y, r: 2, alpha: .55, col: src.tint });
            }
        }

        for (let i = this.#pulses.length - 1; i >= 0; i--) {
            const p = this.#pulses[i];
            p.r    += .85;
            p.alpha -= .013;
            if (p.alpha <= 0) { this.#pulses.splice(i, 1); continue; }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.strokeStyle = p.col + p.alpha + ')';
            ctx.lineWidth   = .7;
            ctx.stroke();
        }

        this.#raf = requestAnimationFrame(this.#tick);
    };
}
