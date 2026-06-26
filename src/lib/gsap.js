/**
 * GSAP — Configuração, Presets & Composables
 *
 * API declarativa via data-attributes:
 *
 *   data-animate="fadeUp"           → scroll reveal (ScrollTrigger)
 *   data-animate="fadeUp" data-delay="0.2"
 *   data-stagger="scaleUp"         → anima children com stagger
 *   data-stagger="scaleUp" data-gap="0.12"
 *   data-load="fadeIn"             → animação imediata (above the fold)
 *   data-load="fadeUp" data-delay="0.1"
 *   data-parallax="20"              → scroll-linked parallax sutil (y ±valor)
 *
 * Composables:
 *   useAnimations(name?)           → retorna ref, processa data-* automaticamente
 *   useParallax(ref, toVars, opts) → scroll-linked scrub
 *   useTransition(ref)             → { play } para tab/content swap
 *   useAccordion(isOpen)           → retorna ref, expand/collapse automático
 *
 * Uso no template: bind o ref retornado com `ref="scope"` no elemento raiz.
 */

import { onMounted, onUnmounted, ref, watch } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── Dev mode flag ──────────────────────────────────────────────
const IS_DEV = typeof import.meta !== "undefined" && import.meta.env?.DEV;

// ── Reduced motion ─────────────────────────────────────────────
// Respeita prefers-reduced-motion do sistema operacional.
// Quando ativo: duração zero, sem parallax, sem smooth scroll.
export const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ── Registro global (idempotente) ──────────────────────────────
gsap.registerPlugin(ScrollTrigger);

gsap.defaults({
  ease: "power1.out",
  duration: prefersReducedMotion ? 0 : 0.8,
});
ScrollTrigger.defaults({
  toggleActions: "play none none none",
  start: "top 85%",
});

// ── Presets (estado "from" — anima DAQUI até o natural) ────────
// autoAlpha = opacity + visibility (resolve FOUC com CSS visibility:hidden)
export const presets = {
  fadeUp: { autoAlpha: 0, y: 30 },
  fadeDown: { autoAlpha: 0, y: -12 },
  fadeIn: { autoAlpha: 0 },
  slideRight: { autoAlpha: 0, x: -30 },
  slideLeft: { autoAlpha: 0, x: 30 },
  scaleUp: { autoAlpha: 0, scale: 0.92 },
};

// ── Section timeline registry ──────────────────────────────────
// Cada seção cria uma timeline nomeada → ferramentas de debug inspecionam individualmente
export const sectionTimelines = new Map();
let _sectionCounter = 0;

