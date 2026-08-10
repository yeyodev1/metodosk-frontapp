/**
 * Directiva `v-reveal`: añade `is-visible` cuando el elemento entra en pantalla.
 * Los estilos de la animación están en global.scss y respetan
 * prefers-reduced-motion.
 */
import type { Directive } from 'vue'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
  }
  return observer
}

/** Uso: `<div v-reveal>` o `<div v-reveal="150">` para retrasar 150 ms. */
export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible')
      return
    }

    el.classList.add('reveal')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
