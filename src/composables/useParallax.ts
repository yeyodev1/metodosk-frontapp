/**
 * Progreso de scroll de un elemento, normalizado, para efectos de parallax.
 *
 * Devuelve un valor entre -1 y 1:
 *   -1  el elemento viene entrando por abajo
 *    0  el elemento está centrado en la pantalla
 *    1  el elemento ya salió por arriba
 *
 * Se actualiza con requestAnimationFrame y solo mientras el elemento está
 * visible, para no pagar el cálculo en todo el scroll de la página.
 */
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

export function useParallax(target: Ref<HTMLElement | null>) {
  const progress = ref(0)

  let frame = 0
  let visible = false
  let observer: IntersectionObserver | null = null
  let reduced = false

  function measure() {
    const el = target.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewport = window.innerHeight
    const center = rect.top + rect.height / 2
    const distance = viewport / 2 + rect.height / 2

    progress.value = Math.max(-1, Math.min(1, (viewport / 2 - center) / distance))
  }

  function onScroll() {
    if (!visible || reduced || frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      measure()
    })
  }

  onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !target.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false
        if (visible) measure()
      },
      { rootMargin: '20% 0px' },
    )
    observer.observe(target.value)

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame)
    observer?.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })

  /** Desplazamiento en px para una capa, según su velocidad. */
  const shift = (speed: number) => `translate3d(0, ${(progress.value * speed).toFixed(2)}px, 0)`

  return { progress, shift }
}