// ═══════════════════════════════════════════════════════════════
// COMPOSABLE PRINCIPAL — useAnimations(name?)
// Cria timelines nomeadas por seção; tudo dentro de gsap.context()
// é revertido no onUnmounted (cleanup de tweens + ScrollTriggers).
// ═══════════════════════════════════════════════════════════════
export function useAnimations(name) {
  const scope = ref(null);
  let ctx;

  onMounted(() => {
    const el = scope.value;
    if (!el) return;

    ctx = gsap.context(() => {
      // Auto-detect section name
      const sectionName =
        name || el.id || el.dataset.section || "section-" + ++_sectionCounter;

      // ── data-animate → section timeline com ScrollTrigger na seção ──
      const animateNodes = el.querySelectorAll("[data-animate]");
      if (animateNodes.length) {
        // Reduced motion: revela todos os elementos imediatamente sem animação
        if (prefersReducedMotion) {
          animateNodes.forEach((node) =>
            gsap.set(node, { autoAlpha: 1, x: 0, y: 0, scale: 1 }),
          );
        } else {
          const tl = gsap.timeline({
            id: sectionName,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
          animateNodes.forEach((node) => {
            const preset = presets[node.dataset.animate];
            if (!preset) return;
            tl.from(
              node,
              { ...preset, duration: parseFloat(node.dataset.duration || 0.7) },
              parseFloat(node.dataset.delay || 0), // position na timeline
            );
          });
          sectionTimelines.set(sectionName, tl);
        }
      }

      // ── data-stagger → timeline com ScrollTrigger no container ──
      const staggerContainers = el.querySelectorAll("[data-stagger]");
      staggerContainers.forEach((container, i) => {
        const preset = presets[container.dataset.stagger];
        if (!preset) return;
        const children = container.children;
        if (!children.length) return;

        // Reduced motion: revela children imediatamente
        if (prefersReducedMotion) {
          gsap.set(children, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
          return;
        }

        const staggerId =
          sectionName +
          (staggerContainers.length > 1 ? "-stagger-" + (i + 1) : "-stagger");
        const tl = gsap.timeline({
          id: staggerId,
          scrollTrigger: {
            trigger: container,
            start: container.dataset.start || "top 85%",
            toggleActions: "play none none none",
          },
        });
        tl.from(
          children,
          {
            ...preset,
            duration: parseFloat(container.dataset.duration || 0.6),
            stagger: parseFloat(container.dataset.gap || 0.08),
          },
          parseFloat(container.dataset.delay || 0),
        );
        sectionTimelines.set(staggerId, tl);
      });

      // ── data-parallax → scroll-linked parallax sutil ──
      // Parallax desativado com reduced motion (movimento contínuo é o mais incômodo)
      if (!prefersReducedMotion) {
        const parallaxNodes = el.querySelectorAll("[data-parallax]");
        parallaxNodes.forEach((node) => {
          const distance = parseFloat(node.dataset.parallax || 20);
          gsap.fromTo(
            node,
            { y: distance },
            {
              y: -distance,
              ease: "none",
              scrollTrigger: {
                trigger: node.closest("section") || el,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5,
              },
            },
          );
        });
      }

      // ── data-load → timeline imediata (sem ScrollTrigger) ──
      const loadNodes = el.querySelectorAll("[data-load]");
      if (loadNodes.length) {
        // Reduced motion: revela imediatamente sem transição
        if (prefersReducedMotion) {
          loadNodes.forEach((node) =>
            gsap.set(node, { autoAlpha: 1, x: 0, y: 0, scale: 1 }),
          );
        } else {
          const loadId = sectionName + "-load";
          const tl = gsap.timeline({ id: loadId });
          loadNodes.forEach((node) => {
            const preset = presets[node.dataset.load];
            if (!preset) return;
            tl.from(
              node,
              { ...preset, duration: parseFloat(node.dataset.duration || 0.7) },
              parseFloat(node.dataset.delay || 0),
            );
          });
          sectionTimelines.set(loadId, tl);
        }
      }
    }, el);
  });

  onUnmounted(() => ctx?.revert());

  return scope;
}

// ═══════════════════════════════════════════════════════════════
// useParallax — scroll-linked scrub
// ═══════════════════════════════════════════════════════════════
export function useParallax(targetRef, toVars, opts = {}) {
  const {
    triggerRef,
    start = "top top",
    end = "bottom top",
    scrub = 1.5,
  } = opts;

  let ctx;

  onMounted(() => {
    if (!targetRef.value || prefersReducedMotion) return;

    ctx = gsap.context(() => {
      gsap.to(targetRef.value, {
        ...toVars,
        ease: "none",
        scrollTrigger: {
          trigger: (triggerRef || targetRef).value,
          start,
          end,
          scrub,
        },
      });
    }, targetRef.value);
  });

  onUnmounted(() => ctx?.revert());
}

// ═══════════════════════════════════════════════════════════════
// useTransition — tab/content swap imperativo
// ═══════════════════════════════════════════════════════════════
export function useTransition(targetRef) {
  function play(callback) {
    const el = targetRef.value;
    if (!el) {
      callback?.();
      return;
    }

    gsap.to(el, {
      opacity: 0,
      y: -20,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        callback?.();
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        );
      },
    });
  }

  return { play };
}

// ═══════════════════════════════════════════════════════════════
// useAccordion — expand/collapse height automático
// isOpen é um ref reativo; watch dispara a animação na transição.
// ═══════════════════════════════════════════════════════════════
export function useAccordion(isOpen) {
  const targetRef = ref(null);

  function animate(open) {
    const el = targetRef.value;
    if (!el) return;

    if (open) {
      gsap.set(el, { display: "block" });
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" },
      );
    } else if (el.offsetHeight > 0) {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.inOut",
        onComplete: () => gsap.set(el, { display: "none" }),
      });
    }
  }

  // Estado inicial (sem animar) + reage a mudanças de isOpen
  onMounted(() => {
    if (!isOpen.value && targetRef.value) {
      gsap.set(targetRef.value, { height: 0, opacity: 0, display: "none" });
    }
  });
  watch(isOpen, (open) => animate(open));

  return targetRef;
}

// ── Re-exports ─────────────────────────────────────────────────
export { gsap, ScrollTrigger };

// ── Expose on window for DevTools ──────────────────────────────
if (IS_DEV && typeof window !== "undefined") {
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
  window.__gsapTimelines = sectionTimelines;
}
