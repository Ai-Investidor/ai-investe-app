// src/boot/modules/lenis.js
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from 'lib/gsap'

/**
 * Lenis Smooth Scroll — Integração com GSAP ScrollTrigger.
 *
 * Inicializa o Lenis globalmente e sincroniza com o ticker do GSAP para
 * scroll suave estilo Locomotive Scroll. Todos os ScrollTriggers existentes
 * (data-animate, data-parallax etc.) continuam funcionando automaticamente.
 *
 * Smooth scroll é desativado quando o sistema pede reduced motion.
 *
 * @param {import('vue').App} app
 */
export default function bootLenis(app) {
  if (prefersReducedMotion) return

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
  })

  // ── Conecta Lenis → ScrollTrigger ─────────────────────────────
  // Cada evento de scroll do Lenis dispara ScrollTrigger.update()
  lenis.on('scroll', ScrollTrigger.update)

  // ── Sincroniza GSAP ticker → Lenis RAF ────────────────────────
  // O ticker do GSAP passa tempo em segundos; Lenis espera em ms
  gsap.ticker.add((time) => lenis.raf(time * 1000))

  // Desabilita lag smoothing para evitar conflito com o lerp do Lenis
  gsap.ticker.lagSmoothing(0)

  // ── Refresh após todos os recursos carregarem ──────────────────
  // Recalcula limit do Lenis e posições do ScrollTrigger depois que
  // imagens, fontes e vídeos atingiram o tamanho final do layout.
  window.addEventListener(
    'load',
    () => {
      lenis.resize()
      ScrollTrigger.refresh()
    },
    { once: true },
  )

  // ── ResizeObserver no body ─────────────────────────────────────
  // Componentes com client:visible hidratam quando entram na viewport,
  // aumentando a altura do documento depois que o Lenis inicializou.
  // Sem isso, o limit interno do Lenis fica menor que a página real e
  // o scroll para antes de chegar ao fim — e os triggers do ScrollTrigger
  // ficam com posições defasadas, impedindo animações de completar.
  let resizeTimer = null
  const bodyObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      lenis.resize()
      ScrollTrigger.refresh()
    }, 200)
  })
  bodyObserver.observe(document.body)

  // ── Disponibiliza para debugging ──────────────────────────────
  if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    window.__lenis = lenis
  }

  app.config.globalProperties.$lenis = lenis
}
