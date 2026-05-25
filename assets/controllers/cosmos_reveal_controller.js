import { Controller } from '@hotwired/stimulus';

/**
 * Scroll-reveal with IntersectionObserver. Stagger children or elements
 * marked with [data-reveal].
 *
 * Usage:
 *   <div data-controller="cosmos-reveal" data-cosmos-reveal-stagger-value="80">
 *     <div data-reveal>...</div>
 *     <div data-reveal>...</div>
 *   </div>
 *
 * Without [data-reveal] attributes, all direct children are observed.
 */
export default class extends Controller {
    static values = { stagger: { type: Number, default: 75 } };

    #io;

    connect() {
        const marked = this.element.querySelectorAll('[data-reveal]');
        const targets = Array.from(marked.length ? marked : this.element.children);

        targets.forEach((el, i) => {
            el.dataset.revealIdx = i;
            el.classList.add('cosmos-reveal-pending');
        });

        this.#io = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const el    = entry.target;
                const delay = Number(
                    el.dataset.revealDelay
                    ?? Number(el.dataset.revealIdx) * this.staggerValue
                );
                el.style.transitionDelay = delay + 'ms';
                el.classList.remove('cosmos-reveal-pending');
                el.classList.add('cosmos-reveal-visible');
                this.#io.unobserve(el);
            }
        }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

        targets.forEach(el => this.#io.observe(el));
    }

    disconnect() {
        this.#io?.disconnect();
    }
}
